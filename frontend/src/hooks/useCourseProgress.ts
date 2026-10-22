import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

const STORAGE_KEY_PROGRESS = "curso_drive_user_progress";

interface StoredProgress {
  completedLessonIds: string[];
  lastActiveLessonId: string | null;
  autoplay: boolean;
  notes: Record<string, string>;
}

const DEFAULT_PROGRESS: StoredProgress = {
  completedLessonIds: [],
  lastActiveLessonId: null,
  autoplay: true,
  notes: {},
};

export function useCourseProgress() {
  const [progress, setProgress] = useState<StoredProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (stored) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Erro ao carregar progresso do localStorage", e);
    }
    return DEFAULT_PROGRESS;
  });

  // Salva no localStorage sempre que o progresso mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error("Erro ao salvar progresso no localStorage", e);
    }
  }, [progress]);

  const toggleLessonCompletion = useCallback((lessonId: string, totalLessons?: number) => {
    setProgress((prev) => {
      const exists = prev.completedLessonIds.includes(lessonId);
      const updated = exists
        ? prev.completedLessonIds.filter((id) => id !== lessonId)
        : [...prev.completedLessonIds, lessonId];

      // Dispara confetes se o usuário acabou de concluir uma aula
      if (!exists) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#3b82f6", "#6366f1", "#10b981"],
        });

        // Grande celebração se concluiu 100% do curso!
        if (totalLessons && updated.length >= totalLessons) {
          setTimeout(() => {
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.6 },
              colors: ["#fbbf24", "#f59e0b", "#10b981", "#6366f1"],
            });
          }, 300);
        }
      }

      return {
        ...prev,
        completedLessonIds: updated,
      };
    });
  }, []);

  const markLessonComplete = useCallback((lessonId: string, totalLessons?: number) => {
    setProgress((prev) => {
      if (prev.completedLessonIds.includes(lessonId)) return prev;
      const updated = [...prev.completedLessonIds, lessonId];

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#3b82f6", "#10b981", "#6366f1"],
      });

      if (totalLessons && updated.length >= totalLessons) {
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.6 },
            colors: ["#fbbf24", "#f59e0b", "#10b981", "#6366f1"],
          });
        }, 300);
      }

      return {
        ...prev,
        completedLessonIds: updated,
      };
    });
  }, []);

  const setLastActiveLessonId = useCallback((lessonId: string) => {
    setProgress((prev) => ({
      ...prev,
      lastActiveLessonId: lessonId,
    }));
  }, []);

  const setAutoplay = useCallback((enabled: boolean) => {
    setProgress((prev) => ({
      ...prev,
      autoplay: enabled,
    }));
  }, []);

  const saveNote = useCallback((lessonId: string, noteText: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [lessonId]: noteText,
      },
    }));
  }, []);

  const isCompleted = useCallback(
    (lessonId: string) => progress.completedLessonIds.includes(lessonId),
    [progress.completedLessonIds]
  );

  const calculateProgress = useCallback(
    (totalLessons: number) => {
      if (!totalLessons || totalLessons <= 0) return { percentage: 0, completedCount: 0 };
      const completedCount = progress.completedLessonIds.length;
      const percentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));
      return { percentage, completedCount };
    },
    [progress.completedLessonIds]
  );

  return {
    completedLessonIds: progress.completedLessonIds,
    lastActiveLessonId: progress.lastActiveLessonId,
    autoplay: progress.autoplay,
    notes: progress.notes,
    toggleLessonCompletion,
    markLessonComplete,
    setLastActiveLessonId,
    setAutoplay,
    saveNote,
    isCompleted,
    calculateProgress,
  };
}
