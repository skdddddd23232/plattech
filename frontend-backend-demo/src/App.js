import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import "./App.css";

function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const notesCollection = collection(db, "notes");

  const fetchNotes = async () => {
    const q = query(notesCollection, orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    setNotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const addNote = async () => {
    if (note.trim() === "") return;
    setLoading(true);
    await addDoc(notesCollection, {
      text: note.trim(),
      createdAt: serverTimestamp(),
    });
    setNote("");
    await fetchNotes();
    setLoading(false);
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "notes", id));
    fetchNotes();
  };

  const handleKey = (e) => {
    if (e.key === "Enter") addNote();
  };

  const todayCount = notes.filter((n) => {
    if (!n.createdAt) return false;
    const d = n.createdAt.toDate();
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="wrap">
      <div className="header">
        <h1>Notes</h1>
        <p className="firebase-badge">
          <span className="fb-dot" />
          Connected to Firestore
        </p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-num">{notes.length}</div>
          <div className="stat-lbl">total notes</div>
        </div>
        <div className="stat">
          <div className="stat-num">{todayCount}</div>
          <div className="stat-lbl">added today</div>
        </div>
      </div>

      <div className="input-card">
        <div className="input-row">
          <input
            type="text"
            placeholder="Write a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="btn-add" onClick={addNote} disabled={loading}>
            {loading ? "..." : "+ Add"}
          </button>
        </div>
      </div>

      <div className="section-label">
        {notes.length > 0 ? `Notes (${notes.length})` : "Notes"}
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty">No notes yet — add one above</div>
        ) : (
          notes.map((n) => (
            <div className="note-card" key={n.id}>
              <span className="note-dot" />
              <span className="note-text">{n.text}</span>
              <span className="note-time">
                {n.createdAt
                  ? n.createdAt.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
              <button className="btn-delete" onClick={() => deleteNote(n.id)}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
