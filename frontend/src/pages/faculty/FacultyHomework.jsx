import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle, Calendar, User, Award, X, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function FacultyHomework() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Homework Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClassId, setNewClassId] = useState('2');
  const [newSubjectId, setNewSubjectId] = useState('1');
  const [newDueDate, setNewDueDate] = useState('2026-10-15');
  const [creating, setCreating] = useState(false);

  // Grade Submission Modal
  const [gradingModal, setGradingModal] = useState(null); // submission object
  const [gradeMarks, setGradeMarks] = useState(85);
  const [gradeRemarks, setGradeRemarks] = useState('Well done, good problem solving structure.');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        api.get('/assign-homeworks'),
        api.get('/submit-homeworks'),
      ]);
      if (assRes.success && Array.isArray(assRes.data)) setAssignments(assRes.data);
      if (subRes.success && Array.isArray(subRes.data)) setSubmissions(subRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/assign-homeworks', {
        title: newTitle,
        description: newDescription,
        class_id: Number(newClassId),
        subject_id: Number(newSubjectId),
        submission_date: newDueDate,
      });

      if (res.success) {
        setNotification('New assignment published successfully!');
        setShowCreateModal(false);
        setNewTitle('');
        setNewDescription('');
        loadData();
      } else {
        setNotification(`Error: ${res.message}`);
      }
    } catch (err) {
      setNotification('Network error creating assignment');
    } finally {
      setCreating(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!gradingModal) return;
    setSubmittingGrade(true);
    try {
      const res = await api.put(`/submit-homeworks/${gradingModal.id}`, {
        marks: Number(gradeMarks),
        remarks: gradeRemarks,
      });

      if (res.success) {
        setNotification('Grade and remarks updated successfully!');
        setGradingModal(null);
        loadData();
      } else {
        setNotification(`Grading failed: ${res.message}`);
      }
    } catch (err) {
      setNotification('Network error saving grade');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Homework Management & Grading</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create tasks for your classes and evaluate student submissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Homework</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {notification}
        </div>
      )}

      {/* Grid: Published Tasks + Student Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Published Assignments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Published Assignments</span>
            <span className="text-xs text-slate-400 font-normal">{assignments.length} Total</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No assignments created yet.</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {assignments.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {item.class?.name || `Class #${item.class_id}`}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Due: {item.submission_date || item.due_date || 'Upcoming'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Student Submissions to Review */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Student Submissions</span>
            <span className="text-xs text-slate-400 font-normal">{submissions.length} Total</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No student submissions uploaded yet. You can submit one as a student to test grading!
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Student: {sub.student?.user?.name || `Student #${sub.student_id || sub.user_id || 1}`}
                    </span>
                    {sub.marks !== null && sub.marks !== undefined ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        {sub.marks} / 100
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Ungraded
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 italic">
                    "{sub.submission_text || sub.notes || 'No description provided'}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400">
                      Submitted on: {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setGradingModal(sub)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                    >
                      {sub.marks !== null && sub.marks !== undefined ? 'Re-grade' : 'Grade Solution'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Assign Homework Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Practice Set - Quadratic Equations"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Instructions for students..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Class ID</label>
                  <input
                    type="number"
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">
                  {creating ? 'Publishing...' : 'Publish Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Grade Submission</h3>
            <p className="text-xs text-slate-400 mb-4">Assign marks out of 100 and provide constructive teacher feedback.</p>

            <form onSubmit={handleGradeSubmission} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Score / Marks (out of 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty Feedback / Remarks</label>
                <textarea
                  rows={3}
                  value={gradeRemarks}
                  onChange={(e) => setGradeRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setGradingModal(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" disabled={submittingGrade} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  {submittingGrade ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
