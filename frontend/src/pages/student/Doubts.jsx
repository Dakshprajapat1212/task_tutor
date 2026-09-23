import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, MessageSquare, Plus, CheckCircle, Clock, User, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function Doubts() {
  const [myDoubts, setMyDoubts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [posting, setPosting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadMyDoubts();
  }, []);

  const loadMyDoubts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/library/my-doubts');
      if (res.success && Array.isArray(res.data)) {
        setMyDoubts(res.data);
      } else {
        setMyDoubts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.post('/doubts/search', { query: searchQuery });
      if (res.success && Array.isArray(res.data)) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setPosting(true);
    setFeedback('');
    try {
      const res = await api.post('/doubts', {
        question: newQuestion,
        class_id: 2, // default test class
        subject_id: 1, // default test subject
      });
      if (res.success) {
        setFeedback('Your doubt has been submitted to faculty!');
        setNewQuestion('');
        loadMyDoubts();
      } else {
        setFeedback(res.message || 'Failed to submit doubt.');
      }
    } catch (err) {
      setFeedback('Error submitting doubt.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Doubts & Academic Discussion</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Ask questions directly to your teachers and search through verified class answers.
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-indigo-800 dark:text-indigo-200 text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* Top Search & Ask Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ask Question Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Post a New Academic Doubt</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Faculty will review your question and post an explanation.
          </p>

          <form onSubmit={handlePostDoubt} className="space-y-3">
            <textarea
              rows={3}
              required
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. Can someone explain why momentum is conserved in inelastic collisions?"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={posting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Submit to Faculty'}
              </button>
            </div>
          </form>
        </div>

        {/* Search Existing Doubts (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Search Verified Doubts</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Find instant answers from previous student questions.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic or keywords..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                {searching ? '...' : 'Search'}
              </button>
            </form>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-40 overflow-y-auto">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Search Results:</p>
              {searchResults.map((r, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{r.question}</p>
                  {r.answer && <p className="text-[11px] text-emerald-600 mt-1">Ans: {r.answer}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Submitted Doubts List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4">
          My Asked Doubts ({myDoubts.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your questions...</div>
        ) : myDoubts.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
            No doubts submitted yet. Have a question? Ask above!
          </div>
        ) : (
          <div className="space-y-3">
            {myDoubts.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {d.question}
                  </span>
                  {d.answer ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      <span>Answered</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>Pending Teacher</span>
                    </span>
                  )}
                </div>

                {d.answer ? (
                  <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200">
                    <p className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-300">
                      Teacher's Answer:
                    </p>
                    <p className="mt-1 leading-relaxed">{d.answer}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Faculty will answer shortly during office hours.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
