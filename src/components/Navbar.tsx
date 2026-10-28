import React, { useState } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  BookOpen,
  LayoutDashboard,
  CreditCard,
  ChevronDown,
  FileQuestion,
  Sparkles,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', portal?: 'student' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses (कोर्स)' },
    { id: 'tests', label: '16 Chapter Tests' },
    { id: 'batches', label: 'Batches (बैच)' },
    { id: 'faculty', label: 'Teachers (शिक्षक)' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      {/* Topmost Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
              Notice
            </span>
            <span className="truncate">
              कक्षा 10वीं, 12वीं बोर्ड (BSEB/CBSE) एवं NEET 2026 नए बैच में नामांकन प्रारंभ • By Shekhar Sir
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Helpline: +91 91223 45678</span>
            </span>
            <span>aspireacademyonline.in</span>
          </div>
        </div>
      </div>

      {/* Admin Mode Floating Indicator Banner */}
      {isAdmin && (
        <div className="bg-amber-600 text-white text-xs py-2 px-4 shadow-sm flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-200" />
              <span className="font-bold">Admin Portal Active:</span>
              <span className="text-amber-100 hidden sm:inline">{currentUser?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                  currentTab === 'admin'
                    ? 'bg-white text-amber-900'
                    : 'bg-amber-700 hover:bg-amber-800 text-white'
                }`}
              >
                Open Admin Dashboard
              </button>
              <button
                onClick={() => handleNavClick('home')}
                className="px-2.5 py-1 rounded-lg text-xs bg-amber-700/60 hover:bg-amber-800 text-amber-100"
              >
                View Public Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900">
                    Aspire<span className="text-blue-600">Academy</span>
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 tracking-wider">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">
                  Bihar Board & CBSE Coaching • Founded by Shekhar Sir
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                    currentTab === link.id
                      ? 'text-blue-600 bg-blue-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Dedicated Admin Portal Gateway Button */}
              <button
                onClick={() => handleNavClick('admin')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  currentTab === 'admin'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title="Administrator Control Gateway"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Portal</span>
              </button>

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (userProfile?.name || currentUser.email || 'U').charAt(0)
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                      {userProfile?.name || currentUser.email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">
                          {userProfile?.name || 'Aspire Scholar'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          Role: {userProfile?.role || 'student'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-left font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        Student Dashboard (My Learning)
                      </button>

                      <button
                        onClick={() => handleNavClick('my-courses')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-left font-medium"
                      >
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        My Enrolled Courses
                      </button>

                      <button
                        onClick={() => handleNavClick('orders')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-left font-medium"
                      >
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Fee Receipts & Orders
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleNavClick('admin')}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-amber-800 hover:bg-amber-50 text-left font-bold"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Admin Control Panel
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('login', 'student')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Student Login
                  </button>
                  <button
                    onClick={() => onOpenAuth('register', 'student')}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-102"
                  >
                    Join Free
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => handleNavClick('admin')}
                className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1"
                title="Admin Gateway"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px]">Admin</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <button
                onClick={() => {
                  if (currentUser) {
                    handleNavClick('dashboard');
                  } else {
                    onOpenAuth('login', 'student');
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </button>

              <button
                onClick={() => handleNavClick('admin')}
                className="py-2.5 px-3 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Gateway</span>
              </button>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                    currentTab === link.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-800 truncate">{currentUser.email}</p>
                      <span className="text-[10px] uppercase font-bold text-blue-600">
                        {userProfile?.role || 'student'}
                      </span>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="text-xs font-bold text-red-600 p-1 hover:underline"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login', 'student');
                    }}
                    className="py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register', 'student');
                    }}
                    className="py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white text-center shadow-md shadow-blue-500/20"
                  >
                    Join Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
