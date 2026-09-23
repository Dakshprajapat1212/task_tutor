import React, { useState, useEffect } from 'react';
import { 
  Video, Calendar, Clock, BookOpen, Award, CheckCircle, 
  ExternalLink, Bell, ArrowRight, Sparkles, AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LiveDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Student's Approved Classes
      const classesRes = await api.get('/my-classes');
      if (classesRes.success && Array.isArray(classesRes.data)) {
        setClasses(classesRes.data);
      }

      // 2. Fetch Announcements
      const annRes = await api.get('/announcements');
      if (annRes.success && Array.isArray(annRes.data)) {
        setAnnouncements(annRes.data);
      }

      // 3. Fetch Featured Events
      const evRes = await api.get('/events');
      if (evRes.success && Array.isArray(evRes.data)) {
        setEvents(evRes.data);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (liveClass) => {
    try {
      setAttendanceMsg('Recording your attendance...');
      await api.post('/student/live-attendance/join', {
        class_id: liveClass.class_id || 1,
        subject_id: liveClass.subject_id || 1,
      });
      setAttendanceMsg(`Attendance marked for ${liveClass.subject_name || 'class'}!`);
      setTimeout(() => setAttendanceMsg(''), 4000);
      
      // Open class link
      if (liveClass.link) {
        window.open(liveClass.link, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Flatten upcoming live schedule from classes
  const liveSessions = [];
  classes.forEach(c => {
    if (c.subjects && Array.isArray(c.subjects)) {
      c.subjects.forEach(s => {
        if (s.pivot?.class_link) {
          liveSessions.push({
            id: s.pivot.id,
            className: c.name,
            class_id: c.id,
            subject_id: s.id,
            subject_name: s.name,
            faculty_name: s.pivot.faculty_name || 'Assigned Faculty',
            date: s.pivot.class_date || 'Today',
            startTime: s.pivot.start_time || '10:00 AM',
            endTime: s.pivot.end_time || '11:30 AM',
            link: s.pivot.class_link,
          });
        }
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Learning Hub</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Ready to continue your journey? You have {classes.length} enrolled class(es) with interactive notes, quizzes, live lectures, and homework tasks.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-indigo-50 shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Course Library</span>
            </Link>
            <Link
              to="/enrollment"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <span>Enroll In More Classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {attendanceMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{attendanceMsg}</span>
        </div>
      )}

      {/* Main Grid: Live Classes & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Class Timetable */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Upcoming Live Class Sessions
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {liveSessions.length} Scheduled
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Loading schedules...
            </div>
          ) : liveSessions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Live Sessions Active</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {classes.length === 0 
                  ? 'You are not enrolled in any class yet. Go to Enrollment Hub to request class access.' 
                  : 'Check back later when faculty schedules the next lecture.'}
              </p>
              {classes.length === 0 && (
                <Link
                  to="/enrollment"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Request Class Enrollment
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {liveSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {session.className}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {session.subject_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Instructor: <span className="font-medium text-slate-700 dark:text-slate-300">{session.faculty_name}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Date: {session.date}</span>
                    <button
                      onClick={() => handleJoinClass(session)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <span>Join Live</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Announcements & Quick Enrolled Classes */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Announcements & Notices
              </h3>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400">No announcements right now.</p>
              ) : (
                announcements.slice(0, 4).map((ann, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                      {ann.title || 'Important Notice'}
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 line-clamp-2">
                      {ann.content || ann.message || 'Check your classes for recent updates.'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Classes Quick Pill List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>My Enrolled Classes</span>
              <span className="text-xs font-normal text-slate-400">{classes.length} Total</span>
            </h3>

            {classes.length === 0 ? (
              <div className="text-xs text-slate-400">
                You have no active enrollments.{' '}
                <Link to="/enrollment" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">
                  Apply now
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {classes.map(c => (
                  <Link
                    key={c.id}
                    to="/library"
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {c.subjects?.length || 0} Subject(s) Available
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
