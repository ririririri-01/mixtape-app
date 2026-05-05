import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cassette from '../components/Cassette';
import SongSearch from '../components/SongSearch';
import { supabase } from '../lib/supabase';
import styles from './Creator.module.css';

import tape1 from '../assets/cassettes/IMG_6122.PNG';
import tape2 from '../assets/cassettes/IMG_6123.PNG';
import tape3 from '../assets/cassettes/IMG_6124.PNG';
import tape4 from '../assets/cassettes/IMG_6125.PNG';
import tape5 from '../assets/cassettes/IMG_6126.PNG';
import tape6 from '../assets/cassettes/IMG_6127.PNG';
import tape7 from '../assets/cassettes/IMG_6128.PNG';

const CASSETTE_DATA = [
  { src: tape1, color: '#C0392B' },
  { src: tape2, color: '#2A7D6F' },
  { src: tape3, color: '#5B2D8E' },
  { src: tape4, color: '#8B4513' },
  { src: tape5, color: '#2C3E6B' },
  { src: tape6, color: '#C0392B' },
  { src: tape7, color: '#2A7D6F' },
];

// Each cassette rests at a slightly different angle so the shelf feels hand-placed
const REST_ROTATIONS = [-4, 2, -2, 3, -1, 2, -3];

const COLORS = [
  { hex: '#C0392B', label: 'Red'    },
  { hex: '#2A7D6F', label: 'Teal'   },
  { hex: '#2C3E6B', label: 'Navy'   },
  { hex: '#8B4513', label: 'Brown'  },
  { hex: '#5B2D8E', label: 'Purple' },
];

function makeId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const emptyForm = { title: '', fromName: '', toName: '', note: '', color: '#2A7D6F' };

export default function Creator() {
  const [form, setForm]               = useState(emptyForm);
  const [songs, setSongs]             = useState([{ title: '', videoId: '', note: '' }]);
  const [generating, setGenerating]   = useState(false);
  const [spinSlowing, setSpinSlowing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [pressedIndex, setPressedIndex] = useState(null);
  const navigate = useNavigate();

  // Log Supabase config on mount so env issues show up immediately in the console
  useEffect(() => {
    console.log('SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('SUPABASE KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, []);

  function setField(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function updateSong(i, s)   { setSongs((p) => p.map((v, j) => (j === i ? s : v))); }
  function addSong()           { setSongs((p) => [...p, { title: '', videoId: '', note: '' }]); }
  function removeSong(i)       { setSongs((p) => p.filter((_, j) => j !== i)); }

  // ── Cassette click: set colour → brief press → scroll ─────────────
  function handleCassetteClick(i) {
    setField('color', CASSETTE_DATA[i].color);
    setPressedIndex(i);
    setTimeout(() => {
      setPressedIndex(null);
      document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    }, 120);
  }

  // ── Per-cassette inline style ──────────────────────────────────────
  function getCassetteStyle(i) {
    const rest = `rotate(${REST_ROTATIONS[i]}deg)`;

    if (pressedIndex === i) {
      return {
        transform:  `${rest} scale(0.95)`,
        opacity:    1,
        zIndex:     10,
        boxShadow:  'none',
      };
    }
    if (hoveredIndex === i) {
      return {
        transform:  'rotate(8deg) scale(1.13) translateY(-12px)',
        opacity:    1,
        zIndex:     10,
        boxShadow:  '0 16px 40px rgba(0,0,0,0.25)',
      };
    }
    if (hoveredIndex !== null) {
      // Container is hovered but this isn't the active cassette
      return {
        transform:  `${rest} scale(0.95)`,
        opacity:    0.75,
        zIndex:     'auto',
        boxShadow:  'none',
      };
    }
    // Resting state
    return {
      transform:  rest,
      opacity:    1,
      zIndex:     'auto',
      boxShadow:  'none',
    };
  }

  // ── Supabase save ──────────────────────────────────────────────────
  async function handleGenerate() {
    const validSongs = songs.filter((s) => s.videoId && s.title);
    if (!form.title.trim())      { alert('Please give your tape a title!'); return; }
    if (validSongs.length === 0) { alert('Add at least one song!');         return; }

    setGenerating(true);
    const id = makeId();
    const payload = {
      id,
      title:     form.title.trim(),
      from_name: form.fromName.trim(),
      to_name:   form.toName.trim(),
      note:      form.note.trim(),
      color:     form.color,
      songs:     validSongs,
    };

    console.log('tape object being inserted:', payload);

    // NOTE — if this fails with row-level security: Supabase dashboard →
    // Table Editor → tapes → disable RLS, or add anon INSERT policy (expression: true)
    try {
      const { data, error } = await supabase.from('tapes').insert([payload]).select();
      console.log('[supabase] insert result — data:', data, '| error:', error);
      if (error) throw error;

      setTimeout(() => {
        setSpinSlowing(true);
        setTimeout(() => navigate(`/tape/${id}`), 800);
      }, 2500);
    } catch (error) {
      console.log('FULL ERROR:', JSON.stringify(error));
      console.error('[supabase] insert failed:', error);
      alert(`Something went wrong saving your tape.\n\nError: ${error?.message || JSON.stringify(error)}`);
      setGenerating(false);
    }
  }

  // ── Generating screen ──────────────────────────────────────────────
  if (generating) {
    return (
      <div className={styles.generatingScreen}>
        <div className={styles.generatingCassette}>
          <Cassette
            color={form.color}
            title={form.title}
            fromName={form.fromName}
            toName={form.toName}
            spinning={!spinSlowing}
          />
        </div>
        <p className={styles.generatingText}>making your tape...</p>
      </div>
    );
  }

  // ── Creator page ───────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Heading ── */}
        <header className={styles.heroHeading}>
          <h1 className={styles.heroTitle}>
            Make A<br />
            <em className={styles.heroRed}>Mixtape.</em>
          </h1>
          <p className={styles.heroSub}>For somebody I like &lt;3</p>
        </header>

        {/* ── Cassette shelf ── */}
        <section className={styles.shelfSection}>
          <div
            className={styles.shelfBox}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={styles.shelfRow}>
              {CASSETTE_DATA.map((cassette, i) => (
                <div
                  key={i}
                  className={styles.cassetteWrapper}
                  style={getCassetteStyle(i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={() => handleCassetteClick(i)}
                >
                  <img
                    src={cassette.src}
                    alt=""
                    className={styles.cassetteImg}
                  />
                </div>
              ))}
            </div>
          </div>
          <p className={styles.shelfLabel}>hover to browse &nbsp;·&nbsp; click to start</p>
        </section>

        {/* ── Two-column form ── */}
        <div id="form-section" className={styles.layout}>

          <div className={styles.formCol}>
            <section className={styles.card}>
              <h2 className={styles.sectionLabel}>The Details</h2>

              <div className={styles.field}>
                <label className={styles.label}>Tape Title</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Songs For Rainy Sundays"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>From</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Your name"
                    value={form.fromName}
                    onChange={(e) => setField('fromName', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>To</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Their name"
                    value={form.toName}
                    onChange={(e) => setField('toName', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Personal Note</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Write something from the heart..."
                  value={form.note}
                  onChange={(e) => setField('note', e.target.value)}
                  rows={4}
                />
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionLabel}>Cassette Colour</h2>
              <div className={styles.colorPicker}>
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    className={`${styles.colorSwatch} ${form.color === c.hex ? styles.colorSelected : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => setField('color', c.hex)}
                    type="button"
                    title={c.label}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionLabel}>The Tracklist</h2>
              <div className={styles.songs}>
                {songs.map((song, i) => (
                  <SongSearch
                    key={i}
                    index={i}
                    song={song}
                    onChange={(s) => updateSong(i, s)}
                    onRemove={() => removeSong(i)}
                    showRemove={songs.length > 1}
                  />
                ))}
              </div>
              <button className={styles.addSongBtn} type="button" onClick={addSong}>
                + Add another song
              </button>
            </section>

            <button className={styles.generateBtn} type="button" onClick={handleGenerate}>
              Generate my tape →
            </button>
          </div>

          <aside className={styles.previewCol}>
            <div className={styles.previewSticky}>
              <p className={styles.previewLabel}>Preview</p>
              <Cassette
                color={form.color}
                title={form.title}
                fromName={form.fromName}
                toName={form.toName}
                spinning={false}
              />
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}
