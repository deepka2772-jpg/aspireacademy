import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Course, Lesson, Category, Faculty, Batch, SiteSettings, Quiz } from '../types';

export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    return snap.empty;
  } catch {
    return false;
  }
}

export async function seedInitialPlatformData(force = false): Promise<void> {
  const now = new Date().toISOString();

  // 1. Initial Categories
  const categories: Category[] = [
    {
      id: 'cat_biology',
      name: 'Biology & NEET (जीव विज्ञान)',
      slug: 'biology-neet',
      description: 'कक्षा 12 जीव विज्ञान, NEET फाउंडेशन, NCERT डायग्राम्स एवं पिछले वर्षों के प्रश्न (PYQs) - By Shekhar Sir.',
      icon: 'Dna',
      courseCount: 2,
      isPublished: true,
    },
    {
      id: 'cat_physics',
      name: 'Physics (भौतिक विज्ञान)',
      slug: 'physics',
      description: 'कक्षा 11 एवं 12 भौतिकी, संख्यात्मक प्रश्न (Numericals), डेरिवेशन और फॉर्मूला शीट.',
      icon: 'Atom',
      courseCount: 2,
      isPublished: true,
    },
    {
      id: 'cat_chemistry',
      name: 'Chemistry (रसायन विज्ञान)',
      slug: 'chemistry',
      description: 'भौतिक, कार्बनिक (Organic) एवं अकार्बनिक रसायन विज्ञान, रिएक्शन्स एवं अध्यायवार टेस्ट.',
      icon: 'FlaskConical',
      courseCount: 1,
      isPublished: true,
    },
    {
      id: 'cat_class10_science',
      name: 'Class 10 Science (कक्षा 10 विज्ञान)',
      slug: 'class-10-science',
      description: 'बिहार बोर्ड (BSEB) एवं CBSE कक्षा 10 विज्ञान: 16 अध्यायवार टेस्ट सीरीज एवं वीडियो लेक्चर्स.',
      icon: 'BookOpen',
      courseCount: 1,
      isPublished: true,
    },
    {
      id: 'cat_math',
      name: 'Mathematics (गणित)',
      slug: 'mathematics',
      description: 'कक्षा 11 एवं 12 गणित, कैलकुलस, त्रिकोणमिति एवं निर्देशांक ज्यामिति.',
      icon: 'Calculator',
      courseCount: 1,
      isPublished: true,
    },
  ];

  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), cat);
  }

  // 2. Initial Faculty - Authentic from aspireacademyonline.in
  const facultyList: Faculty[] = [
    {
      id: 'fac_shekhar_sir',
      name: 'Shekhar Sir',
      title: 'Founder & Senior Biology / Science Mentor',
      bio: 'Founder of Aspire Academy. 10+ years of dedicated mentorship in Class 10 Science & Class 12 Biology for Bihar Board (BSEB) & NEET aspirants. Known for intuitive diagrammatic explanations and high board score results.',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      subject: 'Biology & Class 10 Science',
      qualification: 'M.Sc. Life Sciences, Lead Educator & Founder',
      isPublished: true,
    },
    {
      id: 'fac_rk_verma',
      name: 'R. K. Verma Sir',
      title: 'Senior Faculty - Physics & Mechanics',
      bio: 'Ex-Senior Faculty with 14+ years of experience helping students master complex numericals, derivations, and NEET/JEE concepts from first principles.',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      subject: 'Physics',
      qualification: 'M.Tech Applied Physics, IITian Mentor',
      isPublished: true,
    },
    {
      id: 'fac_priya_kumari',
      name: 'Dr. Priya Kumari',
      title: 'Head of Chemistry Department',
      bio: 'Specialist in Organic Mechanisms, Reaction Charts, and NCERT Chemistry with over 9 years of teaching excellence for board and medical exams.',
      photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      subject: 'Chemistry',
      qualification: 'Ph.D. in Organic Chemistry',
      isPublished: true,
    },
    {
      id: 'fac_amit_kumar',
      name: 'Er. Amit Kumar Sir',
      title: 'Senior Faculty - Mathematics',
      bio: 'Author and mathematics mentor specializing in Calculus, Coordinate Geometry, and CBSE/Board scoring strategies with proven student results.',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      subject: 'Mathematics',
      qualification: 'B.Tech NIT, Senior Math Faculty',
      isPublished: true,
    },
  ];

  for (const fac of facultyList) {
    await setDoc(doc(db, 'faculty', fac.id), fac);
  }

  // 3. Initial Courses - Exact Courses from aspireacademyonline.in
  const courses: Course[] = [
    {
      id: 'course_bio_12_shekhar',
      title: 'कक्षा 12 जीव विज्ञान (Class 12 Biology Full Course)',
      shortDescription: 'Complete Class 12 Biology for Bihar Board (BSEB) & NEET. NCERT line-by-line, diagrams, PYQs & chapter notes by Shekhar Sir.',
      description: 'Aspire Academy का सबसे लोकप्रिय कोर्स! इसमें कक्षा 12वीं जीव विज्ञान का संपूर्ण पाठ्यक्रम बिहार बोर्ड और NEET फाउंडेशन के अनुसार पढ़ाया गया है। हर अध्याय के विस्तृत वीडियो लेक्चर्स, हस्तलिखित नोट्स, महत्वपूर्ण डायग्राम्स और 10 वर्षों के PYQs शामिल हैं।',
      thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
      category: 'Biology & NEET (जीव विज्ञान)',
      targetClass: 'Class 12 & NEET Foundation (BSEB / CBSE)',
      facultyName: 'Shekhar Sir',
      duration: '50 Hours • 24 Lessons',
      syllabus: 'इकाई 1: जीवों में जनन एवं पुष्पी पादपों में लैंगिक जनन\\nइकाई 2: मानव जनन एवं जनन स्वास्थ्य\\nइकाई 3: वंशागति एवं विविधता के सिद्धांत\\nइकाई 4: जैव प्रौद्योगिकी एवं इसके अनुप्रयोग\\nइकाई 5: पारिस्थितिकी एवं पर्यावरण',
      lessonCount: 4,
      isFree: false,
      price: 399,
      originalPrice: 999,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course_phy_12_master',
      title: 'कक्षा 12 भौतिक विज्ञान (Class 12 Physics Mastercourse)',
      shortDescription: 'Concept-based learning emphasizing numerical problem-solving, derivations, and regular test series.',
      description: 'कक्षा 12वीं भौतिकी के सभी कठिन अध्यायों को आसान तरीके से समझें। इलेक्ट्रोस्टैटिक्स से लेकर मॉडर्न फिजिक्स तक, सभी डेरिवेशंस, फॉर्मूला शीट्स और न्यूमेरिकल प्रॉब्लम सॉल्विंग का संपूर्ण संग्रह।',
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80',
      category: 'Physics (भौतिक विज्ञान)',
      targetClass: 'Class 12 (Bihar Board & CBSE)',
      facultyName: 'R. K. Verma Sir',
      duration: '48 Hours • 20 Lessons',
      syllabus: 'अध्याय 1-2: विद्युत आवेश तथा क्षेत्र, स्थिरवैद्युत विभव\\nअध्याय 3-4: विद्युत धारा, गतिमान आवेश और चुंबकत्व\\nअध्याय 5-7: प्रत्यावर्ती धारा एवं विद्युतचुंबकीय प्रेरण\\nअध्याय 8-10: किरण प्रकाशिकी एवं तरंग प्रकाशिकी\\nअध्याय 11-14: आधुनिक भौतिकी एवं सेमीकंडक्टर',
      lessonCount: 4,
      isFree: false,
      price: 999,
      originalPrice: 2499,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course_chem_12_master',
      title: 'कक्षा 12 रसायन विज्ञान (Class 12 Chemistry Mastercourse)',
      shortDescription: 'Physical, Organic, and Inorganic Chemistry fundamentals with reaction mechanism charts and test series.',
      description: 'कार्बनिक और अकार्बनिक रसायन के सभी महत्वपूर्ण रिएक्शन्स, फॉर्मूले और अध्यायवार टेस्ट। बोर्ड परीक्षा में 95%+ स्कोर करने के लिए विशेष रूप से डिज़ाइन किया गया कोर्स।',
      thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop&q=80',
      category: 'Chemistry (रसायन विज्ञान)',
      targetClass: 'Class 12 (BSEB & CBSE)',
      facultyName: 'Dr. Priya Kumari',
      duration: '45 Hours • 18 Lessons',
      syllabus: 'भाग 1: विलयन, वैद्युतरसायन, रासायनिक बलगतिकी\\nभाग 2: d एवं f ब्लॉक के तत्व, उपसहसंयोजन यौगिक\\nभाग 3: हैलोएल्केन तथा हैलोएरीन, एल्कोहॉल, फीनॉल एवं ईथर\\nभाग 4: एल्डिहाइड, कीटोन एवं कार्बोक्सिलिक अम्ल\\nभाग 5: जैव-अणु एवं दैनिक जीवन में रसायन',
      lessonCount: 3,
      isFree: false,
      price: 999,
      originalPrice: 2499,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course_sci_10_quiz_free',
      title: 'कक्षा 10 विज्ञान — 16 Chapter Test Series (Free Quiz Course)',
      shortDescription: 'Designed specifically for BSEB & CBSE Hindi Medium students to practice chapter-wise Science MCQ quizzes.',
      description: 'कक्षा 10वीं बोर्ड परीक्षा में विज्ञान के सभी 16 अध्यायों के वस्तुनिष्ठ (MCQ) प्रश्नों का निःशुल्क टेस्ट सीरीज। प्रत्येक टेस्ट में समय सीमा, तत्काल परिणाम और सही उत्तर की विस्तृत व्याख्या शामिल है। By Shekhar Sir.',
      thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      category: 'Class 10 Science (कक्षा 10 विज्ञान)',
      targetClass: 'Class 10 (Bihar Board & CBSE)',
      facultyName: 'Shekhar Sir',
      duration: '16 Chapter Tests • 100% Free',
      syllabus: 'भौतिकी: प्रकाश का परावर्तन, मानव नेत्र, विद्युत, विद्युत धारा के चुंबकीय प्रभाव\\nरसायन: रासायनिक अभिक्रियाएं, अम्ल-क्षार, धातु-अधातु, कार्बन एवं उसके यौगिक\\nजीव विज्ञान: जैव प्रक्रम, नियंत्रण एवं समन्वय, जीव जनन कैसे करते हैं, आनुवंशिकता\\nपर्यावरण: हमारा पर्यावरण, प्राकृतिक संसाधनों का प्रबंधन',
      lessonCount: 3,
      isFree: true,
      price: 0,
      originalPrice: 499,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const c of courses) {
    await setDoc(doc(db, 'courses', c.id), c);
  }

  // 4. Initial Lessons (Dual Video Source: YouTube + R2 ready)
  const lessons: Lesson[] = [
    // Lessons for course_bio_12_shekhar
    {
      id: 'les_bio_01',
      courseId: 'course_bio_12_shekhar',
      title: 'अध्याय 1: जीवों में जनन एवं पुष्पी पादपों में लैंगिक जनन (Introduction)',
      description: 'पुष्प की संरचना, परागण (Pollination) के प्रकार और द्विनिषेचन (Double Fertilization) की पूरी प्रक्रिया।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=b1VbUa_qH4M',
      duration: '28 mins',
      order: 1,
      isFreePreview: true,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },
    {
      id: 'les_bio_02',
      courseId: 'course_bio_12_shekhar',
      title: 'अध्याय 2: मानव जनन (Human Reproduction) - नर एवं मादा जनन तंत्र',
      description: 'शुक्राणुजनन एवं अंडाणुजनन (Spermatogenesis & Oogenesis) की विस्तृत व्याख्या NCERT डायग्राम के साथ।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=yqhX7VwW2pQ',
      duration: '35 mins',
      order: 2,
      isFreePreview: false,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },
    {
      id: 'les_bio_03',
      courseId: 'course_bio_12_shekhar',
      title: 'अध्याय 3: वंशागति तथा विविधता के सिद्धांत (Mendelian Genetics)',
      description: 'मेंडल के तीनों नियम, एकसंकर एवं द्विसंकर संकरण (Monohybrid & Dihybrid Cross) और लिंकेज।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=4dO1oT552W8',
      duration: '32 mins',
      order: 3,
      isFreePreview: false,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },

    // Lessons for course_sci_10_quiz_free
    {
      id: 'les_sci10_01',
      courseId: 'course_sci_10_quiz_free',
      title: 'पाठ 1: रासायनिक अभिक्रियाएं एवं समीकरण (Complete Concept & Test)',
      description: 'रासायनिक समीकरणों को संतुलित करना, संयोजन, वियोजन, विस्थापन एवं उपचयन-अपचयन अभिक्रियाएं।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=7DjsD7Hcd9U',
      duration: '25 mins',
      order: 1,
      isFreePreview: true,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },
    {
      id: 'les_sci10_02',
      courseId: 'course_sci_10_quiz_free',
      title: 'पाठ 6: जैव प्रक्रम (Life Processes) - पोषण, श्वसन एवं वहन',
      description: 'प्रकाश संश्लेषण, मानव पाचन तंत्र, हृदय की कार्यप्रणाली एवं वृक्क (Kidney) द्वारा उत्सर्जन।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=nxebQZUVvTg',
      duration: '30 mins',
      order: 2,
      isFreePreview: true,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },
    {
      id: 'les_sci10_03',
      courseId: 'course_sci_10_quiz_free',
      title: 'पाठ 10: प्रकाश - परावर्तन तथा अपवर्तन (Ray Diagrams & Numericals)',
      description: 'दर्पण सूत्र, लेंस सूत्र, आवर्धन और किरण आरेख बनाने के सबसे आसान नियम।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=OTgpN6n3v28',
      duration: '28 mins',
      order: 3,
      isFreePreview: true,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },

    // Lessons for course_phy_12_master
    {
      id: 'les_phy12_01',
      courseId: 'course_phy_12_master',
      title: 'अध्याय 1: स्थिर वैद्युतिकी (Electrostatics & Coulomb\'s Law)',
      description: 'आवेश के मूल गुण, कूलॉम का नियम, विद्युत क्षेत्र रेखाएं और गाउस की प्रमेय।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=d_k5sZ9c7_4',
      duration: '34 mins',
      order: 1,
      isFreePreview: true,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },
    {
      id: 'les_phy12_02',
      courseId: 'course_phy_12_master',
      title: 'अध्याय 2: संधारित्र तथा धारिता (Capacitance & Dielectrics)',
      description: 'समांतर पट्ट संधारित्र, ऊर्जा घनत्व और संधारित्रों का श्रेणी एवं समांतर संयोजन।',
      contentType: 'youtube',
      contentUrl: 'https://www.youtube.com/watch?v=7v2mE6H59v4',
      duration: '30 mins',
      order: 2,
      isFreePreview: false,
      isPublished: true,
      sourceType: 'youtube',
      createdAt: now,
    },
  ];

  for (const les of lessons) {
    await setDoc(doc(db, 'lessons', les.id), les);
  }

  // 5. Initial Batches
  const batches: Batch[] = [
    {
      id: 'batch_bseb_12_bio',
      name: 'सफलता बैच 2026: कक्षा 12 जीव विज्ञान (BSEB / NEET)',
      courseId: 'course_bio_12_shekhar',
      courseTitle: 'कक्षा 12 जीव विज्ञान (Class 12 Biology Full Course)',
      startDate: '2026-11-01',
      endDate: '2027-02-15',
      schedule: 'सोमवार, बुधवार, शुक्रवार • शाम 6:00 से 7:30 बजे IST',
      teacherName: 'Shekhar Sir',
      maxStudents: 150,
      enrolledCount: 94,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'batch_class10_mission95',
      name: 'मिशन 95%+ बैच: कक्षा 10 विज्ञान 16 चैप्टर टेस्ट सीरीज',
      courseId: 'course_sci_10_quiz_free',
      courseTitle: 'कक्षा 10 विज्ञान — 16 Chapter Test Series (Free Quiz Course)',
      startDate: '2026-11-05',
      endDate: '2027-02-28',
      schedule: 'दैनिक ऑनलाइन टेस्ट एवं डाउट समाधान • प्रतिदिन शाम 5:00 बजे',
      teacherName: 'Shekhar Sir',
      maxStudents: 300,
      enrolledCount: 218,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'batch_phy12_target',
      name: 'प्रयास बैच 2026: कक्षा 12 भौतिक विज्ञान स्पेशल',
      courseId: 'course_phy_12_master',
      courseTitle: 'कक्षा 12 भौतिक विज्ञान (Class 12 Physics Mastercourse)',
      startDate: '2026-11-10',
      endDate: '2027-03-10',
      schedule: 'मंगलवार, गुरुवार, शनिवार • शाम 7:00 से 8:30 बजे IST',
      teacherName: 'R. K. Verma Sir',
      maxStudents: 100,
      enrolledCount: 68,
      isPublished: true,
      createdAt: now,
    },
  ];

  for (const b of batches) {
    await setDoc(doc(db, 'batches', b.id), b);
  }

  // 6. Quizzes: Authentic Chapter Tests from aspireacademyonline.in
  const quizzes: Quiz[] = [
    {
      id: 'quiz_sci10_chap01',
      courseId: 'course_sci_10_quiz_free',
      lessonId: 'les_sci10_01',
      title: 'कक्षा 10 विज्ञान अध्याय 1: रासायनिक अभिक्रियाएं एवं समीकरण (Chapter 1 Test)',
      instructions: 'इस टेस्ट में 5 महत्वपूर्ण वस्तुनिष्ठ (MCQ) प्रश्न हैं। प्रत्येक प्रश्न 2 अंक का है। पासिंग मार्क्स: 50% (5 अंक).',
      passingPercentage: 50,
      timeLimitMinutes: 10,
      isPublished: true,
      createdAt: now,
      questions: [
        {
          id: 'q1',
          question: 'रासायनिक अभिक्रिया Fe + CuSO4 → FeSO4 + Cu किस प्रकार की अभिक्रिया है?',
          options: [
            'संयोजन अभिक्रिया (Combination)',
            'विस्थापन अभिक्रिया (Displacement)',
            'द्विविस्थापन अभिक्रिया (Double Displacement)',
            'वियोजन अभिक्रिया (Decomposition)',
          ],
          marks: 2,
          correctAnswerIndex: 1,
        },
        {
          id: 'q2',
          question: 'श्वसन किस प्रकार की रासायनिक अभिक्रिया है?',
          options: [
            'ऊष्माक्षेपी (Exothermic)',
            'ऊष्माशोषी (Endothermic)',
            'अपचयन (Reduction)',
            'संयोजन (Combination)',
          ],
          marks: 2,
          correctAnswerIndex: 0,
        },
        {
          id: 'q3',
          question: 'चिप्स की थैली में कौन सी गैस भरी जाती है ताकि विकृतगंधिता (Rancidity) न हो?',
          options: ['ऑक्सीजन (O2)', 'नाइट्रोजन (N2)', 'हाइड्रोजन (H2)', 'हीलियम (He)'],
          marks: 2,
          correctAnswerIndex: 1,
        },
        {
          id: 'q4',
          question: 'बुझे हुए चूने का रासायनिक सूत्र क्या है?',
          options: ['CaO', 'Ca(OH)2', 'CaCO3', 'CaCl2'],
          marks: 2,
          correctAnswerIndex: 1,
        },
        {
          id: 'q5',
          question: 'लोहे पर जंग लगना किस प्रकार की प्रक्रिया है?',
          options: ['संक्षारण एवं उपचयन', 'केवल अपचयन', 'उदासीनीकरण', 'अवक्षेपण'],
          marks: 2,
          correctAnswerIndex: 0,
        },
      ],
    },
    {
      id: 'quiz_sci10_chap06',
      courseId: 'course_sci_10_quiz_free',
      lessonId: 'les_sci10_02',
      title: 'कक्षा 10 विज्ञान अध्याय 6: जैव प्रक्रम (Life Processes - Test Series)',
      instructions: 'कक्षा 10वीं बोर्ड परीक्षा में बार-बार पूछे जाने वाले अति महत्वपूर्ण प्रश्न। पासिंग स्कोर: 50%.',
      passingPercentage: 50,
      timeLimitMinutes: 10,
      isPublished: true,
      createdAt: now,
      questions: [
        {
          id: 'q1',
          question: 'मानव हृदय में कितने कोष्ठक (Chambers) होते हैं?',
          options: ['2', '3', '4', '5'],
          marks: 2,
          correctAnswerIndex: 2,
        },
        {
          id: 'q2',
          question: 'पादप में जाइलम (Xylem) किसके परिवहन के लिए उत्तरदायी है?',
          options: ['जल (Water)', 'भोजन (Food)', 'अमीनो अम्ल', 'ऑक्सीजन'],
          marks: 2,
          correctAnswerIndex: 0,
        },
        {
          id: 'q3',
          question: 'मनुष्य में वृक्क (Kidney) एक तंत्र का भाग है, जो संबंधित है:',
          options: ['पोषण से', 'श्वसन से', 'उत्सर्जन से (Excretion)', 'परिवहन से'],
          marks: 2,
          correctAnswerIndex: 2,
        },
        {
          id: 'q4',
          question: 'प्रकाश संश्लेषण प्रक्रिया में ऑक्सीजन किससे मुक्त होती है?',
          options: ['जल (H2O) से', 'CO2 से', 'ग्लूकोज से', 'क्लोरोफिल से'],
          marks: 2,
          correctAnswerIndex: 0,
        },
      ],
    },
    {
      id: 'quiz_bio12_chap01',
      courseId: 'course_bio_12_shekhar',
      lessonId: 'les_bio_01',
      title: 'कक्षा 12 जीव विज्ञान: पुष्पी पादपों में लैंगिक जनन (Diagnostic Test)',
      instructions: 'By Shekhar Sir. बिहार बोर्ड एवं NEET के लिए महत्वपूर्ण प्रश्न।',
      passingPercentage: 50,
      timeLimitMinutes: 12,
      isPublished: true,
      createdAt: now,
      questions: [
        {
          id: 'q1',
          question: 'द्विनिषेचन (Double Fertilization) किस वर्ग के पौधों की मुख्य विशेषता है?',
          options: ['एंजियोस्पर्म (आवृतबीजी)', 'जिम्नोस्पर्म (अनावृतबीजी)', 'टेरिडोफाइटा', 'ब्रायोफाइटा'],
          marks: 2,
          correctAnswerIndex: 0,
        },
        {
          id: 'q2',
          question: 'परागकण (Pollen Grain) का बाह्यचोल (Exine) किस पदार्थ का बना होता है?',
          options: ['सेलूलोज़', 'स्पोरोपोलेनिन (Sporopollenin)', 'पेक्टिन', 'लिग्निन'],
          marks: 2,
          correctAnswerIndex: 1,
        },
        {
          id: 'q3',
          question: 'एक प्रारूपिक आवृतबीजी भ्रूणकोष (Embryo Sac) कितने केंद्रकीय एवं कितने कोशिकीय होता है?',
          options: ['7 केंद्रकीय, 8 कोशिकीय', '8 केंद्रकीय, 7 कोशिकीय', '8 केंद्रकीय, 8 कोशिकीय', '7 केंद्रकीय, 7 कोशिकीय'],
          marks: 2,
          correctAnswerIndex: 1,
        },
      ],
    },
  ];

  for (const q of quizzes) {
    await setDoc(doc(db, 'quizzes', q.id), q);
  }

  // 7. Site Settings - Reflecting Aspire Academy Online
  const siteSettings: SiteSettings = {
    academyName: 'Aspire Academy Online',
    tagline: 'बिहार बोर्ड (BSEB) एवं CBSE के लिए सर्वश्रेष्ठ ऑनलाइन शिक्षा संस्थान',
    contactEmail: 'deepka2772@gmail.com',
    contactPhone: '+91 91223 45678',
    address: 'Aspire Academy Campus, Main Road, Bihar, India',
    announcement: 'कक्षा 10वीं एवं 12वीं बोर्ड परीक्षा 2026 तथा NEET/JEE नए बैच में नामांकन प्रारंभ! Flat 40% Discount!',
    heroTitle: 'Aspire Academy Online - सपनों को दें नई उड़ान',
    heroSubtitle: 'Shekhar Sir एवं अनुभवी शिक्षकों द्वारा संचालित। कक्षा 9वीं से 12वीं बोर्ड, NEET एवं JEE की संपूर्ण तैयारी। 16 अध्यायवार टेस्ट सीरीज, वीडियो क्लासेज एवं फ्री नोट्स।',
    updatedAt: now,
  };

  await setDoc(doc(db, 'settings', 'site_settings'), siteSettings);
}
