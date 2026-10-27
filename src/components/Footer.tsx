import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, ShieldCheck, HelpCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Aspire<span className="text-blue-400">Academy</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering students with deep conceptual clarity, rigorous scientific problem-solving, structured syllabus pathways, and continuous mentorship.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <p>Registration: [Academy Trust/LLP ID Placeholder - Managed in Settings]</p>
              <p>Affiliation & Recognition: Online Learning Portal</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Academics</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-blue-400 transition-colors">
                  Explore All Courses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-blue-400 transition-colors">
                  Course Categories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('batches')} className="hover:text-blue-400 transition-colors">
                  Live & Upcoming Batches
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faculty')} className="hover:text-blue-400 transition-colors">
                  Faculty & Mentors
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Academy</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition-colors">
                  About Aspire Academy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-blue-400 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition-colors">
                  Contact & Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-blue-400 transition-colors">
                  Student Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support & Office</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Aspire Learning Hub, Knowledge Park, India [Owner Address Placeholder]</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@aspireacademy.edu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Student Desk: Mon - Sat 9AM - 7PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Policy Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Aspire Academy Online. All rights reserved.</p>
          <div className="flex items-center flex-wrap gap-6">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </button>
            <button onClick={() => onNavigate('refund')} className="hover:text-slate-300 transition-colors">
              Refund & Cancellation Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
