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
} from 'lucide-react';
import { Course, Lesson, Enrollment } from '../types';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { updateLessonProgress } from '../services/enrollmentService';
import { getSignedPlaybackUrl } from '../services/storageService';

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
  const [r2SignedUrl, setR2SignedUrl] = useState<string | null>(null);
  const [loadingR2, setLoadingR2] = useState(false);
  const [r2Error, setR2Error] = useState<string | null>(null);

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
              // PDF / Document Content
              <div className="text-center p-8 max-w-lg space-y-4">
                <FileText className="w-16 h-16 text-blue-400 mx-auto" />
                <h3 className="text-base font-bold text-white">{activeLesson.title}</h3>
                <p className="text-xs text-slate-400">
                  This lesson is a learning document / PDF notes module. Click below to view or download.
                </p>
                <a
                  href={activeLesson.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Open Document Material
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
                    {activeLesson.isFreePreview && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                        Free Preview
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{activeLesson.title}</h2>
                </div>

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

        {/* Right: Lesson Curriculum Sidebar */}
        <div
          className={`w-full lg:w-80 xl:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 lg:static absolute inset-y-0 right-0 z-30 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Course Syllabus</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{lessons.length} Modules & Lectures</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {lessons.map((lesson, idx) => {
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
