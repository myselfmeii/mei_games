import React, { useReducer, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import './innervoice.css';

const initialState = {
  started: false,
  currentQuestionIndex: 0,
  answers: [],
  isFinished: false,
};

const questions = [
  "I'm checking the fridge for the 5th time with no new food",
  "I'm pretending to work while scrolling memes",
  "I'm laughing at my own jokes in silence",
  "I'm mentally arguing with someone in the shower",
  "I'm staring at the wall instead of doing tasks",
  "I'm saying “I'm fine” while dying inside",
  "I'm overthinking that one thing from 3 years ago",
  "I'm replying to texts after 3 business days",
  "I'm eating snacks 10 minutes after a full meal",
  "I'm refreshing messages to see if they texted back",
];

const options = ['Yes', 'No', 'Maybe', 'Leave blank'];

const rules = [
  'Feel free to answer',
  'Recall yourself',
  'Take a moment',
  'No judgment here',
];

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, started: true };
    case 'ANSWER':
      const updatedAnswers = [...state.answers];
      updatedAnswers[state.currentQuestionIndex] = action.payload;
      const nextIndex = state.currentQuestionIndex + 1;
      const finished = nextIndex >= questions.length;
      return {
        ...state,
        answers: updatedAnswers,
        currentQuestionIndex: finished ? state.currentQuestionIndex : nextIndex,
        isFinished: finished,
      };
    case 'RESTART':
      return initialState;
    default:
      return state;
  }
}

const OptionButton = React.memo(({ option, onSelect, selected }) => {
  return (
    <button
      className={`option-button ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(option)}
      aria-pressed={selected}
      aria-label={`Answer option: ${option}`}
      type="button"
    >
      {option}
    </button>
  );
});

const RuleList = React.memo(({ rules }) => (
  <ul className="rules-list">
    {rules.map((rule, i) => (
      <li key={i} className="rule-item">
        <span className="rule-icon">💡</span> {rule}
      </li>
    ))}
  </ul>
));

const InnerVoice = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { started, currentQuestionIndex, answers, isFinished } = state;

  const handleStart = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const handleAnswer = useCallback((option) => {
    dispatch({ type: 'ANSWER', payload: option });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const percentage = useMemo(() => {
    return Math.round(
      ((currentQuestionIndex + (isFinished ? 1 : 0)) / questions.length) * 100
    );
  }, [currentQuestionIndex, isFinished]);

  const selectedAnswer = answers[currentQuestionIndex] || '';

   const navigate = useNavigate();

  const handleExit = () => {
    navigate("/");
  };

  if (!started) {
    return (
      <div className="quiz-container" role="main" aria-label="Quiz Rules">
        <div className="quiz-card">
          <h1 className="quiz-title">Inner Voice Quiz</h1>
          <h2 className="rules-title">Remainder</h2>
          <RuleList rules={rules} />
           <div style={{ display: 'flex', gap: 10 }}>
          <button className="start-button" onClick={handleStart} type="button">
            Start Quiz
          </button>
            <button className="exit-button" onClick={handleExit} type="button">
            Exit Quiz
          </button>
          </div>    
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container" role="main" aria-live="polite">
      <div className="quiz-card">
        <span className="quiz-title">Inner Voice Quiz</span>

        <div
          className="progress-bar-container"
          aria-label={`Progress: ${percentage}%`}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="progress-text" aria-live="off">
          {isFinished
            ? 'Completed!'
            : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
        </p>

        {!isFinished ? (
          <section
            className="question-section"
            aria-labelledby="question-label"
            role="region"
          >
            <p className="question-text" id="question-label">
              <span className="question-number">
                {currentQuestionIndex + 1}.
              </span>
              <span className="answer-blank">___________</span>,
              {questions[currentQuestionIndex]}
            </p>
            <div className="options-container" role="list">
              {options.map((option) => (
                <OptionButton
                  key={option}
                  option={option}
                  onSelect={handleAnswer}
                  selected={selectedAnswer === option}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="results-section" aria-live="polite">
            <span className="results-title">
              You finished! Here's your Inner Voice's:
            </span>
            <ul className="results-list">
              {questions.map((question, index) => (
                <li key={index} className="result-item">
                  <span className="result-answer-container">
                    <span className="result-answer">{answers[index]}</span>
                  </span>
                  <span className="result-question">{question}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                className="play-again-button"
                onClick={handleRestart}
                type="button"
              >
                Play Again
              </button>
              <button
                className="exit-button"
                onClick={handleExit}
                type="button"
              >
                Exit game
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default InnerVoice;
