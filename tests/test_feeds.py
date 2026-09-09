import unittest
from scripts.refresh_feeds import parse_feed, merge_snapshot, resolve_channel

CID = 'UC' + 'a' * 22
XML = f'''<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015"><yt:channelId>{CID}</yt:channelId><entry><yt:videoId>abcdefghijk</yt:videoId><title>Science &amp; wonder</title><published>2026-09-08T10:00:00Z</published></entry></feed>'''

class FeedsTest(unittest.TestCase):
    def test_prefixless_feed_requires_canonical(self):
        xml = XML.replace(f'<yt:channelId>{CID}</yt:channelId>', f'<yt:channelId>{CID[2:]}</yt:channelId><link rel="alternate" href="https://www.youtube.com/channel/{CID}"/>')
        self.assertEqual(len(parse_feed(xml, 'test', CID)), 1)
        with self.assertRaises(ValueError):
            parse_feed(xml.replace('/channel/' + CID, '/channel/incorrect'), 'test', CID)

    def test_parses_real_atom_shape_and_escapes(self):
        self.assertEqual(parse_feed(XML, 'test', CID)[0]['title'], 'Science & wonder')

    def test_rejects_other_channel(self):
        with self.assertRaises(ValueError):
            parse_feed(XML, 'test', 'UC' + 'b' * 22)

    def test_failure_keeps_previous_videos_and_date(self):
        old = {'updatedAt': 'old', 'channels': {'test': {'videos': parse_feed(XML, 'test', CID)}}}
        result = merge_snapshot([{'id': 'test'}], old, {}, ['test'], 'new')
        self.assertEqual(result['updatedAt'], 'old')
        self.assertEqual(len(result['videos']), 1)
        self.assertEqual(result['checkedAt'], 'new')

    def test_partial_refresh_keeps_failed_channel_and_removes_deleted(self):
        old = {'channels': {'keep': {'videos': [{'id': 'old', 'published': '2026-01-01'}]}, 'deleted': {'videos': [{'id': 'gone', 'published': '2026-01-01'}]}}}
        result = merge_snapshot([{'id':'keep'}, {'id':'new'}], old, {'new': {'videos':[{'id':'new', 'published':'2026-02-01'}]}}, ['keep'], 'today')
        self.assertEqual([v['id'] for v in result['videos']], ['new', 'old'])

    def test_resolves_only_metadata(self):
        self.assertEqual(resolve_channel(f'"externalId":"{CID}"'), CID)
        with self.assertRaises(ValueError):
            resolve_channel(f'"channelId":"{CID}"')

if __name__ == '__main__':
    unittest.main()
