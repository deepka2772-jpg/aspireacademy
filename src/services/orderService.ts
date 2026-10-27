import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Order, Course, Enrollment } from '../types';
import { getEnrollmentDocId } from './enrollmentService';

export interface PaymentConfigResponse {
  configured: boolean;
  keyId: string | null;
  currency: string;
  message: string;
}

export async function checkPaymentConfig(): Promise<PaymentConfigResponse> {
  try {
    const res = await fetch('/api/payments/config');
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      keyId: null,
      currency: 'INR',
      message: 'Failed to contact payment configuration endpoint.',
    };
  }
}

export async function createRazorpayOrder(course: Course, userId: string, userEmail: string) {
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price,
      userId,
      userEmail,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to initialize payment order');
  }
  return data;
}

export async function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.verified) {
    throw new Error(data.error || 'Payment signature verification failed.');
  }
  return data;
}

export async function recordVerifiedPurchase(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  course: Course,
  userId: string,
  userEmail: string
): Promise<{ order: Order; enrollment: Enrollment }> {
  try {
    const now = new Date().toISOString();
    const orderDocId = `order_${Date.now()}_${userId.slice(0, 6)}`;

    const orderData: Order = {
      id: orderDocId,
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      userId,
      userEmail,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price,
      currency: 'INR',
      status: 'paid',
      createdAt: now,
      paidAt: now,
    };

    // Save order in Firestore
    await setDoc(doc(db, 'orders', orderDocId), orderData);

    // Persist verified enrollment in Firestore
    const enrollmentDocId = getEnrollmentDocId(userId, course.id);
    const enrollmentData: Enrollment = {
      id: enrollmentDocId,
      userId,
      courseId: course.id,
      courseTitle: course.title,
      courseThumbnail: course.thumbnail || '',
      enrolledAt: now,
      status: 'active',
      progress: {
        completedLessonIds: [],
        percentage: 0,
        updatedAt: now,
      },
    };

    await setDoc(doc(db, 'enrollments', enrollmentDocId), enrollmentData);

    return { order: orderData, enrollment: enrollmentData };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'orders/enrollments');
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const list: Order[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function getAllOrdersAdmin(): Promise<Order[]> {
  try {
    const snapshot = await getDocs(collection(db, 'orders'));
    const list: Order[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}
