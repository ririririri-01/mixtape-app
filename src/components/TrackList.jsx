import styles from './TrackList.module.css';

export default function TrackList({ songs }) {
  if (!songs || songs.length === 0) return null;

  return (
    <ol className={styles.list}>
      {songs.map((song, i) => (
        <li key={i} className={styles.track}>
          <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
          <div className={styles.info}>
            <a
              href={`https://youtube.com/watch?v=${song.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.title}
            >
              {song.title}
            </a>
            {song.note && <p className={styles.note}>{song.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
