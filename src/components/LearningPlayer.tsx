import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  PlayCircle,
  FileText,
  Download,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  BookOpen,
  FileQuestion,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Radio,
} from 'lucide-react';
import { Course, Lesson, Enrollment, Quiz } from '../types';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { updateLessonProgress } from '../services/enrollmentService';
import { getSignedPlaybackUrl } from '../services/storageService';
import { getQuizzesForCourse, submitQuizAttempt } from '../services/quizService';

interface LearningPlayerProps {
  course: Course;
  lessons: Lesson[];
  enrollment?: Enrollment | null;
  userId?: string;
  onBackToCourse: () => void;
  onRequestEnroll: (course: Course) => void;
  onRefreshEnrollment?: () => void;
}

export const LearningPlayer: React.FC<LearningPlayerProps> = ({
  course,
  lessons,
  enrollment,
  userId,
  onBackToCourse,
  onRequestEnroll,
  onRefreshEnrollment,
}) => {
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'lessons' | 'quizzes'>('lessons');
  const [r2SignedUrl, setR2SignedUrl] = useState<string | null>(null);
  const [loadingR2, setLoadingR2] = useState(false);
  const [r2Error, setR2Error] = useState<string | null>(null);

  // Quizzes for this course
  const [courseQuizzes, setCourseQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  // Load quizzes for this course
  useEffect(() => {
    setLoadingQuizzes(true);
    getQuizzesForCourse(course.id)
      .then((data) => setCourseQuizzes(data))
      .catch((err) => console.warn('Could not load course quizzes:', err))
      .finally(() => setLoadingQuizzes(false));
  }, [course.id]);

  // Quiz Timer Countdown
  useEffect(() => {
    if (!activeQuiz || testSubmitted) return;
    if (quizTimeLeft <= 0) {
      handleFinalQuizSubmit();
      return;
    }
    const interval = setInterval(() => {
      setQuizTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, quizTimeLeft, testSubmitted]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIdx(0);
    setSelectedAnswers({});
    setQuizTimeLeft((quiz.timeLimitMinutes || 10) * 60);
    setTestSubmitted(false);
    setTestResult(null);
  };

  const handleSelectQuizOption = (qId: string, optIdx: number) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleFinalQuizSubmit = async () => {
    if (!activeQuiz || testSubmitted) return;
    setTestSubmitted(true);
    let score = 0;
    let totalMarks = 0;
    activeQuiz.questions.forEach((q) => {
      const marks = q.marks || 2;
      totalMarks += marks;
      if (q.correctAnswerIndex !== undefined && selectedAnswers[q.id] === q.correctAnswerIndex) {
        score += marks;
      }
    });
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= (activeQuiz.passingPercentage || 50);
    setTestResult({ score, totalMarks, percentage, passed });

    if (userId) {
      try {
        await submitQuizAttempt(activeQuiz, userId, selectedAnswers);
      } catch (err) {
        console.error('Failed to save quiz attempt:', err);
      }
    }
  };

  const activeLesson = lessons[activeLessonIndex] || null;
  const isEnrolled = Boolean(enrollment && enrollment.status === 'active');

  const completedLessonIds = enrollment?.progress?.completedLessonIds || [];
  const isCurrentLessonCompleted = activeLesson ? completedLessonIds.includes(activeLesson.id) : false;

  // Determine if student has access to the current active lesson
  const hasAccess = Boolean(isEnrolled || (activeLesson && activeLesson.isFreePreview));

  // Handle R2 video playback tokens
  useEffect(() => {
    if (activeLesson && activeLesson.contentType === 'r2_video' && hasAccess) {
      setLoadingR2(true);
      setR2Error(null);
      setR2SignedUrl(null);

      getSignedPlaybackUrl(activeLesson.contentUrl)
        .then((url) => setR2SignedUrl(url))
        .catch((err) => {
          setR2Error(err.message || 'Could not fetch secure playback link for Cloudflare R2 object.');
        })
        .finally(() => setLoadingR2(false));
    } else {
      setR2SignedUrl(null);
      setR2Error(null);
    }
  }, [activeLesson?.id, hasAccess]);

  const handleToggleComplete = async () => {
    if (!activeLesson || !userId || !isEnrolled) return;
    try {
      await updateLessonProgress(
        userId,
        course.id,
        activeLesson.id,
        lessons.length,
        !isCurrentLessonCompleted
      );
      if (onRefreshEnrollment) onRefreshEnrollment();
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    }
  };

  const handlePreviousLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  const progressPercentage = enrollment?.progress?.percentage || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Player Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCourse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Course Details</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white max-w-[200px] sm:max-w-md md:max-w-xl truncate">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {activeLesson ? `Lesson ${activeLessonIndex + 1} of ${lessons.length}: ${activeLesson.title}` : 'No lessons available'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          {isEnrolled && (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">{progressPercentage}% Completed</span>
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Sidebar toggle for mobile / desktop */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Learning Body */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left: Video & Content Area */}
        <div className="flex-1 flex flex-col bg-black/40 overflow-y-auto">
          {/* Media Player Container */}
          <div className="w-full bg-black aspect-video max-h-[68vh] flex items-center justify-center relative">
            {!activeLesson ? (
              <div className="text-center p-8 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No lessons have been added to this course yet.</p>
              </div>
            ) : !hasAccess ? (
              // Access Denied Screen
              <div className="text-center p-8 max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Protected Course Lesson</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  This lesson is part of the full curriculum. Enroll in this course to access all video lectures, downloadable notes, worksheets, and practice assessments.
                </p>
                <button
                  onClick={() => onRequestEnroll(course)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {course.isFree ? 'Enroll Free to Access' : `Enroll for ₹${course.price.toLocaleString('en-IN')}`}
                </button>
              </div>
            ) : activeLesson.contentType === 'youtube' || activeLesson.contentType === 'youtube_live' ? (
              // YouTube Embed
              (() => {
                const embedUrl = getYouTubeEmbedUrl(activeLesson.contentUrl);
                if (!embedUrl) {
                  return (
                    <div className="text-center p-6 text-slate-400">
                      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-300">Invalid YouTube URL</p>
                      <p className="text-xs text-slate-500 mt-1">
                        The video URL configured for this lesson could not be validated.
                      </p>
                    </div>
                  );
                }
                return (
                  <iframe
                    src={embedUrl}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                );
              })()
            ) : activeLesson.contentType === 'r2_video' ? (
              // Cloudflare R2 Video Player
              loadingR2 ? (
                <div className="text-center p-6 text-slate-400">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs">Generating secure Cloudflare R2 playback token...</p>
                </div>
              ) : r2Error ? (
                <div className="text-center p-6 text-slate-400 max-w-md">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">Cloudflare R2 Unavailable</p>
                  <p className="text-xs text-slate-500 mt-1">{r2Error}</p>
                </div>
              ) : r2SignedUrl ? (
                <video
                  src={r2SignedUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <p className="text-xs">R2 video object ready.</p>
                </div>
              )
            ) : (
              // PDF / Document Content with Inline Viewer
              <div className="w-full h-full flex flex-col bg-slate-900 min-h-[360px]">
                <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 border-b border-slate-700">
                  <span className="font-semibold flex items-center gap-2 text-white">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>{activeLesson.title} (Study Notes / PDF)</span>
                  </span>
                  <a
                    href={activeLesson.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open / Download PDF</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                </div>
                {activeLesson.contentUrl ? (
                  <iframe
                    src={activeLesson.contentUrl}
                    title={activeLesson.title}
                    className="w-full flex-1 border-0 bg-slate-950 min-h-[420px]"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                    <FileText className="w-12 h-12 mb-3 text-slate-500" />
                    <p className="text-xs">No PDF link provided for this module yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lesson Details & Actions Bar */}
          {activeLesson && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold mb-1">
                    <span>Lesson {activeLessonIndex + 1}</span>
                    <span>•</span>
                    <span>{activeLesson.duration || 'Self-paced'}</span>
                    {activeLesson.contentType === 'youtube_live' && (
                      <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                        LIVE SESSION
                      </span>
                    )}
                    {activeLesson.isFreePreview && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                        Free Preview
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{activeLesson.title}</h2>
                </div>

                <div className="flex items-center gap-3">
                  {courseQuizzes.length > 0 && (
                    <button
                      onClick={() => {
                        setSidebarTab('quizzes');
                        setSidebarOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all"
                    >
                      <FileQuestion className="w-3.5 h-3.5" />
                      <span>{courseQuizzes.length} Quizzes Available</span>
                    </button>
                  )}

                  {isEnrolled && (
                    <button
                      onClick={handleToggleComplete}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrentLessonCompleted
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isCurrentLessonCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-400" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Lesson Description */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                <p className="whitespace-pre-line">{activeLesson.description || 'No additional notes provided for this lesson.'}</p>
              </div>

              {/* Navigation buttons: Prev / Next */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handlePreviousLesson}
                  disabled={activeLessonIndex === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Lesson</span>
                </button>

                <button
                  onClick={handleNextLesson}
                  disabled={activeLessonIndex === lessons.length - 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Lesson Curriculum & Quizzes Sidebar */}
        <div
          className={`w-full lg:w-80 xl:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 lg:static absolute inset-y-0 right-0 z-30 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{course.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{lessons.length} Modules &bull; {courseQuizzes.length} Quizzes</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Tab Switcher */}
          <div className="flex border-b border-slate-800 bg-slate-950/40">
            <button
              onClick={() => setSidebarTab('lessons')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                sidebarTab === 'lessons'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lectures ({lessons.length})</span>
            </button>
            <button
              onClick={() => setSidebarTab('quizzes')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                sidebarTab === 'quizzes'
                  ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Quizzes ({courseQuizzes.length})</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {sidebarTab === 'lessons' ? (
              lessons.map((lesson, idx) => {
                const isSelected = idx === activeLessonIndex;
                const isCompleted = completedLessonIds.includes(lesson.id);
                const canAccess = isEnrolled || lesson.isFreePreview;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-950/70 border-l-4 border-blue-500'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Status icon */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : canAccess ? (
                        <PlayCircle className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">Lesson {idx + 1}</span>
                        {lesson.isFreePreview && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1 rounded">
                            Preview
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium truncate mt-0.5 ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                        {lesson.title}
                      </p>
                      <span className="text-[11px] text-slate-500">{lesson.duration || 'Self-paced'}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              /* Quizzes Tab */
              <div className="p-3 space-y-3">
                {courseQuizzes.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <FileQuestion className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-xs">No chapter tests uploaded for this course yet.</p>
                  </div>
                ) : (
                  courseQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Assessment
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{quiz.timeLimitMinutes || 10} Mins</span>
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{quiz.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{quiz.instructions}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">
                          {quiz.questions?.length || 0} Questions
                        </span>
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                        >
                          <PlayCircle className="w-3 h-3" />
                          <span>Attempt Quiz</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUIZ TAKING MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Chapter Assessment
                </span>
                <h3 className="text-lg font-bold text-white">{activeQuiz.title}</h3>
              </div>
              {!testSubmitted && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(quizTimeLeft / 60)
                      .toString()
                      .padStart(2, '0')}
                    :{(quizTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Results or Active Question */}
            {testSubmitted && testResult ? (
              <div className="text-center space-y-5 py-4">
                <div
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg ${
                    testResult.passed
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/40'
                  }`}
                >
                  {testResult.passed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white">
                    {testResult.passed ? 'उत्कृष्ट प्रदर्शन! (Passed)' : 'अभ्यास जारी रखें! (Keep Practicing)'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your Score: {testResult.score}/{testResult.totalMarks} ({testResult.percentage}%)
                  </p>
                </div>

                {/* Scorecard */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Points</span>
                    <span className="font-bold text-white text-base">
                      {testResult.score}/{testResult.totalMarks}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Percentage</span>
                    <span className="font-bold text-amber-400 text-base">{testResult.percentage}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span
                      className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${
                        testResult.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {testResult.passed ? 'Passed' : 'Need Work'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-3">
                  <button
                    onClick={() => handleStartQuiz(activeQuiz)}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Active Question */
              <div className="space-y-5">
                {activeQuiz.questions.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Question {currentQIdx + 1} of {activeQuiz.questions.length}
                      </span>
                      <span>Marks: {activeQuiz.questions[currentQIdx].marks || 2}</span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-relaxed">
                      {activeQuiz.questions[currentQIdx].question}
                    </h4>

                    <div className="space-y-2.5">
                      {activeQuiz.questions[currentQIdx].options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[activeQuiz.questions[currentQIdx].id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectQuizOption(activeQuiz.questions[currentQIdx].id, optIdx)}
                            className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        disabled={currentQIdx === 0}
                        onClick={() => setCurrentQIdx((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 disabled:opacity-40"
                      >
                        Previous
                      </button>

                      {currentQIdx < activeQuiz.questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQIdx((prev) => prev + 1)}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFinalQuizSubmit}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
                        >
                          Submit Test
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
