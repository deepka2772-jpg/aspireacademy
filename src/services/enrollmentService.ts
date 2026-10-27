import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Enrollment, Course } from '../types';

export function getEnrollmentDocId(userId: string, courseId: string): string {
  return `${userId}_${courseId}`;
}

export async function checkIsEnrolled(userId: string, courseId: string): Promise<boolean> {
  if (!userId || !courseId) return false;
  try {
    const docId = getEnrollmentDocId(userId, courseId);
    const snap = await getDoc(doc(db, 'enrollments', docId));
    return snap.exists() && snap.data()?.status === 'active';
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `enrollments/${userId}_${courseId}`);
  }
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const list: Enrollment[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Enrollment);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'enrollments');
  }
}

export async function enrollInFreeCourse(userId: string, course: Course): Promise<Enrollment> {
  if (!userId || !course) throw new Error('User and course are required');
  try {
    const docId = getEnrollmentDocId(userId, course.id);
    const existing = await getDoc(doc(db, 'enrollments', docId));
    if (existing.exists() && existing.data()?.status === 'active') {
      return { id: existing.id, ...existing.data() } as Enrollment;
    }

    const enrollmentData: Enrollment = {
      id: docId,
      userId,
      courseId: course.id,
      courseTitle: course.title,
      courseThumbnail: course.thumbnail || '',
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progress: {
        completedLessonIds: [],
        percentage: 0,
        updatedAt: new Date().toISOString(),
      },
    };

    await setDoc(doc(db, 'enrollments', docId), enrollmentData);
    return enrollmentData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'enrollments');
  }
}

export async function updateLessonProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  totalLessons: number,
  markCompleted: boolean
): Promise<void> {
  try {
    const docId = getEnrollmentDocId(userId, courseId);
    const docRef = doc(db, 'enrollments', docId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return;
    const currentEnrollment = snap.data() as Enrollment;
    let completed = currentEnrollment.progress?.completedLessonIds || [];

    if (markCompleted) {
      if (!completed.includes(lessonId)) {
        completed = [...completed, lessonId];
      }
    } else {
      completed = completed.filter((id) => id !== lessonId);
    }

    const percentage = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0;

    await updateDoc(docRef, {
      'progress.completedLessonIds': completed,
      'progress.lastLessonId': lessonId,
      'progress.percentage': Math.min(100, Math.max(0, percentage)),
      'progress.updatedAt': new Date().toISOString(),
      status: percentage >= 100 ? 'completed' : 'active',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `enrollments/${userId}_${courseId}`);
  }
}
