import React, { useState } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import './ProductTour.css';

/**
 * Composant ProductTour - Wrapper autour de React Joyride
 * Gère les tours guidés de l'application TalentLink
 */
export default function ProductTour({ steps, tourKey, userId, onComplete, run }) {
  const [stepIndex, setStepIndex] = useState(0);

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED]).includes(status)) {
      // Tour terminé ou passé
      setStepIndex(0);
      if (onComplete) {
        onComplete();
      }
    } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND]).includes(type)) {
      // Passage à l'étape suivante
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextStepIndex);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#6366f1',
          zIndex: 10000,
          arrowColor: '#fff',
          backgroundColor: '#fff',
          textColor: '#374151',
        },
        tooltip: {
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '380px',
        },
        tooltipContent: {
          padding: '10px 0',
          fontSize: '15px',
          lineHeight: '1.6',
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '10px',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
        },
        spotlight: {
          borderRadius: '4px',
        },
      }}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        open: 'Ouvrir',
        skip: 'Passer tout',
      }}
    />
  );
}
