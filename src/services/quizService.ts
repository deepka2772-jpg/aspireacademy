import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Quiz, QuizAttempt } from '../types';

export async function getQuizzesForCourse(courseId: string): Promise<Quiz[]> {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('courseId', '==', courseId),
      where('isPublished', '==', true)
    );
    const snapshot = await getDocs(q);
    const list: Quiz[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Quiz);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
  }
}

export async function getAllQuizzesAdmin(): Promise<Quiz[]> {
  try {
    const snapshot = await getDocs(collection(db, 'quizzes'));
    const list: Quiz[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Quiz);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
  }
}

export async function saveQuiz(quiz: Partial<Quiz> & { id?: string }): Promise<string> {
  try {
    const quizId = quiz.id || `quiz_${Date.now()}`;
    await setDoc(doc(db, 'quizzes', quizId), {
      courseId: quiz.courseId || '',
      lessonId: quiz.lessonId || '',
      title: quiz.title || 'Course Quiz',
      instructions: quiz.instructions || 'Answer all questions. You must score 50% or more to pass.',
      passingPercentage: Number(quiz.passingPercentage) || 50,
      timeLimitMinutes: Number(quiz.timeLimitMinutes) || 15,
      questions: quiz.questions || [],
      isPublished: quiz.isPublished !== undefined ? quiz.isPublished : true,
      createdAt: quiz.createdAt || new Date().toISOString(),
    }, { merge: true });
    return quizId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'quizzes');
  }
}

export async function deleteQuiz(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'quizzes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `quizzes/${id}`);
  }
}

export async function submitQuizAttempt(
  quiz: Quiz,
  userId: string,
  userAnswers: Record<string, number>
): Promise<QuizAttempt> {
  try {
    let score = 0;
    let totalMarks = 0;

    quiz.questions.forEach((q) => {
      const markValue = q.marks || 1;
      totalMarks += markValue;
      if (q.correctAnswerIndex !== undefined && userAnswers[q.id] === q.correctAnswerIndex) {
        score += markValue;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= (quiz.passingPercentage || 50);

    const attemptId = `attempt_${Date.now()}_${userId.slice(0, 6)}`;
    const attempt: QuizAttempt = {
      id: attemptId,
      quizId: quiz.id,
      userId,
      courseId: quiz.courseId,
      score,
      totalMarks,
      percentage,
      passed,
      answers: userAnswers,
      completedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'quizAttempts', attemptId), attempt);
    return attempt;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'quizAttempts');
  }
}

export async function getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  try {
    const q = query(collection(db, 'quizAttempts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: QuizAttempt[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as QuizAttempt);
    });
    return list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizAttempts');
  }
}
