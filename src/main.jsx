import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, BookOpen, MagnifyingGlass as Search, X, Moon, Sun, Shuffle } from '@phosphor-icons/react';
import '@fontsource/outfit/latin-400.css';
import '@fontsource/outfit/latin-500.css';
import '@fontsource/outfit/latin-600.css';
import '@fontsource/outfit/latin-700.css';
import channels from './data/channels.json';
import './style.css';

const topics = ['All', 'Science', 'Space', 'Nature', 'Big ideas', 'Engineering'];
const date = value => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const summaries = {
 'kurzgesagt': 'Big questions about science, philosophy and our future, brought to life through animation.',
 'veritasium': 'Surprising experiments and the fascinating truths behind everyday phenomena.',
 'vsauce': 'Strange questions that lead somewhere between science, philosophy and wonder.',
 'ted': 'New perspectives, remarkable stories and ideas from thinkers around the world.',
 'melodysheep': 'Epic journeys through space and time, told with music and cinematic visuals.',
 'steve-mould': 'Quirky experiments that make the science around us click.',
 'rational-animations': 'Animated explorations of rational thinking, human values and AI.',
 'action-lab': 'Unexpected experiments for anyone who has ever wondered: what if?',
 'real-engineering': 'The engineering, design and ingenuity behind the modern world.',
 'smarter-every-day': 'Real science, slow-motion discoveries and a wonderfully curious host.',
 'be-smart': 'Life science, smart questions and the weird wonders of our world.',
 'physics-girl': 'Hands-on physics that brings puzzling ideas down to Earth.',
 'minute-earth': 'Short animated stories about nature, animals and our planet.',
 'pbs-space-time': 'A rewarding deep dive into black holes, quantum theory and the cosmos.'
};

function ChannelAvatar({ channel, snapshot }) {
 const [failed, setFailed] = useState(false);
 const url = snapshot?.avatarUrl || channel.avatarUrl;
 return url && !failed ? <img className="channel-avatar" src={url} width="56" height="56" alt={`${channel.name} channel avatar`} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/> : <span className="channel-avatar avatar-fallback" aria-label="Channel image unavailable"><BookOpen size={28}/></span>;
}

function UploadPreview({ video, compact = false }) {
 const [failed, setFailed] = useState(false);
 return <a className={compact ? 'channel-upload compact-upload' : 'channel-upload featured-upload'} href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`} target="_blank" rel="noopener noreferrer">
  <div className="thumbnail">{!failed && <img src={`https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" onError={()=>setFailed(true)}/>}{failed && <span className="image-unavailable">Watch on YouTube</span>}{!compact&&<span className="watch">Watch on YouTube <ArrowUpRight size={18}/></span>}</div>
  <div className="upload-caption"><span className="upload-date">{date(video.published)}</span><span className="upload-title">{video.title}</span></div>
 </a>;
}

function ChannelCard({ channel, snapshot, loading, onExplore }) {
 const recent = snapshot?.videos || [];
 return <article className="channel">
  {recent[0] ? <UploadPreview video={recent[0]}/> : <div className="channel-feed-placeholder">{loading?'Loading recent uploads…':'Recent uploads unavailable'}</div>}
  <div className="channel-heading"><ChannelAvatar channel={channel} snapshot={snapshot}/><div><h3>{channel.name}</h3><p className="channel-style">{channel.style}</p></div></div>
  <p className="description">{summaries[channel.id] || channel.description}</p>
  {recent.length>1&&<div className="channel-recent" aria-label={`More uploads from ${channel.name}`}>{recent.slice(1,3).map(video=><UploadPreview key={video.id} video={video} compact/>)}</div>}
  <button className="explore-link" onClick={onExplore} aria-label={`Explore channel: ${channel.name}`}>Explore channel <span className="upload-count">{recent.length ? `· ${recent.length} recent uploads` : ''}</span><ArrowUpRight size={19}/></button>
 </article>;
}

function App() {
 const [query, setQuery] = useState('');
 const [topic, setTopic] = useState('All');
 const [selected, setSelected] = useState(null);
 const [feed, setFeed] = useState(null);
 const [feedError, setFeedError] = useState(false);
 const [feedAttempt, setFeedAttempt] = useState(0);
 const [videoLimit, setVideoLimit] = useState(6);
 const [dark, setDark] = useState(() => { try { const saved=localStorage.getItem('shelf-theme'); return saved ? saved==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return false; } });
 const dialog = useRef(null);
 useEffect(() => { document.documentElement.dataset.theme=dark?'dark':'light'; try { localStorage.setItem('shelf-theme',dark?'dark':'light'); } catch {} }, [dark]);
 useEffect(() => {
  const controller = new AbortController(); setFeedError(false);
  fetch(`${import.meta.env.BASE_URL}data/uploads.json`, { signal: controller.signal }).then(r => { if(!r.ok) throw new Error('Feed unavailable'); return r.json(); }).then(data => {if(!Array.isArray(data.videos)) throw new Error('Invalid feed'); setFeed(data);}).catch(e => { if(e.name!=='AbortError') setFeedError(true); });
  return () => controller.abort();
 }, [feedAttempt]);
 useEffect(() => { if(selected) { dialog.current.showModal(); document.body.style.overflow='hidden'; } else { dialog.current.close(); document.body.style.overflow=''; } return () => { document.body.style.overflow=''; }; }, [selected]);
 const filtered = channels.filter(c => (topic==='All'||c.topics.includes(topic)) && `${c.name} ${c.topics.join(' ')} ${c.description} ${c.audience}`.toLowerCase().includes(query.trim().toLowerCase()));
 const videos = feed?.videos.filter(v => channels.some(c => c.id===v.channel)) || [];
 const reset = () => {setQuery('');setTopic('All');};
 const surprise = () => setSelected(channels[Math.floor(Math.random()*channels.length)]);
 return <>
  <a href="#explore" className="skip">Skip to the library</a>
  <header className="shell nav"><a className="brand" href="#"><BookOpen size={26} weight="bold"/>The Curiosity Shelf</a><nav aria-label="Main navigation"><a href="#explore">Explore</a><a href="#fresh">Fresh uploads</a><a href="#pedro">A note from Pedro</a></nav><button className="icon-button theme" onClick={() => setDark(!dark)} aria-label={dark?'Use light theme':'Use dark theme'}>{dark?<Sun size={22}/>:<Moon size={22}/>}</button></header>
  <main>
   <section className="shell hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">Good videos. Bigger worlds.</p><h1 id="hero-title">Follow your<br/>curiosity.</h1><p className="intro">Discover remarkable channels. Explore big ideas. Find your English along the way.</p><div className="hero-actions"><a className="button primary" href="#explore">Explore the shelf <ArrowRight size={22}/></a><button className="text-button" onClick={surprise}>Surprise me <Shuffle size={21}/></button></div></div><figure><img src={`${import.meta.env.BASE_URL}images/curiosity-hero.webp`} width="1536" height="1024" fetchPriority="high" alt="An open science book, a fern and a suspended model of the moon"/><figcaption>A little curiosity goes a long way.</figcaption></figure></section>
   <section id="explore" className="shell library" aria-labelledby="library-title"><div className="section-heading"><div><p className="eyebrow">The collection</p><h2 id="library-title">Find your next rabbit hole.</h2><p>{channels.length} channels, chosen with care by Pedro.</p></div><label className="search"><Search size={23}/><span className="sr-only">Search channels, topics or ideas</span><input type="search" placeholder="What are you curious about?" value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className="filters" aria-label="Filter by topic">{topics.map(t=><button key={t} aria-pressed={topic===t} onClick={()=>setTopic(t)}>{t}</button>)}</div><p className="result-count" role="status">{filtered.length} {filtered.length===1?'channel':'channels'}{topic!=='All'?` about ${topic.toLowerCase()}`:''}{query.trim()?` matching “${query.trim()}”`:''}</p><p className="collection-feed-note">Channel recommendations by Pedro. Recent uploads come directly from each channel.</p><div className="channel-grid">{filtered.map(c=><ChannelCard key={c.id} channel={c} snapshot={feed?.channels?.[c.id]} loading={!feed&&!feedError} onExplore={()=>setSelected(c)}/>) }</div>{!filtered.length&&<div className="empty"><h3>No rabbit holes here yet.</h3><p>Try another subject, a channel name, or clear your filters.</p><button className="button primary" onClick={reset}>Show all channels</button></div>}<p className="library-caption">Choose a subject you love. Let the English follow.</p></section>
   <section id="fresh" className="shell fresh" aria-labelledby="fresh-title"><p className="eyebrow">Something new to explore</p><h2 id="fresh-title">Fresh from the channels.</h2><p className="section-intro">The latest uploads from recommended creators. Automatically collected, not individually reviewed by Pedro.</p>{feed?.updatedAt&&<p className="feed-status">Last successful refresh: {date(feed.updatedAt)}{feed.errors?.length ? ' · Some channels could not refresh; their saved uploads are still available.' : ''}</p>}{feedError?<div className="empty"><h3>The latest uploads couldn’t load.</h3><p>You can still explore every recommended channel above.</p><button className="button" onClick={()=>setFeedAttempt(n=>n+1)}>Try again</button></div>:!feed?<div className="video-grid" aria-label="Loading latest uploads" aria-busy="true">{[0,1,2].map(n=><div className="skeleton" key={n}/>)}</div>:videos.length?<><div className="video-grid">{videos.slice(0,videoLimit).map(v=><article key={v.id} className="video"><a href={`https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`} target="_blank" rel="noopener noreferrer"><div className="thumbnail"><img src={`https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden';}}/><span className="watch">Watch on YouTube <ArrowUpRight size={18}/></span></div><p className="video-meta">{channels.find(c=>c.id===v.channel)?.name} · {date(v.published)}</p><h3>{v.title}</h3></a></article>)}</div>{videoLimit<videos.length&&<button className="button more" onClick={()=>setVideoLimit(n=>n+6)}>Show more uploads <ArrowRight size={18}/></button>}</>:<div className="empty"><h3>The fresh shelf is warming up.</h3><p>Recent uploads will appear after the first successful feed refresh. In the meantime, the full channel collection is ready to explore.</p><a className="explore-link" href="#explore">Explore the channels <ArrowRight size={18}/></a></div>}</section>
   <section id="pedro" className="shell note" aria-labelledby="note-title"><div><p className="eyebrow">A note from your teacher</p><h2 id="note-title">English<br/>opens doors.</h2></div><div><p className="note-lead">Learning English is about connecting with the world, understanding new ideas, and growing as a thinker and communicator.</p><p>Choose something that makes you curious. Watch with subtitles, collect a few useful phrases, and tell someone what surprised you. You don’t have to understand every word to discover something wonderful.</p><p className="signature">Pedro<span>Your English teacher</span></p><a className="explore-link" href="https://github.com/pedramonline/The-Curiosity-Shelf/issues/new?title=Channel%20suggestion" target="_blank" rel="noopener noreferrer">Suggest something for the shelf <ArrowUpRight size={18}/></a></div></section>
  </main><footer className="shell footer"><a className="brand" href="#">The Curiosity Shelf</a><p>Curated by Pedro. Made for curious minds.</p><a href="https://github.com/pedramonline/The-Curiosity-Shelf" target="_blank" rel="noopener noreferrer">On GitHub <ArrowUpRight size={16}/></a></footer>
  <dialog ref={dialog} className="channel-dialog" aria-labelledby="detail-title" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)setSelected(null);}}>{selected&&<div className="dialog-content"><button className="icon-button close" autoFocus onClick={()=>setSelected(null)} aria-label="Close channel details"><X size={24}/></button><p className="eyebrow">{selected.topics.join(' / ')}</p><div className="detail-channel-heading"><ChannelAvatar channel={selected} snapshot={feed?.channels?.[selected.id]}/><h2 id="detail-title">{selected.name}</h2></div><div className="detail-feed"><h3>Recent uploads</h3><p className="detail-feed-note">Automatically collected from this channel; not individually reviewed by Pedro.</p>{feed?.channels?.[selected.id]?.videos?.length ? <div className="detail-uploads">{feed.channels[selected.id].videos.map(video=><UploadPreview key={video.id} video={video} compact/>)}</div> : <p>Recent uploads are unavailable. You can still visit the channel below.</p>}</div><p>{selected.description}</p><h3>Who is it for?</h3><p>{selected.audience}</p><div className="learning-tip"><h3>Try this with your English</h3><p>{selected.englishTip}</p></div><a className="button primary" href={selected.url} target="_blank" rel="noopener noreferrer">Visit YouTube channel <ArrowUpRight size={21}/></a><p className="detail-credit">Channel description from Pedro’s English YouTube Library. Learning activity added for the website.</p></div>}</dialog>
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
