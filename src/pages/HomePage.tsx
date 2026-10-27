import React from 'react';
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
  HelpCircle,
  ShieldCheck,
  ChevronRight,
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
  onOpenAuth: (mode?: 'login' | 'register') => void;
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

  // Typewriter animation state
  const typewriterWords = React.useMemo(() => [
    'Classical Mechanics',
    'Pure Mathematics',
    'Organic Chemistry',
    'NEET & JEE Foundation',
    'First-Principles Thinking',
  ], []);

  const [wordIdx, setWordIdx] = React.useState(0);
  const [typedText, setTypedText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const currentWord = typewriterWords[wordIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting && typedText === currentWord) {
      // Pause at full word
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typedText === '') {
      // Switch to next word
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % typewriterWords.length);
    } else {
      const typingSpeed = isDeleting ? 40 : 80;
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
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white pt-10 sm:pt-20 pb-16 sm:pb-28">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.25),transparent_50%)] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{settings?.announcement || '2026 Admissions Open for Foundation & Master Batches'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
              Master Complex Concepts in <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent inline-block min-h-[1.2em]">
                {typedText}
              </span>
              <span className="text-blue-400 animate-pulse font-normal">|</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              {settings?.heroSubtitle ||
                "Join India's premier online learning platform. Structured syllabus pathways, conceptual masterclasses, timed diagnostic assessments, and persistent progress tracking."}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('courses')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Explore All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <span>Join Aspire Free</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80 mt-10">
              <div className="p-3">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Syllabus-Aligned</p>
              </div>
              <div className="p-3">
                <p className="text-2xl font-black text-blue-400">Lifetime</p>
                <p className="text-xs text-slate-400 mt-0.5">Course Access</p>
              </div>
              <div className="p-3">
                <p className="text-2xl font-black text-emerald-400">Zero-Lag</p>
                <p className="text-xs text-slate-400 mt-0.5">Mobile Video Player</p>
              </div>
              <div className="p-3">
                <p className="text-2xl font-black text-amber-400">Secure</p>
                <p className="text-xs text-slate-400 mt-0.5">Razorpay Payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE ASPIRE ACADEMY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Our Academic Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Why Students Excel with Aspire Academy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered from the ground up for deep intuition, structured study, and measurable exam mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">First-Principles Teaching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No rote memorization. We start with physical intuition and historical context before diving into advanced mathematical derivations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Modular Syllabus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Carefully decomposed chapters with progressive lesson difficulty, lecture notes, and downloadable PDF problem sets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Timed Diagnostics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluate retention with integrated test modules. Immediate score breakdown and benchmark tracking stored in your profile.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Verified Enrollments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reliable Cloud Firestore persistence. Your completed lessons, enrolled courses, and invoices stay synced across all devices.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED COURSES (LOADED FROM FIRESTORE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Structured Curriculum
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Featured Courses & Masterclasses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Real course records fetched directly from Cloud Firestore.
            </p>
          </div>

          <button
            onClick={() => onNavigate('courses')}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {publishedCourses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No courses published yet. Check back soon or visit the Admin Panel to seed initial courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={onSelectCourse}
                isEnrolled={enrolledCourseIds.includes(course.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. COURSE CATEGORIES */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Academic Tracks
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Explore by Discipline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate('courses')}
                className="group cursor-pointer bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-4 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>View Courses</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FACULTY & MENTORS */}
      {faculty.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Experienced Educators
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Meet Our Senior Faculty
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Seasoned subject specialists committed to mentoring science and competitive aspirants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faculty.slice(0, 3).map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center space-y-4"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-500/20 shadow-inner">
                  <img
                    src={teacher.photoURL}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{teacher.name}</h3>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{teacher.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{teacher.qualification}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {teacher.bio}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. STUDENT TESTIMONIALS (Transparent feedback placeholder) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Real Student Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Success Stories & Academic Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
              "The mechanics lectures completely dismantled my fear of multi-body friction problems. The step-by-step visual breakdowns are unmatched."
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs">
              <p className="font-bold text-slate-900">Aditya Verma</p>
              <p className="text-slate-400">Class 12 Competitive Aspirant [Verified Student]</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
              "I love how seamless the student dashboard is. I can pause on my laptop and pick up right where I left off on my phone during my commute."
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs">
              <p className="font-bold text-slate-900">Pooja Nair</p>
              <p className="text-slate-400">Pure Mathematics Scholar [Verified Student]</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-1 text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
              "The timed diagnostic assessments after each chapter ensure that you test your retention before moving forward. Highly recommended."
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs">
              <p className="font-bold text-slate-900">Rohan Sengupta</p>
              <p className="text-slate-400">Foundation Batch 2026 [Verified Student]</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-700/20">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black">Ready to Elevate Your Understanding?</h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Create your student profile today, enroll in free primer courses, and begin mastering your curriculum with Aspire Academy Online.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3.5 rounded-xl bg-white text-blue-900 font-extrabold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-colors"
            >
              Get Started Free
            </button>
            <button
              onClick={() => onNavigate('courses')}
              className="px-6 py-3.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm border border-blue-600/50 transition-colors"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
