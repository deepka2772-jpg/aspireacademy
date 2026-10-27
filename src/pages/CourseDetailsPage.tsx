import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  UserCheck,
  CheckCircle2,
  Lock,
  PlayCircle,
  FileText,
  Share2,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Course, Lesson, LearningMaterial, Enrollment } from '../types';
import { getLessonsForCourse, getMaterialsForCourse } from '../services/courseService';
import { checkIsEnrolled, enrollInFreeCourse } from '../services/enrollmentService';
import { useAuth } from '../context/AuthContext';

interface CourseDetailsPageProps {
  course: Course;
  onOpenPlayer: (course: Course) => void;
  onInitiatePayment: (course: Course) => void;
  onOpenAuth: () => void;
  onRefreshUserData?: () => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({
  course,
  onOpenPlayer,
  onInitiatePayment,
  onOpenAuth,
  onRefreshUserData,
}) => {
  const { currentUser } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollingFree, setEnrollingFree] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getLessonsForCourse(course.id),
      getMaterialsForCourse(course.id),
      currentUser ? checkIsEnrolled(currentUser.uid, course.id) : Promise.resolve(false),
    ])
      .then(([lList, mList, enrolledStatus]) => {
        if (!isMounted) return;
        setLessons(lList);
        setMaterials(mList);
        setIsEnrolled(enrolledStatus);
      })
      .catch((err) => console.error('Course details load error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [course.id, currentUser]);

  const handleEnrollClick = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (course.isFree) {
      setEnrollingFree(true);
      try {
        await enrollInFreeCourse(currentUser.uid, course);
        setIsEnrolled(true);
        if (onRefreshUserData) onRefreshUserData();
        onOpenPlayer(course);
      } catch (err) {
        console.error('Free enrollment error:', err);
      } finally {
        setEnrollingFree(false);
      }
    } else {
      onInitiatePayment(course);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Course Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Course Meta & Description */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {course.targetClass}
                </span>
                {course.isFree && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                    FREE ACCESS
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {course.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800">{course.facultyName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>{lessons.length || course.lessonCount || 0} Video Lessons</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{course.duration || 'Self-paced'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Enrollment Action Card */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 relative shadow-sm">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  {course.isFree ? (
                    <span className="text-3xl font-black text-emerald-600">Free Access</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-slate-900">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{course.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>You are enrolled in this course. Full access active!</span>
                    </div>

                    <button
                      onClick={() => onOpenPlayer(course)}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>Launch Course Player</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    disabled={enrollingFree}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {enrollingFree ? (
                      <span>Enrolling...</span>
                    ) : course.isFree ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Enroll Now (Free)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Buy Course (₹{course.price.toLocaleString('en-IN')})</span>
                      </>
                    )}
                  </button>
                )}

                <div className="text-[11px] text-slate-500 space-y-1 pt-2">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Full lifetime access to video lectures & study notes</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Timed diagnostic assessments & progress tracking</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified server transaction & persistent student dashboard</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Curriculum & Syllabus Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Syllabus & Lessons */}
          <div className="lg:col-span-8 space-y-8">
            {/* Syllabus Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Course Syllabus & Curriculum</h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {course.syllabus || 'Detailed lecture breakdown and notes are outlined in the modules below.'}
              </div>
            </div>

            {/* Lessons List */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Lectures & Modules</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{lessons.length} Lessons Available</p>
                </div>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading lessons...</div>
              ) : lessons.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No lessons have been published for this course yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{lesson.title}</h4>
                            {lesson.isFreePreview && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lesson.description}</p>
                          <span className="text-[11px] text-slate-400 font-medium">{lesson.duration || 'Self-paced'}</span>
                        </div>
                      </div>

                      <div>
                        {isEnrolled || lesson.isFreePreview ? (
                          <button
                            onClick={() => onOpenPlayer(course)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Watch</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Study Materials */}
            {materials.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Handouts & Reference Materials</h2>
                <div className="space-y-3">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-slate-900">{mat.title}</p>
                          <p className="text-[11px] text-slate-400">{mat.fileType} • {mat.fileSize || 'Standard'}</p>
                        </div>
                      </div>
                      {isEnrolled || mat.isFreePreview ? (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Enrolled Only</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info: Faculty & Course Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  {course.facultyName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{course.facultyName}</h4>
                  <p className="text-xs text-slate-500">Senior Faculty & Subject Specialist</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated educator at Aspire Academy with years of experience coaching competitive candidates and building deep intuition.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 text-xs text-slate-600">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-2">Key Highlights</h3>
              <p>✓ Complete syllabus alignment with high-yield concepts</p>
              <p>✓ Timed quizzes and instant score analytics</p>
              <p>✓ Responsive mobile playback anytime on Android and iOS</p>
              <p>✓ Verified Razorpay payments with instant enrollment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
