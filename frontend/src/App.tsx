import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Course, Lesson, Module } from "@/types/course";
import { fetchCourseData } from "@/services/courseService";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonMaterials } from "@/components/LessonMaterials";
import { AutoplayCountdown } from "@/components/AutoplayCountdown";
import { SettingsModal } from "@/components/SettingsModal";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function App() {
  const [course, setCourse] = useState<Course | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de navegação e UI
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [countdownTargetLesson, setCountdownTargetLesson] = useState<Lesson | null>(null);

  // Hook de Progresso
  const {
    completedLessonIds,
    lastActiveLessonId,
    autoplay,
    notes,
    toggleLessonCompletion,
    markLessonComplete,
    setLastActiveLessonId,
    setAutoplay,
    saveNote,
    isCompleted,
    calculateProgress,
  } = useCourseProgress();

  // Lista plana de todas as aulas em sequência para navegação rápida
  const flattenedLessons = useMemo(() => {
    if (!course) return [];
    const list: { lesson: Lesson; module: Module }[] = [];
    course.modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        list.push({ lesson: les, module: mod });
      });
    });
    return list;
  }, [course]);

  // Carrega os dados do curso
  const loadData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    const result = await fetchCourseData(forceRefresh);
    setCourse(result.course);
    setIsMock(result.isMock);
    if (result.error) {
      setErrorMessage(result.error);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Define a aula ativa inicial (última assistida ou primeira do curso)
  useEffect(() => {
    if (!course || flattenedLessons.length === 0) return;

    if (!activeLesson) {
      if (lastActiveLessonId) {
        const found = flattenedLessons.find((item) => item.lesson.id === lastActiveLessonId);
        if (found) {
          setActiveLesson(found.lesson);
          return;
        }
      }
      setActiveLesson(flattenedLessons[0].lesson);
    }
  }, [course, flattenedLessons, lastActiveLessonId, activeLesson]);

  // Atualiza a última aula ativa no progresso ao mudar de aula
  const handleSelectLesson = useCallback(
    (lesson: Lesson) => {
      setActiveLesson(lesson);
      setLastActiveLessonId(lesson.id);
      setCountdownTargetLesson(null); // Cancela qualquer contagem de autoplay pendente
    },
    [setLastActiveLessonId]
  );

  // Localiza índice atual, anterior e próxima aula
  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return flattenedLessons.findIndex((item) => item.lesson.id === activeLesson.id);
  }, [activeLesson, flattenedLessons]);

  const currentModule = useMemo(() => {
    if (currentLessonIndex === -1) return null;
    return flattenedLessons[currentLessonIndex].module;
  }, [currentLessonIndex, flattenedLessons]);

  const prevLesson = currentLessonIndex > 0 ? flattenedLessons[currentLessonIndex - 1].lesson : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < flattenedLessons.length - 1
      ? flattenedLessons[currentLessonIndex + 1].lesson
      : null;

  // Navegação
  const handleNextLesson = useCallback(() => {
    if (nextLesson) {
      handleSelectLesson(nextLesson);
    }
  }, [nextLesson, handleSelectLesson]);

  const handlePrevLesson = useCallback(() => {
    if (prevLesson) {
      handleSelectLesson(prevLesson);
    }
  }, [prevLesson, handleSelectLesson]);

  // Conclusão com Autoplay
  const handleToggleLessonComplete = useCallback(() => {
    if (!activeLesson || !course) return;

    const currentlyDone = isCompleted(activeLesson.id);
    toggleLessonCompletion(activeLesson.id, course.totalLessons);

    // Se estava incompleta e vai ser marcada como concluída e autoplay está ativo e tem próxima aula
    if (!currentlyDone && autoplay && nextLesson) {
      setCountdownTargetLesson(nextLesson);
    }
  }, [activeLesson, course, isCompleted, toggleLessonCompletion, autoplay, nextLesson]);

  const { percentage, completedCount } = calculateProgress(course?.totalLessons || 0);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Carregando plataforma de aulas...</h2>
          <p className="text-xs text-muted-foreground">Sincronizando com o Google Drive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Cabeçalho */}
      <Header
        courseTitle={course?.courseTitle || "Plataforma de Curso"}
        progressPercentage={percentage}
        completedLessons={completedCount}
        totalLessons={course?.totalLessons || 0}
        isMock={isMock}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebarMobile={() => setIsSidebarOpenMobile((prev) => !prev)}
      />

      {/* Banner de Aviso (se houver erro ou dica de mock) */}
      {errorMessage && (
        <div className="bg-destructive/15 border-b border-destructive/30 px-4 py-2.5 text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Não foi possível carregar a API do Drive: {errorMessage}. Exibindo dados locais de demonstração.</span>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="text-destructive underline text-xs h-auto p-0"
          >
            Ajustar URL
          </Button>
        </div>
      )}

      {/* Conteúdo Principal: Sidebar + Player */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar com Lista de Módulos e Aulas */}
        <Sidebar
          modules={course?.modules || []}
          activeLesson={activeLesson}
          completedLessonIds={completedLessonIds}
          isOpenMobile={isSidebarOpenMobile}
          onSelectLesson={handleSelectLesson}
          onToggleComplete={(lessonId, e) => {
            e.stopPropagation();
            toggleLessonCompletion(lessonId, course?.totalLessons);
          }}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Área Central: Player e Materiais */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 max-w-6xl mx-auto w-full space-y-6">
          {activeLesson ? (
            <>
              <VideoPlayer
                lesson={activeLesson}
                moduleTitle={currentModule?.title || "Módulo"}
                isCompleted={isCompleted(activeLesson.id)}
                autoplay={autoplay}
                hasPrevLesson={!!prevLesson}
                hasNextLesson={!!nextLesson}
                onToggleComplete={handleToggleLessonComplete}
                onNextLesson={handleNextLesson}
                onPrevLesson={handlePrevLesson}
                onToggleAutoplay={setAutoplay}
              />

              {/* Materiais de Apoio e Anotações */}
              <LessonMaterials
                lesson={activeLesson}
                moduleTitle={currentModule?.title || ""}
                userNote={notes[activeLesson.id] || ""}
                onSaveNote={(noteText) => saveNote(activeLesson.id, noteText)}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
              <Sparkles className="h-10 w-10 text-muted-foreground/40" />
              <h3 className="text-base font-semibold">Nenhuma aula selecionada</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Selecione uma aula na barra lateral para começar a assistir.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Overlay de Contagem Regressiva do Autoplay */}
      {countdownTargetLesson && (
        <AutoplayCountdown
          nextLesson={countdownTargetLesson}
          onAdvance={() => {
            handleSelectLesson(countdownTargetLesson);
            setCountdownTargetLesson(null);
          }}
          onCancel={() => setCountdownTargetLesson(null)}
          durationSeconds={5}
        />
      )}

      {/* Modal de Configuração da API do Drive */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveAndReload={() => loadData(true)}
      />
    </div>
  );
}
export default App;
