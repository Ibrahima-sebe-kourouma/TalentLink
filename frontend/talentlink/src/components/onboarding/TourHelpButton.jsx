import React from 'react';
import './ProductTour.css';

const TourHelpButton = ({ onClick, isFirstVisit = false }) => {
  return (
    <button
      className={`tour-help-button ${isFirstVisit ? 'first-visit' : ''}`}
      onClick={onClick}
      data-tooltip="Besoin d'aide ? Relancer le tutoriel"
      aria-label="Relancer le tutoriel"
      title="Relancer le tutoriel"
    >
      ?
      {isFirstVisit && <span className="badge">!</span>}
    </button>
  );
};

export default TourHelpButton;
