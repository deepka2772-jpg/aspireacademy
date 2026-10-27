import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Quiz, QuizAttempt } from '../types';
import { getAllQuizzesAdmin, submitQuizAttempt } from '../services/quizService';
import { useAuth } from '../context/AuthContext';

export const TestSeriesPage: React.FC<{
  onOpenAuth: (mode?: 'login' | 'register', portal?: 'student' | 'admin') => void;
}> = ({ onOpenAuth }) => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Test State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    getAllQuizzesAdmin()
      .then((data) => {
        setQuizzes(data.filter((q) => q.isPublished));
      })
      .catch((err) => console.error('Failed to load quizzes:', err))
      .finally(() => setLoading(false));
  }, []);

  // Timer countdown for active test
  useEffect(() => {
    if (!activeQuiz || testSubmitted) return;

    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuiz, timeLeft, testSubmitted]);

  const handleStartTest = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIdx(0);
    setSelectedAnswers({});
    setTimeLeft((quiz.timeLimitMinutes || 10) * 60);
    setTestSubmitted(false);
    setTestResult(null);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleFinalSubmit = async () => {
    if (!activeQuiz || testSubmitted) return;
    setTestSubmitted(true);

    let score = 0;
    let totalMarks = 0;

    activeQuiz.questions.forEach((q) => {
      const markValue = q.marks || 2;
      totalMarks += markValue;
      if (q.correctAnswerIndex !== undefined && selectedAnswers[q.id] === q.correctAnswerIndex) {
        score += markValue;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= (activeQuiz.passingPercentage || 50);

    setTestResult({
      score,
      totalMarks,
      percentage,
      passed,
    });

    if (currentUser) {
      try {
        await submitQuizAttempt(activeQuiz, currentUser.uid, selectedAnswers);
      } catch (err) {
        console.error('Failed to save quiz attempt:', err);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>BSEB & CBSE Free Chapter Test Series</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          कक्षा 10वीं एवं 12वीं: 16 Chapter Test Series
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Aspire Academy का आधिकारिक टेस्ट पोर्टल। शेखर सर द्वारा तैयार किए गए अध्यायवार वस्तुनिष्ठ (MCQ) टेस्ट दें और तुरंत अपना स्कोरकार्ड देखें।
        </p>
      </div>

      {/* ACTIVE TEST RUNNER */}
      {activeQuiz && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-300 shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95">
          {/* Test Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Active Assessment
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{activeQuiz.title}</h2>
            </div>
            {!testSubmitted && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold text-sm shrink-0">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Test Result Display */}
          {testSubmitted && testResult ? (
            <div className="py-8 text-center space-y-6">
              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg ${
                  testResult.passed
                    ? 'bg-emerald-100 text-emerald-600 border-4 border-emerald-500/20'
                    : 'bg-amber-100 text-amber-600 border-4 border-amber-500/20'
                }`}
              >
                {testResult.passed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {testResult.passed ? 'शानदार प्रदर्शन! (Congratulations!)' : 'अभ्यास जारी रखें! (Keep Practicing)'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  आपने {testResult.totalMarks} में से {testResult.score} अंक प्राप्त किए हैं ({testResult.percentage}%).
                </p>
              </div>

              {/* Scorecard metrics */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-xs text-slate-400 block">Score</span>
                  <span className="font-black text-lg text-slate-900">
                    {testResult.score}/{testResult.totalMarks}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Percentage</span>
                  <span className="font-black text-lg text-blue-600">{testResult.percentage}%</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Result</span>
                  <span
                    className={`font-black text-sm uppercase px-2 py-0.5 rounded ${
                      testResult.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {testResult.passed ? 'Pass' : 'Need Work'}
                  </span>
                </div>
              </div>

              {/* Question review */}
              <div className="text-left space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Question Review & Answers (समीक्षा):
                </h4>
                {activeQuiz.questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctAnswerIndex;
                  return (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs font-bold text-slate-900">
                          {idx + 1}. {q.question}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isOptCorrect = optIdx === q.correctAnswerIndex;
                          const isOptUser = optIdx === userAns;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-xl border text-xs ${
                                isOptCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : isOptUser
                                  ? 'bg-red-50 border-red-300 text-red-800'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span>{opt}</span>
                              {isOptCorrect && <span className="ml-1 text-emerald-600">✓ Correct</span>}
                              {isOptUser && !isOptCorrect && <span className="ml-1 text-red-600">✗ Your Choice</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => handleStartTest(activeQuiz)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Re-take Test</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Close & Back to List
                </button>
              </div>
            </div>
          ) : (
            /* Active Question View */
            <div className="py-6 space-y-6">
              {activeQuiz.questions.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700">
                      Question {currentQIdx + 1} of {activeQuiz.questions.length}
                    </span>
                    <span>Marks: {activeQuiz.questions[currentQIdx].marks || 2} Points</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeQuiz.questions[currentQIdx].question}
                  </h3>

                  <div className="space-y-2.5">
                    {activeQuiz.questions[currentQIdx].options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[activeQuiz.questions[currentQIdx].id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(activeQuiz.questions[currentQIdx].id, optIdx)}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={currentQIdx === 0}
                      onClick={() => setCurrentQIdx((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {currentQIdx < activeQuiz.questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQIdx((prev) => prev + 1)}
                        className="px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinalSubmit}
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* QUIZ LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Chapter Test
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{quiz.timeLimitMinutes || 10} Mins</span>
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{quiz.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{quiz.instructions}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {quiz.questions?.length || 4} Questions
              </span>
              <button
                onClick={() => handleStartTest(quiz)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
              >
                <span>Take Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
