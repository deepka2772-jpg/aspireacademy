import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  HelpCircle,
  Shield,
  FileText,
  Clock,
  Award,
  Users,
  Compass,
  BookOpen,
} from 'lucide-react';
import { Category, Faculty } from '../types';

// ==========================================
// ABOUT US PAGE
// ==========================================
export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          About Aspire Academy
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Nurturing Analytical Minds with Conceptual Clarity
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Aspire Academy Online was founded with a singular mission: to democratize high-yield, structured science and competitive education. We reject rote memorization in favor of first-principles intuition, systematic problem decomposition, and continuous student mentorship.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Pedagogy</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every lecture breaks down challenging concepts into visual intuitions before stepping into rigorous mathematical derivations and past-exam problem sets.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Rigorous Quality</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Curated by seasoned academicians and competitive rank-holders. Each syllabus module is backed by comprehensive handbooks, worksheets, and timed diagnostics.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Student First</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We provide seamless student dashboards, transparent progress metrics, accessible video playback across mobile devices, and active doubt resolution.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CONTACT US PAGE
// ==========================================
export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl font-black text-slate-900">Contact Student Support & Admissions</h1>
        <p className="text-sm text-slate-600">
          Have questions about courses, admissions, or schedules? Our academic counseling desk is here to guide you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Info Card */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Aspire Academy Academic Office</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Reach out for enrollment inquiries, technical assistance with video player access, or institutional cohort bookings.
            </p>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>Aspire Learning Hub, Knowledge Park, India [Office Address Placeholder]</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <span>contact@aspireacademy.edu</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Monday – Saturday: 9:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400">
            Note: All official fee receipts and admissions confirmations are issued through verified Razorpay invoices and recorded in your student dashboard.
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Inquiry Received</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, {name}! Our student counselor will get back to you at {email} within 24 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Send an Academic Inquiry</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message / Question *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us which course or cohort you are inquiring about..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// FAQ ACCORDION PAGE
// ==========================================
export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I access course video lectures once enrolled?',
      a: 'Immediately upon enrolling (either in a free course or by completing payment for a paid course), the course is linked to your account in Cloud Firestore. You can launch the Course Learning Player anytime from "My Courses" on desktop, tablet, or mobile.',
    },
    {
      q: 'Are the payments on Aspire Academy Online secure?',
      a: 'Yes. All online card, UPI, and netbanking transactions are processed through Razorpay with 256-bit SSL encryption. Every payment is cryptographically verified on our backend servers before any course access is unlocked.',
    },
    {
      q: 'Can I watch lessons multiple times?',
      a: 'Yes! Enrolled students enjoy unlimited, lifetime access to all lectures, syllabus worksheets, notes, and interactive quizzes in their registered courses.',
    },
    {
      q: 'What is the format of practice quizzes?',
      a: 'Our quizzes feature timed multiple-choice assessments designed to test conceptual clarity and problem-solving speed. Results, percentage scores, and correct explanations are calculated and stored in your profile.',
    },
    {
      q: 'Can I preview lessons before buying a paid course?',
      a: 'Yes. Look for lessons marked with the green "Free Preview" badge. These allow prospective students to inspect the mentor\'s teaching pedagogy and video quality before making a purchase.',
    },
    {
      q: 'What should I do if a transaction fails or is pending?',
      a: 'If money was deducted during a bank outage, Razorpay automatically resolves or refunds transactions within 3-5 banking days. You can also view real-time payment states in your "Orders & Payment History" tab.',
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Help & Answers
        </span>
        <h1 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-600">
          Everything you need to know about enrollments, player access, and online assessments.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4"
            >
              <span>{faq.q}</span>
              <span className="text-blue-600 text-xl font-mono shrink-0">
                {openIndex === idx ? '−' : '+'}
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// LEGAL POLICIES (Privacy, Terms, Refund)
// ==========================================
export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Privacy Policy</h1>
      </div>
      <p className="text-xs text-slate-400">Effective Date: October 2026</p>
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
        <p>
          At <strong>Aspire Academy Online</strong>, we take the confidentiality and security of our students' data with utmost seriousness. This Privacy Policy details how we collect, store, and protect your information.
        </p>
        <h4 className="font-bold text-slate-900 text-sm">1. Information We Collect</h4>
        <p>
          We collect account information including name, email address, profile photos (when authenticated via Google), course progress, and quiz submission attempts. Payment details (card numbers, UPI IDs) are processed securely by Razorpay and are never stored on our servers.
        </p>
        <h4 className="font-bold text-slate-900 text-sm">2. Cloud Firestore & Rule Enforcement</h4>
        <p>
          Your profile and enrollments are stored in Cloud Firestore guarded by strict attribute-based security rules. Only you and authorized platform administrators can access your order receipts and test submissions.
        </p>
        <h4 className="font-bold text-slate-900 text-sm">3. Contact</h4>
        <p>
          For privacy inquiries or deletion requests, contact privacy@aspireacademy.edu.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Terms & Conditions</h1>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
        <h4 className="font-bold text-slate-900 text-sm">1. Acceptance of Terms</h4>
        <p>
          By creating an account or accessing learning materials on Aspire Academy Online, you agree to comply with these terms of service.
        </p>
        <h4 className="font-bold text-slate-900 text-sm">2. Course Access & Intellectual Property</h4>
        <p>
          All video lectures, PDF notes, problem sets, and diagnostic tests are proprietary educational content belonging to Aspire Academy Online and its faculty. Content is licensed for individual, non-commercial educational use only.
        </p>
        <h4 className="font-bold text-slate-900 text-sm">3. Student Conduct</h4>
        <p>
          Students agree to maintain academic integrity and refrain from attempting unauthorized scraping, screen-capturing distribution, or credential sharing.
        </p>
      </div>
    </div>
  );
};

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Refund & Cancellation Policy</h1>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
        <h4 className="font-bold text-slate-900 text-sm">1. Free Previews</h4>
        <p>
          To ensure every student makes an informed decision, we provide free preview lectures and comprehensive syllabus outlines for every course. We encourage students to review these sample lectures before purchasing.
        </p>
        <h4 className="font-bold text-slate-900 text-sm">2. 7-Day Academic Satisfaction Window</h4>
        <p>
          If you purchase a course and find that it does not meet the promised syllabus scope, you may request a refund within 7 days of purchase, provided less than 25% of the course lectures have been consumed.
        </p>
        <h4 className="font-bold text-slate-900 text-sm">3. Processing Refunds</h4>
        <p>
          Approved refunds are processed back to the original payment method via Razorpay within 5-7 working days.
        </p>
      </div>
    </div>
  );
};
