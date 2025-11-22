import React, { useState, useEffect, useCallback } from 'react';
import { API_APPOINTMENT_URL } from '../../constants/api';
import './CandidateAppointments.css';

const CandidateAppointments = ({ candidateId, userType }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // URLs des services
  const APPOINTMENT_SERVICE_URL = API_APPOINTMENT_URL;

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/candidate/${candidateId}`
      );
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  }, [candidateId, APPOINTMENT_SERVICE_URL]);

  useEffect(() => {
    if (userType === 'candidate' && candidateId) {
      loadAppointments();
    }
  }, [candidateId, userType, loadAppointments]);



  const chooseSlot = async (appointmentId, slotId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/candidate/choose-slot?candidate_id=${candidateId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointment_id: appointmentId,
            slot_id: slotId
          }),
        }
      );

      if (response.ok) {
        alert('🎉 Créneau sélectionné avec succès! Le recruteur va finaliser les détails.');
        setSelectedSlot(null);
        loadAppointments();
      } else {
        alert('Erreur lors de la sélection du créneau');
      }
    } catch (error) {
      console.error('Erreur sélection créneau:', error);
      alert('Erreur lors de la sélection du créneau');
    } finally {
      setLoading(false);
    }
  };

  const refuseAllSlots = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir refuser tous les créneaux ? Une conversation sera créée automatiquement avec le recruteur.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${APPOINTMENT_SERVICE_URL}/appointments/candidate/refuse-all/${appointmentId}?candidate_id=${candidateId}`,
        { method: 'POST' }
      );

      if (response.ok) {
        alert('💬 Créneaux refusés. Une conversation a été créée avec le recruteur pour discuter d\'autres dates.');
        loadAppointments();
      } else {
        alert('Erreur lors du refus des créneaux');
      }
    } catch (error) {
      console.error('Erreur refus créneaux:', error);
      alert('Erreur lors du refus des créneaux');
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
      case 'pending': return 'En attente de votre choix';
      case 'confirmed': return 'Créneau confirmé - En attente des détails';
      case 'completed': return 'Rendez-vous confirmé';
      case 'refused': return 'Créneaux refusés - Vérifiez vos messages';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#8b5cf6';
      case 'refused': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (userType !== 'candidate') {
    return null;
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="appointment-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de vos rendez-vous...</p>
      </div>
    );
  }

  return (
    <div className="candidate-appointments">
      <div className="appointments-header">
        <h2>📅 Mes Rendez-vous</h2>
        <p className="subtitle">Gérez vos rendez-vous d'entretien avec les recruteurs</p>
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <div className="no-appointments-icon">📅</div>
          <h3>Aucun rendez-vous pour le moment</h3>
          <p>Les recruteurs pourront vous proposer des rendez-vous dès que vos candidatures passent en phase d'entretien.</p>
        </div>
      ) : (
        <div className="appointments-container">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-card-header">
                <div className="appointment-title">
                  <span className="status-icon">{getStatusIcon(appointment.status)}</span>
                  <div>
                    <h3>{appointment.position_title}</h3>
                    <p className="company-name">{appointment.company_name}</p>
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
                  <div className="pending-section">
                    <h4>🕰️ Créneaux proposés</h4>
                    <p className="instruction">Choisissez le créneau qui vous convient le mieux :</p>
                    
                    <div className="slots-grid">
                      {appointment.proposed_slots.map((slot, index) => (
                        <div 
                          key={slot.id} 
                          className={`slot-option ${selectedSlot === slot.id ? 'selected' : ''}`}
                          onClick={() => setSelectedSlot(slot.id)}
                        >
                          <div className="slot-number">Option {index + 1}</div>
                          <div className="slot-datetime">
                            <div className="slot-date">
                              {new Date(slot.proposed_datetime).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="slot-time">
                              {new Date(slot.proposed_datetime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="appointment-actions">
                      <button
                        className="btn-confirm"
                        onClick={() => {
                          if (selectedSlot) {
                            chooseSlot(appointment.id, selectedSlot);
                          } else {
                            alert('Veuillez sélectionner un créneau');
                          }
                        }}
                        disabled={!selectedSlot || loading}
                      >
                        {loading ? 'Confirmation...' : '✅ Confirmer ce créneau'}
                      </button>
                      
                      <button
                        className="btn-refuse"
                        onClick={() => refuseAllSlots(appointment.id)}
                        disabled={loading}
                      >
                        💬 Aucun créneau ne me convient
                      </button>
                    </div>

                    <div className="help-text">
                      <p>
                        <strong>💡 Aucun créneau ne vous convient ?</strong> Cliquez sur le bouton ci-dessus 
                        pour créer automatiquement une conversation avec le recruteur et proposer d'autres dates.
                        Le message suivant sera envoyé : "Je voudrais un autre créneau horaire pour le poste de {appointment.position_title}."
                      </p>
                    </div>
                  </div>
                )}

                {appointment.status === 'confirmed' && (
                  <div className="confirmed-section">
                    <h4>✅ Créneau confirmé</h4>
                    <div className="chosen-slot">
                      <div className="chosen-datetime">
                        <div className="chosen-date">
                          {new Date(appointment.chosen_datetime).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="chosen-time">
                          {new Date(appointment.chosen_datetime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="waiting-notice">
                      <p>🕰️ Le recruteur va finaliser les détails du rendez-vous (lieu, lien, etc.) et vous envoyer un email de confirmation.</p>
                    </div>
                  </div>
                )}

                {appointment.status === 'completed' && (
                  <div className="completed-section">
                    <h4>🎉 Rendez-vous confirmé</h4>
                    
                    <div className="final-details">
                      <div className="detail-row">
                        <span className="label">🗓️ Date et heure:</span>
                        <span className="important">
                          {new Date(appointment.chosen_datetime).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })} à {new Date(appointment.chosen_datetime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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
                    
                    <div className="success-notice">
                      <p>✅ Vous devriez avoir reçu un email de confirmation avec tous ces détails.</p>
                      <p>🚀 Bonne chance pour votre entretien !</p>
                    </div>
                  </div>
                )}

                {appointment.status === 'refused' && (
                  <div className="refused-section">
                    <h4>💬 Créneaux refusés</h4>
                    <div className="conversation-notice">
                      <p>Vous avez refusé les créneaux proposés.</p>
                      <p>💬 Une conversation a été créée automatiquement avec le recruteur.</p>
                      <p>Rendez-vous dans votre espace messagerie pour discuter de nouvelles dates.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section d'aide */}
      <div className="help-section">
        <h3>📚 Comment ça marche ?</h3>
        <div className="help-steps">
          <div className="help-step">
            <span className="step-number">1</span>
            <div>
              <h4>Proposition reçue</h4>
              <p>Le recruteur vous propose 3 créneaux pour un entretien</p>
            </div>
          </div>
          <div className="help-step">
            <span className="step-number">2</span>
            <div>
              <h4>Votre choix</h4>
              <p>Sélectionnez le créneau qui vous convient ou refusez pour discuter</p>
            </div>
          </div>
          <div className="help-step">
            <span className="step-number">3</span>
            <div>
              <h4>Finalisation</h4>
              <p>Le recruteur ajoute les détails (lieu/lien) et vous envoie une confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateAppointments;