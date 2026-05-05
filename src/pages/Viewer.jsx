import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Cassette from '../components/Cassette';
import StickyNote from '../components/StickyNote';
import TrackList from '../components/TrackList';
import styles from './Viewer.module.css';

export default function Viewer() {
  const { id } = useParams();
  const [tape, setTape] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const playerRef = useRef(null);
  const currentSongIndexRef = useRef(0);
  const songsRef = useRef([]);

  useEffect(() => {
    async function fetchTape() {
      const { data, error } = await supabase
        .from('tapes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setTape(data);
        songsRef.current = data.songs || [];
      }
      setLoading(false);
    }
    fetchTape();
  }, [id]);

  useEffect(() => {
    currentSongIndexRef.current = currentSongIndex;
  }, [currentSongIndex]);

  // Load YouTube IFrame API — yt-player div must always be in the DOM (no early returns)
  useEffect(() => {
    function onPlayerStateChange(event) {
      const { PlayerState } = window.YT;
      if (event.data === PlayerState.PLAYING) {
        setIsPlaying(true);
      } else if (event.data === PlayerState.PAUSED) {
        setIsPlaying(false);
      } else if (event.data === PlayerState.ENDED) {
        setIsPlaying(false);
        const songs = songsRef.current;
        if (songs.length > 0) {
          const next = (currentSongIndexRef.current + 1) % songs.length;
          currentSongIndexRef.current = next;
          setCurrentSongIndex(next);
          playerRef.current.loadVideoById(songs[next].videoId);
          playerRef.current.playVideo();
        }
      }
    }

    function initPlayer() {
      console.log('YT API ready');
      playerRef.current = new window.YT.Player('yt-player', {
        playerVars: { autoplay: 0, controls: 0 },
        events: { onStateChange: onPlayerStateChange },
      });
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    }
  }, []);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePlayPause() {
    const songs = songsRef.current;
    console.log('play button clicked', songs[currentSongIndexRef.current]);
    console.log('player ref:', playerRef.current);
    if (!playerRef.current) return;
    if (songs.length === 0) return;
    if (!hasStarted) {
      console.log('loading videoId:', songs[0].videoId);
      setHasStarted(true);
      playerRef.current.loadVideoById(songs[0].videoId);
      playerRef.current.playVideo();
    } else if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }

  function handleNext() {
    const songs = songsRef.current;
    if (!playerRef.current || songs.length === 0) return;
    const next = (currentSongIndexRef.current + 1) % songs.length;
    currentSongIndexRef.current = next;
    setCurrentSongIndex(next);
    setHasStarted(true);
    playerRef.current.loadVideoById(songs[next].videoId);
    playerRef.current.playVideo();
  }

  function handlePrev() {
    const songs = songsRef.current;
    if (!playerRef.current || songs.length === 0) return;
    const prev = (currentSongIndexRef.current - 1 + songs.length) % songs.length;
    currentSongIndexRef.current = prev;
    setCurrentSongIndex(prev);
    setHasStarted(true);
    playerRef.current.loadVideoById(songs[prev].videoId);
    playerRef.current.playVideo();
  }

  const songs = tape?.songs || [];
  const hasSongs = songs.length > 0;
  const currentSong = songs[currentSongIndex] || null;

  return (
    <>
      {/*
        Always rendered on first paint so YT.Player can attach to it.
        Early-return patterns (loading / notFound) would remove it from the DOM
        before the player effect runs, causing silent attachment failure.
      */}
      <div
        id="yt-player"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
      />

      {loading && (
        <div className={styles.loading}>
          <p className={styles.loadingText}>loading your tape...</p>
        </div>
      )}

      {!loading && notFound && (
        <div className={styles.loading}>
          <p className={styles.loadingText}>tape not found.</p>
          <Link to="/" className={styles.homeLink}>make your own mixtape →</Link>
        </div>
      )}

      {!loading && !notFound && tape && (
        <div className={`${styles.page} ${hasStarted && hasSongs ? styles.pageWithPlayer : ''}`}>
          <div className={styles.container}>
            {tape.note && (
              <div className={styles.noteWrap}>
                <StickyNote note={tape.note} from={tape.from_name} />
              </div>
            )}

            <div className={styles.cassetteWrap}>
              <Cassette
                color={tape.color}
                title={tape.title}
                fromName={tape.from_name}
                toName={tape.to_name}
                spinning={isPlaying}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                hasSongs={hasSongs}
              />
            </div>

            <div className={styles.tapeHeader}>
              <h1 className={styles.title}>{tape.title}</h1>
              <p className={styles.names}>
                <span className={styles.from}>{tape.from_name}</span>
                {tape.to_name && (
                  <>
                    <span className={styles.arrow}> → </span>
                    <span className={styles.to}>{tape.to_name}</span>
                  </>
                )}
              </p>
            </div>

            <div className={styles.tracklistWrap}>
              <TrackList songs={tape.songs} />
            </div>

            <button
              className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
              type="button"
              onClick={handleCopyLink}
            >
              {copied ? 'link copied ✓' : 'copy link to share ↗'}
            </button>

            <footer className={styles.footer}>
              <Link to="/" className={styles.footerLink}>make your own mixtape →</Link>
            </footer>
          </div>

          {hasStarted && hasSongs && (
            <div className={styles.miniPlayer}>
              <div className={styles.miniPlayerInfo}>
                <span className={styles.miniPlayerTitle}>{currentSong?.title || ''}</span>
                <span className={styles.miniPlayerLabel}>NOW PLAYING</span>
              </div>
              <div className={styles.miniPlayerControls}>
                <button className={styles.controlBtn} type="button" onClick={handlePrev}>←</button>
                <button className={styles.controlBtn} type="button" onClick={handlePlayPause}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button className={styles.controlBtn} type="button" onClick={handleNext}>→</button>
              </div>
              <div className={styles.miniPlayerProgress}>
                {String(currentSongIndex + 1).padStart(2, '0')} / {String(songs.length).padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
