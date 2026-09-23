import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCw, Layers, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function FlashcardsModal({ chapter, note, onClose }) {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, [chapter, note]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      let res;
      if (note) {
        res = await api.get(`/library/modules/${note.id}/flashcards`);
      } else if (chapter) {
        res = await api.get(`/library/chapters/${chapter.id}/flashcards`);
      }

      if (res && res.success) {
        const list = res.data?.flashcards || (Array.isArray(res.data) ? res.data : []);
        setFlashcards(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Flashcards Revision
              </h3>
              <p className="text-xs text-slate-400">
                {note ? note.title : chapter?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-8 flex flex-col items-center justify-center min-h-[260px]">
          {loading ? (
            <p className="text-xs text-slate-400">Generating flashcards...</p>
          ) : flashcards.length === 0 ? (
            <p className="text-xs text-slate-400">No flashcards available for this chapter.</p>
          ) : (
            <div className="w-full max-w-md">
              {/* Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-56 rounded-2xl cursor-pointer p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800 dark:to-indigo-950/40 shadow-lg hover:shadow-xl transition-all select-none relative group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{isFlipped ? 'Answer' : 'Question'}</span>
                  <span className="flex items-center gap-1 text-indigo-500">
                    <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                    <span>Click to Flip</span>
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {isFlipped 
                      ? (currentCard.answer || currentCard.correct_answer || currentCard.correct_option || 'Answer not provided') 
                      : (currentCard.question || currentCard.front || 'Question')}
                  </p>
                </div>

                <div className="text-center text-[10px] text-slate-400">
                  Card {currentIndex + 1} of {flashcards.length}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                >
                  Flip
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
