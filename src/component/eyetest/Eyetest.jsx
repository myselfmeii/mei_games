import React, { useState, useEffect, useMemo, useCallback } from "react";
import Modal from "../common/Modal";
import "./eyetest.css";

export default function ColorGame() {
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState([]);
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'win' or 'timeout'
  const [showRulesModal, setShowRulesModal] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const levelSettings = useMemo(() => ({
    1: { size: 3, time: 5, colorDiff: 50 },
    2: { size: 5, time: 5, colorDiff: 25 },
    3: { size: 7, time: 7, colorDiff: 10 },
    4: { size: 7, time: 7, colorDiff: 10 },
    5: { size: 7, time: 7, colorDiff: 10 },
  }), []);

  const rules = useMemo(() => [
    "Find the color that's a little different from the others.",
    "You have a time limit for each level.",
    "Pick the right color to go to the next level.",
    "Finish all 5 levels to win.",
    "Missed a level? Don't stress, we'll give you feedback.",
  ], []);

const failureMessages = useMemo(() => ({
  1: "Just warming up — take your time. 👀",
  2: "Getting trickier! Step away from the screen for a bit. ⏸️",
  3: "Your eyes might be tired — be sure to rest and get good sleep daily. 🛌",
  4: "Close one! Stay hydrated and avoid screens before bed.",
  5: "You’ve come far! Take care of your eyes and body — exercise and eat well. 🍎🧘‍♂️",
}), []);



  const randomColor = useCallback(() => {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  const setupGrid = useCallback(() => {
    const { size, colorDiff } = levelSettings[level];
    const baseColor = randomColor();
    const diffColor = baseColor.replace(/\d+/g, (num) =>
      Math.min(255, parseInt(num) + colorDiff)
    );

    const total = size * size;
    const targetIndex = Math.floor(Math.random() * total);
    const newGrid = Array(total).fill(baseColor);
    newGrid[targetIndex] = diffColor;

    setTarget(targetIndex);
    setGrid(newGrid);
    setTimeLeft(levelSettings[level].time);
  }, [level, levelSettings, randomColor]);

  useEffect(() => {
    if (!gameStarted) return;

    setTimeLeft(levelSettings[level].time);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setModalType("timeout");
          setIsModalOpen(true);
          setGameStarted(false); // Stop the game
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [level, gameStarted, levelSettings]);

  useEffect(() => {
    if (gameStarted) {
      setupGrid();
    }
  }, [level, gameStarted, setupGrid]);

  const handleClick = useCallback((index) => {
    if (!gameStarted) return;

    if (index === target) {
      if (level < 5) {
        setMessage("✅ Correct! Moving to next level...");
        setTimeout(() => {
          setLevel((l) => l + 1);
          setMessage("");
        }, 1000);
      } else {
        setGameStarted(false); // Stop the timer and game
        setModalType("win");
        setIsModalOpen(true);
      }
    } else {
      setMessage("❌ Wrong! Try again.");
    }
  }, [gameStarted, target, level]);

  const handleCloseModal = useCallback(() => {
    window.history.back();
  }, []);

  const handleRetry = useCallback(() => {
    setIsModalOpen(false);
    setModalType(null);
    setMessage("");
    setLevel(1);
    setGameStarted(true);
  }, []);

  const handleStartGame = useCallback(() => {
    setShowRulesModal(false);
    setGameStarted(true);
  }, []);

  const gridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${levelSettings[level].size}, 60px)`,
    pointerEvents: gameStarted ? "auto" : "none",
    opacity: gameStarted ? 1 : 0.5,
  }), [level, levelSettings, gameStarted]);

  return (
    <div className="game">
      <h1>
        Color Game 🎨 - Level {level}{" "}
        {level >= 3 && <span className="devil">😈</span>}
      </h1>

      {gameStarted && <p>Time Left: {timeLeft}s</p>}

      <div className="grid" style={gridStyle}>
        {grid.map((color, i) => (
          <div
            key={i}
            className="cell"
            style={{ backgroundColor: color }}
            onClick={() => handleClick(i)}
          />
        ))}
      </div>

      <p>{message}</p>

      {/* Rules Modal */}
      <Modal isOpen={showRulesModal} onClose={handleCloseModal} title="Game Rules">
        <ul style={{ textAlign: "left" }}>
          {rules.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
        <button className="start-button" onClick={handleStartGame}>
          Start
        </button>
      </Modal>
     
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalType === "win" ? "🎉 Congratulations!" : "⏳ Time’s up!"}
      >
        {modalType === "timeout" && (
          <>
            <p>{failureMessages[level]}</p>
            <div className="modal-actions">
              <button onClick={handleRetry}>🔁 Retry</button>
              <button onClick={handleCloseModal}>❌ Exit Game</button>
            </div>
          </>
        )}
        {modalType === "win" && (
          <p>You won! Your eyesight is seriously impressive. You’ve got a sharp eye!</p>
        )}
      </Modal>
    </div>
  );
}