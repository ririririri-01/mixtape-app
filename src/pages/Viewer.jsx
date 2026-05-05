import { useEffect, useState } from 'react';
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

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
      }
      setLoading(false);
    }
    fetchTape();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p className={styles.loadingText}>loading your tape...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.loading}>
        <p className={styles.loadingText}>tape not found.</p>
        <Link to="/" className={styles.homeLink}>make your own mixtape →</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Sticky note */}
        {tape.note && (
          <div className={styles.noteWrap}>
            <StickyNote note={tape.note} from={tape.from_name} />
          </div>
        )}

        {/* Cassette */}
        <div className={styles.cassetteWrap}>
          <Cassette
            color={tape.color}
            title={tape.title}
            fromName={tape.from_name}
            toName={tape.to_name}
            spinning={false}
          />
        </div>

        {/* Tape header */}
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

        {/* Tracklist */}
        <div className={styles.tracklistWrap}>
          <TrackList songs={tape.songs} />
        </div>

        {/* Copy link */}
        <button
          className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
          type="button"
          onClick={handleCopyLink}
        >
          {copied ? 'link copied ✓' : 'copy link to share ↗'}
        </button>

        {/* Footer */}
        <footer className={styles.footer}>
          <Link to="/" className={styles.footerLink}>make your own mixtape →</Link>
        </footer>
      </div>
    </div>
  );
}
