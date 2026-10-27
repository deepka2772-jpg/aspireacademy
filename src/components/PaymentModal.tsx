import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Course, Order, Enrollment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  checkPaymentConfig,
  createRazorpayOrder,
  verifyPaymentSignature,
  recordVerifiedPurchase,
  PaymentConfigResponse,
} from '../services/orderService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (enrollment: Enrollment, order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  course,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [config, setConfig] = useState<PaymentConfigResponse | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ order: Order; enrollment: Enrollment } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSuccessResult(null);
    setError(null);
    setLoadingConfig(true);

    checkPaymentConfig()
      .then((res) => {
        setConfig(res);
      })
      .catch(() => {
        setConfig({
          configured: false,
          keyId: null,
          currency: 'INR',
          message: 'Could not fetch payment gateway status.',
        });
      })
      .finally(() => setLoadingConfig(false));
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    if (!currentUser) return;
    setError(null);
    setProcessing(true);

    try {
      if (!config?.configured || !config.keyId) {
        throw new Error(
          'Razorpay payment gateway credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not yet configured in the environment settings. Please configure credentials to accept real transactions.'
        );
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay secure checkout script. Please check your internet connection.');
      }

      // Step 1 & 2: Server creates Razorpay Order with verified amount from backend
      const orderData = await createRazorpayOrder(
        course,
        currentUser.uid,
        currentUser.email || userProfile?.email || ''
      );

      // Step 3: Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Aspire Academy Online',
        description: `Enrollment in ${course.title.slice(0, 40)}`,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
        order_id: orderData.orderId,
        prefill: {
          name: userProfile?.name || currentUser.displayName || '',
          email: currentUser.email || userProfile?.email || '',
        },
        theme: {
          color: '#1d4ed8', // Royal Blue
        },
        handler: async (response: any) => {
          try {
            setProcessing(true);
            // Step 4: Secure Server-side Signature Verification
            const verifyResult = await verifyPaymentSignature(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyResult.verified) {
              // Step 5: Persist verified order & enrollment in Firestore
              const result = await recordVerifiedPurchase(
                orderData.orderId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                course,
                currentUser.uid,
                currentUser.email || ''
              );

              setSuccessResult(result);
              onPaymentSuccess(result.enrollment, result.order);
            }
          } catch (verifyErr: any) {
            setError(verifyErr.message || 'Payment signature could not be verified by the server.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failResponse: any) => {
        console.error('Payment failed:', failResponse.error);
        setError(`Payment failed: ${failResponse.error?.description || 'Transaction declined.'}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successResult ? (
          // Success Receipt Screen
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Payment & Enrollment Verified!</h3>
            <p className="text-sm text-slate-600 mt-2">
              Your payment of <strong className="text-slate-900">₹{course.price.toLocaleString('en-IN')}</strong> has been confirmed and verified on the server.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[220px]">{course.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono text-slate-700">{successResult.order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono text-slate-700">{successResult.order.razorpayPaymentId || 'Verified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access:</span>
                <span className="font-bold text-emerald-700">Lifetime Full Access Active</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
              }}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Go to Learning Player
            </button>
          </div>
        ) : (
          // Checkout Form
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Course Checkout</h3>
                <p className="text-xs text-slate-500">Secure Indian Payment Gateway via Razorpay</p>
              </div>
            </div>

            {/* Course Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5">
              <div className="flex gap-3">
                <img
                  src={course.thumbnail}
                  alt=""
                  className="w-16 h-12 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{course.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{course.facultyName} • {course.lessonCount} Lessons</p>
                  <p className="text-xs font-black text-blue-700 mt-1">₹{course.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Configuration Status Notice */}
            {!loadingConfig && !config?.configured && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Razorpay Credentials Required</span>
                </div>
                <p className="text-amber-700 leading-relaxed">
                  To process live card, UPI, and NetBanking transactions, the administrator must configure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">RAZORPAY_KEY_ID</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">RAZORPAY_KEY_SECRET</code> in the project's environment variables.
                </p>
                <div className="pt-1">
                  <a
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                  >
                    Generate API Keys on Razorpay Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 text-xs text-slate-600 mb-6 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Course Tuition</span>
                <span className="font-semibold text-slate-800">₹{course.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Online Learning Resources & Player Access</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Processing</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-blue-700">₹{course.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleInitiatePayment}
              disabled={processing || loadingConfig}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Transaction...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{course.price.toLocaleString('en-IN')} & Unlock Full Course</span>
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit encrypted secure payment with instant verification</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
