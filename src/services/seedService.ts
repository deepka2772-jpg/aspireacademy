import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Course, Lesson, Category, Faculty, Batch, SiteSettings } from '../types';

export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    return snap.empty;
  } catch {
    return false;
  }
}

export async function seedInitialPlatformData(): Promise<void> {
  const now = new Date().toISOString();

  // 1. Initial Categories
  const categories: Category[] = [
    {
      id: 'cat_physics',
      name: 'Physics & Mechanics',
      slug: 'physics-mechanics',
      description: 'Comprehensive conceptual physics, mechanics, electrodynamics, and modern physics.',
      icon: 'Atom',
      courseCount: 2,
      isPublished: true,
    },
    {
      id: 'cat_math',
      name: 'Pure & Applied Mathematics',
      slug: 'mathematics',
      description: 'Calculus, algebra, vectors, coordinate geometry, and numerical techniques.',
      icon: 'Calculator',
      courseCount: 1,
      isPublished: true,
    },
    {
      id: 'cat_chemistry',
      name: 'Chemistry Masterseries',
      slug: 'chemistry',
      description: 'Physical chemistry formulas, organic reaction mechanisms, and inorganic periodicity.',
      icon: 'FlaskConical',
      courseCount: 1,
      isPublished: true,
    },
    {
      id: 'cat_biology',
      name: 'Biological Sciences & NEET',
      slug: 'biology',
      description: 'Human physiology, plant biology, genetics, and biotechnology modules.',
      icon: 'Dna',
      courseCount: 1,
      isPublished: true,
    },
  ];

  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), cat);
  }

  // 2. Initial Faculty
  const facultyList: Faculty[] = [
    {
      id: 'fac_1',
      name: 'Dr. V. K. Sharma',
      title: 'Head of Physics Department',
      bio: 'Ex-Professor with 18+ years of mentorship experience in advanced mechanics and electrostatics.',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      subject: 'Physics',
      qualification: 'Ph.D. in Applied Physics',
      isPublished: true,
    },
    {
      id: 'fac_2',
      name: 'Prof. Ananya Sen',
      title: 'Senior Faculty - Mathematics',
      bio: 'Renowned author and competitive mathematics mentor specializing in differential calculus and linear algebra.',
      photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      subject: 'Mathematics',
      qualification: 'M.Sc. Mathematics, Gold Medalist',
      isPublished: true,
    },
    {
      id: 'fac_3',
      name: 'Dr. Rajesh Nair',
      title: 'Senior Organic Chemistry Specialist',
      bio: 'Specialist in reaction mechanisms, spectroscopy, and molecular modeling with over a decade of teaching excellence.',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      subject: 'Chemistry',
      qualification: 'Ph.D. in Organic Chemistry',
      isPublished: true,
    },
  ];

  for (const fac of facultyList) {
    await setDoc(doc(db, 'faculty', fac.id), fac);
  }

  // 3. Initial Courses
  const courses: Course[] = [
    {
      id: 'course_physics_complete',
      title: 'Classical Mechanics & Motion: From First Principles',
      shortDescription: 'Master kinematics, Newton\'s laws of motion, work-energy theorem, and rotational dynamics with problem-solving walkthroughs.',
      description: 'This mastercourse provides a thorough mathematical and intuitive journey into classical physics. Specially crafted for competitive aspirants and science scholars seeking deep conceptual mastery, each module includes lecture notes, step-by-step solved examples, and interactive quizzes.',
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80',
      category: 'Physics & Mechanics',
      targetClass: 'Class 11, 12 & Competitive Exams',
      facultyName: 'Dr. V. K. Sharma',
      duration: '42 Hours • 16 Lessons',
      syllabus: 'Module 1: Kinematics in 1D and 2D\\nModule 2: Newton\'s Laws & Friction Dynamics\\nModule 3: Work, Energy, and Power\\nModule 4: Center of Mass & Collisions\\nModule 5: Rotational Mechanics & Torque',
      lessonCount: 4,
      isFree: false,
      price: 1499,
      originalPrice: 3999,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course_calculus_foundations',
      title: 'Calculus Mastery: Limits, Derivatives & Integrals',
      shortDescription: 'From instantaneous rates of change to Riemann sums and area integration, build rock-solid foundations in calculus.',
      description: 'Calculus is the language of modern engineering and physical sciences. This course deconstructs epsilon-delta limits, differentiation shortcuts, curve sketching, optimization, and definite integration with graphical visualizations.',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
      category: 'Pure & Applied Mathematics',
      targetClass: 'Senior Secondary & Undergrads',
      facultyName: 'Prof. Ananya Sen',
      duration: '35 Hours • 12 Lessons',
      syllabus: 'Module 1: Limits & Continuity\\nModule 2: Differential Calculus & Mean Value Theorem\\nModule 3: Maxima & Minima Problems\\nModule 4: Indefinite and Definite Integrals\\nModule 5: Differential Equations',
      lessonCount: 3,
      isFree: false,
      price: 1299,
      originalPrice: 2999,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course_chemistry_basics_free',
      title: 'Foundations of Chemical Bonding & Molecular Structure',
      shortDescription: 'Free starter course covering VSEPR theory, hybridization, dipole moments, and molecular orbital diagrams.',
      description: 'A free essential primer for all science learners. Learn how atoms combine to form molecules, visualize geometry in 3D space, and understand resonance structures with zero prior prerequisites.',
      thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
      category: 'Chemistry Masterseries',
      targetClass: 'All Science Students',
      facultyName: 'Dr. Rajesh Nair',
      duration: '8 Hours • 3 Lessons',
      syllabus: 'Module 1: Lewis Structures & Formal Charges\\nModule 2: VSEPR Geometry & Bond Angles\\nModule 3: Hybridization (sp, sp2, sp3, sp3d)\\nModule 4: Molecular Orbital Theory Basics',
      lessonCount: 3,
      isFree: true,
      price: 0,
      originalPrice: 999,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const c of courses) {
    await setDoc(doc(db, 'courses', c.id), c);
  }

  // 4. Initial Lessons (with real working educational YouTube links)
  const lessons: Lesson[] = [
    // Lessons for course_physics_complete
    {
      id: 'les_phy_01',
      courseId: 'course_physics_complete',
      title: 'Lesson 1: Introduction to Vectors & Frame of Reference',
      description: 'Understanding inertial frames, vector resolution, scalar products, and cross products in 3D.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=ihNZLpZ-p_o', // 3Blue1Brown Vectors
      duration: '18 mins',
      order: 1,
      isFreePreview: true, // Free preview available to anyone!
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'les_phy_02',
      courseId: 'course_physics_complete',
      title: 'Lesson 2: Kinematic Equations & Projectile Motion',
      description: 'Deriving trajectory equations, maximum height, range calculations, and projectile on inclined planes.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=ZM8ECpBQD0U',
      duration: '24 mins',
      order: 2,
      isFreePreview: false, // Protected paid content
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'les_phy_03',
      courseId: 'course_physics_complete',
      title: 'Lesson 3: Free Body Diagrams & Friction Analysis',
      description: 'Systematic approaches to multi-block pulley systems, static and kinetic friction coefficient applications.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=kYUPbYjM8lY',
      duration: '30 mins',
      order: 3,
      isFreePreview: false,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'les_phy_04',
      courseId: 'course_physics_complete',
      title: 'Lesson 4: Rotational Dynamics & Moment of Inertia',
      description: 'Calculating moments of inertia using parallel and perpendicular axis theorems with live demonstrations.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=XHGKX3z5OF8',
      duration: '28 mins',
      order: 4,
      isFreePreview: false,
      isPublished: true,
      createdAt: now,
    },

    // Lessons for course_calculus_foundations
    {
      id: 'les_calc_01',
      courseId: 'course_calculus_foundations',
      title: 'Lesson 1: The Essence of Calculus and Limits',
      description: 'Intuitive geometrical interpretation of limits and derivatives before computational formalisms.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=WUvTyaaNkzM', // 3Blue1Brown Calculus Essence
      duration: '17 mins',
      order: 1,
      isFreePreview: true,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'les_calc_02',
      courseId: 'course_calculus_foundations',
      title: 'Lesson 2: Derivative Rules: Product, Quotient & Chain Rule',
      description: 'Mastering the differentiation toolkit with rigorous algebraic proofs and graphical intuitions.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=YG15m2VwSjA',
      duration: '22 mins',
      order: 2,
      isFreePreview: false,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'les_calc_03',
      courseId: 'course_calculus_foundations',
      title: 'Lesson 3: Integration as Cumulative Area & Fundamental Theorem',
      description: 'Connecting derivatives and antiderivatives through the fundamental theorem of calculus.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=rfG8ce4nNh0',
      duration: '25 mins',
      order: 3,
      isFreePreview: false,
      isPublished: true,
      createdAt: now,
    },

    // Lessons for course_chemistry_basics_free
    {
      id: 'les_chem_01',
      courseId: 'course_chemistry_basics_free',
      title: 'Lesson 1: Octet Rule, Lewis Dot Symbols & Ionic vs Covalent Bonds',
      description: 'Introduction to chemical bonding, electronegativity difference, and formal charge evaluations.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=7DjsD7Hcd9U',
      duration: '20 mins',
      order: 1,
      isFreePreview: true,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'les_chem_02',
      courseId: 'course_chemistry_basics_free',
      title: 'Lesson 2: VSEPR Theory and Molecular Geometries',
      description: 'Predicting linear, bent, trigonal planar, tetrahedral, and octahedral molecular structures.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=nxebQZUVvTg',
      duration: '26 mins',
      order: 2,
      isFreePreview: true,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'les_chem_03',
      courseId: 'course_chemistry_basics_free',
      title: 'Lesson 3: Hybridization & Molecular Orbital Fundamentals',
      description: 'Sigma and pi bonds, overlapping atomic orbitals, and orbital energy level diagrams.',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=OTgpN6n3v28',
      duration: '25 mins',
      order: 3,
      isFreePreview: true,
      isPublished: true,
      createdAt: now,
    },
  ];

  for (const les of lessons) {
    await setDoc(doc(db, 'lessons', les.id), les);
  }

  // 5. Initial Batches
  const batches: Batch[] = [
    {
      id: 'batch_alpha_2026',
      name: 'Pinnacle Batch 2026 - Advanced Physics & Math',
      courseId: 'course_physics_complete',
      courseTitle: 'Classical Mechanics & Motion: From First Principles',
      startDate: '2026-11-15',
      endDate: '2027-04-30',
      schedule: 'Monday, Wednesday & Friday • 6:30 PM - 8:30 PM IST',
      teacherName: 'Dr. V. K. Sharma',
      maxStudents: 80,
      enrolledCount: 38,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'batch_calculus_accelerated',
      name: 'Weekend Calculus Intensive - Morning Cohort',
      courseId: 'course_calculus_foundations',
      courseTitle: 'Calculus Mastery: Limits, Derivatives & Integrals',
      startDate: '2026-11-01',
      endDate: '2027-02-28',
      schedule: 'Saturday & Sunday • 9:00 AM - 12:00 PM IST',
      teacherName: 'Prof. Ananya Sen',
      maxStudents: 60,
      enrolledCount: 42,
      isPublished: true,
      createdAt: now,
    },
  ];

  for (const b of batches) {
    await setDoc(doc(db, 'batches', b.id), b);
  }

  // 6. Initial Quizzes
  const quizPhysics = {
    id: 'quiz_phy_01',
    courseId: 'course_physics_complete',
    lessonId: 'les_phy_01',
    title: 'Mechanics Diagnostic Assessment 01',
    instructions: 'Timed assessment containing 4 conceptual questions. Review each question thoroughly before submission. Passing grade: 50%.',
    passingPercentage: 50,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q1',
        question: 'Which of the following is true for an object in uniform circular motion?',
        options: [
          'Velocity is constant but acceleration is zero',
          'Speed is constant but velocity is continuously changing',
          'Both speed and velocity are constant vectors',
          'The net work done by centripetal force is non-zero',
        ],
        marks: 2,
        correctAnswerIndex: 1,
      },
      {
        id: 'q2',
        question: 'Two vectors of equal magnitude A have an angle θ between them. The magnitude of their resultant is equal to A when θ is:',
        options: ['60 degrees', '90 degrees', '120 degrees', '180 degrees'],
        marks: 2,
        correctAnswerIndex: 2,
      },
      {
        id: 'q3',
        question: 'What is the dimension of the universal gravitational constant G?',
        options: ['[M^-1 L^3 T^-2]', '[M^1 L^2 T^-2]', '[M^-2 L^3 T^-1]', '[M^-1 L^2 T^-2]'],
        marks: 2,
        correctAnswerIndex: 0,
      },
      {
        id: 'q4',
        question: 'In an isolated system with no external non-conservative forces, which quantity is strictly conserved?',
        options: [
          'Total mechanical energy (Kinetic + Potential)',
          'Only kinetic energy',
          'Only gravitational potential energy',
          'Thermal dissipative energy',
        ],
        marks: 2,
        correctAnswerIndex: 0,
      },
    ],
    isPublished: true,
    createdAt: now,
  };

  await setDoc(doc(db, 'quizzes', quizPhysics.id), quizPhysics);

  // 7. Initial Materials
  const materials = [
    {
      id: 'mat_vectors_summary',
      courseId: 'course_physics_complete',
      title: 'Vectors & 3D Coordinates Quick Reference Handbook',
      fileType: 'PDF',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '1.8 MB',
      isFreePreview: true,
      createdAt: now,
    },
    {
      id: 'mat_rotational_notes',
      courseId: 'course_physics_complete',
      title: 'Rotational Dynamics Problem Set & Moment of Inertia Table',
      fileType: 'PDF',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '3.4 MB',
      isFreePreview: false,
      createdAt: now,
    },
  ];

  for (const m of materials) {
    await setDoc(doc(db, 'materials', m.id), m);
  }

  // 8. Site Settings
  const siteSettings: SiteSettings = {
    academyName: 'Aspire Academy Online',
    tagline: 'Empowering Aspirants with Conceptual Clarity & High-Yield Learning',
    contactEmail: 'contact@aspireacademy.edu',
    contactPhone: '+91 98765 43210',
    address: 'Aspire Learning Hub, Knowledge Park, India',
    announcement: 'Admissions open for 2026 Foundation & Advanced Preparation Batches!',
    heroTitle: 'Master Complex Concepts. Achieve Your Academic Dreams.',
    heroSubtitle: 'Join India\'s leading competitive & academic learning platform. Structured syllabus, live masterclasses, high-yield notes, and comprehensive mock assessments.',
    updatedAt: now,
  };

  await setDoc(doc(db, 'settings', 'site_settings'), siteSettings);
}
