import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Award,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Shield,
  FileQuestion,
  Clock,
  Phone,
  Video,
  Download,
  HelpCircle,
  Star,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Course, Category, Faculty, SiteSettings } from '../types';
import { CourseCard } from '../components/CourseCard';

interface HomePageProps {
  courses: Course[];
  categories: Category[];
  faculty: Faculty[];
  settings: SiteSettings | null;
  enrolledCourseIds: string[];
  onSelectCourse: (course: Course) => void;
  onNavigate: (tab: string, param?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', portal?: 'student' | 'admin') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  categories,
  faculty,
  settings,
  enrolledCourseIds,
  onSelectCourse,
  onNavigate,
  onOpenAuth,
}) => {
  const publishedCourses = courses.filter((c) => c.isPublished);

  // Typewriter animation state representing authentic Aspire Academy subjects
  const typewriterWords = useMemo(
    () => [
      'कक्षा 12 जीव विज्ञान By Shekhar Sir',
      'Class 10 Science 16 Chapter Tests',
      'कक्षा 12 भौतिकी एवं रसायन विज्ञान',
      'Bihar Board (BSEB) & CBSE Special',
      'NEET-UG & IIT-JEE Foundation',
    ],
    []
  );

  const [wordIdx, setWordIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typewriterWords[wordIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting && typedText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && typedText === '') {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % typewriterWords.length);
    } else {
      const typingSpeed = isDeleting ? 35 : 70;
      timer = setTimeout(() => {
        setTypedText(
          isDeleting
            ? currentWord.substring(0, typedText.length - 1)
            : currentWord.substring(0, typedText.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, wordIdx, typewriterWords]);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white pt-10 sm:pt-16 pb-16 sm:pb-24">
        {/* Decorative backdrop light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.22),transparent_50%)] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Live Admission Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{settings?.announcement || 'कक्षा 10वीं, 12वीं एवं NEET 2026 नए बैच में नामांकन प्रारंभ!'}</span>
            </div>

            {/* Main Headline with Stabilized Typewriter */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight flex flex-col items-center">
              <span className="text-white block">सपनों को दें नई उड़ान with</span>
              <span className="h-20 sm:h-24 lg:h-28 flex items-center justify-center text-center px-2 max-w-full">
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent inline-block">
                  {typedText || '\u00A0'}
                </span>
                <span className="text-blue-400 animate-pulse font-light ml-1 select-none" aria-hidden="true">|</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              {settings?.heroSubtitle ||
                'बिहार बोर्ड (BSEB) एवं CBSE के छात्रों के लिए भारत का विश्वसनीय ऑनलाइन संस्थान। शेखर सर एवं अनुभवी शिक्षकों द्वारा सरल भाषा में संपूर्ण तैयारी।'}
            </p>

            {/* Proof Points */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">4.9/5 Rating</span>
                <span className="text-slate-400 hidden sm:inline">(5,000+ Reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white">50,000+ Enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">96.8% Board Score</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('courses')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <span>Browse All Courses (कोर्स देखें)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('tests')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <FileQuestion className="w-4 h-4 text-amber-400" />
                <span>16 Chapter Science Tests (Free)</span>
              </button>

              <button
                onClick={() => onOpenAuth('login', 'admin')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-sm border border-amber-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Gateway</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR ACADEMIC TRACKS FROM ASPIRE ACADEMY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <span>Target Curriculums</span>
              <span aria-hidden="true">·</span>
              <span>Bihar Board & CBSE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Academy Offerings (प्रमुख पाठ्यक्रम)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800"
          >
            <span>View All Courses</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Class 12 Biology by Shekhar Sir */}
          <div
            onClick={() => {
              const bioCourse = courses.find((c) => c.id.includes('bio'));
              if (bioCourse) onSelectCourse(bioCourse);
              else onNavigate('courses');
            }}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                <span>By Shekhar Sir</span>
                <span>·</span>
                <span>BSEB & NEET</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                कक्षा 12 जीव विज्ञान (Class 12 Biology)
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                संपूर्ण NCERT लाइन-बाय-लाइन, डायग्राम्स, हस्तलिखित नोट्स और 10 वर्षों के PYQs।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-slate-900">₹399</span>
                <span className="text-xs text-slate-400 line-through ml-1.5">₹999</span>
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                Explore <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Class 10 Science 16 Chapter Tests */}
          <div
            onClick={() => onNavigate('tests')}
            className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between group bg-gradient-to-b from-amber-50/50 to-white"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-amber-800 font-bold mb-1">
                <span>100% Free Practice</span>
                <span>·</span>
                <span>16 Chapters</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-amber-700 transition-colors">
                कक्षा 10 विज्ञान 16 Chapter Tests
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                बिहार बोर्ड एवं CBSE 10वीं के सभी 16 अध्यायों के वस्तुनिष्ठ (MCQ) ऑनलाइन टेस्ट सीरीज।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                FREE ACCESS
              </span>
              <span className="text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform inline-flex items-center">
                Start Test <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Class 12 Physics Mastercourse */}
          <div
            onClick={() => {
              const phyCourse = courses.find((c) => c.id.includes('phy'));
              if (phyCourse) onSelectCourse(phyCourse);
              else onNavigate('courses');
            }}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                <span>By R.K. Verma Sir</span>
                <span>·</span>
                <span>Class 12</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                कक्षा 12 भौतिक विज्ञान (Physics)
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                संख्यात्मक प्रश्न (Numericals), सभी डेरिवेशंस और फॉर्मूला शीट के साथ संपूर्ण पाठ्यक्रम।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-slate-900">₹999</span>
                <span className="text-xs text-slate-400 line-through ml-1.5">₹2,499</span>
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                Explore <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Card 4: Class 12 Chemistry */}
          <div
            onClick={() => {
              const chemCourse = courses.find((c) => c.id.includes('chem'));
              if (chemCourse) onSelectCourse(chemCourse);
              else onNavigate('courses');
            }}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                <span>By Dr. Priya Kumari</span>
                <span>·</span>
                <span>Class 12</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                कक्षा 12 रसायन विज्ञान (Chemistry)
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                Physical, Organic & Inorganic reactions, नामकरण, क्रियाविधि और अध्यायवार टेस्ट।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-slate-900">₹999</span>
                <span className="text-xs text-slate-400 line-through ml-1.5">₹2,499</span>
              </div>
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                Explore <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ALL COURSES CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Structured Syllabus
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            All Available Courses (संपूर्ण पाठ्यक्रम)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Cloudflare R2 HD private streaming, high-yield notes, and chapter tests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              isEnrolled={enrolledCourseIds.includes(c.id)}
              onSelect={onSelectCourse}
            />
          ))}
        </div>
      </section>

      {/* 4. MEET FOUNDER & SENIOR FACULTY */}
      <section className="bg-slate-100 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Leadership & Mentorship
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Meet Shekhar Sir & Aspire Mentors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              10+ वर्षों का शिक्षण अनुभव और हज़ारों विद्यार्थियों के बोर्ड परीक्षा में 90%+ लाने का गौरवशाली रिकॉर्ड।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculty.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col items-center text-center space-y-4 hover:border-blue-500 transition-colors"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-3 border-blue-600/30 shadow-md">
                  <img src={f.photoURL} alt={f.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{f.name}</h3>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">{f.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.qualification}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{f.bio}</p>
                <div className="pt-2 w-full border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Subject: {f.subject}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE ASPIRE ACADEMY ONLINE (4 PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Why Aspire Academy
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Aspire Academy Online की प्रमुख विशेषताएं
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            हर विद्यार्थी को गुणवत्तापूर्ण एवं सस्ती शिक्षा प्रदान करने के लिए विशेष रूप से तैयार।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Dual Video Streaming</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cloudflare R2 प्राइवेट HD वीडियो लेक्चर्स बिना किसी बफरिंग के और यूट्यूब लाइव सेशंस।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">16 Chapter Test Series</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              कक्षा 10वीं एवं 12वीं के प्रत्येक अध्याय के वस्तुनिष्ठ (MCQ) टेस्ट, समय सीमा और तुरंत रिपोर्ट।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Handwritten Notes & PYQs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              शेखर सर एवं शिक्षकों द्वारा हस्तलिखित अध्यायवार नोट्स और 10 वर्षों के बोर्ड प्रश्न पत्र।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Personal Doubt Mentorship</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              व्हाट्सएप और लाइव क्लास में सीधे शिक्षकों से अपने सवालों के जवाब पाने की सुविधा।
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 rounded-3xl text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Admission Helpline: +91 91223 45678
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              आज ही Aspire Academy Online से जुड़ें और 95%+ का लक्ष्य प्राप्त करें!
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              कक्षा 10वीं व 12वीं बोर्ड परीक्षा तथा NEET फाउंडेशन के लिए विशेष नए बैच में सीमित सीटें उपलब्ध हैं।
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onOpenAuth('register', 'student')}
                className="px-6 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-xs sm:text-sm shadow-lg hover:bg-blue-50 transition-all"
              >
                Enroll as Student (नामांकन करें)
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 rounded-xl bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 font-bold text-xs sm:text-sm transition-all"
              >
                Contact Academic Counselor
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
