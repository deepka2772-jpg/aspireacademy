export type UserRole = 'student' | 'admin';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export type LessonSourceType = 'youtube' | 'r2_video';
export type LessonContentType = 'youtube' | 'youtube_live' | 'r2_video' | 'pdf';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  sourceType?: LessonSourceType;
  contentType: LessonContentType;
  contentUrl: string; // YouTube URL or R2 object key / document link
  r2ObjectKey?: string;
  youtubeId?: string;
  duration?: string;
  order: number;
  isFreePreview: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  thumbnailObjectKey?: string;
  category: string;
  targetClass: string;
  facultyName: string;
  duration: string;
  syllabus: string;
  lessonCount: number;
  isFree: boolean;
  price: number;
  originalPrice?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  courseCount?: number;
  isPublished: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoURL: string;
  subject: string;
  qualification: string;
  isPublished: boolean;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  schedule: string;
  teacherName: string;
  maxStudents: number;
  enrolledCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface EnrollmentProgress {
  completedLessonIds: string[];
  lastLessonId?: string;
  percentage: number;
  updatedAt: string;
}

export interface Enrollment {
  id: string; // Pattern: `${userId}_${courseId}`
  userId: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
  progress?: EnrollmentProgress;
}

export interface Order {
  id: string;
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  paidAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  marks: number;
  correctAnswerIndex?: number; // Only exposed to admin or on post-submission result
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  instructions: string;
  passingPercentage: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
  isPublished: boolean;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  courseId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>;
  completedAt: string;
}

export interface LearningMaterial {
  id: string;
  courseId: string;
  title: string;
  fileType: string;
  fileUrl: string;
  fileSize?: string;
  isFreePreview: boolean;
  createdAt: string;
}

export interface SiteSettings {
  academyName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcement?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  updatedAt?: string;
}
