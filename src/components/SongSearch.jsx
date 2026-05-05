import { useState, useRef, useEffect } from 'react';
import { searchYouTube } from '../lib/youtube';
import styles from './SongSearch.module.css';

export default function SongSearch({ index, song, onChange, onRemove, showRemove }) {
  const [query, setQuery] = useState(song.title || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    if (song.videoId) {
      onChange({ ...song, title: '', videoId: '', note: song.note });
    }
    setLoading(true);
    searchYouTube(val, (res) => {
      setResults(res);
      setOpen(res.length > 0);
      setLoading(false);
    });
  }

  function selectResult(result) {
    setQuery(result.title);
    onChange({ ...song, title: result.title, videoId: result.videoId });
    setOpen(false);
    setResults([]);
  }

  function handleNoteChange(e) {
    onChange({ ...song, note: e.target.value });
  }

  return (
    <div className={styles.row}>
      <div className={styles.header}>
        <span className={styles.trackNum}>{index + 1}</span>
        <div className={styles.searchWrap} ref={containerRef}>
          <div className={styles.inputRow}>
            <input
              className={`${styles.input} ${song.videoId ? styles.locked : ''}`}
              type="text"
              placeholder="Search for a song..."
              value={query}
              onChange={handleQueryChange}
              autoComplete="off"
            />
            {song.videoId && (
              <span className={styles.lockedBadge} title="Song locked in">✓</span>
            )}
          </div>
          {open && (
            <ul className={styles.dropdown}>
              {results.map((r) => (
                <li key={r.videoId} className={styles.result} onMouseDown={() => selectResult(r)}>
                  <img src={r.thumbnail} alt="" className={styles.thumb} />
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{r.title}</span>
                    <span className={styles.resultChannel}>{r.channel}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {showRemove && (
          <button className={styles.removeBtn} onClick={onRemove} type="button" title="Remove song">
            ✕
          </button>
        )}
      </div>
      <div className={styles.noteWrap}>
        <input
          className={styles.noteInput}
          type="text"
          placeholder="Why this song? (optional)"
          value={song.note || ''}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  );
}
