import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, CheckCircle, Clock, Upload, 
  AlertTriangle, Send, Award, Download, CheckCircle2, X 
} from 'lucide-react';
import api from '../../services/api';

export default function Homework() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // assignment object to submit for
  const [issueModal, setIssueModal] = useState(null); // assignment to report issue for
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadHomeworkData();
  }, []);

  const loadHomeworkData = async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        api.get('/assign-homeworks'),
        api.get('/submit-homeworks'),
      ]);

      if (assRes.success && Array.isArray(assRes.data)) {
        setAssignments(assRes.data);
      }
      if (subRes.success && Array.isArray(subRes.data)) {
        setSubmissions(subRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!activeModal) return;
    setSubmitting(true);
    try {
      const payload = {
        assign_homework_id: activeModal.id,
        submission_text: submissionText,
        file_url: submissionFile || 'https://example.com/homework_submission.pdf',
      };
      const res = await api.post('/submit-homeworks', payload);
      if (res.success) {
        setNotification({ type: 'success', text: 'Homework submitted successfully!' });
        setActiveModal(null);
        setSubmissionText('');
        setSubmissionFile('');
        loadHomeworkData();
      } else {
        setNotification({ type: 'error', text: res.message || 'Submission failed' });
      }
    } catch (err) {
      setNotification({ type: 'error', text: 'Network error submitting homework' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueModal) return;
    setSubmitting(true);
    try {
      const res = await api.post('/homework-issues', {
        assign_homework_id: issueModal.id,
        issue: issueDescription,
      });
      if (res.success) {
        setNotification({ type: 'success', text: 'Issue submitted to faculty.' });
        setIssueModal(null);
        setIssueDescription('');
      } else {
        setNotification({ type: 'error', text: res.message || 'Failed to report issue' });
      }
    } catch (err) {
      setNotification({ type: 'error', text: 'Network error reporting issue' });
    } finally {
      setSubmitting(false);
    }
  };

  // Find submission for assignment if exists
  const getSubmissionForAssignment = (assignId) => {
    return submissions.find(s => Number(s.assign_homework_id) === Number(assignId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Homework & Assignments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View assigned tasks, upload your solutions, and review teacher grading feedback.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {submissions.length} of {assignments.length} Submitted
        </div>
      </div>

      {notification && (
        <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
          notification.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Assignments List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Homework Assigned</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You are all caught up! No active tasks for your classes right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((item) => {
            const sub = getSubmissionForAssignment(item.id);
            const isSubmitted = Boolean(sub);
            const isGraded = sub && (sub.marks !== null && sub.marks !== undefined);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {item.class?.name || 'Class Task'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      Due: {item.due_date || item.submission_date || 'Upcoming'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {item.title || item.name || 'Assignment Problem Set'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description || item.instructions || 'Complete the assigned problem set and upload your solution.'}
                  </p>

                  {/* Submission status & grading badge */}
                  {sub && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Your Submission Status:
                        </span>
                        {isGraded ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            Graded: {sub.marks} / 100
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Submitted (Pending Evaluation)
                          </span>
                        )}
                      </div>
                      {sub.remarks && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Teacher remarks: "{sub.remarks}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => setIssueModal(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-xs"
                    title="Report Homework Issue"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>

                  {isSubmitted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Submitted</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveModal(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Solution</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Homework Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Submit Homework: {activeModal.title || 'Assignment'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHomework} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Notes / Explanation
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Provide your solution details, code, or answer description here..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attachment Link (Google Drive / GitHub / File URL)
                </label>
                <input
                  type="url"
                  value={submissionFile}
                  onChange={(e) => setSubmissionFile(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Upload Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {issueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              Report Homework Issue
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Describe any question ambiguity, broken file link, or problem with this assignment.
            </p>
            <form onSubmit={handleReportIssue} className="space-y-4 text-xs">
              <textarea
                rows={3}
                required
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIssueModal(null)}
                  className="px-3 py-1.5 rounded-xl text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold"
                >
                  {submitting ? 'Reporting...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
