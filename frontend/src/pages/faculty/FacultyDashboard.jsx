import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, BookOpen, FileText, Video, 
  HelpCircle, Plus, CheckCircle, Clock, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [facultyClasses, setFacultyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faculty/my-classes');
      if (res.success && Array.isArray(res.data)) {
        setFacultyClasses(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 text-white shadow-xl shadow-amber-600/10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-amber-100 mb-3 border border-white/20">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Instructor Workspace</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
          Welcome, {user?.name || 'Professor'}!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-xl">
          Manage your assigned classes, create homework problem sets, review student submissions, and upload lecture recordings.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/faculty/homework"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-amber-800 font-bold text-xs shadow-md hover:bg-amber-50"
          >
            <FileText className="w-4 h-4" />
            <span>Assign & Grade Homework</span>
          </Link>
          <Link
            to="/faculty/recordings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white font-semibold text-xs border border-white/20 hover:bg-white/25"
          >
            <Video className="w-4 h-4" />
            <span>Upload Class Recording</span>
          </Link>
        </div>
      </div>

      {/* Assigned Classes Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center justify-between">
          <span>Your Assigned Classes & Subjects</span>
          <span className="text-xs text-slate-400 font-normal">{facultyClasses.length} Classes</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your teaching schedule...</div>
        ) : facultyClasses.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No classes assigned to your faculty profile yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Grade Section
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID #{cls.id}</span>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {cls.name}
                </h4>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Subjects Taught:</p>
                  {cls.subjects?.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <span className="text-slate-400 text-[11px]">
                        {s.pivot?.start_time ? `${s.pivot.start_time} - ${s.pivot.end_time}` : 'Regular Schedule'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/faculty/homework"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all group"
        >
          <FileText className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Review Submissions</h4>
          <p className="text-xs text-slate-400 mt-1">Grade student assignments and leave feedback remarks.</p>
        </Link>

        <Link
          to="/faculty/recordings"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all group"
        >
          <Video className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Class Recordings</h4>
          <p className="text-xs text-slate-400 mt-1">Publish lecture replay videos for students.</p>
        </Link>

        <Link
          to="/faculty/doubts"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all group"
        >
          <HelpCircle className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Resolve Doubts</h4>
          <p className="text-xs text-slate-400 mt-1">Answer questions submitted by enrolled students.</p>
        </Link>
      </div>
    </div>
  );
}
