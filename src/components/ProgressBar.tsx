import React from "react";

interface ProgressBarProps {
  progress: number;
  goal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, goal }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const clampProgress = Math.min(progress, goal);
  const offset = circumference - (clampProgress / goal) * circumference;

  return (
    <div className="progress-bar-container">
      <svg width="200" height="200" className="progress-bar">
        <circle
          r={radius}
          cx="100"
          cy="100"
          fill="transparent"
          strokeWidth="10"
          stroke="#f8f8f8"
        />
        <circle
          r={radius}
          cx="100"
          cy="100"
          fill="transparent"
          strokeWidth="10"
          stroke="#00aaff"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <p>
        Daily Calorie Goal: <span>{goal}</span>
      </p>
    </div>
  );
};

export default ProgressBar;
