// db.js - SkillSwap Persistent Local Storage Database

const STORAGE_KEYS = {
  USERS: 'skillswap_users',
  SKILLS: 'skillswap_skills',
  SESSIONS: 'skillswap_sessions',
  MESSAGES: 'skillswap_messages',
  REVIEWS: 'skillswap_reviews',
  REPORTS: 'skillswap_reports',
  NOTIFICATIONS: 'skillswap_notifications'
};

// Seed Data
const DEFAULT_USERS = [
  {
    id: 'user_admin',
    name: 'Platform Administrator',
    email: 'admin@skillswap.com',
    phone: '+15550199',
    password: 'adminpassword', // In mock db, stored plain/encrypted simulation
    country: 'United States',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    bio: 'SkillSwap administrator account. Overseeing user disputes, verification, and platform integrity.',
    skillsOffered: [],
    skillsNeeded: [],
    rating: 5.0,
    completedSessions: 0,
    creditBalance: 9999,
    role: 'admin',
    membership: 'Administrator',
    status: 'active',
    portfolio: 'https://github.com/skillswap-admin'
  },
  {
    id: 'user_john',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+15550101',
    password: 'password123',
    country: 'Canada',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    bio: 'Senior Software Engineer with 8 years of experience. Excited to teach Full-Stack Development and learn Graphic Design.',
    skillsOffered: ['Programming'],
    skillsNeeded: ['Graphic Design', 'Video Editing'],
    rating: 4.8,
    completedSessions: 14,
    creditBalance: 8.0,
    role: 'standard',
    membership: 'Standard',
    status: 'active',
    portfolio: 'https://github.com/john-codes'
  },
  {
    id: 'user_sarah',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    phone: '+15550102',
    password: 'password123',
    country: 'United Kingdom',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Professional Illustrator and UX/UI Designer. Love helping people design logos and interface flows. Eager to improve my Spanish and Music skills.',
    skillsOffered: ['Graphic Design'],
    skillsNeeded: ['Spanish', 'Music'],
    rating: 4.9,
    completedSessions: 22,
    creditBalance: 3.0,
    role: 'standard',
    membership: 'Standard',
    status: 'active',
    portfolio: 'https://behance.net/sarah-designs'
  },
  {
    id: 'user_ahmed',
    name: 'Ahmed Ali',
    email: 'ahmed@example.com',
    phone: '+20100203040',
    password: 'password123',
    country: 'Egypt',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    bio: 'Native Arabic speaker and copywriter. I can teach standard Arabic and conversational dialects. Looking to learn Programming and Business.',
    skillsOffered: ['Arabic'],
    skillsNeeded: ['Programming', 'Business'],
    rating: 4.7,
    completedSessions: 8,
    creditBalance: 5.0,
    role: 'standard',
    membership: 'Standard',
    status: 'active',
    portfolio: 'https://github.com/ahmed-writes'
  },
  {
    id: 'user_emma',
    name: 'Emma Watson',
    email: 'emma@example.com',
    phone: '+447700900077',
    password: 'password123',
    country: 'Australia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    bio: 'Piano and Acoustic Guitar teacher. Let us write songs together! I want to learn French and Photography.',
    skillsOffered: ['Music'],
    skillsNeeded: ['Photography', 'French'],
    rating: 4.5,
    completedSessions: 5,
    creditBalance: 6.0,
    role: 'standard',
    membership: 'Standard',
    status: 'active',
    portfolio: 'https://youtube.com/emma-guitar'
  },
  {
    id: 'user_raj',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+919876543210',
    password: 'password123',
    country: 'India',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    bio: 'Third-year Computer Science student at IIT Bombay. Passionate about helping aspirants crack JEE Advanced Physics/Math and learning Cybersecurity.',
    skillsOffered: ['IIT Prep & GATE', 'Software Engineering'],
    skillsNeeded: ['Cybersecurity & Networks'],
    rating: 4.9,
    completedSessions: 6,
    creditBalance: 6.0,
    role: 'standard',
    membership: 'Standard',
    status: 'active',
    portfolio: 'https://github.com/rajesh-iitb'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    phone: '+3725550109',
    password: 'password123',
    country: 'Estonia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    bio: 'Certified Ethical Hacker (CEH) and network security specialist. Eager to teach secure coding/pentesting and learn guitar/piano.',
    skillsOffered: ['Cybersecurity & Networks'],
    skillsNeeded: ['Music'],
    rating: 4.9,
    completedSessions: 9,
    creditBalance: 4.5,
    role: 'standard',
    membership: 'Standard',
    status: 'active',
    portfolio: 'https://elena-security.io'
  },
  {
    id: 'user_toxic',
    name: 'Spammy User',
    email: 'spammy@example.com',
    phone: '+15559999',
    password: 'password123',
    country: 'Unknown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Spam',
    bio: 'Buy crypto now! Call me +19999999 or chat on telegram @crypto_rich',
    skillsOffered: ['Business'],
    skillsNeeded: ['Programming'],
    rating: 2.1,
    completedSessions: 1,
    creditBalance: 1.0,
    role: 'standard',
    membership: 'Standard',
    status: 'active',
    portfolio: 'https://crypto-spam.biz'
  }
];

const DEFAULT_SKILLS = [
  {
    id: 'skill_1',
    teacherId: 'user_john',
    name: 'Web Development with React & Node',
    category: 'Programming',
    experienceLevel: 'Advanced',
    schedule: 'Weekends, 4:00 PM - 8:00 PM GMT',
    language: 'English',
    description: 'Learn modern web development from building interactive frontends to deploying scalable APIs. Will cover HTML, CSS, JavaScript, React, Node.js, and MongoDB.'
  },
  {
    id: 'skill_2',
    teacherId: 'user_sarah',
    name: 'Logo Design & Vector Illustration',
    category: 'Graphic Design',
    experienceLevel: 'Intermediate',
    schedule: 'Mondays and Wednesdays, 6:00 PM - 9:00 PM GMT',
    language: 'English',
    description: 'Master Adobe Illustrator and Figma. I will teach you the fundamentals of grids, typography, brand identities, and exporting high-resolution vector artwork.'
  },
  {
    id: 'skill_3',
    teacherId: 'user_ahmed',
    name: 'Modern Standard Arabic for Beginners',
    category: 'Arabic',
    experienceLevel: 'Beginner',
    schedule: 'Flexible scheduling, mornings preferred',
    language: 'Arabic, English',
    description: 'Start speaking Arabic from scratch. We will cover the alphabet, vocabulary, syntax, and essential conversational scripts for daily communications.'
  },
  {
    id: 'skill_4',
    teacherId: 'user_emma',
    name: 'Acoustic Guitar and Music Theory',
    category: 'Music',
    experienceLevel: 'Beginner',
    schedule: 'Fridays, 3:00 PM - 7:00 PM AEST',
    language: 'English',
    description: 'Learn simple chord changes, fingerpicking patterns, and the basics of music theory to read sheet music and write your own acoustic folk songs.'
  },
  {
    id: 'skill_5',
    teacherId: 'user_toxic',
    name: 'Get Rich Quick with Crypto Investing',
    category: 'Business',
    experienceLevel: 'Beginner',
    schedule: '24/7 Available',
    language: 'English',
    description: 'Guaranteed 1000% return on investment. Contact me at telegram @crypto_rich or whatsapp +19999999 for info.'
  },
  {
    id: 'skill_6',
    teacherId: 'user_raj',
    name: 'JEE Advanced Physics & Crack IIT-JEE',
    category: 'IIT Prep & GATE',
    experienceLevel: 'Advanced',
    schedule: 'Mondays and Fridays, 4:00 PM - 6:00 PM IST',
    language: 'Hindi, English',
    description: 'Master mechanics, electrodynamics, optics, and thermodynamics. We will solve past JEE Advanced problems and learn conceptual shortcut methods to crack the IIT exam.'
  },
  {
    id: 'skill_7',
    teacherId: 'user_john',
    name: 'Fine-Tuning LLMs & Prompt Engineering',
    category: 'LLM & AI Development',
    experienceLevel: 'Advanced',
    schedule: 'Flexible, nights and weekends',
    language: 'English',
    description: 'Learn how to fine-tune Large Language Models (LLMs) like Llama and Mistral. We will cover prompt engineering, Retrieval-Augmented Generation (RAG), and deploying model pipelines.'
  },
  {
    id: 'skill_8',
    teacherId: 'user_elena',
    name: 'Ethical Hacking & Network Pen Testing',
    category: 'Cybersecurity & Networks',
    experienceLevel: 'Intermediate',
    schedule: 'Tuesdays and Thursdays, 7:00 PM - 9:00 PM EET',
    language: 'English, Russian',
    description: 'Understand vulnerability assessments, penetration testing methodologies, port scanning with Nmap, exploits with Metasploit, and secure coding practices to defend networks.'
  },
  {
    id: 'skill_9',
    teacherId: 'user_john',
    name: 'System Design, Scalability & Microservices',
    category: 'Software Engineering',
    experienceLevel: 'Advanced',
    schedule: 'Saturdays, 10:00 AM - 12:00 PM GMT',
    language: 'English',
    description: 'Design distributed systems that scale to millions of users. Learn about load balancing, microservices, databases (SQL vs NoSQL), caching, message queues, and partition tolerance.'
  },
  {
    id: 'skill_10',
    teacherId: 'user_elena',
    name: 'Computer Networks, TCP/IP & Wireshark Analysis',
    category: 'Cybersecurity & Networks',
    experienceLevel: 'Beginner',
    schedule: 'Wednesdays, 5:00 PM - 7:00 PM EET',
    language: 'English',
    description: 'Deep dive into the OSI model, TCP/IP stack, DNS, DHCP, routing protocols, and how to capture and analyze network packets using Wireshark.'
  }
];

const DEFAULT_SESSIONS = [
  {
    id: 'session_1',
    teacherId: 'user_john',
    studentId: 'user_sarah',
    skillId: 'skill_1',
    dateTime: '2026-06-20T14:00',
    duration: 2, // 2 hours
    status: 'completed',
    creditsCost: 2.0,
    teacherRated: true,
    studentRated: true,
    iotVerified: true,
    iotToken: '112233'
  },
  {
    id: 'session_2',
    teacherId: 'user_sarah',
    studentId: 'user_john',
    skillId: 'skill_2',
    dateTime: '2026-06-22T10:00',
    duration: 1, // 1 hour
    status: 'completed',
    creditsCost: 1.0,
    teacherRated: true,
    studentRated: false,
    iotVerified: true,
    iotToken: '445566'
  },
  {
    id: 'session_3',
    teacherId: 'user_ahmed',
    studentId: 'user_john',
    skillId: 'skill_3',
    dateTime: '2026-06-24T16:00', // Upcoming
    duration: 1,
    status: 'accepted',
    creditsCost: 1.0,
    teacherRated: false,
    studentRated: false,
    iotVerified: false,
    iotToken: '345678'
  },
  {
    id: 'session_4',
    teacherId: 'user_emma',
    studentId: 'user_sarah',
    skillId: 'skill_4',
    dateTime: '2026-06-25T11:00', // Pending Request
    duration: 1.5,
    status: 'pending',
    creditsCost: 1.5,
    teacherRated: false,
    studentRated: false,
    iotVerified: false,
    iotToken: '987654'
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'review_1',
    sessionId: 'session_1',
    reviewerId: 'user_sarah', // Student reviewing teacher
    revieweeId: 'user_john',
    score: 5,
    comment: 'John explained React hooks extremely clearly. We coded a small counter app together. Highly recommend!',
    type: 'student-to-teacher'
  },
  {
    id: 'review_2',
    sessionId: 'session_1',
    reviewerId: 'user_john', // Teacher reviewing student
    revieweeId: 'user_sarah',
    score: 5,
    comment: 'Sarah is an excellent learner. She already understands design parameters well, making JS components easy to grasp!',
    type: 'teacher-to-student'
  },
  {
    id: 'review_3',
    sessionId: 'session_2',
    reviewerId: 'user_john', // Student reviewing teacher
    revieweeId: 'user_sarah',
    score: 5,
    comment: 'Sarah was wonderful. She helped me restructure the wireframes for my side project and taught me Illustrator shortcuts.',
    type: 'student-to-teacher'
  }
];

const DEFAULT_MESSAGES = [
  {
    id: 'msg_1',
    senderId: 'user_john',
    receiverId: 'user_sarah',
    timestamp: '2026-06-20T12:00:00Z',
    content: 'Hi Sarah! Are you ready for our React session today?',
    fileAttached: null
  },
  {
    id: 'msg_2',
    senderId: 'user_sarah',
    receiverId: 'user_john',
    timestamp: '2026-06-20T12:02:00Z',
    content: 'Yes, John! Excited to start. I have prepared a Figma file with my designs.',
    fileAttached: null
  },
  {
    id: 'msg_3',
    senderId: 'user_toxic',
    receiverId: 'user_john',
    timestamp: '2026-06-21T09:15:00Z',
    content: 'Hey buddy, check out this amazing project. You can call my cell phone 123-456-7890 for quick signup!',
    fileAttached: null
  }
];

const DEFAULT_REPORTS = [
  {
    id: 'report_1',
    reporterId: 'user_john',
    reportedId: 'user_toxic',
    category: 'fake_skills',
    reason: 'This user is posting get rich quick crypto scams and trying to share external phone numbers in chat.',
    status: 'pending'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'user_john',
    title: 'New Session Scheduled',
    content: 'Your Arabic lesson with Ahmed Ali is scheduled for June 24 at 4:00 PM.',
    read: false,
    timestamp: '2026-06-22T08:00:00Z'
  },
  {
    id: 'notif_2',
    userId: 'user_sarah',
    title: 'Credits Received',
    content: 'You earned 10 credits for completing "Logo Design" with John.',
    read: true,
    timestamp: '2026-06-22T11:00:00Z'
  },
  {
    id: 'notif_3',
    userId: 'user_emma',
    title: 'Booking Request Received',
    content: 'Sarah Smith sent a request for Acoustic Guitar on June 25.',
    read: false,
    timestamp: '2026-06-22T15:30:00Z'
  }
];

// Database Class
class MockDB {
  constructor() {
    this.init();
  }

  init() {
    // Migration check to ensure new database structure (IoT tokens, portfolio links, 1-credit exchange rate) is loaded
    if (!localStorage.getItem('skillswap_db_version_v3')) {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.SKILLS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.REVIEWS);
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      localStorage.removeItem(STORAGE_KEYS.REPORTS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem('skillswap_logged_in_user');
      localStorage.setItem('skillswap_db_version_v3', 'true');
    }

    // Check and populate if empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SKILLS)) {
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(DEFAULT_SKILLS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(DEFAULT_REPORTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }

  // Helper getters/setters
  _get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- USERS API ---
  getUsers() {
    return this._get(STORAGE_KEYS.USERS);
  }

  getUser(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user) {
    const users = this.getUsers();
    const newUser = {
      id: 'user_' + Date.now(),
      rating: 5.0,
      completedSessions: 0,
      creditBalance: 5.0, // 5 starting credits (5 hours of learning!)
      role: 'standard',
      status: 'active',
      membership: 'Standard',
      skillsOffered: [],
      skillsNeeded: [],
      portfolio: '',
      avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      ...user
    };
    users.push(newUser);
    this._set(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      this._set(STORAGE_KEYS.USERS, users);
      return users[idx];
    }
    return null;
  }

  // --- SKILLS API ---
  getSkills() {
    // Only return skills of active/non-suspended users
    const activeUserIds = this.getUsers()
      .filter(u => u.status === 'active')
      .map(u => u.id);
    return this._get(STORAGE_KEYS.SKILLS).filter(s => activeUserIds.includes(s.teacherId));
  }

  getSkill(id) {
    return this.getSkills().find(s => s.id === id);
  }

  createSkill(skill) {
    const skills = this._get(STORAGE_KEYS.SKILLS);
    const newSkill = {
      id: 'skill_' + Date.now(),
      ...skill
    };
    skills.push(newSkill);
    this._set(STORAGE_KEYS.SKILLS, skills);

    // Update user skillsOffered list
    const user = this.getUser(skill.teacherId);
    if (user) {
      const offered = new Set(user.skillsOffered);
      offered.add(skill.category);
      this.updateUser(skill.teacherId, { skillsOffered: Array.from(offered) });
    }

    return newSkill;
  }

  updateSkill(id, updates) {
    const skills = this._get(STORAGE_KEYS.SKILLS);
    const idx = skills.findIndex(s => s.id === id);
    if (idx !== -1) {
      skills[idx] = { ...skills[idx], ...updates };
      this._set(STORAGE_KEYS.SKILLS, skills);
      return skills[idx];
    }
    return null;
  }

  // --- SESSIONS API ---
  getSessions() {
    return this._get(STORAGE_KEYS.SESSIONS);
  }

  getSession(id) {
    return this.getSessions().find(s => s.id === id);
  }

  createSession(session) {
    const sessions = this.getSessions();
    const newSession = {
      id: 'session_' + Date.now(),
      status: 'pending',
      teacherRated: false,
      studentRated: false,
      iotVerified: false,
      iotToken: Math.floor(100000 + Math.random() * 900000).toString(), // Generate secure 6-digit token
      ...session
    };
    sessions.push(newSession);
    this._set(STORAGE_KEYS.SESSIONS, sessions);

    // Create a notification for the teacher
    const skill = this.getSkill(session.skillId);
    const student = this.getUser(session.studentId);
    this.createNotification(session.teacherId, {
      title: 'New Booking Request',
      content: `${student.name} requested to learn "${skill.name}" on ${new Date(session.dateTime).toLocaleString()}.`
    });

    return newSession;
  }

  updateSession(id, data) {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    sessions[idx] = { ...sessions[idx], ...data };
    this._set(STORAGE_KEYS.SESSIONS, sessions);
    return sessions[idx];
  }

  updateSessionStatus(id, status) {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const session = sessions[idx];
    const prevStatus = session.status;
    session.status = status;

    // Handle credit transfer upon completion
    if (status === 'completed' && prevStatus !== 'completed') {
      const credits = session.creditsCost;
      const teacher = this.getUser(session.teacherId);
      const student = this.getUser(session.studentId);

      if (teacher && student) {
        // Add to teacher (already deducted from student on approval)
        this.updateUser(teacher.id, {
          creditBalance: teacher.creditBalance + credits,
          completedSessions: teacher.completedSessions + 1
        });
        this.updateUser(student.id, {
          completedSessions: student.completedSessions + 1
        });

        // Notifications
        this.createNotification(student.id, {
          title: 'Session Completed',
          content: `You completed your session with ${teacher.name}. Spent ${credits} credits.`
        });
        this.createNotification(teacher.id, {
          title: 'Session Completed & Credits Earned',
          content: `You completed your session with ${student.name}. Earned ${credits} credits.`
        });
      }
    } 
    // Handle credit deduction upon approval (escrow hold)
    else if (status === 'accepted' && prevStatus === 'pending') {
      const student = this.getUser(session.studentId);
      const teacher = this.getUser(session.teacherId);
      const skill = this.getSkill(session.skillId);
      
      if (student) {
        this.updateUser(student.id, {
          creditBalance: Math.max(0, student.creditBalance - session.creditsCost)
        });
      }

      this.createNotification(session.studentId, {
        title: 'Booking Request Approved',
        content: `${teacher.name} approved your session for "${skill.name}" on ${new Date(session.dateTime).toLocaleString()}.`
      });
    }
    // Handle no-show refund
    else if (status === 'cancelled_noshow' && prevStatus === 'accepted') {
      const student = this.getUser(session.studentId);
      const teacher = this.getUser(session.teacherId);
      const skill = this.getSkill(session.skillId);
      
      if (student) {
        this.updateUser(student.id, {
          creditBalance: student.creditBalance + session.creditsCost
        });
        this.createNotification(student.id, {
          title: 'Session Refunded (No-Show)',
          content: `Your session with ${teacher.name} was cancelled due to instructor no-show. ${session.creditsCost} credits have been refunded.`
        });
      }
      
      if (teacher) {
        const newRating = Math.max(1.0, parseFloat((teacher.rating - 0.2).toFixed(1)));
        this.updateUser(teacher.id, {
          rating: newRating,
          status: 'flagged' // Flag account
        });
        
        this.createNotification(teacher.id, {
          title: 'Account Flagged & Rating Reduced',
          content: `You failed to attend your scheduled session with ${student.name}. Your rating was reduced to ${newRating} and your account has been flagged.`
        });
        
        // Auto-report for Admin Console review
        this.createReport({
          reporterId: student.id,
          reportedId: teacher.id,
          category: 'no_show',
          reason: `System Auto-Flag: Instructor failed to attend the scheduled session. Student wallet was refunded. Rating reduced to ${newRating}.`,
          status: 'pending'
        });
      }
    }
    // Handle general decline of pending request
    else if (status === 'rejected' && prevStatus === 'pending') {
      const teacher = this.getUser(session.teacherId);
      this.createNotification(session.studentId, {
        title: 'Booking Request Declined',
        content: `${teacher.name} declined your booking request.`
      });
    }
    // Handle decline after acceptance (refund student)
    else if (status === 'rejected' && prevStatus === 'accepted') {
      const student = this.getUser(session.studentId);
      if (student) {
        this.updateUser(student.id, {
          creditBalance: student.creditBalance + session.creditsCost
        });
      }
    }

    this._set(STORAGE_KEYS.SESSIONS, sessions);
    return session;
  }

  // --- MESSAGES API ---
  getMessages() {
    return this._get(STORAGE_KEYS.MESSAGES);
  }

  getChatHistory(user1, user2) {
    return this.getMessages().filter(m => 
      (m.senderId === user1 && m.receiverId === user2) ||
      (m.senderId === user2 && m.receiverId === user1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  createMessage(msg) {
    const messages = this.getMessages();
    const newMsg = {
      id: 'msg_' + Date.now(),
      timestamp: new Date().toISOString(),
      fileAttached: null,
      ...msg
    };
    messages.push(newMsg);
    this._set(STORAGE_KEYS.MESSAGES, messages);
    return newMsg;
  }

  // --- REVIEWS API ---
  getReviews() {
    return this._get(STORAGE_KEYS.REVIEWS);
  }

  createReview(review) {
    const reviews = this.getReviews();
    const newReview = {
      id: 'review_' + Date.now(),
      ...review
    };
    reviews.push(newReview);
    this._set(STORAGE_KEYS.REVIEWS, reviews);

    // Update Rated flags in session
    const sessions = this.getSessions();
    const sIdx = sessions.findIndex(s => s.id === review.sessionId);
    if (sIdx !== -1) {
      if (review.type === 'student-to-teacher') {
        sessions[sIdx].teacherRated = true;
      } else {
        sessions[sIdx].studentRated = true;
      }
      this._set(STORAGE_KEYS.SESSIONS, sessions);
    }

    // Recompute user rating average
    const targetUserId = review.revieweeId;
    const userReviews = reviews.filter(r => r.revieweeId === targetUserId);
    if (userReviews.length > 0) {
      const avg = userReviews.reduce((sum, r) => sum + r.score, 0) / userReviews.length;
      this.updateUser(targetUserId, { rating: parseFloat(avg.toFixed(1)) });
    }

    return newReview;
  }

  // --- REPORTS API ---
  getReports() {
    return this._get(STORAGE_KEYS.REPORTS);
  }

  createReport(report) {
    const reports = this.getReports();
    const newReport = {
      id: 'report_' + Date.now(),
      status: 'pending',
      ...report
    };
    reports.push(newReport);
    this._set(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  }

  updateReportStatus(id, status) {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      reports[idx].status = status;
      this._set(STORAGE_KEYS.REPORTS, reports);
      return reports[idx];
    }
    return null;
  }

  // --- NOTIFICATIONS API ---
  getNotifications(userId) {
    return this._get(STORAGE_KEYS.NOTIFICATIONS)
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  createNotification(userId, data) {
    const notifications = this._get(STORAGE_KEYS.NOTIFICATIONS);
    const newNotif = {
      id: 'notif_' + Date.now(),
      userId,
      title: data.title,
      content: data.content,
      read: false,
      timestamp: new Date().toISOString()
    };
    notifications.push(newNotif);
    this._set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotif;
  }

  markNotificationsAsRead(userId) {
    const notifications = this._get(STORAGE_KEYS.NOTIFICATIONS);
    notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this._set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  buyCredits(userId, amount, cost) {
    const user = this.getUser(userId);
    if (!user) return null;
    
    const updated = this.updateUser(userId, {
      creditBalance: user.creditBalance + amount
    });

    this.createNotification(userId, {
      title: 'Credits Purchased Successfully',
      content: `You purchased ${amount} credits for $${cost}.`
    });

    return updated;
  }

  subscribePremium(userId, billingCycle, price) {
    const user = this.getUser(userId);
    if (!user) return null;

    const updated = this.updateUser(userId, {
      membership: `Premium (${billingCycle})`,
      creditBalance: user.creditBalance + 10 // 10 credits bonus!
    });

    this.createNotification(userId, {
      title: 'Premium Membership Active',
      content: `Welcome to Premium! You subscribed to the ${billingCycle} membership ($${price}) and received a bonus of 10 credits.`
    });

    return updated;
  }
}

const db = new MockDB();
export default db;
