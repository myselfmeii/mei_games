import React, { useState, useRef, useEffect, useMemo } from "react";
import { languageChunks } from "./songData";
import { useNavigate } from "react-router-dom";

export default function SongGame() {
  const [selectedLang, setSelectedLang] = useState("Tamil");
  const [currentChunk, setCurrentChunk] = useState("");
  const [originLang, setOriginLang] = useState(null);
  const [view, setView] = useState("rules"); // 'rules' | 'game'
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const chunks = useMemo(() => {
    if (selectedLang === "Mixed") {
      return Object.entries(languageChunks).flatMap(([lang, chunks]) =>
        chunks.map((chunk) => ({ chunk, lang }))
      );
    }
    return (
      languageChunks[selectedLang]?.map((chunk) => ({
        chunk,
        lang: selectedLang,
      })) || []
    );
  }, [selectedLang]);

  const startCycling = () => {
    if (running || chunks.length === 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      const randomItem = chunks[Math.floor(Math.random() * chunks.length)];
      setCurrentChunk(randomItem.chunk);
      setOriginLang(randomItem.lang);
    }, 100);
  };

  const stopCycling = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);
  
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {view === "rules" ? (
        <RulesScreen onStart={() => setView("game")} />
      ) : (
        <GameScreen
          selectedLang={selectedLang}
          setSelectedLang={(lang) => {
            setSelectedLang(lang);
            setCurrentChunk("");
            setOriginLang(null);
          }}
          currentChunk={currentChunk}
          originLang={originLang}
          running={running}
          startCycling={startCycling}
          stopCycling={stopCycling}
          onExit={() => {
            setView("rules");
            setRunning(false);
            setCurrentChunk("");
            // setOriginLang(null);
            navigate("/");
          }}
        />
      )}
    </div>
  );
}

// 🔹 Rules Screen Component
function RulesScreen({ onStart }) {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate("/");
  };
  return (
    <div>
      <h2 style={styles.title}>📜 Game Rules</h2>
      <ul style={styles.rulesList}>
        <li style={styles.rulesListli}>
          🎶 Select a language and start the game
        </li>
        <li>🛑 Click "Stop" to get your word</li>
        <li>🎤 A random word will appear</li>
        <li>🎵 Sing a song starting with that word</li>
        {/* <li>↩️ Press "Exit" to go back </li> */}
      </ul>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button style={styles.buttonStart} onClick={onStart}>
          Let's Play
        </button>
        <button style={styles.buttonStart} onClick={handleExit}>
          Exit
        </button>
      </div>
    </div>
  );
}

// 🔹 Game Screen Component
function GameScreen({
  selectedLang,
  setSelectedLang,
  currentChunk,
  originLang,
  running,
  startCycling,
  stopCycling,
  onExit,
}) {
  return (
    <>
      <h2 style={styles.title}>🎵Sing a Song</h2>

      <LanguageSelector
        selectedLang={selectedLang}
        onChange={setSelectedLang}
      />

      {currentChunk && (
        <p style={styles.instruction}>
          🎤 Sing a song that starts or is related to the word
          {/* <span style={styles.chunkText}>{currentChunk}</span>
          {selectedLang === 'Mixed' && originLang && (
            <span style={styles.origin}>Origin: {originLang}</span>
          )} */}
        </p>
      )}

      <div
        onClick={!running ? startCycling : stopCycling}
        style={{
          ...styles.chunkDisplay,
          backgroundColor: running ? "#f06292" : "#ab47bc",
        }}
      >
        {currentChunk || (
          <span style={styles.chunkDisplayBefore}>Tap to Start & Stop</span>
        )}
      </div>

      <div style={styles.buttonWrapper}>
        {/* {!running ? (
          <button style={styles.buttonStart} onClick={startCycling}>
            Start
          </button>
        ) : (
          <button style={styles.buttonStop} onClick={stopCycling}>
            Stop
          </button>
        )} */}
        <div style={{ marginTop: 16 }}>
          <button style={styles.buttonExit} onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    </>
  );
}

// 🔹 Language Selector Component
function LanguageSelector({ selectedLang, onChange }) {
  return (
    <div style={styles.selector}>
      <label htmlFor="lang-select" style={styles.label}>
        Choose Language:{" "}
      </label>
      <select
        id="lang-select"
        value={selectedLang}
        onChange={(e) => onChange(e.target.value)}
        style={styles.select}
      >
        {Object.keys(languageChunks).map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
        <option value="Mixed">Mixed</option>
      </select>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: {
    maxWidth: 450,
    margin: "50px auto",
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#f3e5f5",
    boxShadow: "0 0 20px rgba(0,0,0,0.15)",
    fontFamily: "Segoe UI, sans-serif",
    textAlign: "center",
    userSelect: "none",
  },
  title: {
    color: "#6a1b9a",
    fontSize: 24,
    marginBottom: 16,
  },
  rulesList: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    listStyleType: "none",
    textAlign: "left",
    alignItems: "center",
    margin: "0 auto 20px",
    padding: "0 20px",
    fontSize: 16,
    color: "#4a148c",
  },

  selector: {
    marginBottom: 24,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
  select: {
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  chunkDisplayBefore: {
    margin: "30px auto",
    padding: "50px 20px",
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    borderRadius: 20,
    minHeight: 80,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.3s ease",
    letterSpacing: 6,
  },

  chunkDisplay: {
    margin: "30px auto",
    padding: "50px 20px",
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
    borderRadius: 20,
    minHeight: 80,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.3s ease",
    letterSpacing: 6,
  },
  buttonWrapper: {
    marginTop: 24,
  },
  buttonStart: {
    padding: "12px 40px",
    fontSize: 20,
    backgroundColor: "#7b1fa2",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  buttonStop: {
    padding: "12px 40px",
    fontSize: 20,
    backgroundColor: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  buttonExit: {
    padding: "10px 30px",
    fontSize: 16,
    backgroundColor: "#8e24aa",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  instruction: {
    marginTop: 30,
    fontSize: 18,
    color: "#4a148c",
  },
  chunkText: {
    display: "block",
    marginTop: 10,
    fontSize: 32,
    fontWeight: "bold",
    color: "#7b1fa2",
  },
  origin: {
    display: "block",
    marginTop: 8,
    fontSize: 16,
    fontWeight: 500,
    color: "#6a1b9a",
  },
};
