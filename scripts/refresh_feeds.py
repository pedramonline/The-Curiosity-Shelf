"""Refresh public YouTube Atom feeds, retaining a per-channel last good snapshot."""
import concurrent.futures
import datetime as dt
import json
from html.parser import HTMLParser
from urllib.parse import urlparse
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015'}

def fetch(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; CuriosityShelf/1.0)'})
            with urllib.request.urlopen(req, timeout=25) as response:
                return response.read().decode('utf-8')
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)

class ChannelArtworkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.avatar = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and attrs.get('property') == 'og:image':
            url = attrs.get('content', '')
            if urlparse(url).scheme == 'https' and urlparse(url).hostname in ('yt3.googleusercontent.com', 'yt3.ggpht.com'):
                self.avatar = url

def channel_artwork(html):
    parser = ChannelArtworkParser()
    parser.feed(html)
    if not parser.avatar:
        raise ValueError('Channel avatar missing from metadata')
    return parser.avatar

def resolve_channel(html):
    # Prefer channel metadata, never a related video's channel ID.
    patterns = [r'<meta[^>]+itemprop="channelId"[^>]+content="(UC[\w-]{22})"',
                r'<link[^>]+rel="canonical"[^>]+href="https://www.youtube.com/channel/(UC[\w-]{22})"',
                r'"externalId":"(UC[\w-]{22})"']
    for pattern in patterns:
        match = re.search(pattern, html)
        if match:
            return match.group(1)
    raise ValueError('No canonical channel ID found; set channelId in channels.json')

def parse_feed(xml, channel, expected_id):
    root = ET.fromstring(xml)
    if root.tag != '{http://www.w3.org/2005/Atom}feed':
        raise ValueError('Response is not an Atom feed')
    feed_id = root.findtext('yt:channelId', namespaces=NS)
    canonical = root.find("a:link[@rel='alternate']", NS)
    prefixless_match = (feed_id == expected_id[2:] and canonical is not None
                        and canonical.get('href') == 'https://www.youtube.com/channel/' + expected_id)
    if feed_id != expected_id and not prefixless_match:
        raise ValueError('Feed belongs to a different channel')
    videos = []
    for entry in root.findall('a:entry', NS):
        vid = entry.findtext('yt:videoId', namespaces=NS)
        title = entry.findtext('a:title', namespaces=NS)
        published = entry.findtext('a:published', namespaces=NS)
        if not vid or not re.fullmatch(r'[\w-]{11}', vid) or not title or not published:
            continue
        stamp = dt.datetime.fromisoformat(published.replace('Z', '+00:00'))
        if stamp.tzinfo is None:
            continue
        videos.append({'id': vid, 'title': title, 'published': stamp.isoformat(), 'channel': channel})
    return sorted(videos, key=lambda v: v['published'], reverse=True)[:9]

def refresh_channel(channel, previous, now):
    channel_id = channel.get('channelId') or previous.get('channelId')
    if not channel_id:
        channel_id = resolve_channel(fetch(channel['url']))
    if not re.fullmatch(r'UC[\w-]{22}', channel_id):
        raise ValueError('Invalid channel ID')
    xml = fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + channel_id)
    videos = parse_feed(xml, channel['id'], channel_id)
    if not videos:
        raise ValueError('Feed returned no usable uploads')
    avatar = previous.get('avatarUrl') or channel.get('avatarUrl')
    try:
        html = fetch(channel['url'])
        if resolve_channel(html) != channel_id:
            raise ValueError('Artwork page belongs to another channel')
        avatar = channel_artwork(html)
    except Exception as error:
        print(f"Artwork warning for {channel['name']}: {error}; retaining previous avatar", flush=True)
    return {'channelId': channel_id, 'updatedAt': now, 'videos': videos, 'avatarUrl': avatar}

def merge_snapshot(channels, previous, successes, errors, now):
    saved = {c['id']: previous.get('channels', {}).get(c['id'], {}) for c in channels}
    saved.update(successes)
    unique = {}
    for channel in saved.values():
        for video in channel.get('videos', []):
            unique[video['id']] = video
    return {'checkedAt': now, 'updatedAt': now if successes else previous.get('updatedAt'),
            'channels': saved, 'videos': sorted(unique.values(), key=lambda v: v['published'], reverse=True),
            'errors': sorted(errors)}

def main():
    channels = json.loads((ROOT / 'src/data/channels.json').read_text(encoding='utf-8'))
    target = ROOT / 'public/data/uploads.json'
    previous = json.loads(target.read_text(encoding='utf-8')) if target.exists() else {}
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    successes, errors = {}, []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(refresh_channel, c, previous.get('channels', {}).get(c['id'], {}), now): c for c in channels}
        for future in concurrent.futures.as_completed(jobs):
            channel = jobs[future]
            try:
                successes[channel['id']] = future.result()
                print(f"OK {channel['name']}: {len(successes[channel['id']]['videos'])} uploads", flush=True)
            except Exception as error:
                errors.append(channel['id'])
                print(f"WARNING {channel['name']}: {error}; retaining cached uploads", flush=True)
    snapshot = merge_snapshot(channels, previous, successes, errors, now)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(target)
    print(f"Refreshed {len(successes)}/{len(channels)} channels; {len(snapshot['videos'])} total uploads.")

if __name__ == '__main__':
    main()
