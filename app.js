(() => {
  'use strict';

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Bootstrap validation
  document.querySelectorAll('.needs-validation').forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });

  // Membership plan buttons
  document.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      localStorage.setItem('dma_selected_plan', plan);
    });
  });

  const selectedPlan = localStorage.getItem('dma_selected_plan');
  const planSelect = document.querySelector('#membershipPlan');
  if (selectedPlan && planSelect) planSelect.value = selectedPlan;

  // Account prototype using localStorage only
  const registerForm = document.querySelector('#registerForm');
  const loginForm = document.querySelector('#loginForm');
  const profileBox = document.querySelector('#profileBox');
  const authTabs = document.querySelector('#authTabs');

  function getAccount() {
    try { return JSON.parse(localStorage.getItem('dma_account') || 'null'); }
    catch { return null; }
  }

  function renderProfile() {
    const account = getAccount();
    if (!account || !profileBox) return;
    profileBox.innerHTML = `
      <div class="account-panel p-4 p-lg-5">
        <span class="badge bg-dma-yellow text-dark mb-3">Member profile</span>
        <h2 class="fw-bold mb-1">Welcome, ${escapeHtml(account.name)}</h2>
        <p class="text-secondary mb-4">${escapeHtml(account.email)}</p>
        <div class="row g-3 mb-4">
          <div class="col-md-6"><div class="p-3 rounded bg-light"><span class="small-caps text-secondary">Membership</span><div class="fs-5 fw-bold">${escapeHtml(account.plan)}</div></div></div>
          <div class="col-md-6"><div class="p-3 rounded bg-light"><span class="small-caps text-secondary">Status</span><div class="fs-5 fw-bold text-success">Active demo</div></div></div>
        </div>
        <label for="profilePlan" class="form-label fw-bold">Change membership</label>
        <div class="input-group mb-3">
          <select id="profilePlan" class="form-select">
            ${['Basic','Intermediate','Advanced','Elite','Junior'].map(p => `<option ${p===account.plan?'selected':''}>${p}</option>`).join('')}
          </select>
          <button class="btn btn-dma" id="savePlanBtn" type="button">Save</button>
        </div>
        <button class="btn btn-outline-dark" id="logoutBtn" type="button">Sign out</button>
      </div>`;

    document.querySelector('#savePlanBtn')?.addEventListener('click', () => {
      account.plan = document.querySelector('#profilePlan').value;
      localStorage.setItem('dma_account', JSON.stringify(account));
      showToast('Membership updated in this browser demo.');
      renderProfile();
    });
    document.querySelector('#logoutBtn')?.addEventListener('click', () => {
      localStorage.removeItem('dma_signed_in');
      location.reload();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      if (!registerForm.checkValidity()) return;
      e.preventDefault();
      const account = {
        name: registerForm.fullName.value.trim(),
        email: registerForm.email.value.trim(),
        plan: registerForm.membershipPlan.value,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('dma_account', JSON.stringify(account));
      localStorage.setItem('dma_signed_in', '1');
      showToast('Demo account created successfully.');
      setTimeout(() => location.reload(), 450);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      if (!loginForm.checkValidity()) return;
      e.preventDefault();
      const account = getAccount();
      const email = loginForm.loginEmail.value.trim().toLowerCase();
      if (account && account.email.toLowerCase() === email) {
        localStorage.setItem('dma_signed_in', '1');
        showToast('Signed in to your browser demo account.');
        setTimeout(() => location.reload(), 350);
      } else {
        showToast('No demo account found for that email. Create one first.', true);
      }
    });
  }

  if (profileBox && localStorage.getItem('dma_signed_in') === '1' && getAccount()) {
    authTabs?.classList.add('d-none');
    renderProfile();
  } else if (profileBox) {
    profileBox.classList.add('d-none');
  }

  // Community forum prototype
  const forumForm = document.querySelector('#forumForm');
  const forumList = document.querySelector('#forumList');
  const defaultPosts = [
    {name:'DoBu Team', topic:'Training tips', message:'Remember to arrive 10 minutes early, bring water and tell your coach about any injury before class.', time:'Pinned'},
    {name:'Sarah N.', topic:'Karate', message:'Beginner karate this week will focus on stance, balance and safe basic combinations.', time:'Coach update'}
  ];

  function getPosts() {
    try { return JSON.parse(localStorage.getItem('dma_forum_posts') || '[]'); }
    catch { return []; }
  }

  function renderPosts() {
    if (!forumList) return;
    const posts = [...getPosts(), ...defaultPosts];
    forumList.innerHTML = posts.map(post => `
      <article class="forum-post p-3 p-md-4 mb-3">
        <div class="d-flex justify-content-between gap-3 flex-wrap">
          <div><strong>${escapeHtml(post.name)}</strong> <span class="badge text-bg-dark ms-1">${escapeHtml(post.topic)}</span></div>
          <span class="forum-meta">${escapeHtml(post.time)}</span>
        </div>
        <p class="mb-0 mt-2">${escapeHtml(post.message)}</p>
      </article>`).join('');
  }

  if (forumForm) {
    renderPosts();
    forumForm.addEventListener('submit', e => {
      if (!forumForm.checkValidity()) return;
      e.preventDefault();
      const posts = getPosts();
      posts.unshift({
        name: forumForm.forumName.value.trim(),
        topic: forumForm.forumTopic.value,
        message: forumForm.forumMessage.value.trim(),
        time: new Date().toLocaleString()
      });
      localStorage.setItem('dma_forum_posts', JSON.stringify(posts.slice(0, 10)));
      forumForm.reset();
      forumForm.classList.remove('was-validated');
      renderPosts();
      showToast('Post added to the local demo forum.');
    });
  }

  // Timetable day filtering
  document.querySelectorAll('.timeline-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timeline-day-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const day = btn.dataset.day;
      document.querySelectorAll('[data-schedule-day]').forEach(row => {
        row.classList.toggle('d-none', day !== 'all' && row.dataset.scheduleDay !== day);
      });
    });
  });

  // Contact demo
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      if (!contactForm.checkValidity()) return;
      e.preventDefault();
      showToast('Thanks! Your message is ready in this prototype.');
      contactForm.reset();
      contactForm.classList.remove('was-validated');
    });
  }

  function escapeHtml(value='') {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function showToast(message, error=false) {
    let toast = document.querySelector('#dmaToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dmaToast';
      toast.className = 'position-fixed bottom-0 end-0 m-3 p-3 rounded shadow text-white';
      toast.style.zIndex = '2000';
      document.body.appendChild(toast);
    }
    toast.style.background = error ? '#9f1015' : '#111';
    toast.textContent = message;
    toast.classList.remove('d-none');
    clearTimeout(window.__dmaToastTimer);
    window.__dmaToastTimer = setTimeout(() => toast.classList.add('d-none'), 3200);
  }
})();
