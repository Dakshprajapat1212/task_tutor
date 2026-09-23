import React, { useState, useEffect } from 'react';
import { Video, Plus, Trash2, Calendar, Clock, ExternalLink, X } from 'lucide-react';
import api from '../../services/api';

export default function FacultyRecordings() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [newDuration, setNewDuration] = useState('45 mins');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await api.get('/faculty/my-classes');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setClasses(res.data);
        setSelectedClassId(res.data[0].id);
        fetchClassRecordings(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassRecordings = async (cid) => {
    setLoading(true);
    try {
      const res = await api.get(`/faculty/classes/${cid}/recordings`);
      if (res.success && Array.isArray(res.data)) {
        setRecordings(res.data);
      } else {
        setRecordings([]);
      }
    } catch (e) {
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedClassId) return;
    setUploading(true);
    try {
      const res = await api.post(`/faculty/classes/${selectedClassId}/recordings`, {
        title: newTitle,
        topic: newTitle,
        stream_url: newStreamUrl || '/chemistry_lecture.mp4',
        duration: newDuration,
      });

      if (res.success) {
        setNotification('Recording published to class repository!');
        setShowUploadModal(false);
        setNewTitle('');
        setNewStreamUrl('');
        fetchClassRecordings(selectedClassId);
      } else {
        setNotification(`Upload failed: ${res.message}`);
      }
    } catch (err) {
      setNotification('Network error uploading recording');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;
    try {
      const res = await api.delete(`/faculty/recordings/${id}`);
      if (res.success) {
        setNotification('Recording deleted');
        fetchClassRecordings(selectedClassId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Manage Lecture Recordings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Publish, edit, and curate class recordings for your students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => { setSelectedClassId(e.target.value); fetchClassRecordings(e.target.value); }}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 text-xs font-semibold">
          {notification}
        </div>
      )}

      {/* Recordings Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4">
          Published Recordings ({recordings.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading recordings...</div>
        ) : recordings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No recordings found for this class. Click "Upload New" above to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {r.title || r.topic || 'Class Lecture'}
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Duration: {r.duration || '45 mins'} • Added: {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Upload Class Recording</h3>
            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lecture Topic / Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Newton's Laws of Motion - Deep Dive"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Video Stream URL</label>
                <input
                  type="text"
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                  placeholder="/chemistry_lecture.mp4 or https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="e.g. 50 mins"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">
                  {uploading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
