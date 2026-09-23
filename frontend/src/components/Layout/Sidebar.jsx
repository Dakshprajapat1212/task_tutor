import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, Video, FileText, HelpCircle, Trophy, User, 
  CheckSquare, GraduationCap, Users, Shield, 
  Calendar, Award, FolderPlus, Bell, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Live Classes & Home', icon: Video },
    { to: '/library', label: 'Course Library', icon: BookOpen },
    { to: '/recordings', label: 'Past Recordings', icon: Video },
    { to: '/homework', label: 'Homework Tasks', icon: FileText },
    { to: '/enrollment', label: 'Enrollment Hub', icon: CheckSquare },
    { to: '/doubts', label: 'Doubts & Q&A', icon: HelpCircle },
    { to: '/leaderboard', label: 'Leaderboard & XP', icon: Trophy },
    { to: '/profile', label: 'Student Profile', icon: User },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Faculty Overview', icon: GraduationCap },
    { to: '/faculty/homework', label: 'Assign & Grade HW', icon: FileText },
    { to: '/faculty/recordings', label: 'Manage Recordings', icon: Video },
    { to: '/faculty/doubts', label: 'Answer Doubts', icon: HelpCircle },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Metrics', icon: Shield },
    { to: '/admin/enrollments', label: 'Enrollment Approvals', icon: CheckSquare },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/classes', label: 'Classes & Subjects', icon: FolderPlus },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg">
              T
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-800 dark:text-white leading-tight">
                Task Tutorials
              </h1>
              <p className="text-[11px] text-slate-400 font-medium capitalize">
                {role} Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main Role Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {role === 'admin' ? 'Administration' : role === 'faculty' ? 'Instructor Tools' : 'Learning'}
            </p>
            <nav className="space-y-1">
              {(role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                      ${isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Cross-Role Preview Links (for testing convenience) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              All Views Preview
            </p>
            <div className="space-y-1">
              {role !== 'student' && (
                <NavLink
                  to="/library"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Student Library</span>
                </NavLink>
              )}
              {role !== 'faculty' && (
                <NavLink
                  to="/faculty/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Faculty View</span>
                </NavLink>
              )}
              {role !== 'admin' && (
                <NavLink
                  to="/admin/enrollments"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Approvals</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
