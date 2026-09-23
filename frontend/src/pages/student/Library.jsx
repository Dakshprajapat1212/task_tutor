import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ChevronRight, CheckCircle2, HelpCircle, Layers, 
  Download, Award, Sparkles, Folder, FileText, ArrowLeft, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import QuizModal from './QuizModal';
import FlashcardsModal from './FlashcardsModal';

export default function Library() {
  // Navigation states
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  // Status & loaders
  const [loading, setLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(false);
  const [chapterProgress, setChapterProgress] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  // 1. Fetch available classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/library/classes');
      if (res.success && Array.isArray(res.data)) {
        setClasses(res.data);
        if (res.data.length > 0) {
          handleSelectClass(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Select Class -> load subjects
  const handleSelectClass = async (cls) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedNote(null);
    setChapters([]);
    setNotes([]);

    try {
      const res = await api.get(`/library/classes/${cls.id}/subjects`);
      if (res.success && res.data?.subjects) {
        setSubjects(res.data.subjects);
        if (res.data.subjects.length > 0) {
          handleSelectSubject(cls.id, res.data.subjects[0]);
        }
      } else {
        setSubjects([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Select Subject -> load chapters
  const handleSelectSubject = async (classId, subj) => {
    setSelectedSubject(subj);
    setSelectedChapter(null);
    setSelectedNote(null);
    setNotes([]);

    try {
      const res = await api.get(`/library/classes/${classId}/subjects/${subj.id}/chapters`);
      if (res.success && Array.isArray(res.data)) {
        setChapters(res.data);
        if (res.data.length > 0) {
          handleSelectChapter(res.data[0]);
        }
      } else {
        setChapters([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Select Chapter -> load notes & progress
  const handleSelectChapter = async (chap) => {
    setSelectedChapter(chap);
    setSelectedNote(null);

    try {
      const [notesRes, progRes] = await Promise.all([
        api.get(`/library/chapters/${chap.id}/notes`),
        api.get(`/library/chapters/${chap.id}/progress`),
      ]);

      if (notesRes.success && Array.isArray(notesRes.data)) {
        setNotes(notesRes.data);
        if (notesRes.data.length > 0) {
          handleSelectNote(notesRes.data[0]);
        }
      } else {
        setNotes([]);
      }

      if (progRes.success) {
        setChapterProgress(progRes.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Select Note -> view detail
  const handleSelectNote = async (nt) => {
    setNoteLoading(true);
    try {
      const res = await api.get(`/library/notes/${nt.id}`);
      if (res.success && res.data) {
        setSelectedNote(res.data);
      } else {
        setSelectedNote(nt);
      }
    } catch (e) {
      setSelectedNote(nt);
    } finally {
      setNoteLoading(false);
    }
  };

  // 6. Complete Note -> award XP & confetti
  const handleCompleteNote = async () => {
    if (!selectedNote) return;
    setMarkingComplete(true);
    try {
      const res = await api.post(`/library/notes/${selectedNote.id}/complete`);
      if (res.success) {
        setSelectedNote(prev => ({ ...prev, is_completed: true, status: 'completed' }));
        setNotification({
          type: 'success',
          text: '🎉 Great job! Topic marked as completed. Experience points (XP) added!',
        });
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
        setTimeout(() => setNotification(null), 5000);

        // Refresh chapter progress
        if (selectedChapter) {
          const p = await api.get(`/library/chapters/${selectedChapter.id}/progress`);
          if (p.success) setChapterProgress(p.data);
        }
      } else {
        setNotification({ type: 'error', text: res.message || 'Failed to complete note' });
      }
    } catch (e) {
      setNotification({ type: 'error', text: 'Network error completing note' });
    } finally {
      setMarkingComplete(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Class/Subject Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Curriculum Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Browse structured chapters, read interactive topic notes, review flashcards, and take quizzes.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Dropdown */}
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const c = classes.find(item => String(item.id) === e.target.value);
              if (c) handleSelectClass(c);
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Subject Dropdown */}
          <select
            value={selectedSubject?.id || ''}
            onChange={(e) => {
              const s = subjects.find(item => String(item.id) === e.target.value);
              if (s && selectedClass) handleSelectSubject(selectedClass.id, s);
            }}
            disabled={subjects.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:opacity-50"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {notification && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Main 3-Column Split: Chapters -> Notes List -> Note Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* Left Column: Chapters (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
            Chapters ({chapters.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading chapters...</div>
          ) : chapters.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No chapters found.</div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[540px]">
              {chapters.map((chap) => {
                const isSelected = selectedChapter?.id === chap.id;
                return (
                  <button
                    key={chap.id}
                    onClick={() => handleSelectChapter(chap)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-xs leading-snug">{chap.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{chap.topic_notes_count ?? chap.notes_count ?? 2} topic notes</span>
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Middle Column: Topic Notes in Chapter (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Topic Notes ({notes.length})
            </h3>
          </div>

          {/* Quick Chapter Action Buttons */}
          {selectedChapter && (
            <div className="mb-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowQuiz(true)}
                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz</span>
              </button>

              <button
                onClick={() => setShowFlashcards(true)}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-200 dark:border-amber-800"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards</span>
              </button>
            </div>
          )}

          {notes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a chapter to view its notes.
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[460px]">
              {notes.map((nt) => {
                const isSelected = selectedNote?.id === nt.id;
                const isCompleted = nt.is_completed || nt.status === 'completed';

                return (
                  <button
                    key={nt.id}
                    onClick={() => handleSelectNote(nt)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <p className="font-semibold text-xs leading-tight line-clamp-2">{nt.title}</p>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Note Reader & Completion Action (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          {noteLoading ? (
            <div className="py-24 text-center text-xs text-slate-400">Loading note content...</div>
          ) : !selectedNote ? (
            <div className="py-24 text-center text-xs text-slate-400">
              Select a note on the left to start reading.
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Note Header */}
                <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {selectedChapter?.title}
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {selectedNote.title}
                    </h2>
                  </div>

                  {selectedNote.file_path && (
                    <a
                      href={selectedNote.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Download PDF / Attachment"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Attachment</span>
                    </a>
                  )}
                </div>

                {/* Note Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-[420px] overflow-y-auto pr-2">
                  {selectedNote.content ? (
                    <div className="whitespace-pre-line">
                      {selectedNote.content}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-500">
                      This topic note provides core definitions, textbook formulas, and practical review problems for {selectedChapter?.title}. Study the key principles and mark as complete when done.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action: Mark Complete */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Earns +15 XP upon completion
                  </span>
                </div>

                <button
                  onClick={handleCompleteNote}
                  disabled={markingComplete || selectedNote.is_completed}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedNote.is_completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {markingComplete 
                      ? 'Saving...' 
                      : selectedNote.is_completed 
                      ? 'Completed ✓' 
                      : 'Mark as Completed'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Quiz Modal */}
      {showQuiz && selectedChapter && (
        <QuizModal
          chapter={selectedChapter}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* Flashcards Modal */}
      {showFlashcards && selectedChapter && (
        <FlashcardsModal
          chapter={selectedChapter}
          onClose={() => setShowFlashcards(false)}
        />
      )}
    </div>
  );
}
