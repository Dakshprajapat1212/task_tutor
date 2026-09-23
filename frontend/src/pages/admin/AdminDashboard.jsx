import React, { useState, useEffect } from 'react';
import { Shield, Users, BookOpen, CheckSquare, Layers, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    classes: 0,
    enrollments: 0,
    pendingEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [uRes, cRes, eRes] = await Promise.all([
        api.get('/users'),
        api.get('/classes'),
        api.get('/enrollments'),
      ]);

      const usersCount = uRes.success && Array.isArray(uRes.data) ? uRes.data.length : 0;
      const classesCount = cRes.success && Array.isArray(cRes.data) ? cRes.data.length : 0;
      const enrollments = eRes.success && Array.isArray(eRes.data) ? eRes.data : [];
      const pendingCount = enrollments.filter(e => e.status === 'pending').length;

      setStats({
        users: usersCount,
        classes: classesCount,
        enrollments: enrollments.length,
        pendingEnrollments: pendingCount,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 p-6 sm:p-8 text-white shadow-xl shadow-rose-600/10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-rose-100 mb-3 border border-white/20">
          <Shield className="w-3.5 h-3.5" />
          <span>System Administration Control</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
          System Overview & Metrics
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-rose-100/90 leading-relaxed max-w-xl">
          Oversee user provisioning, grant admissions with 1-click enrollment approvals, and manage classes & faculty allocations.
        </p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CheckSquare className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.pendingEnrollments}
          </p>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Pending Admissions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <Users className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.users}
          </p>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Total System Users</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <BookOpen className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.classes}
          </p>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Active Classes</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <UserCheck className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.enrollments}
          </p>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Total Enrollments</p>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/enrollments"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <CheckSquare className="w-6 h-6 text-amber-500" />
              {stats.pendingEnrollments > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                  {stats.pendingEnrollments} Action Required
                </span>
              )}
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Review Admissions</h3>
            <p className="text-xs text-slate-400 mt-1">Approve or reject student applications with instant access granting.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Manage Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <Users className="w-6 h-6 text-indigo-500 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">User Directory</h3>
            <p className="text-xs text-slate-400 mt-1">Manage credentials, view student records and teacher profiles.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/classes"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <BookOpen className="w-6 h-6 text-emerald-500 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Curriculum Setup</h3>
            <p className="text-xs text-slate-400 mt-1">Create classes, link subjects, and assign faculty instructors.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Classes & Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
