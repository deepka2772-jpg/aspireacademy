import React, { useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Course, Category } from '../types';
import { CourseCard } from '../components/CourseCard';

interface ExploreCoursesPageProps {
  courses: Course[];
  categories: Category[];
  enrolledCourseIds: string[];
  onSelectCourse: (course: Course) => void;
}

export const ExploreCoursesPage: React.FC<ExploreCoursesPageProps> = ({
  courses,
  categories,
  enrolledCourseIds,
  onSelectCourse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Filter published courses only
  const filteredCourses = courses.filter((c) => {
    if (!c.isPublished) return false;
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (filterType === 'free' && !c.isFree) return false;
    if (filterType === 'paid' && c.isFree) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.shortDescription?.toLowerCase().includes(q);
      const matchFaculty = c.facultyName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchFaculty) return false;
    }
    return true;
  });

  // Sort
  filteredCourses.sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Courses & Masterclasses</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Dive into comprehensive conceptual physics, pure and applied mathematics, chemistry mechanics, and competitive exam tracks.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Pricing filter */}
          <div className="md:col-span-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
            >
              <option value="all">All Courses (Free & Paid)</option>
              <option value="free">Free Starter Primers</option>
              <option value="paid">Comprehensive Paid Courses</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
            >
              <option value="newest">Sort by: Newest Releases</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching courses found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to see our full catalogue.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setFilterType('all');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
              isEnrolled={enrolledCourseIds.includes(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
