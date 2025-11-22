import React, { useState, useEffect, useCallback } from 'react';
import { API_APPOINTMENT_URL } from '../../constants/api';
import './AppointmentManager.css';

const AppointmentManager = ({ userType, recruiterId }) => {
  const [appointments, setAppointments] = useState([]);
  const [eligibleCandidates, setEligibleCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // États pour la création de rendez-vous avec calendrier
  const [proposedSlots, setProposedSlots] = useState([
    { date: '', time: '', id: 1 },
    { date: '', time: '', id: 2 },
    { date: '', time: '', id: 3 }
  ]);

  // États pour la finalisation
  const [mode, setMode] = useState('online');
  const [locationDetails, setLocationDetails] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const APPOINTMENT_SERVICE_URL = API_APPOINTMENT_URL;

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${APPOINTMENT_SERVICE_URL}/appointments/stats/${recruiterId}`);
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  }, [recruiterId, APPOINTMENT_SERVICE_URL]);

  const loadEligibleCandidates = useCallback(async () => {
    try {
      const response = await fetch(`${APPOINTMENT_SERVICE_URL}/appointments/candidates/${recruiterId}`);
      const data = await response.json();
      setEligibleCandidates(data.candidates || []);
    } catch (error) {
      console.error('Erreur chargement candidats éligibles:', error);
    }
  }, [recruiterId, APPOINTMENT_SERVICE_URL]);

  useEffect(() => {
    if (userType === 'recruiter' && recruiterId) {
      loadAppointments();
      loadEligibleCandidates();
    }
  }, [userType, recruiterId, loadAppointments, loadEligibleCandidates]);

  const createAppointment = async () => {
    if (!selectedCandidate) {
      alert('Veuillez sélectionner un candidat');
      return;
    }

    const validSlots = proposedSlots.filter(slot => slot.date && slot.time);
    if (validSlots.length !== 3) {
      alert('Veuillez proposer exactement 3 créneaux avec date et heure');
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        candidate_id: selectedCandidate.candidate_id,
        offer_id: selectedCandidate.offer_id,
        proposed_slots: validSlots.map(slot => `${slot.date}T${slot.time}:00`)
      };

      const response = await fetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/create?recruiter_id=${recruiterId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        }
      );

      if (response.ok) {
        alert('🎉 Proposition de rendez-vous envoyée au candidat !');
        setSelectedCandidate(null);
        setProposedSlots([
          { date: '', time: '', id: 1 },
          { date: '', time: '', id: 2 },
          { date: '', time: '', id: 3 }
        ]);
        loadAppointments();
        loadEligibleCandidates();
      } else {
        alert('Erreur lors de la création du rendez-vous');
      }
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      alert('Erreur lors de la création du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const completeAppointment = async (appointmentId) => {
    if (!mode || !locationDetails.trim()) {
      alert('Veuillez remplir tous les détails du rendez-vous');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/complete/${appointmentId}?recruiter_id=${recruiterId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: mode,
            location_details: locationDetails.trim(),
            additional_notes: additionalNotes.trim()
          }),
        }
      );

      if (response.ok) {
        alert('✅ Rendez-vous finalisé ! Vous pouvez maintenant envoyer l\'email au candidat.');
        setSelectedAppointment(null);
        setMode('online');
        setLocationDetails('');
        setAdditionalNotes('');
        loadAppointments();
      } else {
        alert('Erreur lors de la finalisation du rendez-vous');
      }
    } catch (error) {
      console.error('Erreur finalisation:', error);
      alert('Erreur lors de la finalisation du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const sendFinalEmail = async (appointmentId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/send-final-email/${appointmentId}?recruiter_id=${recruiterId}`,
        { method: 'POST' }
      );

      if (response.ok) {
        alert('📧 Email envoyé avec succès au candidat !');
        loadAppointments();
      } else {
        alert('Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'refused': return '💬';
      default: return '📅';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente du candidat';
      case 'confirmed': return 'À finaliser';
      case 'completed': return 'Prêt à envoyer';
      case 'sent': return 'Email envoyé';
      case 'refused': return 'Créneaux refusés - Vérifiez votre messagerie';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#8b5cf6';
      case 'sent': return '#059669';
      case 'refused': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (userType !== 'recruiter') {
    return null;
  }

  if (loading && appointments.length === 0 && eligibleCandidates.length === 0) {
    return (
      <div className="appointment-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de l'interface de gestion...</p>
      </div>
    );
  }

  return (
    <div className="appointment-manager">
      <div className="manager-header">
        <h2>📅 Gestion des Rendez-vous</h2>
        <p className="subtitle">Créez des rendez-vous pour les candidats éligibles et gérez vos entretiens</p>
      </div>

      {/* Section de création d'un nouveau rendez-vous */}
      <div className="create-appointment-section">
        <div className="section-header">
          <h3>➕ Nouveau Rendez-vous</h3>
          <p className="section-description">
            Sélectionnez un candidat éligible et proposez 3 créneaux horaires
          </p>
        </div>

        <div className="appointment-creation-layout">
          {/* Section de droite : Liste des candidats */}
          <div className="candidates-section">
            <h4>👥 Candidats éligibles</h4>
            <p className="info-text">
              Candidats dont la candidature est en "revue", "entretien" ou "offre"
            </p>
            
            {eligibleCandidates.length === 0 ? (
              <div className="no-candidates">
                <p>Aucun candidat éligible pour le moment</p>
                <small>
                  Les candidats apparaissent ici automatiquement quand leur statut 
                  de candidature passe en "En revue", "Entretien" ou "Offre faite"
                </small>
              </div>
            ) : (
              <div className="candidates-list">
                {eligibleCandidates.map((candidate) => (
                  <div 
                    key={candidate.id} 
                    className={`candidate-item ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="candidate-info">
                      <h5>{candidate.candidate_name}</h5>
                      <p className="candidate-details">
                        📧 {candidate.candidate_email}<br/>
                        💼 {candidate.position_title}<br/>
                        🏢 {candidate.company_name}
                      </p>
                      <span className="application-status">
                        Statut: {candidate.application_status}
                      </span>
                    </div>
                    {candidate.has_appointment && (
                      <span className="appointment-badge">RDV en cours</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section de gauche : Calendrier pour les créneaux */}
          <div className="calendar-section">
            <h4>📅 Proposer 3 créneaux</h4>
            {selectedCandidate ? (
              <>
                <div className="selected-candidate-info">
                  <p><strong>Candidat sélectionné :</strong> {selectedCandidate.candidate_name}</p>
                  <p><strong>Poste :</strong> {selectedCandidate.position_title}</p>
                </div>
                
                <div className="slots-calendar">
                  {proposedSlots.map((slot, index) => (
                    <div key={slot.id} className="slot-calendar-item">
                      <h5>Créneau {index + 1}</h5>
                      <div className="slot-inputs">
                        <div className="input-group">
                          <label>Date</label>
                          <input
                            type="date"
                            value={slot.date}
                            onChange={(e) => {
                              const newSlots = [...proposedSlots];
                              newSlots[index].date = e.target.value;
                              setProposedSlots(newSlots);
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            className="form-input"
                          />
                        </div>
                        <div className="input-group">
                          <label>Heure</label>
                          <input
                            type="time"
                            value={slot.time}
                            onChange={(e) => {
                              const newSlots = [...proposedSlots];
                              newSlots[index].time = e.target.value;
                              setProposedSlots(newSlots);
                            }}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-create-appointment"
                  onClick={createAppointment}
                  disabled={loading}
                >
                  {loading ? 'Création...' : '📤 Créer le rendez-vous'}
                </button>
              </>
            ) : (
              <div className="no-selection">
                <p>👈 Sélectionnez d'abord un candidat dans la liste de droite</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section des rendez-vous existants */}
      <div className="appointments-section">
        <div className="section-header">
          <h3>📋 Mes Rendez-vous ({appointments.length})</h3>
        </div>

        {appointments.length === 0 ? (
          <div className="no-appointments">
            <div className="no-appointments-icon">📅</div>
            <h3>Aucun rendez-vous pour le moment</h3>
            <p>Créez des rendez-vous avec vos candidats éligibles ci-dessus.</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-card-header">
                  <div className="appointment-title">
                    <span className="status-icon">{getStatusIcon(appointment.status)}</span>
                    <div>
                      <h4>{appointment.position_title}</h4>
                      <p className="candidate-name">
                        {appointment.candidate_name} - {appointment.candidate_email}
                      </p>
                    </div>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {getStatusText(appointment.status)}
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-row">
                    <span className="label">🗓️ Créé le:</span>
                    <span>{new Date(appointment.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {appointment.status === 'pending' && (
                    <div className="pending-info">
                      <p>⏳ En attente que le candidat choisisse un créneau parmi :</p>
                      <div className="proposed-slots">
                        {appointment.proposed_slots?.map((slot, index) => (
                          <div key={slot.id} className="proposed-slot">
                            <span className="slot-label">Option {index + 1}:</span>
                            <span className="slot-datetime">
                              {new Date(slot.proposed_datetime).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {appointment.status === 'confirmed' && (
                    <div className="confirmed-info">
                      <div className="chosen-slot">
                        <p><strong>✅ Créneau choisi par le candidat :</strong></p>
                        <div className="chosen-datetime">
                          {new Date(appointment.chosen_datetime).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      
                      <button
                        className="btn-finalize"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        ⚙️ Finaliser les détails
                      </button>
                    </div>
                  )}

                  {appointment.status === 'completed' && (
                    <div className="completed-info">
                      <div className="final-appointment-details">
                        <p><strong>🎉 Rendez-vous finalisé :</strong></p>
                        
                        <div className="detail-row">
                          <span className="label">🗓️ Date et heure:</span>
                          <span className="important">
                            {new Date(appointment.chosen_datetime).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="detail-row">
                          <span className="label">📍 Mode:</span>
                          <span>
                            {appointment.mode === 'online' && '📹 En ligne'}
                            {appointment.mode === 'physical' && '🏢 En présentiel'}
                            {appointment.mode === 'phone' && '📞 Par téléphone'}
                          </span>
                        </div>
                        
                        <div className="detail-row">
                          <span className="label">
                            {appointment.mode === 'online' && '🔗 Lien:'}
                            {appointment.mode === 'physical' && '📍 Adresse:'}
                            {appointment.mode === 'phone' && '📞 Contact:'}
                          </span>
                          <span className="location-details">{appointment.location_details}</span>
                        </div>
                        
                        {appointment.additional_notes && (
                          <div className="detail-row">
                            <span className="label">📝 Notes:</span>
                            <span>{appointment.additional_notes}</span>
                          </div>
                        )}
                      </div>

                      <button
                        className="btn-send-email"
                        onClick={() => sendFinalEmail(appointment.id)}
                        disabled={loading}
                      >
                        📧 Envoyer l'email au candidat
                      </button>
                    </div>
                  )}

                  {appointment.status === 'refused' && (
                    <div className="refused-info">
                      <p>💬 Le candidat a refusé tous les créneaux proposés.</p>
                      <p><strong>Vérifiez votre messagerie :</strong> Une conversation automatique a été créée.</p>
                      <p>Le candidat vous a envoyé un message pour proposer d'autres dates.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de finalisation des détails */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Finaliser les détails du rendez-vous</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="appointment-summary">
                <h4>📋 Résumé</h4>
                <p><strong>Candidat:</strong> {selectedAppointment.candidate_name}</p>
                <p><strong>Poste:</strong> {selectedAppointment.position_title}</p>
                <p><strong>Date choisie:</strong> {new Date(selectedAppointment.chosen_datetime).toLocaleString('fr-FR')}</p>
              </div>

              <div className="finalization-form">
                <div className="form-group">
                  <label>📍 Mode d'entretien *</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="form-select"
                  >
                    <option value="online">📹 En ligne</option>
                    <option value="physical">🏢 En présentiel</option>
                    <option value="phone">📞 Par téléphone</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    {mode === 'online' && '🔗 Lien de la réunion *'}
                    {mode === 'physical' && '📍 Adresse du rendez-vous *'}
                    {mode === 'phone' && '📞 Numéro à contacter *'}
                  </label>
                  <input
                    type="text"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    placeholder={
                      mode === 'online' ? 'https://meet.google.com/abc-defg-hij' :
                      mode === 'physical' ? '123 Rue des Entreprises, 75001 Paris' :
                      '+33 1 23 45 67 89'
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>📝 Notes additionnelles</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Informations complémentaires pour le candidat..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Annuler
                </button>
                <button
                  className="btn-confirm"
                  onClick={() => completeAppointment(selectedAppointment.id)}
                  disabled={loading}
                >
                  {loading ? 'Finalisation...' : '✅ Finaliser'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;