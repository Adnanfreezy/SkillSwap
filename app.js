// app.js - SkillSwap Platform Controller
import db from './db.js';

// Global App State
const state = {
  currentUser: null,
  activeScreen: 'splash',
  activeChatPartnerId: null,
  bookingSkillId: null,
  bookingDate: null,
  bookingTime: null,
  ratingSessionId: null,
  ratingScore: 0,
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  cameraActive: false,
  micActive: true,
  screenSharingActive: false,
  localMediaStream: null
};

// Seed Avatars
const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Spam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'
];

// Elements Cache
const DOM = {
  body: document.body,
  sidebar: document.getElementById('app-sidebar'),
  mobileNav: document.getElementById('app-mobile-nav'),
  header: document.getElementById('app-header'),
  activeScreenTitle: document.getElementById('active-screen-title'),
  
  // Header Info
  headerCreditAmount: document.getElementById('header-credit-amount'),
  btnRoleSwitcher: document.getElementById('btn-role-switcher'),
  headerNotifContainer: document.getElementById('header-notif-container'),
  headerNotifBadge: document.getElementById('header-notif-badge'),
  headerNotifDropdown: document.getElementById('header-notif-dropdown'),
  headerNotifList: document.getElementById('header-notif-list'),
  btnMarkNotifRead: document.getElementById('btn-mark-notif-read'),
  btnViewAllNotifs: document.getElementById('btn-view-all-notifs'),
  sidebarAvatar: document.getElementById('sidebar-avatar'),
  sidebarUsername: document.getElementById('sidebar-username'),
  sidebarCredits: document.getElementById('sidebar-credits'),

  // Screens
  screens: {
    splash: document.getElementById('screen-splash'),
    login: document.getElementById('screen-login'),
    register: document.getElementById('screen-register'),
    home: document.getElementById('screen-home'),
    search: document.getElementById('screen-search'),
    profile: document.getElementById('screen-profile'),
    booking: document.getElementById('screen-booking'),
    chat: document.getElementById('screen-chat'),
    call: document.getElementById('screen-call'),
    wallet: document.getElementById('screen-wallet'),
    notifications: document.getElementById('screen-notifications'),
    ratings: document.getElementById('screen-ratings'),
    settings: document.getElementById('screen-settings'),
    admin: document.getElementById('screen-admin')
  },

  // Modals
  modals: {
    addSkill: document.getElementById('modal-add-skill'),
    reportUser: document.getElementById('modal-report-user')
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupAuthListeners();
  setupMarketplaceSearch();
  setupProfileListeners();
  setupBookingListeners();
  setupChatListeners();
  setupCallListeners();
  setupWalletListeners();
  setupSettingsListeners();
  setupAdminListeners();
  setupGlobalClickHandlers();
  
  // Start Application
  const savedUser = localStorage.getItem('skillswap_logged_in_user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    // Refresh user object from DB to get latest credits
    const freshUser = db.getUser(user.id);
    if (freshUser) {
      loginSession(freshUser);
    } else {
      showScreen('splash');
    }
  } else {
    showScreen('splash');
  }
});

// Close dropdowns on outer click
function setupGlobalClickHandlers() {
  document.addEventListener('click', (e) => {
    // Notifications dropdown close
    if (!DOM.headerNotifContainer.contains(e.target)) {
      DOM.headerNotifDropdown.style.display = 'none';
    }
  });

  // Notifications bell toggle
  document.querySelector('.notif-bell').addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = DOM.headerNotifDropdown.style.display === 'block';
    DOM.headerNotifDropdown.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      renderHeaderNotifications();
    }
  });
}

// --- ROUTER & SCREEN SWITCHER ---
function showScreen(screenId) {
  // Save current active screen state
  state.activeScreen = screenId;
  
  // 1. Manage visibility of structural elements via CSS classes
  const isAuthScreen = ['splash', 'login', 'register'].includes(screenId);
  
  if (isAuthScreen) {
    document.body.classList.remove('logged-in');
    DOM.sidebar.style.display = 'none';
    DOM.mobileNav.style.display = 'none';
    DOM.header.style.display = 'none';
  } else {
    // If not logged in, force redirect to splash
    if (!state.currentUser) {
      showScreen('splash');
      return;
    }
    document.body.classList.add('logged-in');
    DOM.sidebar.style.removeProperty('display');
    DOM.mobileNav.style.removeProperty('display');
    DOM.header.style.removeProperty('display');
  }

  // 2. Hide all screen views and activate target
  Object.keys(DOM.screens).forEach(key => {
    const section = DOM.screens[key];
    if (key === screenId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // 3. Highlight navigation sidebar/mobile bar active state
  document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
    if (item.getAttribute('data-screen') === screenId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  document.querySelectorAll('.mobile-nav .mobile-nav-item').forEach(item => {
    if (item.getAttribute('data-screen') === screenId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 4. Update header title
  const titles = {
    home: 'My Dashboard',
    search: 'Skill Marketplace',
    chat: 'Internal Secure Chat',
    call: 'Interactive Session Call',
    wallet: 'Credits Wallet',
    profile: 'My User Profile',
    notifications: 'Notifications Log',
    ratings: 'Rate Exchange Session',
    settings: 'Platform Settings',
    admin: 'Administrator Operations Panel'
  };
  if (DOM.activeScreenTitle && titles[screenId]) {
    DOM.activeScreenTitle.textContent = titles[screenId];
  }

  // 5. Trigger view-specific render logic
  if (state.currentUser) {
    updateHeaderPills();
  }

  switch (screenId) {
    case 'home':
      renderDashboard();
      break;
    case 'search':
      renderMarketplace();
      break;
    case 'profile':
      renderProfilePage();
      break;
    case 'booking':
      renderBookingPage();
      break;
    case 'chat':
      renderChatWindow();
      break;
    case 'call':
      renderCallViewport();
      break;
    case 'wallet':
      renderWalletPage();
      break;
    case 'notifications':
      renderNotificationsPage();
      break;
    case 'admin':
      renderAdminDashboard();
      break;
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// --- SETUP STATIC NAVIGATIONAL TRIGGERS ---
function setupNavigation() {
  const attachNavHandlers = (selector) => {
    document.querySelectorAll(selector).forEach(item => {
      item.addEventListener('click', () => {
        const targetScreen = item.getAttribute('data-screen');
        showScreen(targetScreen);
      });
    });
  };

  attachNavHandlers('.nav-menu .nav-item');
  attachNavHandlers('.mobile-nav .mobile-nav-item');

  // Splash Screen Buttons
  document.getElementById('btn-splash-login').addEventListener('click', () => showScreen('login'));
  document.getElementById('btn-splash-register').addEventListener('click', () => showScreen('register'));
  
  // Auth Screen Switch Links
  document.getElementById('btn-login-to-register').addEventListener('click', () => showScreen('register'));
  document.getElementById('btn-register-to-login').addEventListener('click', () => showScreen('login'));

  // Header Switch to Admin View
  DOM.btnRoleSwitcher.addEventListener('click', () => {
    if (state.currentUser.role === 'admin') {
      // Toggle display mode
      if (state.activeScreen === 'admin') {
        showScreen('home');
      } else {
        showScreen('admin');
      }
    } else {
      // For testing purposes, standard users can toggle role to administrator instantly to test features!
      alert('TESTING MODE ENABLED: Elevating role to Administrator to test all admin stats, user tables, and report controls.');
      const updatedUser = db.updateUser(state.currentUser.id, { role: 'admin' });
      state.currentUser = updatedUser;
      localStorage.setItem('skillswap_logged_in_user', JSON.stringify(updatedUser));
      loginSession(updatedUser);
      showScreen('admin');
    }
  });

  // Logouts
  const performLogout = () => {
    localStorage.removeItem('skillswap_logged_in_user');
    state.currentUser = null;
    showScreen('splash');
  };

  document.getElementById('btn-logout-sidebar').addEventListener('click', performLogout);
  document.getElementById('btn-logout-header').addEventListener('click', performLogout);
  document.getElementById('btn-settings-logout').addEventListener('click', performLogout);

  // Recovery Password Modal
  document.getElementById('btn-recover-pw').addEventListener('click', () => {
    const email = prompt('Enter your registered email address to recover your password:');
    if (email) {
      alert(`Success! Password reset instructions have been dispatched to ${email}.`);
    }
  });

  // Notification page redirection
  DOM.btnViewAllNotifs.addEventListener('click', () => {
    DOM.headerNotifDropdown.style.display = 'none';
    showScreen('notifications');
  });

  DOM.btnMarkNotifRead.addEventListener('click', (e) => {
    e.stopPropagation();
    db.markNotificationsAsRead(state.currentUser.id);
    updateHeaderPills();
    renderHeaderNotifications();
  });

  document.getElementById('btn-notif-page-clear').addEventListener('click', () => {
    db.markNotificationsAsRead(state.currentUser.id);
    updateHeaderPills();
    renderNotificationsPage();
  });
}

// --- AUTHENTICATION MODULE ---
function setupAuthListeners() {
  // Pre-seed avatars visual selection in registration
  const avatarPicker = document.getElementById('reg-avatar-picker');
  let selectedAvatar = AVATAR_OPTIONS[0];

  AVATAR_OPTIONS.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'avatar-option' + (i === 0 ? ' selected' : '');
    img.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      img.classList.add('selected');
      selectedAvatar = url;
    });
    avatarPicker.appendChild(img);
  });

  // Register Form
  document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const country = document.getElementById('reg-country').value;
    const bio = document.getElementById('reg-bio').value.trim();

    // Check if user exists
    if (db.getUserByEmail(email)) {
      alert('Email address already registered!');
      return;
    }

    const newUser = db.createUser({
      name,
      email,
      phone,
      password,
      country,
      avatar: selectedAvatar,
      bio
    });

    alert('Registration Complete! 50 Skill Credits have been credited to your wallet.');
    loginSession(newUser);
    showScreen('home');
  });

  // Login Form
  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const user = db.getUserByEmail(email);
    if (!user || user.password !== password) {
      alert('Incorrect email credentials or password.');
      return;
    }

    if (user.status === 'suspended') {
      alert('Access Denied: This account has been suspended by administrators due to policy violations.');
      return;
    }

    loginSession(user);
    showScreen('home');
  });

  // Mock Google Login (autologs as John for testing convenience)
  document.getElementById('btn-google-login').addEventListener('click', () => {
    const john = db.getUserByEmail('john@example.com');
    if (john) {
      loginSession(john);
      showScreen('home');
    }
  });

  // Inject convenient demo presets directly on login form to help users test!
  const loginForm = document.getElementById('form-login');
  const demoDiv = document.createElement('div');
  demoDiv.style.cssText = 'margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;';
  demoDiv.innerHTML = `
    <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center;">Demo Credentials Presets:</div>
    <div style="display: flex; gap: 0.5rem;">
      <button type="button" id="demo-user-john" class="btn btn-secondary" style="flex: 1; padding: 0.4rem; font-size: 0.75rem;">John Doe (User)</button>
      <button type="button" id="demo-user-admin" class="btn btn-secondary" style="flex: 1; padding: 0.4rem; font-size: 0.75rem;">Admin Portal</button>
    </div>
  `;
  loginForm.appendChild(demoDiv);

  document.getElementById('demo-user-john').addEventListener('click', () => {
    document.getElementById('login-email').value = 'john@example.com';
    document.getElementById('login-password').value = 'password123';
  });
  document.getElementById('demo-user-admin').addEventListener('click', () => {
    document.getElementById('login-email').value = 'admin@skillswap.com';
    document.getElementById('login-password').value = 'adminpassword';
  });
}

function loginSession(user) {
  state.currentUser = user;
  localStorage.setItem('skillswap_logged_in_user', JSON.stringify(user));
  
  // Render user data inside layouts
  DOM.sidebarAvatar.src = user.avatar;
  
  // Sidebar Name with Premium Badge
  if (user.membership && user.membership.startsWith('Premium')) {
    DOM.sidebarUsername.innerHTML = `${user.name} <span style="font-size: 0.6rem; background: linear-gradient(135deg, #fbbf24, #d97706); color: black; font-weight: 800; padding: 2px 5px; border-radius: 4px; display: inline-block; box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); border: 1px solid rgba(255,255,255,0.2);">PREMIUM</span>`;
  } else {
    DOM.sidebarUsername.textContent = user.name;
  }

  DOM.sidebarCredits.textContent = `${user.creditBalance} Credits`;

  // Render role switch visual indicator
  if (user.role === 'admin') {
    DOM.btnRoleSwitcher.textContent = 'Enter Admin Dashboard';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
  } else {
    DOM.btnRoleSwitcher.textContent = 'Switch to Admin View';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }

  updateHeaderPills();
}

function updateHeaderPills() {
  DOM.headerCreditAmount.textContent = state.currentUser.creditBalance;
  DOM.sidebarCredits.textContent = `${state.currentUser.creditBalance} Credits`;

  // Notification badges
  const unreadNotifs = db.getNotifications(state.currentUser.id).filter(n => !n.read);
  if (unreadNotifs.length > 0) {
    DOM.headerNotifBadge.style.display = 'flex';
    DOM.headerNotifBadge.textContent = unreadNotifs.length;
  } else {
    DOM.headerNotifBadge.style.display = 'none';
  }
}

function renderHeaderNotifications() {
  const notifs = db.getNotifications(state.currentUser.id).slice(0, 5);
  DOM.headerNotifList.innerHTML = '';
  if (notifs.length === 0) {
    DOM.headerNotifList.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem;">No new notifications.</div>';
    return;
  }

  notifs.forEach(n => {
    const div = document.createElement('div');
    div.className = 'notif-item' + (!n.read ? ' unread' : '');
    div.innerHTML = `
      <div style="font-weight: 600;">${n.title}</div>
      <div style="color: var(--text-secondary); font-size: 0.75rem;">${n.content}</div>
      <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.25rem;">${new Date(n.timestamp).toLocaleTimeString()}</div>
    `;
    DOM.headerNotifList.appendChild(div);
  });
}

// --- HOME DASHBOARD ---
function renderDashboard() {
  // Wallet info
  document.getElementById('home-wallet-amount').innerHTML = `${state.currentUser.creditBalance} <span>Credits</span>`;
  
  // Teaching credits earned (simulate sum of completed sessions where user is teacher)
  const myCompletedTeaching = db.getSessions().filter(s => s.teacherId === state.currentUser.id && s.status === 'completed');
  const earnedCredits = myCompletedTeaching.reduce((sum, s) => sum + s.creditsCost, 0);
  document.getElementById('home-earned-credits').textContent = earnedCredits;
  document.getElementById('home-completed-count').textContent = state.currentUser.completedSessions;

  // Schedules (Active / Pending requests)
  const sessionsList = document.getElementById('home-sessions-list');
  sessionsList.innerHTML = '';
  
  const mySessions = db.getSessions().filter(s => 
    s.studentId === state.currentUser.id || s.teacherId === state.currentUser.id
  ).sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime));

  if (mySessions.length === 0) {
    sessionsList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        <p>No booked sessions scheduled yet.</p>
      </div>
    `;
  } else {
    mySessions.forEach(session => {
      const isTeacher = session.teacherId === state.currentUser.id;
      const partnerId = isTeacher ? session.studentId : session.teacherId;
      const partner = db.getUser(partnerId);
      const skill = db.getSkill(session.skillId);

      const card = document.createElement('div');
      card.className = 'session-card';

      // Action buttons depending on state
      let actionsHTML = '';
      if (session.status === 'pending') {
        if (isTeacher) {
          actionsHTML = `
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-accept-session" data-id="${session.id}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem;">Accept</button>
              <button class="btn btn-danger btn-decline-session" data-id="${session.id}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem; background-color: var(--border-color);">Decline</button>
            </div>
          `;
        } else {
          actionsHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Awaiting approval</span>`;
        }
      } else if (session.status === 'accepted') {
        // Option to enter call, and option to complete
        actionsHTML = `
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-join-call" data-session="${session.id}" data-partner="${partnerId}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem; background: linear-gradient(135deg, var(--color-success), var(--accent-primary)); border: none;">
              <span class="material-symbols-outlined" style="font-size: 1rem;">video_call</span> Join Call
            </button>
            <button class="btn btn-secondary btn-complete-session" data-id="${session.id}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem;">Complete</button>
          </div>
        `;
      } else if (session.status === 'completed') {
        const ratingSubmitted = isTeacher ? session.teacherRated : session.studentRated;
        if (!ratingSubmitted) {
          actionsHTML = `
            <button class="btn btn-primary btn-rate-session" data-id="${session.id}" data-partner-name="${partner.name}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem;">
              Rate Session
            </button>
          `;
        } else {
          actionsHTML = `<span style="font-size: 0.8rem; color: var(--color-success); font-weight: 600;">Rated & Complete</span>`;
        }
      }

      card.innerHTML = `
        <div class="session-info">
          <img src="${partner ? partner.avatar : ''}" alt="Avatar" class="user-avatar-sm">
          <div>
            <div style="font-weight: 700;">${skill ? skill.name : 'Unknown Skill'}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
              ${isTeacher ? 'Teaching' : 'Learning'} • With ${partner ? partner.name : 'Anonymous'}
              ${partner && partner.membership && partner.membership.startsWith('Premium') ? `<span style="font-size: 0.5rem; background: linear-gradient(135deg, #fbbf24, #d97706); color: black; font-weight: 800; padding: 1px 4px; border-radius: 3px; display: inline-block;">PRO</span>` : ''}
            </div>
            <div style="font-size: 0.75rem; color: var(--accent-primary); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem;">
              <span class="material-symbols-outlined" style="font-size: 0.9rem;">calendar_month</span>
              ${new Date(session.dateTime).toLocaleString()} (${session.duration} hrs)
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
          <span class="session-badge badge-${session.status}">${session.status}</span>
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--accent-primary);">${session.creditsCost} Credits</span>
          ${actionsHTML}
        </div>
      `;

      sessionsList.appendChild(card);
    });

    // Schedule actions listeners
    document.querySelectorAll('.btn-accept-session').forEach(btn => {
      btn.addEventListener('click', () => {
        db.updateSessionStatus(btn.getAttribute('data-id'), 'accepted');
        renderDashboard();
        updateHeaderPills();
      });
    });

    document.querySelectorAll('.btn-decline-session').forEach(btn => {
      btn.addEventListener('click', () => {
        db.updateSessionStatus(btn.getAttribute('data-id'), 'rejected');
        renderDashboard();
        updateHeaderPills();
      });
    });

    document.querySelectorAll('.btn-complete-session').forEach(btn => {
      btn.addEventListener('click', () => {
        db.updateSessionStatus(btn.getAttribute('data-id'), 'completed');
        renderDashboard();
        updateHeaderPills();
      });
    });

    document.querySelectorAll('.btn-join-call').forEach(btn => {
      btn.addEventListener('click', () => {
        const sessionId = btn.getAttribute('data-session');
        const partnerId = btn.getAttribute('data-partner');
        initiateVideoCall(sessionId, partnerId);
      });
    });

    document.querySelectorAll('.btn-rate-session').forEach(btn => {
      btn.addEventListener('click', () => {
        state.ratingSessionId = btn.getAttribute('data-id');
        const partnerName = btn.getAttribute('data-partner-name');
        document.getElementById('rating-session-desc').textContent = `How was your session with ${partnerName}?`;
        showScreen('ratings');
      });
    });
  }

  // Recommended Skills Feed
  const skillsFeed = document.getElementById('home-skills-grid');
  skillsFeed.innerHTML = '';
  
  // Recommend skills offered by others, prioritising categories user needs if set
  let pool = db.getSkills().filter(s => s.teacherId !== state.currentUser.id);
  
  if (pool.length === 0) {
    skillsFeed.innerHTML = '<div style="grid-column: span 3; text-align: center; color: var(--text-secondary);">No skills available.</div>';
  } else {
    // Pick 3 random
    pool = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    pool.forEach(skill => {
      const card = createSkillCard(skill);
      skillsFeed.appendChild(card);
    });
  }

  // Mini Notifications feed
  const miniFeed = document.getElementById('home-notif-feed');
  miniFeed.innerHTML = '';
  const notifs = db.getNotifications(state.currentUser.id).slice(0, 3);
  if (notifs.length === 0) {
    miniFeed.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem;">No recent updates.</div>';
  } else {
    notifs.forEach(n => {
      const div = document.createElement('div');
      div.className = 'notif-item' + (!n.read ? ' unread' : '');
      div.style.padding = '0.5rem';
      div.style.borderBottom = '1px solid var(--border-color)';
      div.innerHTML = `
        <div style="font-weight:600; font-size:0.8rem;">${n.title}</div>
        <div style="font-size:0.75rem; color:var(--text-secondary);">${n.content}</div>
      `;
      miniFeed.appendChild(div);
    });
  }

  // Quick Action Buttons
  document.getElementById('btn-home-go-search').addEventListener('click', () => showScreen('search'));
  document.getElementById('btn-home-add-skill').addEventListener('click', () => {
    DOM.modals.addSkill.classList.add('active');
  });
  document.getElementById('btn-home-view-wallet').addEventListener('click', () => showScreen('wallet'));
  document.getElementById('btn-home-view-profile').addEventListener('click', () => showScreen('profile'));
}

// Helper Card Builder
function createSkillCard(skill) {
  const teacher = db.getUser(skill.teacherId);
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <div class="skill-card-body">
      <div class="skill-header">
        <img src="${teacher ? teacher.avatar : ''}" alt="Teacher" class="user-avatar-sm">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.25rem;">
            ${teacher ? teacher.name : 'Unknown'}
            ${teacher && teacher.membership && teacher.membership.startsWith('Premium') ? `<span style="font-size: 0.5rem; background: linear-gradient(135deg, #fbbf24, #d97706); color: black; font-weight: 800; padding: 1px 4px; border-radius: 3px; box-shadow: 0 0 4px rgba(251, 191, 36, 0.4); display: inline-block;">PRO</span>` : ''}
          </div>
          <div class="skill-teacher-name">Rating: ${teacher ? teacher.rating : '5.0'} ★</div>
        </div>
      </div>
      <h4 class="skill-title">${skill.name}</h4>
      <div class="skill-details-meta">
        <span class="tag-badge" style="background-color: rgba(99, 102, 241, 0.1); color: var(--accent-primary); font-weight: 700;">${skill.category}</span>
        <span class="tag-badge">${skill.experienceLevel}</span>
      </div>
      <p class="skill-desc">${skill.description.substring(0, 85)}...</p>
      
      <div class="skill-footer">
        <span style="font-size:0.75rem; color: var(--text-muted);">Schedule: ${skill.schedule.substring(0, 18)}...</span>
        <button class="btn btn-primary btn-book-skill" data-id="${skill.id}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem;">Book</button>
      </div>
    </div>
  `;

  div.querySelector('.btn-book-skill').addEventListener('click', () => {
    state.bookingSkillId = skill.id;
    showScreen('booking');
  });

  return div;
}

// --- SKILL MARKETPLACE SCREEN ---
function setupMarketplaceSearch() {
  const triggerFilter = () => {
    renderMarketplace();
  };

  document.getElementById('search-skill-name').addEventListener('input', triggerFilter);
  document.getElementById('search-category').addEventListener('change', triggerFilter);
  document.getElementById('search-rating').addEventListener('change', triggerFilter);
  document.getElementById('search-experience').addEventListener('change', triggerFilter);
}

function renderMarketplace() {
  const grid = document.getElementById('search-skills-grid');
  grid.innerHTML = '';

  const queryName = document.getElementById('search-skill-name').value.toLowerCase();
  const cat = document.getElementById('search-category').value;
  const minRating = parseFloat(document.getElementById('search-rating').value) || 0;
  const level = document.getElementById('search-experience').value;

  const skills = db.getSkills().filter(skill => {
    // Exclude own skills
    if (skill.teacherId === state.currentUser.id) return false;

    const teacher = db.getUser(skill.teacherId);
    if (!teacher) return false;

    // Filters
    const matchesName = skill.name.toLowerCase().includes(queryName) || 
                        teacher.name.toLowerCase().includes(queryName);
    const matchesCategory = cat === '' || skill.category === cat;
    const matchesRating = minRating === 0 || teacher.rating >= minRating;
    const matchesExperience = level === '' || skill.experienceLevel === level;

    return matchesName && matchesCategory && matchesRating && matchesExperience;
  });

  if (skills.length === 0) {
    grid.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 3rem; grid-column: 1 / -1;">No listed skills match your filter parameters.</div>';
    return;
  }

  skills.forEach(skill => {
    grid.appendChild(createSkillCard(skill));
  });
}

// --- USER PROFILE SCREEN ---
function setupProfileListeners() {
  // Update Profile Info
  document.getElementById('form-update-profile').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-profile-name').value.trim();
    const phone = document.getElementById('edit-profile-phone').value.trim();
    const bio = document.getElementById('edit-profile-bio').value.trim();

    const updated = db.updateUser(state.currentUser.id, { name, phone, bio });
    state.currentUser = updated;
    localStorage.setItem('skillswap_logged_in_user', JSON.stringify(updated));
    loginSession(updated);
    renderProfilePage();
    alert('Profile information successfully saved.');
  });

  // Open List Skill Modal
  document.getElementById('btn-profile-add-skill').addEventListener('click', () => {
    DOM.modals.addSkill.classList.add('active');
  });

  // Modal Submit List Skill
  document.getElementById('form-add-skill').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('skill-title-input').value.trim();
    const category = document.getElementById('skill-category-select').value;
    const experience = document.getElementById('skill-experience-select').value;
    const schedule = document.getElementById('skill-schedule-input').value.trim();
    const description = document.getElementById('skill-description-textarea').value.trim();

    db.createSkill({
      teacherId: state.currentUser.id,
      name: title,
      category,
      experienceLevel: experience,
      schedule,
      description
    });

    DOM.modals.addSkill.classList.remove('active');
    
    // Reset inputs
    document.getElementById('form-add-skill').reset();

    alert('Skill listing published successfully!');
    
    // Refresh
    if (state.activeScreen === 'profile') renderProfilePage();
    else if (state.activeScreen === 'home') renderDashboard();
  });
}

function renderProfilePage() {
  const user = state.currentUser;
  
  document.getElementById('profile-avatar').src = user.avatar;
  
  const profileName = document.getElementById('profile-name');
  if (user.membership && user.membership.startsWith('Premium')) {
    profileName.innerHTML = `${user.name} <span style="font-size: 0.8rem; background: linear-gradient(135deg, #fbbf24, #d97706); color: black; font-weight: 800; padding: 3px 8px; border-radius: 6px; display: inline-block; vertical-align: middle; margin-left: 0.5rem; box-shadow: 0 0 8px rgba(251, 191, 36, 0.6); border: 1px solid rgba(255,255,255,0.2);">PREMIUM</span>`;
  } else {
    profileName.textContent = user.name;
  }

  document.getElementById('profile-country').innerHTML = `<span class="material-symbols-outlined" style="font-size: 1.1rem; color: var(--text-muted);">flag</span> ${user.country}`;
  document.getElementById('profile-bio-text').textContent = user.bio || 'No bio listed yet.';

  document.getElementById('profile-stat-rating').textContent = user.rating;
  document.getElementById('profile-stat-sessions').textContent = user.completedSessions;
  document.getElementById('profile-stat-credits').textContent = user.creditBalance;
  document.getElementById('profile-stat-role').textContent = user.role.toUpperCase();

  // Populate Edit Fields
  document.getElementById('edit-profile-name').value = user.name;
  document.getElementById('edit-profile-phone').value = user.phone;
  document.getElementById('edit-profile-bio').value = user.bio || '';

  // Render My Offered Skills
  const list = document.getElementById('profile-skills-offered-list');
  list.innerHTML = '';

  const mySkills = db.getSkills().filter(s => s.teacherId === user.id);
  if (mySkills.length === 0) {
    list.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-secondary); text-align: center; padding: 1.5rem;">You are not offering any skills yet.</p>';
  } else {
    mySkills.forEach(skill => {
      const item = document.createElement('div');
      item.className = 'session-card';
      item.style.padding = '0.75rem 1rem';
      item.innerHTML = `
        <div>
          <div style="font-weight: 700;">${skill.name}</div>
          <div style="font-size: 0.75rem; color: var(--accent-primary); font-weight: 600;">${skill.category} • ${skill.experienceLevel}</div>
        </div>
        <button class="btn btn-secondary btn-delete-skill" data-id="${skill.id}" style="padding: 0.35rem 0.65rem; font-size: 0.7rem; color: var(--color-error); border-color: rgba(239, 68, 68, 0.2);">Delete</button>
      `;

      item.querySelector('.btn-delete-skill').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this skill listing?')) {
          db.updateSkill(skill.id, { teacherId: 'deleted_' + skill.teacherId }); // Soft delete in mock
          renderProfilePage();
        }
      });

      list.appendChild(item);
    });
  }
}

// --- SESSION BOOKING SCREEN ---
function setupBookingListeners() {
  // Calendar month buttons
  document.getElementById('btn-cal-prev').addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    renderBookingCalendar();
  });

  document.getElementById('btn-cal-next').addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    renderBookingCalendar();
  });

  // Time slot selection
  document.querySelectorAll('#booking-time-slots .time-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#booking-time-slots .time-slot-btn').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
      state.bookingTime = btn.getAttribute('data-time');
    });
  });

  // Duration Slider
  const slider = document.getElementById('booking-duration');
  slider.addEventListener('input', () => {
    const val = parseFloat(slider.value);
    document.getElementById('booking-duration-label').textContent = `${val.toFixed(1)} Hour${val > 1 ? 's' : ''}`;
    
    // Estimate Credits Cost
    const totalCredits = Math.round(val * 10);
    document.getElementById('booking-credits-total').textContent = `${totalCredits} Credits`;
    
    // Check if user has enough credits
    const btnConfirm = document.getElementById('btn-confirm-booking');
    if (state.currentUser.creditBalance < totalCredits) {
      btnConfirm.disabled = true;
      btnConfirm.style.opacity = '0.5';
      btnConfirm.textContent = 'Insufficient Credits';
    } else {
      btnConfirm.disabled = false;
      btnConfirm.style.opacity = '1';
      btnConfirm.textContent = 'Send Session Request';
    }
  });

  // Confirm booking submit
  document.getElementById('btn-confirm-booking').addEventListener('click', () => {
    if (!state.bookingDate) {
      alert('Please select a session date on the calendar!');
      return;
    }
    if (!state.bookingTime) {
      alert('Please select a start time slot!');
      return;
    }

    const duration = parseFloat(document.getElementById('booking-duration').value);
    const creditsCost = Math.round(duration * 10);

    const skill = db.getSkill(state.bookingSkillId);
    
    db.createSession({
      teacherId: skill.teacherId,
      studentId: state.currentUser.id,
      skillId: skill.id,
      dateTime: `${state.bookingDate}T${state.bookingTime}`,
      duration,
      creditsCost
    });

    alert(`Session request sent to ${db.getUser(skill.teacherId).name}! Awaiting teacher approval.`);
    showScreen('home');
  });
}

function renderBookingPage() {
  const skill = db.getSkill(state.bookingSkillId);
  if (!skill) {
    showScreen('search');
    return;
  }
  const teacher = db.getUser(skill.teacherId);
  
  document.getElementById('booking-title').textContent = `Book: ${skill.name}`;
  
  // Reset Calendar Selection
  state.bookingDate = null;
  state.bookingTime = null;
  document.querySelectorAll('#booking-time-slots .time-slot-btn').forEach(el => el.classList.remove('selected'));
  
  // Set slider to 1.0 hour default
  const slider = document.getElementById('booking-duration');
  slider.value = 1.0;
  document.getElementById('booking-duration-label').textContent = '1.0 Hour';
  
  const totalCredits = 10;
  document.getElementById('booking-credits-total').textContent = `${totalCredits} Credits`;

  const btnConfirm = document.getElementById('btn-confirm-booking');
  if (state.currentUser.creditBalance < totalCredits) {
    btnConfirm.disabled = true;
    btnConfirm.style.opacity = '0.5';
    btnConfirm.textContent = 'Insufficient Credits';
  } else {
    btnConfirm.disabled = false;
    btnConfirm.style.opacity = '1';
    btnConfirm.textContent = 'Send Session Request';
  }

  renderBookingCalendar();
}

function renderBookingCalendar() {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('calendar-month-label').textContent = `${months[state.currentMonth]} ${state.currentYear}`;

  const grid = document.getElementById('booking-calendar-grid');
  grid.innerHTML = '';

  // Header days
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  days.forEach(d => {
    const el = document.createElement('div');
    el.className = 'calendar-day-label';
    el.textContent = d;
    grid.appendChild(el);
  });

  // Calculate grid cells
  const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
  const totalDays = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

  // Empties
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'calendar-day-cell empty';
    grid.appendChild(el);
  }

  // Days
  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    cell.textContent = d;

    // Check if cell is in the past
    const cellDateStr = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cellDate = new Date(state.currentYear, state.currentMonth, d, 23, 59);
    if (cellDate < new Date()) {
      cell.style.opacity = '0.3';
      cell.style.pointerEvents = 'none';
    }

    cell.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      state.bookingDate = cellDateStr;
    });

    grid.appendChild(cell);
  }
}

// --- CHAT SYSTEM ---
function setupChatListeners() {
  // Send message
  document.getElementById('btn-chat-send').addEventListener('click', sendMessageFlow);
  document.getElementById('chat-message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessageFlow();
  });

  // Voice & Video Call triggers in chat
  document.getElementById('btn-chat-start-voice').addEventListener('click', () => {
    alert('Voice Call initiated. Transferring to call screen.');
    initiateVideoCall(null, state.activeChatPartnerId);
  });

  document.getElementById('btn-chat-start-video').addEventListener('click', () => {
    alert('Video Call initiated. Transferring to call screen.');
    initiateVideoCall(null, state.activeChatPartnerId);
  });

  // Report User Trigger
  document.getElementById('btn-chat-report-user').addEventListener('click', () => {
    DOM.modals.reportUser.classList.add('active');
  });

  document.getElementById('form-report-user').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('report-category-select').value;
    const reason = document.getElementById('report-reason-textarea').value.trim();

    db.createReport({
      reporterId: state.currentUser.id,
      reportedId: state.activeChatPartnerId,
      category,
      reason
    });

    DOM.modals.reportUser.classList.remove('active');
    document.getElementById('form-report-user').reset();
    alert('Thank you. A security dispute report has been lodged. Administrators will investigate immediately.');
  });

  // File attach simulation
  document.getElementById('btn-chat-attach').addEventListener('click', () => {
    const file = prompt('Attach file link (Mock Simulation):', 'https://example.com/homework_material.pdf');
    if (file) {
      db.createMessage({
        senderId: state.currentUser.id,
        receiverId: state.activeChatPartnerId,
        content: `Attached File: ${file}`
      });
      renderChatWindow();
    }
  });
}

function initiateVideoCall(sessionId, partnerId) {
  state.activeChatPartnerId = partnerId;
  showScreen('call');
}

function sendMessageFlow() {
  const input = document.getElementById('chat-message-input');
  const text = input.value.trim();
  if (!text) return;

  // Regular expression to block Phone, WhatsApp and Telegram
  const blockRegex = /(?:whatsapp\.com|t\.me|telegram\.me|\b\d{10,12}\b|\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/gi;
  if (blockRegex.test(text)) {
    // Show Security alert block
    const alertBox = document.getElementById('chat-alert-container');
    alertBox.style.display = 'block';
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 4500);
    input.value = '';
    return;
  }

  // Create message
  db.createMessage({
    senderId: state.currentUser.id,
    receiverId: state.activeChatPartnerId,
    content: text
  });

  input.value = '';
  renderChatWindow();

  // Peer Mock Reply simulation
  simulatePeerReply();
}

function simulatePeerReply() {
  const partnerId = state.activeChatPartnerId;
  const partner = db.getUser(partnerId);
  if (!partner) return;

  setTimeout(() => {
    // Only reply if still active in chat with the same partner
    if (state.activeScreen === 'chat' && state.activeChatPartnerId === partnerId) {
      const replies = [
        "Sounds like a plan! Looking forward to learning that skill.",
        "That works for me. What timing is best for you?",
        "Excellent details. I will review the scheduling slots in my wallet.",
        "Can we cover the beginner templates during our next session?",
        "Awesome! Thanks for clarifying that."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      db.createMessage({
        senderId: partnerId,
        receiverId: state.currentUser.id,
        content: randomReply
      });

      renderChatWindow();
    }
  }, 1800);
}

function renderChatWindow() {
  const inboxList = document.getElementById('chat-inbox-list');
  inboxList.innerHTML = '';

  // Gather list of user interactions from message history
  const allMessages = db.getMessages();
  const contactedIds = new Set();
  
  allMessages.forEach(m => {
    if (m.senderId === state.currentUser.id) contactedIds.add(m.receiverId);
    if (m.receiverId === state.currentUser.id) contactedIds.add(m.senderId);
  });

  // Make sure seeded users exist in inbox list for testing chat
  const otherUsers = db.getUsers().filter(u => u.id !== state.currentUser.id && u.role !== 'admin');
  otherUsers.forEach(u => contactedIds.add(u.id));

  // Render contacts
  const contacts = Array.from(contactedIds).map(id => db.getUser(id)).filter(Boolean);

  // Set default partner if none
  if (!state.activeChatPartnerId && contacts.length > 0) {
    state.activeChatPartnerId = contacts[0].id;
  }

  contacts.forEach(user => {
    const activeClass = state.activeChatPartnerId === user.id ? ' active' : '';
    
    // Get last message snippet
    const history = db.getChatHistory(state.currentUser.id, user.id);
    const lastMsg = history.length > 0 ? history[history.length - 1].content : 'No messages yet';

    const item = document.createElement('div');
    item.className = 'inbox-item' + activeClass;
    item.innerHTML = `
      <img src="${user.avatar}" alt="Avatar" class="user-avatar-sm">
      <div style="flex-grow: 1; overflow: hidden;">
        <div style="font-weight: 700; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
          <span style="display: flex; align-items: center; gap: 0.25rem;">
            ${user.name}
            ${user.membership && user.membership.startsWith('Premium') ? `<span style="font-size: 0.5rem; background: linear-gradient(135deg, #fbbf24, #d97706); color: black; font-weight: 800; padding: 1px 4px; border-radius: 3px; display: inline-block;">PRO</span>` : ''}
          </span>
          <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: normal;">${user.rating} ★</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${lastMsg}
        </div>
      </div>
    `;

    item.addEventListener('click', () => {
      state.activeChatPartnerId = user.id;
      renderChatWindow();
    });

    inboxList.appendChild(item);
  });

  // Render main window
  const activeUser = db.getUser(state.activeChatPartnerId);
  if (!activeUser) {
    document.getElementById('chat-window-panel').style.opacity = '0.5';
    document.getElementById('chat-active-name').textContent = 'Select a conversation';
    document.getElementById('chat-active-avatar').src = '';
    return;
  }

  document.getElementById('chat-window-panel').style.opacity = '1';
  document.getElementById('chat-active-name').innerHTML = `${activeUser.name}${activeUser.membership && activeUser.membership.startsWith('Premium') ? ` <span style="font-size: 0.6rem; background: linear-gradient(135deg, #fbbf24, #d97706); color: black; font-weight: 800; padding: 2px 5px; border-radius: 4px; margin-left: 0.5rem; vertical-align: middle; display: inline-block; box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); border: 1px solid rgba(255,255,255,0.2);">PREMIUM</span>` : ''}`;
  document.getElementById('chat-active-avatar').src = activeUser.avatar;

  // Messages log
  const logView = document.getElementById('chat-message-log-view');
  logView.innerHTML = '';

  const history = db.getChatHistory(state.currentUser.id, activeUser.id);
  if (history.length === 0) {
    logView.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: auto; margin-bottom: auto; padding: 2rem;">No messages exchanged. Write a secure text below to start swapping.</div>`;
  } else {
    history.forEach(msg => {
      const isSent = msg.senderId === state.currentUser.id;
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + (isSent ? 'sent' : 'received');
      
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      bubble.innerHTML = `
        <div>${msg.content}</div>
        <div class="chat-bubble-time">${time}</div>
      `;
      logView.appendChild(bubble);
    });

    // Auto-scroll chat log
    logView.scrollTop = logView.scrollHeight;
  }
}

// --- VIDEO CALL SCREEN ---
function setupCallListeners() {
  // Toggle Mic
  document.getElementById('btn-call-toggle-mic').addEventListener('click', () => {
    state.micActive = !state.micActive;
    const btn = document.getElementById('btn-call-toggle-mic');
    btn.classList.toggle('active', state.micActive);
    btn.querySelector('.material-symbols-outlined').textContent = state.micActive ? 'mic' : 'mic_off';
  });

  // Toggle Camera (Tries to request actual webcam feed if active)
  document.getElementById('btn-call-toggle-cam').addEventListener('click', async () => {
    state.cameraActive = !state.cameraActive;
    const btn = document.getElementById('btn-call-toggle-cam');
    btn.classList.toggle('active', state.cameraActive);
    btn.querySelector('.material-symbols-outlined').textContent = state.cameraActive ? 'videocam' : 'videocam_off';

    const localFeedPlaceholder = document.getElementById('video-placeholder-local');
    const localFeedCanvas = document.getElementById('video-feed-local-canvas');
    const videoElement = document.getElementById('local-webcam-element');

    if (state.cameraActive) {
      localFeedPlaceholder.style.display = 'none';
      
      // Try to open webcam
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        state.localMediaStream = stream;
        
        let video = document.getElementById('local-webcam-element');
        if (!video) {
          video = document.createElement('video');
          video.id = 'local-webcam-element';
          video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); border-radius: var(--border-radius-lg);';
          video.autoplay = true;
          video.playsInline = true;
          video.muted = true;
          document.getElementById('video-feed-local').appendChild(video);
        }
        video.srcObject = stream;
        video.style.display = 'block';
        localFeedCanvas.style.display = 'none';
      } catch (err) {
        // Fallback: high-tech CSS simulation
        localFeedCanvas.style.display = 'block';
        localFeedCanvas.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--accent-primary); gap:0.5rem;">
            <div class="stat-val" style="font-size:1.5rem;">Active Local Feed</div>
            <p style="font-size:0.75rem; color:var(--text-secondary);">Webcam denied. Simulating stream...</p>
            <div style="width: 25px; height: 25px; border: 3px solid var(--accent-primary); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
        `;
      }
    } else {
      localFeedPlaceholder.style.display = 'flex';
      localFeedCanvas.style.display = 'none';
      if (videoElement) {
        videoElement.style.display = 'none';
      }
      if (state.localMediaStream) {
        state.localMediaStream.getTracks().forEach(track => track.stop());
        state.localMediaStream = null;
      }
    }
  });

  // Toggle Screen Sharing
  document.getElementById('btn-call-share-screen').addEventListener('click', () => {
    state.screenSharingActive = !state.screenSharingActive;
    const btn = document.getElementById('btn-call-share-screen');
    btn.classList.toggle('active', state.screenSharingActive);

    const localFeedPlaceholder = document.getElementById('video-placeholder-local');
    const localFeedCanvas = document.getElementById('video-feed-local-canvas');
    const screenshareView = document.getElementById('video-feed-local-screenshare');
    const videoElement = document.getElementById('local-webcam-element');

    if (state.screenSharingActive) {
      localFeedPlaceholder.style.display = 'none';
      localFeedCanvas.style.display = 'none';
      if (videoElement) videoElement.style.display = 'none';
      screenshareView.style.display = 'flex';
    } else {
      screenshareView.style.display = 'none';
      if (state.cameraActive) {
        if (videoElement && state.localMediaStream) videoElement.style.display = 'block';
        else localFeedCanvas.style.display = 'block';
      } else {
        localFeedPlaceholder.style.display = 'flex';
      }
    }
  });

  // Hangup call
  document.getElementById('btn-call-hangup').addEventListener('click', () => {
    if (state.localMediaStream) {
      state.localMediaStream.getTracks().forEach(track => track.stop());
      state.localMediaStream = null;
    }
    // Return parameters to defaults
    state.cameraActive = false;
    state.screenSharingActive = false;
    
    alert('Training session call finished. Proceeding to reviews.');
    
    // Redirect to rating flow
    const partner = db.getUser(state.activeChatPartnerId);
    document.getElementById('rating-session-desc').textContent = `How was your session with ${partner ? partner.name : 'your peer'}?`;
    
    // Setup rate-session ID (locate last session between these two)
    const historySessions = db.getSessions().filter(s => 
      (s.studentId === state.currentUser.id && s.teacherId === state.activeChatPartnerId) ||
      (s.teacherId === state.currentUser.id && s.studentId === state.activeChatPartnerId)
    );
    if (historySessions.length > 0) {
      state.ratingSessionId = historySessions[historySessions.length - 1].id;
    }

    showScreen('ratings');
  });

  // Ratings submit
  const starsContainer = document.getElementById('star-rating-widget-btns');
  starsContainer.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const score = parseInt(btn.getAttribute('data-score'));
      state.ratingScore = score;
      
      starsContainer.querySelectorAll('button').forEach(s => {
        const sVal = parseInt(s.getAttribute('data-score'));
        s.classList.toggle('filled', sVal <= score);
      });
    });
  });

  document.getElementById('form-ratings').addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.ratingScore === 0) {
      alert('Please select a star rating from 1 to 5!');
      return;
    }

    const comment = document.getElementById('rating-comment').value.trim();
    const session = db.getSession(state.ratingSessionId);
    
    if (session) {
      const isTeacher = session.teacherId === state.currentUser.id;
      const revieweeId = isTeacher ? session.studentId : session.teacherId;

      db.createReview({
        sessionId: session.id,
        reviewerId: state.currentUser.id,
        revieweeId,
        score: state.ratingScore,
        comment,
        type: isTeacher ? 'teacher-to-student' : 'student-to-teacher'
      });

      // Update session completion
      db.updateSessionStatus(session.id, 'completed');
    }

    // Reset Review flow
    state.ratingScore = 0;
    document.getElementById('form-ratings').reset();
    starsContainer.querySelectorAll('button').forEach(s => s.classList.remove('filled'));

    alert('Thank you for rating this exchange session. Your feedback maintains platform trust.');
    
    // Refresh user object and go home
    const fresh = db.getUser(state.currentUser.id);
    loginSession(fresh);
    showScreen('home');
  });
}

function renderCallViewport() {
  const partner = db.getUser(state.activeChatPartnerId);
  if (!partner) return;

  document.getElementById('video-call-session-title').textContent = `Live Session Exchange with ${partner.name}`;
  document.getElementById('call-remote-avatar').src = partner.avatar;
  
  // Clean local webcam tags if remaining
  const localVideo = document.getElementById('local-webcam-element');
  if (localVideo) localVideo.style.display = 'none';

  // Simulating connection animation
  const status = document.getElementById('call-remote-status');
  status.textContent = 'Awaiting peer connection...';
  
  setTimeout(() => {
    status.innerHTML = `
      <div style="position:relative; width:100%; height:250px; background-color:#020617; display:flex; align-items:center; justify-content:center;">
        <img src="${partner.avatar}" style="width:100%; height:100%; object-fit:cover; filter:brightness(0.9);" />
        <div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); font-size:0.7rem; color:#10b981; padding:0.2rem 0.5rem; border-radius:4px; display:flex; align-items:center; gap:0.25rem;">
          <span style="display:inline-block; width:6px; height:6px; background:#10b981; border-radius:50%;"></span> Connected
        </div>
      </div>
    `;
    document.getElementById('call-remote-label').textContent = `${partner.name} (Peer Remote)`;
  }, 2200);
}

// --- CREDITS WALLET SCREEN ---
function setupWalletListeners() {
  document.getElementById('btn-wallet-list-skill').addEventListener('click', () => {
    showScreen('profile');
    DOM.modals.addSkill.classList.add('active');
  });

  document.getElementById('btn-wallet-claim-bonus').addEventListener('click', () => {
    const updated = db.updateUser(state.currentUser.id, { 
      creditBalance: state.currentUser.creditBalance + 20 
    });
    
    // Create notification
    db.createNotification(state.currentUser.id, {
      title: 'Bonus Credits Claimed',
      content: 'You claimed 20 tester bonus credits.'
    });

    state.currentUser = updated;
    localStorage.setItem('skillswap_logged_in_user', JSON.stringify(updated));
    loginSession(updated);
    renderWalletPage();
  });

  // Tab Switchers
  const tabOverviewBtn = document.getElementById('tab-btn-wallet-overview');
  const tabShopBtn = document.getElementById('tab-btn-wallet-shop');
  const tabOverview = document.getElementById('wallet-tab-overview');
  const tabShop = document.getElementById('wallet-tab-shop');

  tabOverviewBtn.addEventListener('click', () => {
    tabOverviewBtn.style.backgroundColor = 'var(--bg-card)';
    tabOverviewBtn.style.color = 'var(--accent-primary)';
    tabOverviewBtn.style.fontWeight = '700';

    tabShopBtn.style.background = 'none';
    tabShopBtn.style.color = 'var(--text-secondary)';
    tabShopBtn.style.fontWeight = '500';

    tabOverview.style.display = 'grid';
    tabShop.style.display = 'none';
  });

  tabShopBtn.addEventListener('click', () => {
    tabShopBtn.style.backgroundColor = 'var(--bg-card)';
    tabShopBtn.style.color = 'var(--accent-primary)';
    tabShopBtn.style.fontWeight = '700';

    tabOverviewBtn.style.background = 'none';
    tabOverviewBtn.style.color = 'var(--text-secondary)';
    tabOverviewBtn.style.fontWeight = '500';

    tabOverview.style.display = 'none';
    tabShop.style.display = 'flex';
  });

  // Purchase Action Handlers
  document.addEventListener('click', (e) => {
    // Buy pack
    const buyPackBtn = e.target.closest('.btn-buy-pack');
    if (buyPackBtn) {
      const amount = parseInt(buyPackBtn.getAttribute('data-amount'));
      const cost = parseFloat(buyPackBtn.getAttribute('data-cost'));
      
      state.activeCheckout = {
        type: 'pack',
        amount,
        cost,
        name: `Skill Credits Pack (${amount} Credits)`,
        price: `$${cost.toFixed(2)}`
      };

      openCheckoutModal();
      return;
    }

    // Subscribe membership
    const subPremiumBtn = e.target.closest('.btn-sub-premium');
    if (subPremiumBtn) {
      const cycle = subPremiumBtn.getAttribute('data-cycle');
      const price = parseFloat(subPremiumBtn.getAttribute('data-price'));

      state.activeCheckout = {
        type: 'membership',
        cycle,
        price,
        name: `Premium Membership (${cycle})`,
        priceStr: `$${price.toFixed(2)}`
      };

      openCheckoutModal();
      return;
    }
  });

  // Submit checkout payment form
  const formCheckout = document.getElementById('form-checkout');
  formCheckout.addEventListener('submit', (e) => {
    e.preventDefault();

    const processing = document.getElementById('checkout-processing');
    const submitBtn = document.getElementById('btn-submit-payment');
    
    // Show spinner feedback
    processing.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';

    // Simulate standard credit card merchant auth delay
    setTimeout(() => {
      // Execute database update
      if (state.activeCheckout.type === 'pack') {
        db.buyCredits(state.currentUser.id, state.activeCheckout.amount, state.activeCheckout.cost);
      } else if (state.activeCheckout.type === 'membership') {
        db.subscribePremium(state.currentUser.id, state.activeCheckout.cycle, state.activeCheckout.price);
      }

      // Hide processing, reset state
      processing.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      document.getElementById('modal-checkout').classList.remove('active');
      formCheckout.reset();

      // Refresh currentUser credentials
      const updatedUser = db.getUser(state.currentUser.id);
      loginSession(updatedUser);
      renderWalletPage();

      alert(`Payment Authorized! Your purchase for "${state.activeCheckout.name}" was completed successfully.`);
      
      // Auto toggle back to Overview tab
      tabOverviewBtn.click();
    }, 2000);
  });
}

function openCheckoutModal() {
  document.getElementById('checkout-item-name').textContent = state.activeCheckout.name;
  document.getElementById('checkout-item-price').textContent = state.activeCheckout.priceStr || state.activeCheckout.price;
  document.getElementById('modal-checkout').classList.add('active');
}

function renderWalletPage() {
  document.getElementById('wallet-total-amount').innerHTML = `${state.currentUser.creditBalance} <span>Credits</span>`;

  // Display Membership Label
  const membershipLabel = document.getElementById('wallet-membership-label');
  if (membershipLabel) {
    membershipLabel.textContent = `Tier: ${state.currentUser.membership || 'Standard Member'}`;
    if (state.currentUser.membership && state.currentUser.membership.startsWith('Premium')) {
      membershipLabel.style.color = '#fbbf24';
      membershipLabel.style.fontWeight = '800';
    } else {
      membershipLabel.style.color = 'inherit';
      membershipLabel.style.fontWeight = 'normal';
    }
  }

  // Render log
  const log = document.getElementById('wallet-transactions-log');
  log.innerHTML = '';

  // Transactions are derived from completed sessions + custom manual claims + purchases
  const mySessions = db.getSessions().filter(s => 
    s.status === 'completed' && (s.studentId === state.currentUser.id || s.teacherId === state.currentUser.id)
  );

  const txs = [];
  
  // Format completed sessions as wallet entries
  mySessions.forEach(s => {
    const isTeacher = s.teacherId === state.currentUser.id;
    const partner = db.getUser(isTeacher ? s.studentId : s.teacherId);
    
    txs.push({
      date: new Date(s.dateTime),
      title: isTeacher ? `Completed teaching session with ${partner ? partner.name : 'Peer'}` : `Completed learning session with ${partner ? partner.name : 'Peer'}`,
      amount: s.creditsCost,
      type: isTeacher ? 'plus' : 'minus'
    });
  });

  // Check notifications for manual bonus claims or credit/premium purchases
  const allNotifs = db.getNotifications(state.currentUser.id);
  
  allNotifs.forEach(n => {
    if (n.title.includes('Bonus') || n.title.includes('Purchased') || n.title.includes('Active')) {
      let amt = 20;
      let sign = 'plus';
      if (n.content.includes('20 credits')) amt = 20;
      else if (n.content.includes('50 credits')) amt = 50;
      else if (n.content.includes('120 credits')) amt = 120;
      else if (n.content.includes('Premium')) amt = 100; // Premium bonus credits

      txs.push({
        date: new Date(n.timestamp),
        title: n.title + ': ' + n.content,
        amount: amt,
        type: sign
      });
    }
  });

  // Sort newest first
  txs.sort((a,b) => b.date - a.date);

  if (txs.length === 0) {
    log.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No transaction activities logged yet.</p>`;
    return;
  }

  txs.forEach(tx => {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    
    const amtSign = tx.type === 'plus' ? '+' : '-';
    div.innerHTML = `
      <div>
        <div style="font-weight:700; font-size:0.9rem;">${tx.title}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${tx.date.toLocaleString()}</div>
      </div>
      <div class="tx-credits ${tx.type}">${amtSign}${tx.amount} Credits</div>
    `;

    log.appendChild(div);
  });
}

// --- NOTIFICATIONS PAGE SCREEN ---
function renderNotificationsPage() {
  const container = document.getElementById('notif-page-list-container');
  container.innerHTML = '';

  const list = db.getNotifications(state.currentUser.id);
  if (list.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 3rem;">No notifications logged.</div>`;
    return;
  }

  list.forEach(n => {
    const div = document.createElement('div');
    div.className = 'notif-item' + (!n.read ? ' unread' : '');
    div.style.padding = '1.25rem 1.5rem';
    
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight: 700; font-size: 0.95rem;">${n.title}</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(n.timestamp).toLocaleString()}</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">${n.content}</p>
    `;

    container.appendChild(div);
  });
}

// --- PLATFORM SETTINGS SCREEN ---
function setupSettingsListeners() {
  // Light/Dark Theme Switcher
  const themeSwitch = document.getElementById('settings-toggle-theme');
  
  // Set default state based on body
  themeSwitch.checked = document.body.classList.contains('theme-light');

  themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      localStorage.setItem('skillswap_visual_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      localStorage.setItem('skillswap_visual_theme', 'dark');
    }
  });

  // Load saved theme on boot
  const savedTheme = localStorage.getItem('skillswap_visual_theme');
  if (savedTheme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
    themeSwitch.checked = true;
  }
}

// --- ADMINISTRATOR OPERATIONS ---
function setupAdminListeners() {
  // Actions bindings will be dynamic upon rendering tables
}

function renderAdminDashboard() {
  const users = db.getUsers();
  const skills = db.getSkills();
  const sessions = db.getSessions();
  const reports = db.getReports();

  // Metrics
  document.getElementById('admin-stat-users').textContent = users.length;
  document.getElementById('admin-stat-skills').textContent = skills.length;
  document.getElementById('admin-stat-sessions').textContent = sessions.length;
  document.getElementById('admin-stat-reports').textContent = reports.filter(r => r.status === 'pending').length;

  // Render User Accounts table rows
  const usersBody = document.getElementById('admin-users-table-rows');
  usersBody.innerHTML = '';

  users.forEach(user => {
    if (user.role === 'admin') return; // Skip showing administrators

    const tr = document.createElement('tr');
    const isSuspended = user.status === 'suspended';
    
    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <img src="${user.avatar}" alt="Avatar" class="user-avatar-sm" style="width:30px; height:30px;">
          <span style="font-weight:700; font-size:0.85rem;">${user.name}</span>
        </div>
      </td>
      <td>${user.email}</td>
      <td>${user.rating} ★</td>
      <td>${user.creditBalance}</td>
      <td>${user.completedSessions}</td>
      <td>
        <span class="session-badge" style="background-color: ${isSuspended ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}; color: ${isSuspended ? 'var(--color-error)' : 'var(--color-success)'}">
          ${user.status}
        </span>
      </td>
      <td>
        <button class="btn btn-secondary btn-admin-toggle-status" data-id="${user.id}" data-action="${isSuspended ? 'active' : 'suspended'}" style="padding:0.25rem 0.5rem; font-size:0.75rem;">
          ${isSuspended ? 'Unsuspend' : 'Suspend'}
        </button>
      </td>
    `;
    
    usersBody.appendChild(tr);
  });

  // Render Abuse/Fraud disputes
  const reportsBody = document.getElementById('admin-reports-table-rows');
  reportsBody.innerHTML = '';

  if (reports.length === 0) {
    reportsBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding:2rem;">No disputes or abuse logs filed.</td></tr>`;
  } else {
    reports.forEach(rep => {
      const reporter = db.getUser(rep.reporterId);
      const reported = db.getUser(rep.reportedId);
      const tr = document.createElement('tr');

      let actionHTML = '';
      if (rep.status === 'pending') {
        actionHTML = `
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary btn-admin-action-resolve" data-id="${rep.id}" data-offender="${rep.reportedId}" style="padding:0.3rem 0.5rem; font-size:0.7rem; background-color: var(--color-error); border: none;">Suspend User</button>
            <button class="btn btn-secondary btn-admin-action-dismiss" data-id="${rep.id}" style="padding:0.3rem 0.5rem; font-size:0.7rem;">Dismiss</button>
          </div>
        `;
      } else {
        actionHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">Resolved</span>`;
      }

      tr.innerHTML = `
        <td>${reporter ? reporter.name : 'Unknown'}</td>
        <td><strong>${reported ? reported.name : 'Unknown'}</strong></td>
        <td style="text-transform: uppercase; font-size:0.75rem; font-weight:700;">${rep.category.replace('_',' ')}</td>
        <td style="font-size:0.8rem; max-width: 250px; white-space: normal;">${rep.reason}</td>
        <td>
          <span class="session-badge" style="background-color:${rep.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}; color:${rep.status === 'pending' ? 'var(--color-warning)' : 'var(--color-success)'}">
            ${rep.status}
          </span>
        </td>
        <td>${actionHTML}</td>
      `;

      reportsBody.appendChild(tr);
    });
  }

  // Bind Admin Action triggers
  document.querySelectorAll('.btn-admin-toggle-status').forEach(btn => {
    btn.addEventListener('click', () => {
      const uId = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      db.updateUser(uId, { status: action });
      renderAdminDashboard();
    });
  });

  document.querySelectorAll('.btn-admin-action-resolve').forEach(btn => {
    btn.addEventListener('click', () => {
      const repId = btn.getAttribute('data-id');
      const offenderId = btn.getAttribute('data-offender');
      
      // Suspend offender
      db.updateUser(offenderId, { status: 'suspended' });
      // Resolve report
      db.updateReportStatus(repId, 'resolved');
      
      alert('Report resolved: Offending user account has been suspended.');
      renderAdminDashboard();
    });
  });

  document.querySelectorAll('.btn-admin-action-dismiss').forEach(btn => {
    btn.addEventListener('click', () => {
      const repId = btn.getAttribute('data-id');
      db.updateReportStatus(repId, 'resolved');
      alert('Report dismissed.');
      renderAdminDashboard();
    });
  });
}
