import React from 'react';
import { BookOpen, Clock, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  isEnrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, isEnrolled }) => {
  return (
    <div
      onClick={() => onSelect(course)}
      className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
            {course.category}
          </span>
        </div>

        {/* Status / Price Badge */}
        <div className="absolute top-3 right-3">
          {course.isFree ? (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-500 text-white shadow-sm">
              FREE
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600 text-white shadow-sm">
              ₹{course.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {isEnrolled && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enrolled
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {course.targetClass || 'All Levels'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              {course.facultyName}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {course.title}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {course.shortDescription}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              {course.lessonCount || 0} Lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {course.duration || 'Self-paced'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {course.isFree ? (
                <span className="text-sm font-extrabold text-emerald-600">Free Access</span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-900">
                    ₹{course.price.toLocaleString('en-IN')}
                  </span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{course.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(course);
              }}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isEnrolled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20'
              }`}
            >
              {isEnrolled ? 'Open Player' : 'View Course'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
