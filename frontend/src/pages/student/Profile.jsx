import React, { useState, useEffect } from 'react';
import { 
  User, Award, Flame, Clock, BookOpen, Sparkles, 
  CheckCircle, Shield, Calendar, Phone, Mail 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const [studyStats, setStudyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [pRes, bRes, xpRes, sRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/badges'),
        api.get('/student/xp-history'),
        api.get('/student/study-stats'),
      ]);

      if (pRes.success && pRes.data) setProfile(pRes.data);
      if (bRes.success && Array.isArray(bRes.data)) setBadges(bRes.data);
      if (xpRes.success && Array.isArray(xpRes.data)) setXpHistory(xpRes.data);
      if (sRes.success && sRes.data) setStudyStats(sRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackTime = async () => {
    setTracking(true);
    try {
      const res = await api.post('/student/track-study-time', { duration_minutes: 15 });
      if (res.success) {
        setFeedback('Recorded 15 minutes of study time! XP updated.');
        loadProfileData();
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-600/20">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {user?.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
            {user?.phone_no && (
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{user.phone_no}</span>
              </p>
            )}
          </div>
        </div>

        {/* Study Time Heartbeat Button */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <button
            onClick={handleTrackTime}
            disabled={tracking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>{tracking ? 'Logging...' : '+ Log 15m Study Session'}</span>
          </button>
          {feedback && (
            <span className="text-[11px] text-emerald-600 font-medium">{feedback}</span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <Award className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {profile?.xp ?? profile?.total_xp ?? 45}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Total XP</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {studyStats?.streak ?? 3} Days
          </p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Study Streak</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <Clock className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {studyStats?.total_hours ?? 12}h
          </p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Study Time</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <Sparkles className="w-5 h-5 mx-auto text-amber-500 mb-1" />
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {badges.length}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase">Badges Unlocked</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Earned Achievements & Badges</span>
        </h3>

        {badges.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Complete your first topic note or quiz in the library to unlock badges!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((b, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-1">
                <span className="text-2xl">🎖️</span>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{b.title || b.name || 'Scholar'}</p>
                <p className="text-[10px] text-slate-400">{b.description || 'Completed curriculum milestone'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* XP Earning History Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4">
          Recent XP Activity
        </h3>

        {xpHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No recent XP logs found.</div>
        ) : (
          <div className="space-y-2">
            {xpHistory.slice(0, 5).map((log, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{log.action || log.reason || 'Curriculum Progress'}</p>
                  <p className="text-[10px] text-slate-400">{new Date(log.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
                <span className="font-bold text-emerald-600 font-mono">+{log.points || log.xp || 15} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
