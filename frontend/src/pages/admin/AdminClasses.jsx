import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, FolderPlus, Layers, Calendar, Clock, ExternalLink, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Class Form Modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [className, setClassName] = useState('');
  const [submittingClass, setSubmittingClass] = useState(false);

  // Assign Subject Modal
  const [showAssignModal, setShowAssignModal] = useState(null); // class object
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [facultyId, setFacultyId] = useState('1');
  const [classLink, setClassLink] = useState('https://meet.google.com/test-link');
  const [classDate, setClassDate] = useState('2026-10-01');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects'),
      ]);
      if (cRes.success && Array.isArray(cRes.data)) setClasses(cRes.data);
      if (sRes.success && Array.isArray(sRes.data)) {
        setSubjects(sRes.data);
        if (sRes.data.length > 0) setSelectedSubjectId(sRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmittingClass(true);
    try {
      const res = await api.post('/classes', { name: className });
      if (res.success) {
        setNotification('Class created successfully!');
        setShowClassModal(false);
        setClassName('');
        loadData();
      } else {
        alert(res.message || 'Error creating class');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSubmittingClass(false);
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    if (!showAssignModal) return;
    setSubmittingAssign(true);
    try {
      const res = await api.post(`/classes/${showAssignModal.id}/assign-subject`, {
        subject_id: Number(selectedSubjectId),
        faculty_id: Number(facultyId),
        class_link: classLink,
        class_date: classDate,
        start_time: startTime,
        end_time: endTime,
        stream_url: '/chemistry_lecture.mp4',
      });

      if (res.success) {
        setNotification('Subject and faculty assigned to class!');
        setShowAssignModal(null);
        loadData();
      } else {
        alert(res.message || 'Assignment failed');
      }
    } catch (err) {
      alert('Network error assigning subject');
    } finally {
      setSubmittingAssign(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Curriculum Setup: Classes & Subjects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define grade levels, link academic subjects, and allocate teacher instructors.
          </p>
        </div>

        <button
          onClick={() => setShowClassModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {notification}
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Class ID #{cls.id}
                </span>
                <button
                  onClick={() => setShowAssignModal(cls)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Assign Subject</span>
                </button>
              </div>

              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {cls.name}
              </h3>

              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Assigned Subjects:</p>
                {cls.subjects && cls.subjects.length > 0 ? (
                  <div className="space-y-1.5">
                    {cls.subjects.map(s => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {s.pivot?.faculty_name ? `Faculty: ${s.pivot.faculty_name}` : 'Teacher Assigned'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No subjects assigned yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Create New Class</h3>
            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Grade 11 Advanced Physics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowClassModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" disabled={submittingClass} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">
                  {submittingClass ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subject Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Assign Subject to {showAssignModal.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Select subject and configure lecture schedule parameters.</p>

            <form onSubmit={handleAssignSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Faculty ID</label>
                <input
                  type="number"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Meeting Link</label>
                <input
                  type="url"
                  value={classLink}
                  onChange={(e) => setClassLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAssignModal(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" disabled={submittingAssign} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
