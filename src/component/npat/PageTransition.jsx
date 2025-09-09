import React from 'react';

const PageTransition = ({ 
  children, 
  isLoading, 
  loadingText = "Loading...", 
  loadingSubText = "", 
  showProgress = false,
  progress = 0 
}) => {
  if (isLoading) {
    return (
      <div className="page-transition">
        <div className="transition-content">
          <div className="transition-spinner-container">
            <div className="transition-spinner"></div>
            {showProgress && (
              <div className="progress-ring">
                <div 
                  className="progress-fill" 
                  style={{ transform: `rotate(${progress * 3.6}deg)` }}
                ></div>
              </div>
            )}
          </div>
          
          <div className="transition-text">
            <h3>{loadingText}</h3>
            {loadingSubText && <p>{loadingSubText}</p>}
            {showProgress && (
              <div className="progress-text">
                <span>{progress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {children}
    </div>
  );
};

export default PageTransition;
