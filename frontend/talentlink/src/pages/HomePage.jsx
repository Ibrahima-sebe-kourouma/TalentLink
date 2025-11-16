import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const HomePage = ({ user }) => (
  <div className="home-container">
    <header className="home-header">
      <Link to="/" className="home-logo">TalentLink</Link>
      <nav className="home-nav">
        {user ? (
          <>
            <span className="nav-link">Bonjour, {user.email}</span>
            <Link to="/profile" className="nav-link">Mon Profil</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Se connecter</Link>
            <Link to="/register" className="btn-primary">S'inscrire</Link>
          </>
        )}
      </nav>
    </header>

    <section className="hero-section">
      <h1 className="hero-title">Trouvez votre talent ou votre opportunité idéale</h1>
      <p className="hero-subtitle">
        TalentLink est la plateforme qui connecte les meilleurs talents avec les entreprises innovantes.
        Simplifiez votre processus de recrutement et trouvez les meilleures opportunités de carrière.
      </p>
      {!user && (
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">Commencer maintenant</Link>
          <Link to="/login" className="btn-secondary">J'ai déjà un compte</Link>
        </div>
      )}
    </section>

    <section className="features-section">
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Matching Intelligent</h3>
          <p className="feature-description">
            Notre algorithme analyse vos compétences et vos préférences pour vous proposer les meilleures correspondances.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3 className="feature-title">Profil Professionnel</h3>
          <p className="feature-description">
            Créez un profil attractif qui met en valeur vos compétences et votre expérience.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3 className="feature-title">Mise en Relation Directe</h3>
          <p className="feature-description">
            Communiquez directement avec les recruteurs ou les candidats qui vous intéressent.
          </p>
        </div>
      </div>
    </section>

    <section className="cta-section">
      <h2 className="cta-title">Prêt à faire décoller votre carrière ?</h2>
      <p className="cta-subtitle">
        Rejoignez TalentLink aujourd'hui et découvrez les meilleures opportunités professionnelles.
      </p>
      {!user && (
        <Link to="/register" className="btn-primary">S'inscrire gratuitement</Link>
      )}
    </section>

    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column">
          <h3>TalentLink</h3>
          <ul className="footer-links">
            <li><Link to="/about">À propos</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Confidentialité</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Pour les candidats</h3>
          <ul className="footer-links">
            <li><Link to="/browse-jobs">Parcourir les offres</Link></li>
            <li><Link to="/career-advice">Conseils carrière</Link></li>
            <li><Link to="/cv-tips">Conseils CV</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Pour les recruteurs</h3>
          <ul className="footer-links">
            <li><Link to="/post-job">Publier une offre</Link></li>
            <li><Link to="/search-candidates">Rechercher des profils</Link></li>
            <li><Link to="/pricing">Tarifs</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
);

export default HomePage;
