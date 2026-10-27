import React from 'react';
import { Home, BookOpen, PlayCircle, Calendar, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenAuth,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => onNavigate('home'),
      isActive: currentTab === 'home',
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
      action: () => onNavigate('courses'),
      isActive: currentTab === 'courses' || currentTab === 'course-details',
    },
    {
      id: 'learning',
      label: 'My Learning',
      icon: PlayCircle,
      action: () => {
        if (!currentUser) {
          onOpenAuth();
        } else {
          onNavigate('my-courses');
        }
      },
      isActive: currentTab === 'my-courses' || currentTab === 'learning-player',
    },
    {
      id: 'batches',
      label: 'Batches',
      icon: Calendar,
      action: () => onNavigate('batches'),
      isActive: currentTab === 'batches',
    },
    {
      id: 'account',
      label: isAdmin ? 'Admin' : currentUser ? 'Profile' : 'Sign In',
      icon: isAdmin ? ShieldAlert : User,
      action: () => {
        if (isAdmin) {
          onNavigate('admin');
        } else if (currentUser) {
          onNavigate('dashboard');
        } else {
          onOpenAuth();
        }
      },
      isActive: currentTab === 'admin' || currentTab === 'dashboard' || currentTab === 'orders',
      isHighlight: isAdmin,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                active
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`}
                />
                {item.isHighlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 line-clamp-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
