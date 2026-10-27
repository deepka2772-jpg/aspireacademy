import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Course, Lesson, Category, Faculty, Batch, LearningMaterial, SiteSettings } from '../types';

// ==========================================
// COURSES
// ==========================================

export async function getPublishedCourses(): Promise<Course[]> {
  try {
    const q = query(collection(db, 'courses'), where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    const list: Course[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Course);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'courses');
  }
}

export async function getAllCoursesAdmin(): Promise<Course[]> {
  try {
    const snapshot = await getDocs(collection(db, 'courses'));
    const list: Course[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Course);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'courses');
  }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const docRef = doc(db, 'courses', courseId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Course;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
  }
}

export async function saveCourse(course: Partial<Course> & { id?: string }): Promise<string> {
  try {
    const courseId = course.id || `course_${Date.now()}`;
    const courseRef = doc(db, 'courses', courseId);
    const now = new Date().toISOString();

    const data: Partial<Course> = {
      title: course.title || 'Untitled Course',
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      thumbnailObjectKey: course.thumbnailObjectKey || '',
      category: course.category || 'General',
      targetClass: course.targetClass || 'All Levels',
      facultyName: course.facultyName || 'Aspire Faculty',
      duration: course.duration || 'Self-paced',
      syllabus: course.syllabus || '',
      lessonCount: course.lessonCount || 0,
      isFree: Boolean(course.isFree),
      price: course.isFree ? 0 : Number(course.price || 0),
      originalPrice: course.originalPrice ? Number(course.originalPrice) : undefined,
      isPublished: Boolean(course.isPublished),
      updatedAt: now,
    };

    if (!course.id) {
      data.createdAt = now;
    }

    await setDoc(courseRef, data, { merge: true });
    return courseId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'courses');
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
  }
}

// ==========================================
// LESSONS
// ==========================================

export async function getLessonsForCourse(courseId: string): Promise<Lesson[]> {
  try {
    const q = query(
      collection(db, 'lessons'),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    const list: Lesson[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        sourceType: data.sourceType || (data.contentType === 'r2_video' ? 'r2_video' : 'youtube'),
        ...data,
      } as Lesson);
    });
    // Sort by order ascending
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'lessons');
  }
}

export async function saveLesson(lesson: Partial<Lesson> & { courseId: string; id?: string }): Promise<string> {
  try {
    const lessonId = lesson.id || `lesson_${Date.now()}`;
    const lessonRef = doc(db, 'lessons', lessonId);
    const now = new Date().toISOString();

    const normalizedSourceType = lesson.sourceType || (lesson.contentType === 'r2_video' ? 'r2_video' : 'youtube');

    const data: Partial<Lesson> = {
      courseId: lesson.courseId,
      title: lesson.title || 'Untitled Lesson',
      description: lesson.description || '',
      sourceType: normalizedSourceType,
      contentType: normalizedSourceType === 'r2_video' ? 'r2_video' : (lesson.contentType || 'youtube'),
      contentUrl: lesson.contentUrl || '',
      r2ObjectKey: lesson.r2ObjectKey || (normalizedSourceType === 'r2_video' ? lesson.contentUrl : ''),
      youtubeId: lesson.youtubeId || '',
      duration: lesson.duration || '',
      order: Number(lesson.order) || 1,
      isFreePreview: Boolean(lesson.isFreePreview),
      isPublished: lesson.isPublished !== undefined ? lesson.isPublished : true,
      updatedAt: now,
    };

    if (!lesson.id) {
      data.createdAt = now;
    }

    await setDoc(lessonRef, data, { merge: true });

    // Update lesson count in course
    const lessons = await getLessonsForCourse(lesson.courseId);
    await updateDoc(doc(db, 'courses', lesson.courseId), {
      lessonCount: lessons.length,
      updatedAt: now,
    });

    return lessonId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'lessons');
  }
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
    const lessons = await getLessonsForCourse(courseId);
    await updateDoc(doc(db, 'courses', courseId), {
      lessonCount: lessons.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `lessons/${lessonId}`);
  }
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getCategories(): Promise<Category[]> {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    const list: Category[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Category);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'categories');
  }
}

export async function saveCategory(cat: Partial<Category> & { id?: string }): Promise<string> {
  try {
    const catId = cat.id || `cat_${Date.now()}`;
    await setDoc(doc(db, 'categories', catId), {
      name: cat.name || 'General',
      slug: (cat.name || 'general').toLowerCase().replace(/\s+/g, '-'),
      description: cat.description || '',
      icon: cat.icon || 'BookOpen',
      courseCount: cat.courseCount || 0,
      isPublished: cat.isPublished !== undefined ? cat.isPublished : true,
    }, { merge: true });
    return catId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'categories');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
  }
}

// ==========================================
// FACULTY / TEACHERS
// ==========================================

export async function getFacultyList(): Promise<Faculty[]> {
  try {
    const snapshot = await getDocs(collection(db, 'faculty'));
    const list: Faculty[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Faculty);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'faculty');
  }
}

export async function saveFaculty(faculty: Partial<Faculty> & { id?: string }): Promise<string> {
  try {
    const facultyId = faculty.id || `faculty_${Date.now()}`;
    await setDoc(doc(db, 'faculty', facultyId), {
      name: faculty.name || '',
      title: faculty.title || 'Senior Instructor',
      bio: faculty.bio || '',
      photoURL: faculty.photoURL || '',
      subject: faculty.subject || 'All Subjects',
      qualification: faculty.qualification || 'M.Tech / M.Sc / Ph.D',
      isPublished: faculty.isPublished !== undefined ? faculty.isPublished : true,
    }, { merge: true });
    return facultyId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'faculty');
  }
}

export async function deleteFaculty(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'faculty', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `faculty/${id}`);
  }
}

// ==========================================
// BATCHES
// ==========================================

export async function getBatches(): Promise<Batch[]> {
  try {
    const snapshot = await getDocs(collection(db, 'batches'));
    const list: Batch[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Batch);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'batches');
  }
}

export async function saveBatch(batch: Partial<Batch> & { id?: string }): Promise<string> {
  try {
    const batchId = batch.id || `batch_${Date.now()}`;
    await setDoc(doc(db, 'batches', batchId), {
      name: batch.name || 'New Batch',
      courseId: batch.courseId || '',
      courseTitle: batch.courseTitle || '',
      startDate: batch.startDate || '',
      endDate: batch.endDate || '',
      schedule: batch.schedule || 'Mon-Fri 6:00 PM IST',
      teacherName: batch.teacherName || 'Aspire Senior Mentor',
      maxStudents: Number(batch.maxStudents) || 100,
      enrolledCount: Number(batch.enrolledCount) || 0,
      isPublished: batch.isPublished !== undefined ? batch.isPublished : true,
      createdAt: batch.createdAt || new Date().toISOString(),
    }, { merge: true });
    return batchId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batches');
  }
}

export async function deleteBatch(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'batches', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `batches/${id}`);
  }
}

// ==========================================
// LEARNING MATERIALS / PDFS
// ==========================================

export async function getMaterialsForCourse(courseId: string): Promise<LearningMaterial[]> {
  try {
    const q = query(collection(db, 'materials'), where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    const list: LearningMaterial[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as LearningMaterial);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'materials');
  }
}

export async function saveMaterial(mat: Partial<LearningMaterial> & { courseId: string; id?: string }): Promise<string> {
  try {
    const matId = mat.id || `mat_${Date.now()}`;
    await setDoc(doc(db, 'materials', matId), {
      courseId: mat.courseId,
      title: mat.title || 'Course Material',
      fileType: mat.fileType || 'PDF',
      fileUrl: mat.fileUrl || '',
      fileSize: mat.fileSize || '2 MB',
      isFreePreview: Boolean(mat.isFreePreview),
      createdAt: mat.createdAt || new Date().toISOString(),
    }, { merge: true });
    return matId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'materials');
  }
}

export async function deleteMaterial(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'materials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `materials/${id}`);
  }
}

// ==========================================
// SITE SETTINGS
// ==========================================

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaultSettings: SiteSettings = {
    academyName: 'Aspire Academy Online',
    tagline: 'Empowering Aspirants with Conceptual Clarity & High-Yield Learning',
    contactEmail: 'contact@aspireacademy.edu',
    contactPhone: '+91 98765 43210',
    address: 'Aspire Learning Hub, Knowledge Park, India',
    announcement: 'Admissions open for 2026 Foundation & Advanced Preparation Batches!',
    heroTitle: 'Master Complex Concepts. Achieve Your Academic Dreams.',
    heroSubtitle: 'Join India\'s leading competitive & academic learning platform. Structured syllabus, live masterclasses, high-yield notes, and comprehensive mock assessments.',
  };

  try {
    const snap = await getDoc(doc(db, 'settings', 'site_settings'));
    if (!snap.exists()) return defaultSettings;
    return { ...defaultSettings, ...snap.data() } as SiteSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'site_settings'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/site_settings');
  }
}
