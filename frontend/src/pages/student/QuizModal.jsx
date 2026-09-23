import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, HelpCircle, Trophy, RotateCcw, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';

export default function QuizModal({ chapter, note, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [chapter, note]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      let res;
      if (note) {
        res = await api.get(`/library/modules/${note.id}/quiz`);
      } else if (chapter) {
        res = await api.get(`/library/chapters/${chapter.id}/quiz`);
      }

      if (res && res.success) {
        const qList = res.data?.questions || (Array.isArray(res.data) ? res.data : []);
        setQuestions(qList);
      }
    } catch (e) {
      console.error('Quiz loading failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    if (submitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(userAnswers).map(([qid, opt]) => ({
        question_id: Number(qid),
        selected_option: opt,
      }));

      let res;
      if (note) {
        res = await api.post(`/library/modules/${note.id}/submit`, { answers: answersPayload });
      } else if (chapter) {
        res = await api.post(`/library/chapters/${chapter.id}/submit`, { answers: answersPayload });
      }

      setSubmitted(true);
      if (res && res.success) {
        setResult(res.data || res);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // Compute local fallback if submission returns custom format
        calculateLocalScore();
      }
    } catch (e) {
      calculateLocalScore();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateLocalScore = () => {
    let score = 0;
    questions.forEach(q => {
      const userChoice = userAnswers[q.id];
      if (userChoice && q.correct_option && userChoice.toLowerCase() === q.correct_option.toLowerCase()) {
        score++;
      }
    });
    setResult({
      score,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((score / questions.length) * 100) : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {note ? `Quiz: ${note.title}` : `Chapter Quiz: ${chapter?.title}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {questions.length} Multiple-Choice Questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Loading quiz questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No questions found for this topic yet.
            </div>
          ) : (
            <>
              {/* Score Banner when submitted */}
              {submitted && result && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-indigo-950 dark:text-indigo-200">
                        Quiz Completed!
                      </h4>
                      <p className="text-indigo-800 dark:text-indigo-300">
                        You scored <strong className="font-bold">{result.score ?? result.correct_count ?? 0}</strong> out of {result.total ?? questions.length} questions ({result.percentage ?? Math.round(((result.score || 0) / questions.length) * 100)}%)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSubmitted(false); setUserAnswers({}); setResult(null); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const selectedOpt = userAnswers[q.id];
                  const options = [
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].filter(o => o.text);

                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-3">
                        {idx + 1}. {q.question || q.question_text}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {options.map((opt) => {
                          const isSelected = selectedOpt === opt.key;
                          const isCorrect = q.correct_option?.toUpperCase() === opt.key.toUpperCase();
                          
                          let optStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                          if (submitted) {
                            if (isCorrect) {
                              optStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              optStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm';
                          }

                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.key)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${optStyle}`}
                            >
                              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {opt.key}
                              </span>
                              <span className="text-xs">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {submitted && q.explanation && (
                        <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-[11px]">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {Object.keys(userAnswers).length} of {questions.length} answered
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
            {!submitted && questions.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(userAnswers).length === 0}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {submitting ? 'Evaluating...' : 'Submit Answers'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
