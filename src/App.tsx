/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { LearningPlayer } from './components/LearningPlayer';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { ExploreCoursesPage } from './pages/ExploreCoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import {
  AboutPage,
  ContactPage,
  FAQPage,
  PrivacyPolicyPage,
  TermsPage,
  RefundPolicyPage,
} from './pages/PublicPages';
import { TestSeriesPage } from './pages/TestSeriesPage';
import { Course, Category, Faculty, SiteSettings, Enrollment, Order } from './types';
import {
  getPublishedCourses,
  getCategories,
  getFacultyList,
  getSiteSettings,
  getLessonsForCourse,
} from './services/courseService';
import { getUserEnrollments, checkIsEnrolled } from './services/enrollmentService';
import { isDatabaseEmpty, seedInitialPlatformData } from './services/seedService';
import { validateFirestoreConnection } from './firebase/config';
import { Shield, ShieldAlert, BookOpen, AlertCircle, ArrowLeft, Key, Zap } from 'lucide-react';

function MainApp() {
  const { currentUser, userProfile, isAdmin, loading: authLoading, quickAdminLogin } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Global Platform Data from Firestore
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Active Player Data
  const [playerLessons, setPlayerLessons] = useState<any[]>([]);
  const [playerEnrollment, setPlayerEnrollment] = useState<Enrollment | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalPortal, setAuthModalPortal] = useState<'student' | 'admin'>('student');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [courseToBuy, setCourseToBuy] = useState<Course | null>(null);

  // 1. Initial Load & Seed Check
  const loadPlatformData = async () => {
    setDataLoading(true);
    try {
      await validateFirestoreConnection();

      // Check if DB is empty; if so, seed sample courses
      const empty = await isDatabaseEmpty();
      if (empty) {
        console.log('Seeding initial Aspire Academy Online curriculum into Firestore...');
        await seedInitialPlatformData();
      }

      const [cList, catList, fList, setts] = await Promise.all([
        getPublishedCourses(),
        getCategories(),
        getFacultyList(),
        getSiteSettings(),
      ]);

      setCourses(cList);
      setCategories(catList);
      setFaculty(fList);
      setSettings(setts);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // 2. Fetch User Enrollments whenever currentUser changes
  const refreshUserEnrollments = async () => {
    if (!currentUser) {
      setUserEnrollments([]);
      return;
    }
    try {
      const list = await getUserEnrollments(currentUser.uid);
      setUserEnrollments(list);
    } catch (err) {
      console.error('Failed to fetch user enrollments:', err);
    }
  };

  useEffect(() => {
    refreshUserEnrollments();
  }, [currentUser]);

  // Handle opening Course Player
  const handleOpenPlayer = async (course: Course) => {
    try {
      const lessons = await getLessonsForCourse(course.id);
      setPlayerLessons(lessons);
      setSelectedCourse(course);

      let enr: Enrollment | null = null;
      if (currentUser) {
        const found = userEnrollments.find((e) => e.courseId === course.id);
        if (found) {
          enr = found;
        } else {
          const isEnr = await checkIsEnrolled(currentUser.uid, course.id);
          if (isEnr) {
            enr = {
              id: `${currentUser.uid}_${course.id}`,
              userId: currentUser.uid,
              courseId: course.id,
              courseTitle: course.title,
              courseThumbnail: course.thumbnail,
              enrolledAt: new Date().toISOString(),
              status: 'active',
            };
          }
        }
      }

      setPlayerEnrollment(enr);
      setCurrentTab('learning-player');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to launch learning player:', err);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentTab('course-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitiatePayment = (course: Course) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setCourseToBuy(course);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (enrollment: Enrollment, order: Order) => {
    setUserEnrollments((prev) => [...prev.filter((e) => e.courseId !== enrollment.courseId), enrollment]);
  };

  const enrolledCourseIds = userEnrollments.map((e) => e.courseId);

  // If in learning-player mode, render dedicated distraction-free player screen
  if (currentTab === 'learning-player' && selectedCourse) {
    return (
      <LearningPlayer
        course={selectedCourse}
        lessons={playerLessons}
        enrollment={playerEnrollment}
        userId={currentUser?.uid}
        onBackToCourse={() => setCurrentTab('course-details')}
        onRequestEnroll={(c) => handleInitiatePayment(c)}
        onRefreshEnrollment={refreshUserEnrollments}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={(mode = 'login', portal = 'student') => {
          setAuthModalMode(mode);
          setAuthModalPortal(portal);
          setAuthModalOpen(true);
        }}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 pb-20 lg:pb-0">
        {dataLoading && currentTab === 'home' ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-slate-700">Connecting to Cloud Firestore...</p>
            <p className="text-xs text-slate-400 mt-1">Aspire Academy Online</p>
          </div>
        ) : (
          <>
            {/* HOME PAGE */}
            {currentTab === 'home' && (
              <HomePage
                courses={courses}
                categories={categories}
                faculty={faculty}
                settings={settings}
                enrolledCourseIds={enrolledCourseIds}
                onSelectCourse={handleSelectCourse}
                onNavigate={(t) => {
                  setCurrentTab(t);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={(mode, portal) => {
                  setAuthModalMode(mode || 'register');
                  setAuthModalPortal(portal || 'student');
                  setAuthModalOpen(true);
                }}
              />
            )}

            {/* EXPLORE COURSES */}
            {currentTab === 'courses' && (
              <ExploreCoursesPage
                courses={courses}
                categories={categories}
                enrolledCourseIds={enrolledCourseIds}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {/* COURSE DETAILS */}
            {currentTab === 'course-details' && selectedCourse && (
              <CourseDetailsPage
                course={selectedCourse}
                onOpenPlayer={handleOpenPlayer}
                onInitiatePayment={handleInitiatePayment}
                onOpenAuth={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                onRefreshUserData={refreshUserEnrollments}
              />
            )}

            {/* CATEGORIES PAGE */}
            {currentTab === 'categories' && (
              <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Course Categories
                  </span>
                  <h1 className="text-3xl font-black text-slate-900">Explore by Subject Track</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setCurrentTab('courses')}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 cursor-pointer transition-all"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-4">{cat.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FACULTY PAGE */}
            {currentTab === 'faculty' && (
              <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Academic Mentors
                  </span>
                  <h1 className="text-3xl font-black text-slate-900">Aspire Academy Faculty</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {faculty.map((f) => (
                    <div
                      key={f.id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center space-y-4"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-500/20">
                        <img src={f.photoURL} alt={f.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{f.name}</h3>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5">{f.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{f.qualification}</p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{f.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BATCHES PAGE */}
            {currentTab === 'batches' && (
              <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Live Schedules
                  </span>
                  <h1 className="text-3xl font-black text-slate-900">Active Batches & Cohorts</h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Live mentorship sessions, scheduled doubt solving, and structured peer groups.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.slice(0, 2).map((c, i) => (
                    <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                          Cohort {i + 1}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">Enrolling Now</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                        <div>
                          <span className="text-slate-400 block">Mentor</span>
                          <span className="font-semibold text-slate-700">{c.facultyName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Schedule</span>
                          <span className="font-semibold text-slate-700">Mon, Wed, Fri 6PM IST</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectCourse(c)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                      >
                        View Course Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABOUT US */}
            {currentTab === 'about' && <AboutPage />}

            {/* 16 CHAPTER SCIENCE TEST SERIES */}
            {currentTab === 'tests' && (
              <TestSeriesPage
                onOpenAuth={(mode, portal) => {
                  setAuthModalMode(mode || 'login');
                  setAuthModalPortal(portal || 'student');
                  setAuthModalOpen(true);
                }}
              />
            )}

            {/* CONTACT US */}
            {currentTab === 'contact' && <ContactPage />}

            {/* FAQ */}
            {currentTab === 'faq' && <FAQPage />}

            {/* POLICIES */}
            {currentTab === 'privacy' && <PrivacyPolicyPage />}
            {currentTab === 'terms' && <TermsPage />}
            {currentTab === 'refund' && <RefundPolicyPage />}

            {/* STUDENT DASHBOARD */}
            {(currentTab === 'dashboard' || currentTab === 'my-courses' || currentTab === 'orders') && (
              <StudentDashboard
                initialTab={
                  currentTab === 'my-courses'
                    ? 'my-courses'
                    : currentTab === 'orders'
                    ? 'orders'
                    : 'overview'
                }
                onOpenPlayer={handleOpenPlayer}
                onExploreCourses={() => {
                  setCurrentTab('courses');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* ADMINISTRATOR DASHBOARD & GATEWAY */}
            {currentTab === 'admin' && (
              isAdmin ? (
                <AdminDashboard onPreviewCourse={handleSelectCourse} />
              ) : (
                <div className="max-w-lg mx-auto my-16 px-4">
                  <div className="bg-white rounded-3xl border border-amber-200 shadow-xl p-8 text-center space-y-5">
                    <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md shadow-amber-500/10">
                      <Shield className="w-8 h-8" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Admin Control Gateway
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-2">
                        Administrator Access
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Sign in with the authorized platform administrator account to manage courses, video sources (Cloudflare R2 & YouTube), batches & students.
                      </p>
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        onClick={async () => {
                          try {
                            await quickAdminLogin();
                            setCurrentTab('admin');
                          } catch (err) {
                            console.error('Quick admin login error:', err);
                            setAuthModalMode('login');
                            setAuthModalPortal('admin');
                            setAuthModalOpen(true);
                          }
                        }}
                        className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        <span>1-Click Admin Access (deepka2772@gmail.com)</span>
                      </button>

                      <button
                        onClick={() => {
                          setAuthModalMode('login');
                          setAuthModalPortal('admin');
                          setAuthModalOpen(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                      >
                        Sign In With Custom Credentials
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setCurrentTab('home')}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        ← Return to Public Website
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={(mode, portal) => {
          setAuthModalMode(mode === 'register' ? 'register' : 'login');
          setAuthModalPortal(portal || 'student');
          setAuthModalOpen(true);
        }}
      />

      {/* Global Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        initialPortal={authModalPortal}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(portal) => {
          refreshUserEnrollments();
          if (portal === 'admin' || isAdmin) {
            setCurrentTab('admin');
          } else {
            setCurrentTab('dashboard');
          }
        }}
      />

      {/* Razorpay Payment Modal */}
      {courseToBuy && (
        <PaymentModal
          course={courseToBuy}
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setCourseToBuy(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
