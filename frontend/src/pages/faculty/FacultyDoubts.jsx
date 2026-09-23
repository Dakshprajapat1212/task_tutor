import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, MessageSquare, Send, Clock, User } from 'lucide-react';
import api from '../../services/api';

export default function FacultyDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadDoubts();
  }, []);

  const loadDoubts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faculty/doubts');
      if (res.success && Array.isArray(res.data)) {
        setDoubts(res.data);
      } else {
        setDoubts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e, doubtId) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/faculty/doubts/${doubtId}`, {
        answer: answerText,
      });

      if (res.success) {
        setFeedback('Answer submitted to student!');
        setAnsweringId(null);
        setAnswerText('');
        loadDoubts();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      setFeedback('Error answering doubt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <span>Student Doubts & Inquiries</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Review and resolve questions asked by students across your subjects.
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {feedback}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4">
          All Student Inquiries ({doubts.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student doubts...</div>
        ) : doubts.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
            No doubts waiting for response right now!
          </div>
        ) : (
          <div className="space-y-4">
            {doubts.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Question #{d.id}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {d.question}
                    </h4>
                  </div>
                  {d.answer ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Answered
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Needs Answer
                    </span>
                  )}
                </div>

                {d.answer && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                    <strong>Your Response:</strong> {d.answer}
                  </div>
                )}

                {answeringId === d.id ? (
                  <form onSubmit={(e) => handleAnswerSubmit(e, d.id)} className="space-y-2 pt-2">
                    <textarea
                      rows={3}
                      required
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your explanation here..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAnsweringId(null)}
                        className="px-3 py-1.5 text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold"
                      >
                        {submitting ? 'Submitting...' : 'Post Solution'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setAnsweringId(d.id); setAnswerText(d.answer || ''); }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      {d.answer ? 'Edit Answer' : 'Answer Doubt'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
