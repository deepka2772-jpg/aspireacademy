import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Layers,
  Users,
  Calendar,
  CreditCard,
  GraduationCap,
  FileQuestion,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Upload,
  ArrowUp,
  ArrowDown,
  Lock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  Course,
  Lesson,
  Category,
  Faculty,
  Batch,
  Order,
  Quiz,
  LearningMaterial,
  SiteSettings,
  Enrollment,
} from '../types';
import {
  getAllCoursesAdmin,
  saveCourse,
  deleteCourse,
  getLessonsForCourse,
  saveLesson,
  deleteLesson,
  getCategories,
  saveCategory,
  deleteCategory,
  getFacultyList,
  saveFaculty,
  deleteFaculty,
  getBatches,
  saveBatch,
  deleteBatch,
  getMaterialsForCourse,
  saveMaterial,
  deleteMaterial,
  getSiteSettings,
  saveSiteSettings,
} from '../services/courseService';
import { getAllOrdersAdmin } from '../services/orderService';
import { getAllQuizzesAdmin, saveQuiz, deleteQuiz } from '../services/quizService';
import { checkStorageConfig, uploadToR2WithProgress } from '../services/storageService';
import { checkPaymentConfig } from '../services/orderService';
import { seedInitialPlatformData } from '../services/seedService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { deleteR2Object } from '../services/storageService';

interface AdminDashboardProps {
  onPreviewCourse: (course: Course) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onPreviewCourse }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'courses' | 'lessons' | 'categories' | 'faculty' | 'batches' | 'students' | 'orders' | 'quizzes' | 'settings'>('overview');

  const [courses, setCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [studentUsers, setStudentUsers] = useState<any[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Configuration status states
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [storageStatus, setStorageStatus] = useState<any>(null);

  // Lesson Management State (exact workflow)
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [r2UploadProgress, setR2UploadProgress] = useState<number | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [previewingLesson, setPreviewingLesson] = useState<Lesson | null>(null);

  // Course Thumbnail Upload & Preview State
  const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'url'>('upload');
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number | null>(null);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
  const [thumbnailLocalPreview, setThumbnailLocalPreview] = useState<string | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);

  // Course Edit Modal State
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  // Category Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Faculty Edit Modal State
  const [editingFaculty, setEditingFaculty] = useState<Partial<Faculty> | null>(null);

  // Batch Edit Modal State
  const [editingBatch, setEditingBatch] = useState<Partial<Batch> | null>(null);

  // Quiz Edit Modal State
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [cList, oList, catList, fList, bList, qList, settings, payCfg, storCfg] = await Promise.all([
        getAllCoursesAdmin(),
        getAllOrdersAdmin(),
        getCategories(),
        getFacultyList(),
        getBatches(),
        getAllQuizzesAdmin(),
        getSiteSettings(),
        checkPaymentConfig(),
        checkStorageConfig(),
      ]);

      setCourses(cList);
      setOrders(oList);
      setCategories(catList);
      setFaculty(fList);
      setBatches(bList);
      setQuizzes(qList);
      setSiteSettings(settings);
      setPaymentStatus(payCfg);
      setStorageStatus(storCfg);

      // Fetch users and enrollments
      try {
        const uSnap = await getDocs(collection(db, 'users'));
        const uList: any[] = [];
        uSnap.forEach((d) => uList.push({ id: d.id, ...d.data() }));
        setStudentUsers(uList);
      } catch (e) {
        console.warn('Could not list users:', e);
      }

      try {
        const eSnap = await getDocs(collection(db, 'enrollments'));
        const eList: Enrollment[] = [];
        eSnap.forEach((d) => eList.push({ id: d.id, ...d.data() } as Enrollment));
        setAllEnrollments(eList);
      } catch (e) {
        console.warn('Could not list enrollments:', e);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // Lesson Management Workflow (as demanded by prompt)
  // -------------------------------------------------------------
  const handleOpenManageLessons = async (course: Course) => {
    setSelectedCourseForLessons(course);
    setActiveSection('lessons');
    const lessons = await getLessonsForCourse(course.id);
    setCourseLessons(lessons);
    setEditingLesson(null);
  };

  const handleStartAddLesson = () => {
    if (!selectedCourseForLessons) return;
    setEditingLesson({
      courseId: selectedCourseForLessons.id,
      title: '',
      description: '',
      sourceType: 'youtube',
      contentType: 'youtube',
      contentUrl: '',
      r2ObjectKey: '',
      duration: '15 mins',
      order: courseLessons.length + 1,
      isFreePreview: false,
      isPublished: true,
    });
    setR2UploadProgress(null);
    setVideoUploadError(null);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !selectedCourseForLessons) return;

    if (!editingLesson.title?.trim()) {
      showNotify('Lesson title is required', 'error');
      return;
    }

    if (!editingLesson.contentUrl?.trim()) {
      showNotify(
        editingLesson.sourceType === 'r2_video'
          ? 'Please upload a video file to Cloudflare R2 before saving'
          : 'Please provide a valid YouTube video URL',
        'error'
      );
      return;
    }

    try {
      await saveLesson({
        ...editingLesson,
        courseId: selectedCourseForLessons.id,
        sourceType: editingLesson.sourceType || (editingLesson.contentType === 'r2_video' ? 'r2_video' : 'youtube'),
      } as any);

      // Refresh lessons
      const updated = await getLessonsForCourse(selectedCourseForLessons.id);
      setCourseLessons(updated);
      setEditingLesson(null);
      showNotify('Lesson saved successfully to database!');
      // Update local course lesson count
      setCourses(courses.map((c) => c.id === selectedCourseForLessons.id ? { ...c, lessonCount: updated.length } : c));
    } catch (err: any) {
      showNotify(err.message || 'Failed to save lesson', 'error');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteLesson(selectedCourseForLessons.id, lessonId);
      const updated = await getLessonsForCourse(selectedCourseForLessons.id);
      setCourseLessons(updated);
      showNotify('Lesson deleted.');
    } catch (err: any) {
      showNotify(err.message || 'Failed to delete lesson', 'error');
    }
  };

  const handleMoveLesson = async (index: number, direction: 'up' | 'down') => {
    if (!selectedCourseForLessons) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= courseLessons.length) return;

    const current = courseLessons[index];
    const target = courseLessons[targetIdx];

    try {
      await saveLesson({ id: current.id, courseId: selectedCourseForLessons.id, order: target.order });
      await saveLesson({ id: target.id, courseId: selectedCourseForLessons.id, order: current.order });
      const updated = await getLessonsForCourse(selectedCourseForLessons.id);
      setCourseLessons(updated);
      showNotify('Lesson order reordered successfully.');
    } catch (err: any) {
      showNotify('Failed to reorder lessons', 'error');
    }
  };

  const handleR2FileUpload = async (file: File) => {
    if (!selectedCourseForLessons) return;
    setVideoUploadError(null);

    // Client-side validations
    const validVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (!validVideoMimes.includes(file.type.toLowerCase()) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      setVideoUploadError('Supported video formats are MP4, WebM, and MOV/QuickTime.');
      showNotify('Supported video formats are MP4, WebM, and MOV/QuickTime.', 'error');
      return;
    }

    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setVideoUploadError(`Video file exceeds the 500 MB limit (${sizeMb} MB). Please choose a smaller or compressed file.`);
      showNotify(`Video file exceeds the 500 MB limit (${sizeMb} MB).`, 'error');
      return;
    }

    if (!storageStatus?.configured) {
      setVideoUploadError('Cloudflare R2 is not configured on this server. Please configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in environment settings.');
      showNotify('Cloudflare R2 is not configured on this server.', 'error');
      return;
    }

    try {
      setR2UploadProgress(0);
      const res = await uploadToR2WithProgress(file, selectedCourseForLessons.id, {
        folder: 'videos',
        onProgress: (pct) => setR2UploadProgress(pct),
      });

      setEditingLesson((prev) => prev ? ({
        ...prev,
        sourceType: 'r2_video',
        contentType: 'r2_video',
        contentUrl: res.objectKey,
        r2ObjectKey: res.objectKey,
      }) : null);

      showNotify(`Uploaded to Cloudflare R2: ${res.objectKey}`);
    } catch (err: any) {
      setVideoUploadError(err.message || 'Cloudflare R2 video upload failed.');
      showNotify(err.message || 'Cloudflare R2 video upload failed', 'error');
    }
  };

  const handleThumbnailFileSelect = async (file: File) => {
    setThumbnailUploadError(null);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailLocalPreview(previewUrl);
    setSelectedThumbnailFile(file);

    // Validation
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type.toLowerCase())) {
      setThumbnailUploadError('Only JPG, PNG, and WebP images are supported.');
      showNotify('Only JPG, PNG, and WebP images are supported.', 'error');
      return;
    }

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_IMAGE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setThumbnailUploadError(`Thumbnail exceeds the 5 MB limit (${sizeMb} MB).`);
      showNotify(`Thumbnail exceeds 5 MB limit (${sizeMb} MB).`, 'error');
      return;
    }

    if (!storageStatus?.configured) {
      setThumbnailUploadError('Cloudflare R2 is not configured on this server. You can enter an image URL or configure R2 credentials to upload directly.');
      // Keep local preview so user can test UI
      setEditingCourse((prev) => prev ? ({ ...prev, thumbnail: previewUrl }) : null);
      return;
    }

    try {
      setThumbnailUploadProgress(0);
      const res = await uploadToR2WithProgress(file, editingCourse?.id || 'courses', {
        folder: 'thumbnails',
        onProgress: (pct) => setThumbnailUploadProgress(pct),
      });

      // If replacing old thumbnail, safely clean up old object
      if (editingCourse?.thumbnailObjectKey && editingCourse.thumbnailObjectKey !== res.objectKey) {
        deleteR2Object(editingCourse.thumbnailObjectKey);
      }

      const displayUrl = res.publicUrl || previewUrl;
      setEditingCourse((prev) => prev ? ({
        ...prev,
        thumbnail: displayUrl,
        thumbnailObjectKey: res.objectKey,
      }) : null);

      showNotify(`Thumbnail uploaded to Cloudflare R2: ${res.objectKey}`);
    } catch (err: any) {
      setThumbnailUploadError(err.message || 'Thumbnail upload failed');
      showNotify(err.message || 'Thumbnail upload failed', 'error');
      setThumbnailUploadProgress(null);
    }
  };

  // -------------------------------------------------------------
  // Course Management
  // -------------------------------------------------------------
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await saveCourse(editingCourse);
      await loadAllData();
      setEditingCourse(null);
      showNotify('Course details updated successfully.');
    } catch (err: any) {
      showNotify(err.message || 'Failed to save course', 'error');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Delete this course permanently? This will also remove associated lessons.')) return;
    try {
      await deleteCourse(courseId);
      await loadAllData();
      showNotify('Course deleted.');
    } catch (err: any) {
      showNotify(err.message || 'Failed to delete course', 'error');
    }
  };

  const handleTogglePublishCourse = async (course: Course) => {
    try {
      await saveCourse({ id: course.id, isPublished: !course.isPublished });
      await loadAllData();
      showNotify(`Course is now ${!course.isPublished ? 'Published' : 'Draft'}.`);
    } catch (err: any) {
      showNotify(err.message || 'Failed to update course', 'error');
    }
  };

  // -------------------------------------------------------------
  // Platform Reset / Re-seed Data
  // -------------------------------------------------------------
  const handleSeedData = async () => {
    if (!window.confirm('This will seed Aspire Academy Online with initial physics, math, and chemistry courses, faculty, and lessons. Proceed?')) return;
    setLoading(true);
    try {
      await seedInitialPlatformData();
      await loadAllData();
      showNotify('Sample curriculum and lessons populated in Firestore successfully!');
    } catch (err: any) {
      showNotify(err.message || 'Failed to seed sample courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                Administrator Control Center
              </span>
              <span className="text-xs text-slate-400">Aspire Academy Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">Platform Management</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time Firestore database persistence, course syllabus management, payments, and storage verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedData}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Seed / Reset Courses</span>
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
            { id: 'lessons', label: 'Lessons & Videos', icon: Video },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'faculty', label: `Faculty (${faculty.length})`, icon: Users },
            { id: 'batches', label: `Batches (${batches.length})`, icon: Calendar },
            { id: 'orders', label: `Orders (${orders.length})`, icon: CreditCard },
            { id: 'students', label: `Students & Enrollments (${allEnrollments.length})`, icon: GraduationCap },
            { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: FileQuestion },
            { id: 'settings', label: 'Settings & Integrations', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SECTION CONTENT */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Querying Firestore data collections...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Total Courses</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{courses.length}</p>
                    <p className="text-[11px] text-blue-600 mt-1">
                      {courses.filter((c) => c.isPublished).length} Published
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Total Students</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{studentUsers.length || 0}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Registered Profiles</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Enrollments</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{allEnrollments.length}</p>
                    <p className="text-[11px] text-emerald-600 mt-1">Active Course Access</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Total Orders</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {orders.filter((o) => o.status === 'paid').length} Paid
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Verified Revenue</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      ₹{totalRevenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Razorpay Verified</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Active Batches</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{batches.length}</p>
                    <p className="text-[11px] text-purple-600 mt-1 font-semibold">Live Cohorts</p>
                  </div>
                </div>

                {/* Gateway Integration Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Razorpay status */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Razorpay Payment Gateway</h3>
                          <p className="text-xs text-slate-500">Card, UPI, NetBanking transactions</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          paymentStatus?.configured
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {paymentStatus?.configured ? 'ACTIVE & CONFIGURED' : 'PENDING CREDENTIALS'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {paymentStatus?.configured
                        ? `Live Key ID: ${paymentStatus.keyId}`
                        : 'To accept real payments in INR, set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in the project environment variables.'}
                    </p>
                  </div>

                  {/* Cloudflare R2 status */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Cloudflare R2 Object Storage</h3>
                          <p className="text-xs text-slate-500">Private video lectures & secure signed playback</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          storageStatus?.configured
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {storageStatus?.configured ? 'ACTIVE & CONFIGURED' : 'PENDING CREDENTIALS'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {storageStatus?.configured
                        ? `Connected Bucket: ${storageStatus.bucket}`
                        : 'To store and stream private video files directly from Cloudflare R2, set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.'}
                    </p>
                  </div>
                </div>

                {/* Quick Course Table preview */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Recent Courses</h3>
                    <button
                      onClick={() => setActiveSection('courses')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Manage All Courses →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase">
                          <th className="py-3 px-3">Title</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Price</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {courses.slice(0, 5).map((course) => (
                          <tr key={course.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 font-semibold text-slate-900">{course.title}</td>
                            <td className="py-3 px-3 text-slate-600">{course.category}</td>
                            <td className="py-3 px-3">
                              {course.isFree ? (
                                <span className="text-emerald-700 font-bold">FREE</span>
                              ) : (
                                <span className="text-blue-700 font-bold">PAID</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-semibold">
                              {course.isFree ? '₹0' : `₹${course.price.toLocaleString('en-IN')}`}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  course.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleOpenManageLessons(course)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 mr-2"
                              >
                                Lessons ({course.lessonCount || 0})
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* COURSES SECTION */}
            {activeSection === 'courses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Course Management</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create, edit pricing, target classes, syllabus, publish status, and manage curriculum lessons.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingCourse({
                        title: '',
                        shortDescription: '',
                        description: '',
                        category: categories[0]?.name || 'General',
                        targetClass: 'Class 11 & 12',
                        facultyName: faculty[0]?.name || 'Aspire Faculty',
                        duration: '30 Hours',
                        syllabus: '',
                        isFree: false,
                        price: 999,
                        originalPrice: 1999,
                        isPublished: true,
                        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Course</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-video w-full bg-slate-100 relative">
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-slate-900 shadow">
                              {course.category}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shadow ${
                                course.isPublished ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                              }`}
                            >
                              {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <p className="text-[11px] font-semibold text-blue-700">{course.targetClass}</p>
                          <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.shortDescription}</p>

                          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                            <span className="font-bold text-slate-800">
                              {course.isFree ? 'Free Access' : `₹${course.price.toLocaleString('en-IN')}`}
                            </span>
                            <span className="text-slate-500">{course.lessonCount || 0} Lessons</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleOpenManageLessons(course)}
                          className="py-2 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs text-center"
                        >
                          Lessons
                        </button>
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="py-2 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublishCourse(course)}
                          className={`py-2 px-2 rounded-lg text-xs font-bold text-center ${
                            course.isPublished
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {course.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LESSONS & VIDEOS SECTION (Exact workflow demanded by prompt) */}
            {activeSection === 'lessons' && (
              <div className="space-y-6">
                {/* Course selector bar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {selectedCourseForLessons
                          ? `Managing Lessons for: ${selectedCourseForLessons.title}`
                          : 'Select a Course to Manage Lessons'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Add YouTube lectures, YouTube Live streams, Cloudflare R2 private videos, or PDF materials.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCourseForLessons?.id || ''}
                      onChange={(e) => {
                        const c = courses.find((item) => item.id === e.target.value);
                        if (c) handleOpenManageLessons(c);
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>

                    {selectedCourseForLessons && (
                      <button
                        onClick={handleStartAddLesson}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Lesson</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Add/Edit Form Modal */}
                {editingLesson && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-200 shadow-lg space-y-5 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="font-bold text-base text-slate-900">
                        {editingLesson.id ? 'Edit Lesson' : 'Step-by-Step Lesson Creator'}
                      </h4>
                      <button
                        onClick={() => setEditingLesson(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveLesson} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Lesson Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Lesson 1: Introduction to Mechanics"
                            value={editingLesson.title || ''}
                            onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                            Video Source Selection *
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLesson({
                                  ...editingLesson,
                                  contentType: 'youtube',
                                  sourceType: 'youtube',
                                });
                                setVideoUploadError(null);
                              }}
                              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                                editingLesson.contentType === 'youtube' || editingLesson.contentType === 'youtube_live'
                                  ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Video className="w-4 h-4 text-red-600" />
                              <span>YouTube URL</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingLesson({
                                  ...editingLesson,
                                  contentType: 'r2_video',
                                  sourceType: 'r2_video',
                                });
                              }}
                              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                                editingLesson.contentType === 'r2_video'
                                  ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Upload className="w-4 h-4 text-blue-600" />
                              <span>Cloudflare R2</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingLesson({
                                  ...editingLesson,
                                  contentType: 'pdf',
                                });
                              }}
                              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                                editingLesson.contentType === 'pdf'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500/20'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <BookOpen className="w-4 h-4 text-amber-600" />
                              <span>PDF Handout</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content URL or R2 Upload input */}
                      {editingLesson.contentType === 'youtube' || editingLesson.contentType === 'youtube_live' ? (
                        <div className="p-4 rounded-2xl bg-red-50/40 border border-red-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-red-950 uppercase">
                              YouTube Video or Live Stream URL *
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingLesson.contentType === 'youtube_live'}
                                onChange={(e) =>
                                  setEditingLesson({
                                    ...editingLesson,
                                    contentType: e.target.checked ? 'youtube_live' : 'youtube',
                                  })
                                }
                                className="rounded text-red-600 focus:ring-red-500"
                              />
                              <span className="font-semibold text-[11px]">Live Stream / Premiere</span>
                            </label>
                          </div>

                          <input
                            type="url"
                            required
                            placeholder="e.g. https://www.youtube.com/watch?v=ihNZLpZ-p_o or youtu.be/..."
                            value={editingLesson.contentUrl || ''}
                            onChange={(e) =>
                              setEditingLesson({
                                ...editingLesson,
                                contentUrl: e.target.value,
                                sourceType: 'youtube',
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-red-500"
                          />

                          {/* Live URL Validation Feedback */}
                          {editingLesson.contentUrl && (
                            <div className="space-y-2 pt-1">
                              {getYouTubeEmbedUrl(editingLesson.contentUrl) ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Valid YouTube Video URL verified! Embed ready for students.</span>
                                  </div>
                                  <div className="aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-black shadow-inner">
                                    <iframe
                                      src={getYouTubeEmbedUrl(editingLesson.contentUrl) || ''}
                                      title="YouTube Preview"
                                      className="w-full h-full"
                                      allowFullScreen
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Please enter a valid YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...).</span>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-[11px] text-slate-500">
                            Standard watch links, youtu.be shortcuts, and live stream URLs are validated and converted into clean, responsive student embeds.
                          </p>
                        </div>
                      ) : editingLesson.contentType === 'r2_video' ? (
                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-blue-700" />
                              <span>Cloudflare R2 Private Video Upload</span>
                            </label>
                            {storageStatus?.configured ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>R2 Connected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                <AlertCircle className="w-3 h-3" />
                                <span>R2 Not Configured</span>
                              </span>
                            )}
                          </div>

                          {!storageStatus?.configured && (
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                              <p className="font-bold">Cloudflare R2 storage credentials are not set on this server.</p>
                              <p className="text-[11px] text-amber-800 leading-relaxed">
                                To upload private video files up to 500 MB directly to R2, set <code>R2_ACCOUNT_ID</code>, <code>R2_ACCESS_KEY_ID</code>, <code>R2_SECRET_ACCESS_KEY</code>, and <code>R2_BUCKET_NAME</code> in your environment. You may also specify an existing R2 object key below.
                              </p>
                            </div>
                          )}

                          {/* File Selection & Upload Area */}
                          <div className="border-2 border-dashed border-blue-200 bg-white rounded-2xl p-4 text-center space-y-2">
                            <input
                              type="file"
                              id="lesson-video-file-input"
                              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleR2FileUpload(f);
                              }}
                            />
                            <label
                              htmlFor="lesson-video-file-input"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm shadow-blue-500/20 transition-all"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Select Video File (MP4, WebM, MOV)</span>
                            </label>
                            <p className="text-[11px] text-slate-500">
                              Supported formats: MP4, WebM, MOV &bull; Maximum file size: <strong>500 MB</strong>
                            </p>
                          </div>

                          {/* Upload Progress Bar */}
                          {r2UploadProgress !== null && (
                            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-blue-200">
                              <div className="flex justify-between text-xs text-blue-900 font-bold">
                                <span>Uploading to Cloudflare R2...</span>
                                <span>{r2UploadProgress}%</span>
                              </div>
                              <div className="w-full bg-blue-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full transition-all duration-200"
                                  style={{ width: `${r2UploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Upload Error Banner & Retry */}
                          {videoUploadError && (
                            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span>{videoUploadError}</span>
                              </div>
                              <label
                                htmlFor="lesson-video-file-input"
                                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer shrink-0"
                              >
                                Retry Upload
                              </label>
                            </div>
                          )}

                          {/* R2 Object Key Display */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              R2 Object Key / Storage Path
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. courses/physics-101/videos/1741234567.mp4"
                              value={editingLesson.contentUrl || editingLesson.r2ObjectKey || ''}
                              onChange={(e) =>
                                setEditingLesson({
                                  ...editingLesson,
                                  contentUrl: e.target.value,
                                  r2ObjectKey: e.target.value,
                                  sourceType: 'r2_video',
                                })
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                            />
                            {editingLesson.r2ObjectKey && (
                              <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>R2 private object key attached. Protected playback will be generated server-side.</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            PDF Document Link or Public Material URL *
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://example.com/syllabus-handout.pdf"
                            value={editingLesson.contentUrl || ''}
                            onChange={(e) =>
                              setEditingLesson({ ...editingLesson, contentUrl: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 24 mins"
                            value={editingLesson.duration || ''}
                            onChange={(e) =>
                              setEditingLesson({ ...editingLesson, duration: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Display Order (Sequence)
                          </label>
                          <input
                            type="number"
                            value={editingLesson.order || 1}
                            onChange={(e) =>
                              setEditingLesson({ ...editingLesson, order: Number(e.target.value) })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-5">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editingLesson.isFreePreview)}
                              onChange={(e) =>
                                setEditingLesson({ ...editingLesson, isFreePreview: e.target.checked })
                              }
                              className="rounded text-blue-600"
                            />
                            <span>Free Preview Lesson</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Lesson Description / Notes
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Outline of concepts discussed in this lecture..."
                          value={editingLesson.description || ''}
                          onChange={(e) =>
                            setEditingLesson({ ...editingLesson, description: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
                        ></textarea>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                        >
                          Save Lesson to Firestore
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLesson(null)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lesson List Table */}
                {selectedCourseForLessons ? (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">
                        {courseLessons.length} Lessons Configured
                      </h4>
                      <button
                        onClick={handleStartAddLesson}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Another Lesson</span>
                      </button>
                    </div>

                    {courseLessons.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 space-y-2">
                        <Video className="w-10 h-10 mx-auto opacity-30" />
                        <p className="text-xs">No lessons added yet for this course.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {courseLessons.map((lesson, idx) => (
                          <div
                            key={lesson.id}
                            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80"
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-sm text-slate-900">{lesson.title}</h5>
                                  {lesson.isFreePreview && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                      Free Preview
                                    </span>
                                  )}
                                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                                    {lesson.contentType}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lesson.description}</p>
                                <p className="text-[11px] text-slate-400 mt-1 font-mono truncate max-w-md">
                                  {lesson.contentUrl}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Reorder Up Button */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveLesson(idx, 'up')}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                title="Move Lesson Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Reorder Down Button */}
                              <button
                                type="button"
                                disabled={idx === courseLessons.length - 1}
                                onClick={() => handleMoveLesson(idx, 'down')}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                title="Move Lesson Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Preview Lesson Button */}
                              <button
                                type="button"
                                onClick={() => setPreviewingLesson(lesson)}
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold"
                                title="Preview Lesson"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Lesson */}
                              <button
                                type="button"
                                onClick={() => setEditingLesson(lesson)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                                title="Edit Lesson"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Lesson */}
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                                title="Delete Lesson"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400 space-y-3">
                    <Video className="w-12 h-12 mx-auto opacity-30" />
                    <p className="text-sm font-semibold text-slate-700">Please select a course to start managing lessons</p>
                    <p className="text-xs text-slate-400">Choose from the dropdown above or click 'Lessons' on any course card.</p>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS SECTION */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Orders & Payment Transactions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real orders confirmed through server-side Razorpay signature verification.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No orders recorded in Firestore yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase bg-slate-50">
                            <th className="py-3 px-4">Order ID</th>
                            <th className="py-3 px-4">Student Email</th>
                            <th className="py-3 px-4">Course</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Payment ID</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-50">
                              <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">#{ord.orderId}</td>
                              <td className="py-3.5 px-4 text-slate-700">{ord.userEmail}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">{ord.courseTitle}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">₹{ord.amount.toLocaleString('en-IN')}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-500">{ord.razorpayPaymentId || 'Verified'}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STUDENTS & ENROLLMENTS SECTION */}
            {activeSection === 'students' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Enrollments & Progress</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Students with active course access recorded in Firestore.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  {allEnrollments.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No active enrollments found in database.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {allEnrollments.map((enr) => (
                        <div key={enr.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                              {enr.status}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 mt-1">{enr.courseTitle}</h4>
                            <p className="text-xs text-slate-500">
                              Student UID: <span className="font-mono">{enr.userId}</span> • Enrolled on {new Date(enr.enrolledAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900">
                              {enr.progress?.percentage || 0}% Completed
                            </span>
                            <p className="text-[11px] text-slate-400">
                              {enr.progress?.completedLessonIds?.length || 0} lessons cleared
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS & INTEGRATIONS SECTION */}
            {activeSection === 'settings' && siteSettings && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Site Settings & Gateway Integrations</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Update branding, contact details, and inspect service credentials.</p>
                </div>

                {/* Integration Credentials Info */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-base font-bold text-slate-900">Required Environment Configurations</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Razorpay India Payments</span>
                        <span className={paymentStatus?.configured ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {paymentStatus?.configured ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                      <p className="text-slate-500">Variables needed in Cloud Run or .env:</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-mono text-[11px]">
                        <li>RAZORPAY_KEY_ID</li>
                        <li>RAZORPAY_KEY_SECRET</li>
                        <li>RAZORPAY_WEBHOOK_SECRET</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Cloudflare R2 Storage</span>
                        <span className={storageStatus?.configured ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {storageStatus?.configured ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                      <p className="text-slate-500">Variables needed in Cloud Run or .env:</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-mono text-[11px]">
                        <li>R2_ACCOUNT_ID</li>
                        <li>R2_ACCESS_KEY_ID</li>
                        <li>R2_SECRET_ACCESS_KEY</li>
                        <li>R2_BUCKET_NAME</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Site Profile Form */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Academy Branding & Public Copy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academy Name</label>
                      <input
                        type="text"
                        value={siteSettings.academyName || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, academyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tagline</label>
                      <input
                        type="text"
                        value={siteSettings.tagline || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={siteSettings.contactEmail || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={siteSettings.contactPhone || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Headquarters / Campus Address</label>
                    <input
                      type="text"
                      value={siteSettings.address || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (siteSettings) {
                        await saveSiteSettings(siteSettings);
                        showNotify('Settings updated successfully in Firestore.');
                      }
                    }}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Save Site Settings
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Course Edit / Creation Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCourse.id ? 'Edit Course Details' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingCourse.shortDescription || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={editingCourse.category || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Class / Exam</label>
                  <input
                    type="text"
                    value={editingCourse.targetClass || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, targetClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Type</label>
                  <select
                    value={editingCourse.isFree ? 'free' : 'paid'}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        isFree: e.target.value === 'free',
                        price: e.target.value === 'free' ? 0 : editingCourse.price || 999,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  >
                    <option value="paid">Paid Course</option>
                    <option value="free">Free Starter Course</option>
                  </select>
                </div>

                {!editingCourse.isFree && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹ INR)</label>
                      <input
                        type="number"
                        value={editingCourse.price || 0}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, price: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Original Price (Strike)</label>
                      <input
                        type="number"
                        value={editingCourse.originalPrice || 0}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, originalPrice: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Course Thumbnail Management (R2 Upload + URL Fallback) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase">
                    Course Thumbnail Image *
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setThumbnailMode('upload')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        thumbnailMode === 'upload'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Upload File (R2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        thumbnailMode === 'url'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {thumbnailMode === 'upload' ? (
                  <div className="space-y-3">
                    {!storageStatus?.configured && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Cloudflare R2 is not configured</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Direct file upload requires R2 credentials. You can switch to the <strong>Image URL</strong> tab above to provide an image link directly, or configure R2 credentials in environment variables.
                        </p>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-2xl p-4 text-center transition-all">
                      <input
                        type="file"
                        id="course-thumbnail-upload"
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleThumbnailFileSelect(f);
                        }}
                      />
                      <label
                        htmlFor="course-thumbnail-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Select Thumbnail Image</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Supported: JPG, PNG, WebP &bull; Maximum file size: <strong>5 MB</strong>
                      </p>
                    </div>

                    {thumbnailUploadProgress !== null && (
                      <div className="space-y-1 bg-white p-3 rounded-xl border border-blue-200">
                        <div className="flex justify-between text-xs text-blue-900 font-bold">
                          <span>Uploading image to R2...</span>
                          <span>{thumbnailUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-200"
                            style={{ width: `${thumbnailUploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {thumbnailUploadError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{thumbnailUploadError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={editingCourse.thumbnail || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                    />
                    <p className="text-[11px] text-slate-500">
                      Provide a direct web-accessible URL to a course banner or cover image.
                    </p>
                  </div>
                )}

                {/* Instant Thumbnail Live Preview */}
                {(editingCourse.thumbnail || thumbnailLocalPreview) && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                      Thumbnail Preview
                    </span>
                    <div className="aspect-video max-w-xs rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-sm">
                      <img
                        src={editingCourse.thumbnail || thumbnailLocalPreview || ''}
                        alt="Course Thumbnail Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {editingCourse.thumbnailObjectKey && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white truncate block backdrop-blur-sm">
                            R2 Key: {editingCourse.thumbnailObjectKey}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Course Syllabus & Outline</label>
                <textarea
                  rows={4}
                  value={editingCourse.syllabus || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, syllabus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                ></textarea>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingCourse.isPublished)}
                    onChange={(e) => setEditingCourse({ ...editingCourse, isPublished: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Publish Immediately (Visible to Public Students)</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  Save Course
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                {editingCourse.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(editingCourse.id!)}
                    className="ml-auto px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs"
                  >
                    Delete Course
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
