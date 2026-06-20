// BGMI STATIC HUB - CLIENT JS UTILITIES
// This script interacts with Firebase Services established in firebase-config.js

document.addEventListener('DOMContentLoaded', () => {
  const tournamentsContainer = document.getElementById('tournaments-container');
  const detailsModal = document.getElementById('details-modal');
  const modalBody = document.getElementById('modal-detail-body');
  const regFormContainer = document.getElementById('registration-form-container');
  
  let activeTournaments = [];

  // 1. Fetch Tournaments from cloud Firestore
  function listenTournaments() {
    if (typeof db === 'undefined') {
      console.warn("Firestore db object missing - ensure firebase-config.js load");
      return;
    }

    db.collection('tournaments').orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        activeTournaments = [];
        tournamentsContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
          tournamentsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #6b7280;">
              <h3>No matchups specified. Log into Admin panel to deploy rooms.</h3>
            </div>
          `;
          return;
        }

        querySnapshot.forEach((doc) => {
          const tournament = { id: doc.id, ...doc.data() };
          activeTournaments.push(tournament);
          renderTournamentCard(tournament);
        });
      }, (error) => {
        console.error("Firestore Listen error: ", error);
      });
  }

  // 2. Render Card to grid container
  function renderTournamentCard(t) {
    const isFull = t.joinedSlots >= t.maxSlots;
    const isClosed = t.status === 'Closed' || t.status === 'Completed';
    const percent = Math.min((t.joinedSlots / t.maxSlots) * 100, 100);
    
    let progressClass = '';
    if (percent >= 90) progressClass = 'danger';
    else if (percent >= 65) progressClass = 'warning';

    const card = document.createElement('div');
    card.className = 't-card';
    card.id = `card-${t.id}`;

    card.innerHTML = `
      <div class="card-banner">
        <span class="badge badge-gold">${t.type} Match</span>
        <span class="badge">${t.map}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${t.title}</h3>
        
        <div class="card-info-row">
          <div class="card-info-box">
            <span class="info-label">Prize Pool</span>
            <span class="info-value text-green">₹${t.prizePool}</span>
          </div>
          <div class="card-info-box">
            <span class="info-label">Entry Fee</span>
            <span class="info-value ${t.entryFee === 0 ? 'free' : ''}">
              ${t.entryFee === 0 ? 'FREE' : '₹' + t.entryFee}
            </span>
          </div>
        </div>

        <div class="card-date-box">
          📅 ${formatCustomDateTime(t.dateTime)}
        </div>

        <div class="slots-wrapper">
          <div class="slots-header">
            <span style="color: #9cb3af;">Slots Taken:</span>
            <span style="font-weight: bold; color: ${percent >= 90 ? '#ef4444' : '#10b981'};">
              ${t.joinedSlots} / ${t.maxSlots}
            </span>
          </div>
          <div class="slots-bar">
            <div class="slots-fill ${progressClass}" style="width: ${percent}%;"></div>
          </div>
        </div>

        <button class="btn btn-primary card-btn" id="join-btn-${t.id}">
          ${isClosed ? 'Lobby Closed' : isFull ? 'Lobby Full / Specs' : 'Claim Spot Now'}
        </button>
      </div>
    `;

    tournamentsContainer.appendChild(card);

    // Apply active trigger listener
    document.getElementById(`join-btn-${t.id}`).addEventListener('click', () => {
      openDetailsModal(t);
    });
  }

  // 3. Render Details Modal
  function openDetailsModal(t) {
    detailsModal.style.display = 'flex';
    
    const isFull = t.joinedSlots >= t.maxSlots;
    const isClosed = t.status === 'Closed' || t.status === 'Completed';

    modalBody.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <span class="hero-tag" style="margin-bottom: 0.5rem;">${t.type} • ${t.map}</span>
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${t.title}</h2>
      </div>

      <div class="card-info-row" style="margin-bottom: 1.5rem;">
        <div class="card-info-box">
          <span class="info-label">Scheduled Battle</span>
          <span style="font-size: 0.85rem; font-weight: bold;">${formatCustomDateTime(t.dateTime)}</span>
        </div>
        <div class="card-info-box">
          <span class="info-label">WhatsApp Channel</span>
          <span style="font-size: 0.85rem; font-weight: bold; color: var(--accent-gold);">Match Group Active</span>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--accent-gold);">Battle Arena Rules</h3>
        <ul style="font-size: 0.8rem; color: var(--text-gray); margin-left: 1rem; line-height: 1.6;">
          ${t.rules && t.rules.length > 0 ? t.rules.map(r => `<li>✓ ${r}</li>`).join('') : `
            <li>✓ Mobile Screen play strictly allowed. No screen simulators, hacks or modifications. Teaming results in bans.</li>
            <li>✓ Credentials are shared 15 minutes prior in WhatsApp match group.</li>
          `}
        </ul>
      </div>

      <div id="booking-form-area">
        ${isClosed ? `
          <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); padding: 1rem; border-radius: 0.75rem; text-align: center; color: #f87171; font-weight: bold;">
            REGISTRATION TIME WAS COMPLETED
          </div>
        ` : isFull ? `
          <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); padding: 1rem; border-radius: 0.75rem; text-align: center; color: #f87171; font-weight: bold;">
            SLOTS ARE COMLETELY PACKED! PLEASE WAIT FOR SUBSEQUENT LOBBIES.
          </div>
        ` : `
          <button class="btn btn-primary" id="start-register-btn" style="width: 100%; justify-content: center; padding: 1rem; font-size: 1rem;">
            Claim Slot Form
          </button>
        `}
      </div>
    `;

    const triggerBtn = document.getElementById('start-register-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        renderRegistrationForm(t);
      });
    }
  }

  // 4. Render Registration Form input inside Modal
  function renderRegistrationForm(t) {
    const bookingFormArea = document.getElementById('booking-form-area');
    
    bookingFormArea.innerHTML = `
      <form id="firebase-registration-form" style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 1rem; border: 1px solid rgba(244,166,29,0.2); margin-top: 1rem;" class="animated">
        <h4 style="font-size: 0.85rem; color: var(--accent-gold); margin-bottom: 1rem; font-family: var(--font-display);">Tournament Ticket parameters</h4>
        
        <div class="form-group">
          <label>Leader Game Name (IGN) *</label>
          <input type="text" id="p-ign" required placeholder="In-game Name">
        </div>

        <div class="form-group">
          <label>Character ID (Numeric) *</label>
          <input type="text" id="p-charid" required placeholder="e.g. 5183920194">
        </div>

        <div class="form-group">
          <label>WhatsApp Contact Mobile *</label>
          <input type="tel" id="p-phone" required maxLength="10" placeholder="10 Digit number">
        </div>

        <div class="form-group">
          <label>Email Address *</label>
          <input type="email" id="p-email" required placeholder="player@gmail.com">
        </div>

        ${t.type !== 'Solo' ? `
          <div class="form-group">
            <label>Team Name *</label>
            <input type="text" id="p-teamname" required placeholder="Clan/Team Name">
          </div>
          <div class="form-group">
            <label>Teammate Names (comma separated) *</label>
            <input type="text" id="p-teammates" required placeholder="IGN TM2, IGN TM3, IGN TM4">
          </div>
        ` : ''}

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button type="button" class="btn" id="cancel-form-btn" style="background: rgba(0,0,0,0.5); color: #fff;">Cancel</button>
          <button type="submit" class="btn btn-primary" id="commit-form-btn">Confirm Slot</button>
        </div>
      </form>
    `;

    document.getElementById('cancel-form-btn').addEventListener('click', () => {
      openDetailsModal(t);
    });

    const form = document.getElementById('firebase-registration-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const ign = document.getElementById('p-ign').value.trim();
      const characterId = document.getElementById('p-charid').value.trim();
      const phoneNumber = document.getElementById('p-phone').value.trim();
      const email = document.getElementById('p-email').value.trim();
      
      const teamNameInput = document.getElementById('p-teamname');
      const teammatesInput = document.getElementById('p-teammates');
      
      const teamName = teamNameInput ? teamNameInput.value.trim() : null;
      const teammatesStr = teammatesInput ? teammatesInput.value.trim() : "";
      const teammateArray = teammatesStr ? teammatesStr.split(',').map(name => name.trim()) : [];

      if (!ign || !characterId || !phoneNumber || !email) {
        alert('All core fields are required.');
        return;
      }

      if (isNaN(Number(characterId))) {
        alert('Character ID must be completely numeric.');
        return;
      }

      const commitBtn = document.getElementById('commit-form-btn');
      commitBtn.disabled = true;
      commitBtn.innerText = 'Synchronizing Ticket...';

      try {
        // Double check character existence registration
        const dupSnapshot = await db.collection('registrations')
          .where('tournamentId', '==', t.id)
          .where('characterId', '==', characterId)
          .get();

        if (!dupSnapshot.empty) {
          alert('This BGMI character ID is already registered for this battle!');
          commitBtn.disabled = false;
          commitBtn.innerText = 'Confirm Slot';
          return;
        }

        // Complete save
        const payload = {
          tournamentId: t.id,
          ign,
          characterId,
          phoneNumber,
          email,
          teamName,
          teammates: teammateArray,
          registeredAt: new Date().toISOString()
        };

        await db.collection('registrations').add(payload);
        
        // Increase slots count
        await db.collection('tournaments').doc(t.id).update({
          joinedSlots: firebase.firestore.FieldValue.increment(1)
        });

        // Show Success card
        bookingFormArea.innerHTML = `
          <div style="text-align: center; padding: 2rem 0; animation: scaleUp 0.3s;" class="success-screen">
            <span style="font-size: 3rem; color: var(--whatsapp-green);">✓</span>
            <h3 style="font-size: 1.25rem; margin: 1rem 0 0.5rem; text-transform: uppercase;">Registration Confirmed!</h3>
            <p style="font-size: 0.8rem; color: var(--text-gray); margin-bottom: 1.5rem;">Join the official dynamic WhatsApp tournament coordination link directly below:</p>
            
            <a href="${t.whatsappLink || 'https://wa.me/919999999999'}" target="_blank" class="btn btn-primary" style="background:#25D366; color:#000; width:100%; justify-content:center; padding:0.875rem; font-weight:800; font-size:0.9rem;">
              Join Active WhatsApp Match Lobby
            </a>
          </div>
        `;
      } catch (err) {
        console.error(err);
        alert('Cloud synchronisation timed out: ' + err.message);
        commitBtn.disabled = false;
        commitBtn.innerText = 'Confirm Slot';
      }
    });
  }

  // Utility Date Formatter
  function formatCustomDateTime(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return dateStr;
    }
  }

  // Modal Closer triggers
  document.getElementById('modal-close-trigger').addEventListener('click', () => {
    detailsModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === detailsModal) {
      detailsModal.style.display = 'none';
    }
  });

  // Start Listener loops
  listenTournaments();
});
