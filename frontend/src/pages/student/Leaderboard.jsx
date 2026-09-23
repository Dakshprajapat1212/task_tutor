import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Award, Sparkles, TrendingUp } from 'lucide-react';
import api from '../../services/api';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaderboard');
      if (res.success && Array.isArray(res.data)) {
        setLeaders(res.data);
      } else {
        setLeaders([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-extrabold flex items-center justify-center text-xs shadow-md">🥇 1</span>;
      case 2:
        return <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-xs shadow-md">🥈 2</span>;
      case 3:
        return <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-extrabold flex items-center justify-center text-xs shadow-md">🥉 3</span>;
      default:
        return <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-xs">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-100 w-fit mb-3 border border-white/20">
          <Trophy className="w-3.5 h-3.5" />
          <span>Top Performers</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold">
          Academic Honor Roll & Leaderboard
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-amber-100/90 max-w-xl">
          Complete topic notes, achieve top scores on chapter quizzes, and maintain daily study streaks to earn XP and level up your rank!
        </p>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4">
          Rankings ({leaders.length} Active Students)
        </h3>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Calculating student scores...</div>
        ) : leaders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No rankings available right now. Complete a note or quiz to get on the board!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 px-3">Rank</th>
                  <th className="pb-3 px-3">Student</th>
                  <th className="pb-3 px-3">Class</th>
                  <th className="pb-3 px-3">Streak</th>
                  <th className="pb-3 px-3 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {leaders.map((student, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={student.id || index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        {getRankBadge(rank)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                            {student.name ? student.name[0] : 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {student.class_name || student.class?.name || 'Class 9'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-orange-500">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span>{student.streak || student.current_streak || 1} days</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                        {student.xp ?? student.total_xp ?? 0} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
