import styles from './StickyNote.module.css';

export default function StickyNote({ note, from }) {
  return (
    <div className={styles.note}>
      {from && <span className={styles.from}>from {from}</span>}
      <p className={styles.text}>{note}</p>
    </div>
  );
}
