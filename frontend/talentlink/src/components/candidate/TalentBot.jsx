import React from "react";

export default function TalentBotCandidate({ user }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      {/* Icône du bot */}
      <div style={{
        fontSize: '80px',
        marginBottom: '24px',
        opacity: 0.7
      }}>
        🤖
      </div>
      
      {/* Titre */}
      <h2 style={{
        margin: '0 0 16px',
        color: 'var(--tl-text)',
        fontSize: '28px',
        fontWeight: 700
      }}>
        TalentBot - Assistant Carrière
      </h2>
      
      {/* Sous-titre */}
      <p style={{
        color: 'var(--tl-text-secondary)',
        fontSize: '18px',
        margin: '0 0 32px',
        maxWidth: '500px',
        lineHeight: 1.5
      }}>
        Votre assistant IA personnel pour booster votre recherche d'emploi
      </p>
      
      {/* Badge "Bientôt disponible" */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(99, 102, 241, 0.1))',
        border: '1px solid rgba(37, 99, 235, 0.2)',
        borderRadius: '24px',
        padding: '12px 24px',
        marginBottom: '32px'
      }}>
        <span style={{
          fontSize: '12px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'orange',
          display: 'inline-block',
          animation: 'pulse 2s infinite'
        }}></span>
        <span style={{
          color: 'var(--tl-primary-600)',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          Fonctionnalité en développement
        </span>
      </div>
      
      {/* Description des fonctionnalités à venir */}
      <div style={{
        background: 'var(--tl-surface)',
        border: '1px solid var(--tl-border)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        textAlign: 'left'
      }}>
        <h3 style={{
          margin: '0 0 16px',
          color: 'var(--tl-text)',
          fontSize: '18px',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Fonctionnalités prévues
        </h3>
        
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <div>
              <strong>Conseils personnalisés :</strong> Obtenez des recommandations sur-mesure pour votre carrière
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>📝</span>
            <div>
              <strong>Optimisation CV :</strong> Amélioration automatique de votre profil et CV
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <div>
              <strong>Matching intelligent :</strong> Découverte d'offres parfaitement adaptées à votre profil
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <div>
              <strong>Préparation entretiens :</strong> Entraînement et conseils pour vos entretiens
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>📊</span>
            <div>
              <strong>Analyse de marché :</strong> Insights sur les tendances du marché du travail
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>🚀</span>
            <div>
              <strong>Suivi candidatures :</strong> Accompagnement personnalisé dans vos démarches
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <p style={{
        marginTop: '32px',
        color: 'var(--tl-text-muted)',
        fontSize: '14px',
        fontStyle: 'italic'
      }}>
        Restez connecté pour être informé du lancement de votre assistant carrière
      </p>
      
      {/* Animation CSS */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}