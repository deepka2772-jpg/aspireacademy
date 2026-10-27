import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Award,
  CreditCard,
  User,
  LogOut,
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Enrollment, Order, Batch, Quiz, QuizAttempt, Course } from '../types';
import { getUserEnrollments } from '../services/enrollmentService';
import { getUserOrders } from '../services/orderService';
import { getBatches, getCourseById } from '../services/courseService';
import { getUserQuizAttempts, getQuizzesForCourse, submitQuizAttempt } from '../services/quizService';

interface StudentDashboardProps {
  initialTab?: 'overview' | 'my-courses' | 'batches' | 'quizzes' | 'orders' | 'profile';
  onOpenPlayer: (course: Course) => void;
  onExploreCourses: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  initialTab = 'overview',
  onOpenPlayer,
  onExploreCourses,
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz Modal state
  const [activeQuizCourse, setActiveQuizCourse] = useState<Course | null>(null);
  const [courseQuizzes, setCourseQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    Promise.all([
      getUserEnrollments(currentUser.uid),
      getUserOrders(currentUser.uid),
      getBatches(),
      getUserQuizAttempts(currentUser.uid),
    ])
      .then(([enrData, ordData, batchData, attemptData]) => {
        setEnrollments(enrData);
        setOrders(ordData);
        setBatches(batchData.filter((b) => b.isPublished));
        setQuizAttempts(attemptData);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleLaunchCourse = async (courseId: string) => {
    const course = await getCourseById(courseId);
    if (course) {
      onOpenPlayer(course);
    }
  };

  const handleOpenCourseQuizzes = async (courseId: string) => {
    const course = await getCourseById(courseId);
    if (!course) return;
    setActiveQuizCourse(course);
    const quizzes = await getQuizzesForCourse(courseId);
    setCourseQuizzes(quizzes);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz || !currentUser) return;
    setQuizSubmitting(true);
    try {
      const attempt = await submitQuizAttempt(selectedQuiz, currentUser.uid, quizAnswers);
      setQuizResult(attempt);
      // Refresh attempts
      const updated = await getUserQuizAttempts(currentUser.uid);
      setQuizAttempts(updated);
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setQuizSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to your Aspire Academy account to view your student portal.</p>
      </div>
    );
  }

  const completedCount = enrollments.filter((e) => (e.progress?.percentage || 0) >= 100).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-blue-500/20">
              {userProfile?.name?.charAt(0) || currentUser.email?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {userProfile?.name || 'Aspire Student'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                  {userProfile?.role || 'student'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">{currentUser.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Member since {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreCourses}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'my-courses', label: `My Courses (${enrollments.length})`, icon: BookOpen },
            { id: 'batches', label: 'Batches & Schedule', icon: Calendar },
            { id: 'quizzes', label: 'Quizzes & Tests', icon: FileQuestion },
            { id: 'orders', label: `Orders (${orders.length})`, icon: CreditCard },
            { id: 'profile', label: 'Profile Settings', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading student records from Firestore...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Enrolled Courses</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{enrollments.length}</p>
                    <p className="text-[11px] text-blue-600 mt-2 font-medium">Active lifetime access</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Completed Courses</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
                    <p className="text-[11px] text-emerald-600 mt-2 font-medium">100% syllabus cleared</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Assessments Taken</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{quizAttempts.length}</p>
                    <p className="text-[11px] text-purple-600 mt-2 font-medium">Diagnostic tests</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Completed Payments</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {orders.filter((o) => o.status === 'paid').length}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Verified receipts</p>
                  </div>
                </div>

                {/* Continue Learning section */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Continue Learning</h2>
                  {enrollments.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-3">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-base font-bold text-slate-800">No Enrolled Courses Yet</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Explore our course catalog to start learning with our structured modules and video lectures.
                      </p>
                      <button
                        onClick={onExploreCourses}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Explore Courses
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enrollments.map((enr) => {
                        const pct = enr.progress?.percentage || 0;
                        return (
                          <div
                            key={enr.id}
                            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                                <img
                                  src={enr.courseThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900/20"></div>
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{enr.courseTitle}</h3>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Enrolled: {new Date(enr.enrolledAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1.5">
                                <span>Progress</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                                <div
                                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>

                              <button
                                onClick={() => handleLaunchCourse(enr.courseId)}
                                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <PlayCircle className="w-4 h-4" />
                                <span>Continue Learning</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY COURSES TAB */}
            {activeTab === 'my-courses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Enrolled Courses</h2>
                  <button
                    onClick={onExploreCourses}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Enroll in More Courses
                  </button>
                </div>

                {enrollments.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">You are not enrolled in any course yet</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Choose from free starter primers or complete comprehensive mastercourses.
                    </p>
                    <button
                      onClick={onExploreCourses}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Browse Courses Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enr) => {
                      const pct = enr.progress?.percentage || 0;
                      return (
                        <div
                          key={enr.id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
                              <img
                                src={enr.courseThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{enr.courseTitle}</h3>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Enrolled {new Date(enr.enrolledAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-100">
                            <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
                              <span>Completion</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleLaunchCourse(enr.courseId)}
                                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                              >
                                <PlayCircle className="w-4 h-4" />
                                <span>Player</span>
                              </button>
                              <button
                                onClick={() => handleOpenCourseQuizzes(enr.courseId)}
                                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1"
                              >
                                <FileQuestion className="w-4 h-4" />
                                <span>Tests</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* BATCHES TAB */}
            {activeTab === 'batches' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Batches & Live Schedules</h2>
                  <p className="text-xs text-slate-500 mt-1">Interactive live masterclass batches, mentorship sessions, and doubt-clearing timings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {batches.map((batch) => (
                    <div key={batch.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                            Active Batch
                          </span>
                          <h3 className="font-bold text-slate-900 text-base mt-2">{batch.name}</h3>
                          <p className="text-xs text-blue-700 font-semibold mt-0.5">{batch.courseTitle}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Schedule</span>
                          <span className="font-semibold text-slate-700">{batch.schedule}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Mentor</span>
                          <span className="font-semibold text-slate-700">{batch.teacherName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Cohort Duration</span>
                          <span className="font-semibold text-slate-700">{batch.startDate} to {batch.endDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Cohort Size</span>
                          <span className="font-semibold text-slate-700">{batch.enrolledCount} / {batch.maxStudents} Students</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLaunchCourse(batch.courseId)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>View Associated Course</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUIZZES TAB */}
            {activeTab === 'quizzes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Quizzes & Assessments</h2>
                    <p className="text-xs text-slate-500 mt-1">Diagnostic practice tests to evaluate your conceptual clarity.</p>
                  </div>
                </div>

                {/* Prior attempts */}
                {quizAttempts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Your Test History</h3>
                    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
                      {quizAttempts.map((attempt) => (
                        <div key={attempt.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${attempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {attempt.passed ? 'PASSED' : 'NEEDS REVISION'}
                            </span>
                            <p className="font-bold text-xs sm:text-sm text-slate-900 mt-1">Assessment Result</p>
                            <p className="text-[11px] text-slate-400">
                              Completed: {new Date(attempt.completedAt).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">{attempt.percentage}%</span>
                            <p className="text-[11px] text-slate-500">Score: {attempt.score} / {attempt.totalMarks} Marks</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available course quizzes */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Take a Course Assessment</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrollments.map((enr) => (
                      <div key={enr.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">{enr.courseTitle}</h4>
                          <p className="text-xs text-slate-500 mt-1">Practice and benchmark your understanding.</p>
                        </div>
                        <button
                          onClick={() => handleOpenCourseQuizzes(enr.courseId)}
                          className="mt-4 w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <FileQuestion className="w-4 h-4" />
                          <span>View Quizzes</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quizzes list for selected course */}
                {activeQuizCourse && (
                  <div className="mt-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-base">
                        Assessments for {activeQuizCourse.title}
                      </h4>
                      <button
                        onClick={() => setActiveQuizCourse(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Close
                      </button>
                    </div>

                    {courseQuizzes.length === 0 ? (
                      <p className="text-xs text-slate-500">No active quizzes have been published for this course yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {courseQuizzes.map((quiz) => (
                          <div key={quiz.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-slate-900">{quiz.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{quiz.questions?.length || 0} Questions • Pass mark: {quiz.passingPercentage}% • Time limit: {quiz.timeLimitMinutes} mins</p>
                            </div>
                            <button
                              onClick={() => handleStartQuiz(quiz)}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            >
                              Start Test
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Orders & Payment History</h2>
                  <p className="text-xs text-slate-500 mt-1">Verified receipts recorded in Firestore.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">No Payment Orders Found</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      When you purchase courses through Razorpay, verified invoices will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
                    {orders.map((order) => (
                      <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                              {order.status}
                            </span>
                            <span className="text-xs font-mono text-slate-500">#{order.orderId}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{order.courseTitle}</h4>
                          <p className="text-[11px] text-slate-400">
                            Payment ID: {order.razorpayPaymentId || 'Direct / Free Access'} • {new Date(order.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">
                            ₹{order.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[11px] text-emerald-600 font-semibold">Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Account Profile</h2>
                  <p className="text-xs text-slate-500 mt-1">Your registered student identity at Aspire Academy Online.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userProfile?.name || ''}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email || ''}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Platform Role
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userProfile?.role || 'student'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm uppercase font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.uid}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-600"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    To modify roles or administrative privileges, contact support.
                  </p>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Interactive Quiz Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedQuiz.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedQuiz.instructions}</p>
              </div>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {quizResult ? (
              // Quiz Results
              <div className="text-center py-6 space-y-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    quizResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-slate-900">
                  {quizResult.passed ? 'Assessment Passed!' : 'Test Completed'}
                </h4>
                <p className="text-sm text-slate-600">
                  You scored <strong className="text-slate-900">{quizResult.score}</strong> out of {quizResult.totalMarks} marks ({quizResult.percentage}%).
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-600">
                  {quizResult.passed
                    ? 'Outstanding job! You have demonstrated conceptual mastery in this module.'
                    : 'We recommend revisiting the video lectures and lecture notes to review challenging topics.'}
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              // Question answering interface
              <div className="space-y-6">
                {selectedQuiz.questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-blue-700 uppercase mb-1">
                      Question {qIndex + 1} ({q.marks || 1} mark)
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-3 p-3 rounded-xl text-xs sm:text-sm cursor-pointer border transition-colors ${
                            quizAnswers[q.id] === optIndex
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${q.id}`}
                            checked={quizAnswers[q.id] === optIndex}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIndex })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmitQuiz}
                  disabled={quizSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {quizSubmitting ? 'Evaluating & Submitting...' : 'Submit Assessment'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
