import React, { useState, useEffect } from 'react';
import { Video, Play, Clock, Calendar, User, ExternalLink, X, Search } from 'lucide-react';
import api from '../../services/api';

export default function Recordings() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await api.get('/my-classes');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setClasses(res.data);
        setSelectedClassId(res.data[0].id);
        fetchRecordings(res.data[0].id);
      } else {
        // Fallback to library classes
        const fallback = await api.get('/library/classes');
        if (fallback.success && Array.isArray(fallback.data) && fallback.data.length > 0) {
          setClasses(fallback.data);
          setSelectedClassId(fallback.data[0].id);
          fetchRecordings(fallback.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordings = async (classId) => {
    setLoading(true);
    try {
      const res = await api.get(`/classes/${classId}/recordings`);
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

  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    fetchRecordings(newClassId);
  };

  const filtered = recordings.filter(r => 
    (r.title || r.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.faculty_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Class Lecture Recordings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Catch up on past live lectures, whiteboard explanations, and problem-solving sessions.
          </p>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by lecture title or teacher..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Grid of Recordings */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading class recordings...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Video className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Recordings Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no recorded sessions for this class yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail / Video Banner */}
              <div 
                onClick={() => setActiveVideo(rec)}
                className="h-40 bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center relative cursor-pointer group-hover:opacity-95 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                {rec.duration && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-mono text-white">
                    {rec.duration}
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {rec.title || rec.topic || 'Class Lecture Session'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {rec.description || 'Comprehensive lecture recording covering key formulas and curriculum problems.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[120px]">{rec.faculty_name || 'Faculty'}</span>
                  </span>
                  <button
                    onClick={() => setActiveVideo(rec)}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white truncate">
                {activeVideo.title || activeVideo.topic || 'Video Player'}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activeVideo.recording_url || activeVideo.stream_url ? (
                <video
                  src={activeVideo.recording_url || activeVideo.stream_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video.
                </video>
              ) : (
                <div className="text-center p-8 text-xs text-slate-400">
                  <p>Stream URL not configured. If this is an external lecture link:</p>
                  {activeVideo.class_link && (
                    <a
                      href={activeVideo.class_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                    >
                      <span>Open Meeting / Drive Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 text-xs text-slate-300">
              <p className="font-semibold text-white">Details</p>
              <p className="mt-1 text-slate-400">
                Instructor: {activeVideo.faculty_name || 'Faculty Member'} • Subject: {activeVideo.subject_name || 'Class Subject'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
