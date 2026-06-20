// BGMI STATIC HUB - ADMIN PORTAL UTILITY SCRIPT
// Coordinates authentication gates and Firestore CRUD structures

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const authGate = document.getElementById('auth-gate-section');
  const adminDashboard = document.getElementById('admin-dashboard-section');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('logout-admin-btn');
  
  const openBuilderBtn = document.getElementById('open-builder-btn');
  const hideBuilderBtn = document.getElementById('hide-builder-btn');
  const builderBox = document.getElementById('tournament-builder-box');
  const specForm = document.getElementById('tournament-spec-form');
  const saveTournamentBtn = document.getElementById('save-t-btn');
  
  const tournamentsTbody = document.getElementById('tournaments-tbody');
  const registrationsTbody = document.getElementById('registrations-tbody');
  const dropdownSelector = document.getElementById('player-selector-dropdown');

  let activeLobbies = [];

  // 1. Listen for Authentication states
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is entered
      authGate.style.display = 'none';
      adminDashboard.style.display = 'block';
      logoutBtn.style.display = 'inline-flex';
      
      initAdminPanel();
    } else {
      // User is logged out
      authGate.style.display = 'block';
      adminDashboard.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
  });

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();
    
    const authBtn = document.getElementById('auth-btn');
    authBtn.disabled = true;
    authBtn.innerText = 'Verifying security keys...';

    try {
      await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
      console.error(err);
      alert('Authentication Gateway error: ' + err.message + '\nTry "admin@bgmi.com" / "admin123"');
    } finally {
      authBtn.disabled = false;
      authBtn.innerText = 'Authenticate access';
    }
  });

  // Logout trigger
  logoutBtn.addEventListener('click', () => {
    auth.signOut();
  });

  // Toggle builder form
  openBuilderBtn.addEventListener('click', () => {
    resetForm();
    builderBox.style.display = 'block';
    openBuilderBtn.style.display = 'none';
  });

  hideBuilderBtn.addEventListener('click', () => {
    resetForm();
  });

  function resetForm() {
    specForm.reset();
    document.getElementById('edit-t-id').value = '';
    document.getElementById('builder-action-title').innerText = 'Deploy New Custom Battle room';
    saveTournamentBtn.innerText = 'Deploy Match specs';
    builderBox.style.display = 'none';
    openBuilderBtn.style.display = 'inline-flex';
  }

  // Initialize DB data loops
  function initAdminPanel() {
    loadLobbies();
  }

  // 2. Load Lobbies
  function loadLobbies() {
    db.collection('tournaments').orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        activeLobbies = [];
        tournamentsTbody.innerHTML = '';
        
        // Reset Selector dropdown
        dropdownSelector.innerHTML = '<option value="">Choose tournament match...</option>';

        if (querySnapshot.empty) {
          tournamentsTbody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; padding: 2rem;">No active tournaments deployed. Click "Deploy Custom Battle Room".</td>
            </tr>
          `;
          return;
        }

        querySnapshot.forEach((doc) => {
          const lobby = { id: doc.id, ...doc.data() };
          activeLobbies.push(lobby);
          
          // Append dropdown selector
          const option = document.createElement('option');
          option.value = lobby.id;
          option.innerText = `${lobby.title} (${lobby.type})`;
          dropdownSelector.appendChild(option);

          appendTournamentRow(lobby);
        });
      });
  }

  // Append row
  function appendTournamentRow(l) {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    tr.innerHTML = `
      <td style="padding:1rem; font-weight:bold; color:#fff;">
        ${l.title} 
        <span style="font-size:0.7rem; padding:0.15rem 0.4rem; background:rgba(255,255,255,0.1); border-radius:4px; margin-left:0.5rem; color:#9cb3af;">${l.type}</span>
      </td>
      <td style="padding:1rem;">${l.map}</td>
      <td style="padding:1rem; color:#10b981; font-weight:bold;">₹${l.prizePool}</td>
      <td style="padding:1rem;">${l.entryFee === 0 ? '<span style="color:#C5FF1A;">FREE</span>' : '₹' + l.entryFee}</td>
      <td style="padding:1rem; font-family:monospace;">${l.joinedSlots} / ${l.maxSlots}</td>
      <td style="padding:1rem;">
        <span style="font-size:0.75rem; font-weight:bold; color: ${l.status === 'Live' ? '#ef4444' : l.status === 'Closed' ? '#f59e0b' : '#3b82f6'};">
          ${l.status}
        </span>
      </td>
      <td style="padding:1rem; text-align:right;">
        <button class="btn" id="edit-btn-${l.id}" style="padding:0.3rem 0.6rem; font-size:0.75rem; background:rgba(244,166,29,0.1); color:var(--accent-gold); margin-right:0.25rem;">Edit</button>
        <button class="btn" id="delete-btn-${l.id}" style="padding:0.3rem 0.6rem; font-size:0.75rem; background:rgba(239, 68, 68, 0.1); color:#ef4444;">Remove</button>
      </td>
    `;

    tournamentsTbody.appendChild(tr);

    // Bind triggers
    document.getElementById(`edit-btn-${l.id}`).addEventListener('click', () => {
      loadEditSpecs(l);
    });

    document.getElementById(`delete-btn-${l.id}`).addEventListener('click', () => {
      triggerDelete(l.id);
    });
  }

  // Load editing values
  function loadEditSpecs(l) {
    document.getElementById('edit-t-id').value = l.id;
    document.getElementById('t-title').value = l.title;
    document.getElementById('t-type').value = l.type;
    document.getElementById('t-map').value = l.map;
    document.getElementById('t-prize').value = l.prizePool;
    document.getElementById('t-entry').value = l.entryFee;
    document.getElementById('t-datetime').value = l.dateTime;
    document.getElementById('t-slots').value = l.maxSlots;
    document.getElementById('t-status').value = l.status;
    document.getElementById('t-whatsapp').value = l.whatsappLink || '';
    document.getElementById('t-rules').value = l.rules ? l.rules.join('\n') : '';

    document.getElementById('builder-action-title').innerText = 'Modify Spaced Lobbys';
    saveTournamentBtn.innerText = 'Update Match specs';
    builderBox.style.display = 'block';
    openBuilderBtn.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete Tournament logic
  async function triggerDelete(tId) {
    if (!window.confirm("Permanent remove tournament room? This cannot be undone.")) return;
    try {
      await db.collection('tournaments').doc(tId).delete();
    } catch (err) {
      alert("CRUD execution error: " + err.message);
    }
  }

  // Form Submission handles Add & Update
  specForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = document.getElementById('edit-t-id').value;
    const title = document.getElementById('t-title').value.trim();
    const type = document.getElementById('t-type').value;
    const map = document.getElementById('t-map').value;
    const prizePool = Number(document.getElementById('t-prize').value);
    const entryFee = Number(document.getElementById('t-entry').value);
    const dateTime = document.getElementById('t-datetime').value;
    const maxSlots = Number(document.getElementById('t-slots').value);
    const status = document.getElementById('t-status').value;
    const whatsappLink = document.getElementById('t-whatsapp').value.trim() || null;
    const rulesText = document.getElementById('t-rules').value;
    const rulesArray = rulesText.split('\n').map(r => r.trim()).filter(r => r.length > 0);

    saveTournamentBtn.disabled = true;
    saveTournamentBtn.innerText = 'Executing Sync...';

    const payload = {
      title, type, map, prizePool, entryFee, dateTime, maxSlots, status, whatsappLink,
      rules: rulesArray,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editId) {
        // Edit flow
        await db.collection('tournaments').doc(editId).update(payload);
      } else {
        // Add flow
        await db.collection('tournaments').add({
          ...payload,
          joinedSlots: 0,
          createdAt: new Date().toISOString()
        });
      }
      resetForm();
    } catch (err) {
      alert("Error committing details: " + err.message);
    } finally {
      saveTournamentBtn.disabled = false;
      saveTournamentBtn.innerText = editId ? 'Update Match specs' : 'Deploy Match specs';
    }
  });

  // 3. Dropdown selector change listener load participants
  dropdownSelector.addEventListener('change', (e) => {
    const selectedTourId = e.target.value;
    if (!selectedTourId) {
      registrationsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-gray);">Select a tournament above to load active participant clans</td>
        </tr>
      `;
      return;
    }

    registrationsTbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem;">Loading participants list...</td>
      </tr>
    `;

    db.collection('registrations').where('tournamentId', '==', selectedTourId)
      .onSnapshot((querySnapshot) => {
        registrationsTbody.innerHTML = '';
        if (querySnapshot.empty) {
          registrationsTbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-gray);">No players registered for this battle yet.</td>
            </tr>
          `;
          return;
        }

        querySnapshot.forEach((doc) => {
          const reg = { id: doc.id, ...doc.data() };
          appendRegistrationRow(reg);
        });
      });
  });

  function appendRegistrationRow(r) {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    tr.innerHTML = `
      <td style="padding:1rem; font-weight:bold; color:#10b981; font-family:monospace;">${r.ign}</td>
      <td style="padding:1rem; font-family:monospace;">${r.characterId}</td>
      <td style="padding:1rem; color:#25D366; font-family:monospace; font-weight:bold;">${r.phoneNumber}</td>
      <td style="padding:1rem;">${r.email}</td>
      <td style="padding:1rem;">
        ${r.teamName ? `<div style="font-weight:bold;">${r.teamName}</div><span style="font-size:0.7rem; color:var(--text-gray);">TMs: ${r.teammates ? r.teammates.join(', ') : ''}</span>` : '<span style="font-size:0.75rem; color:var(--text-gray);">SOLO MATCH</span>'}
      </td>
      <td style="padding:1rem; text-align:right;">
        <button class="btn" id="remove-reg-${r.id}" style="padding:0.3rem 0.6rem; font-size:0.75rem; background:rgba(239, 68, 68, 0.1); color:#ef4444;">Remove</button>
      </td>
    `;

    registrationsTbody.appendChild(tr);

    document.getElementById(`remove-reg-${r.id}`).addEventListener('click', async () => {
      if (!window.confirm("Remove registered player/team? This frees 1 slot.")) return;

      try {
        await db.collection('registrations').doc(r.id).delete();
        
        // Decrement Slots Count
        await db.collection('tournaments').doc(r.tournamentId).update({
          joinedSlots: firebase.firestore.FieldValue.increment(-1)
        });
      } catch (err) {
        alert("Operation failed: " + err.message);
      }
    });
  }

});
