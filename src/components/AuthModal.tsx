import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Shield, GraduationCap, Zap, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth, DEFAULT_MASTER_ADMIN_PASSWORD } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  initialPortal?: 'student' | 'admin';
  onClose: () => void;
  onSuccess?: (portal: 'student' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  initialPortal = 'student',
  onClose,
  onSuccess,
}) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginMasterAdmin,
    quickAdminLogin,
    quickStudentLogin,
    resetPassword,
  } = useAuth();

  const [portal, setPortal] = useState<'student' | 'admin'>(initialPortal);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminMasterKey, setAdminMasterKey] = useState(DEFAULT_MASTER_ADMIN_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setPortal(initialPortal);
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
    if (initialPortal === 'admin') {
      setAdminMasterKey(DEFAULT_MASTER_ADMIN_PASSWORD);
      setEmail('admin@aspireacademyonline.in');
      setPassword(DEFAULT_MASTER_ADMIN_PASSWORD);
    } else {
      setEmail('');
      setPassword('');
    }
  }, [initialPortal, initialMode, isOpen]);

  if (!isOpen) return null;

  const handlePortalSwitch = (p: 'student' | 'admin') => {
    setError(null);
    setSuccessMessage(null);
    setPortal(p);
    if (p === 'admin') {
      setAdminMasterKey(DEFAULT_MASTER_ADMIN_PASSWORD);
      setEmail('admin@aspireacademyonline.in');
      setPassword(DEFAULT_MASTER_ADMIN_PASSWORD);
      setMode('login');
    } else {
      setEmail('');
      setPassword('');
      setMode('login');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
      if (onSuccess) onSuccess(portal);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Use email & password below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMasterAdminSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginMasterAdmin(adminMasterKey);
      setSuccessMessage('Master Admin Access Granted!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess('admin');
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Invalid Master Admin Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setError(null);
    setLoading(true);
    try {
      await quickAdminLogin();
      setSuccessMessage('Welcome Shekhar Sir!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess('admin');
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as Administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudent = async () => {
    setError(null);
    setLoading(true);
    try {
      await quickStudentLogin();
      setSuccessMessage('Welcome Aarav Sharma!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess('student');
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as Student.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // If admin portal, submit master password
    if (portal === 'admin') {
      await handleMasterAdminSignIn(e);
      return;
    }

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent to your email inbox.');
      } catch (err: any) {
        setError(err.message || 'Could not send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await registerWithEmail(name, email, password);
        setSuccessMessage('Student account created successfully!');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess(portal);
        }, 300);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError('An account with this email address already exists. Please sign in instead.');
        } else if (err.code === 'auth/weak-password') {
          setError('The password is too weak. Please use a stronger password.');
        } else {
          setError(err.message || 'Registration failed.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login mode
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      setSuccessMessage('Signed in successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(portal);
      }, 300);
    } catch (err: any) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Invalid email or password. Please verify or click Register if you are new.');
      } else {
        setError(err.message || 'Sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Portal Segmented Selector */}
        <div className="mb-6 p-1 bg-slate-100 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePortalSwitch('student')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              portal === 'student'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              portal === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Gateway</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          {portal === 'admin' ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3 shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Master Admin Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Independent Master Access — Works everywhere on Render, Hostinger & any domain.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'login' && 'Welcome Back, Student'}
                {mode === 'register' && 'Create Your Student Account'}
                {mode === 'forgot' && 'Reset Your Password'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login' && 'Sign in to access your enrolled courses, tests & video lectures.'}
                {mode === 'register' && 'Join Aspire Academy Online to start mastering your syllabus.'}
                {mode === 'forgot' && 'Enter your email to receive a password reset link.'}
              </p>
            </>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Attention</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ADMIN PORTAL INTERFACE */}
        {portal === 'admin' ? (
          <div className="space-y-4">
            <form onSubmit={handleMasterAdminSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Master Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter Master Admin Password"
                    value={adminMasterKey}
                    onChange={(e) => setAdminMasterKey(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono bg-amber-50/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Default: <code className="font-bold text-amber-800 bg-amber-100 px-1 py-0.5 rounded">AspireAdmin@2026</code></span>
                  <span className="text-emerald-700 font-medium">Ready for Hostinger</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Enter Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-3 text-slate-400 font-bold">Or 1-Click Fast Access</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickAdmin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Instant Admin Sign In</span>
            </button>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
              <p className="font-bold text-slate-700">🔒 Independent Account Shift Friendly:</p>
              <p>
                This admin gateway does not rely on any specific Google Gmail or authorized Firebase domain. You can shift this repository to another GitHub account and deploy to Hostinger with complete freedom!
              </p>
            </div>
          </div>
        ) : (
          /* STUDENT PORTAL INTERFACE */
          <div className="space-y-4">
            {mode !== 'forgot' && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickStudent}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Demo Student Access (Aarav Sharma)</span>
                </button>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                  <span className="font-bold text-amber-950 block">💡 Gmail se Direct Login:</span>
                  <span>Google popup me unauthorized domain error aane par neeche apna <strong>Gmail</strong> aur <strong>Password</strong> likh kar direct Sign In / Register karein — account turant khul jayega!</span>
                </div>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-white px-3 text-slate-400 font-bold">Or Email & Password</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In as Student'}
                      {mode === 'register' && 'Create Student Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Mode Switcher for Student */}
            <div className="mt-4 text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
              {mode === 'login' && (
                <p>
                  Don't have a student account?{' '}
                  <button
                    onClick={() => {
                      setError(null);
                      setMode('register');
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Register free now
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setError(null);
                      setMode('login');
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Sign In here
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <p>
                  Remembered your password?{' '}
                  <button
                    onClick={() => {
                      setError(null);
                      setMode('login');
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Back to Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
