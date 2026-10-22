import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Course, Lesson, Module, UserCourse } from "@/types/course";
import {
  fetchCourseData,
  fetchUserCourses,
  deleteUserCourse,
} from "@/services/courseService";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonMaterials } from "@/components/LessonMaterials";
import { AutoplayCountdown } from "@/components/AutoplayCountdown";
import { SettingsModal } from "@/components/SettingsModal";
import { CoursesDashboard } from "@/components/CoursesDashboard";
import { AddCourseModal } from "@/components/AddCourseModal";
import { DriveFolderTutorialModal } from "@/components/DriveFolderTutorialModal";
import { AlertCircle, Loader2, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function App() {
  const { user, isAuthenticated, loginWithEmail, loginAsGuest, logout } = useAuth();

  // Estados de Visualização: 'dashboard' ou 'player'
  const [view, setView] = useState<"dashboard" | "player">("dashboard");

  // Lista de cursos do usuário
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [selectedUserCourse, setSelectedUserCourse] = useState<UserCourse | null>(null);

  // Estado do curso ativo no player
  const [courseContent, setCourseContent] = useState<Course | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados do Player
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [countdownTargetLesson, setCountdownTargetLesson] = useState<Lesson | null>(null);

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Hook de Progresso
  const {
    completedLessonIds,
    lastActiveLessonId,
    autoplay,
    notes,
    toggleLessonCompletion,
    setLastActiveLessonId,
    setAutoplay,
    saveNote,
    isCompleted,
    calculateProgress,
  } = useCourseProgress();

  // Carrega cursos do usuário ao autenticar
  const loadCourses = useCallback(async () => {
    if (!user) return;
    const courses = await fetchUserCourses(user.email);
    setUserCourses(courses);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCourses();
    }
  }, [isAuthenticated, loadCourses]);

  // Carrega conteúdo das aulas de um curso selecionado
  const loadCourseContent = useCallback(
    async (folderId: string, forceRefresh = false) => {
      if (forceRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setErrorMessage(null);

      const result = await fetchCourseData(folderId, forceRefresh);
      setCourseContent(result.course);
      setIsMock(result.isMock);
      if (result.error) {
        setErrorMessage(result.error);
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    []
  );

  // Seleciona um curso do dashboard e abre o player
  const handleSelectCourse = useCallback(
    (course: UserCourse) => {
      setSelectedUserCourse(course);
      setActiveLesson(null);
      setView("player");
      loadCourseContent(course.folderId);
    },
    [loadCourseContent]
  );

  // Volta para o Dashboard
  const handleBackToDashboard = useCallback(() => {
    setView("dashboard");
    loadCourses(); // Atualiza contadores
  }, [loadCourses]);

  // Lista plana de aulas do curso ativo
  const flattenedLessons = useMemo(() => {
    if (!courseContent) return [];
    const list: { lesson: Lesson; module: Module }[] = [];
    courseContent.modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        list.push({ lesson: les, module: mod });
      });
    });
    return list;
  }, [courseContent]);

  // Define aula inicial ao carregar o curso
  useEffect(() => {
    if (!courseContent || flattenedLessons.length === 0) return;

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
  }, [courseContent, flattenedLessons, lastActiveLessonId, activeLesson]);

  const handleSelectLesson = useCallback(
    (lesson: Lesson) => {
      setActiveLesson(lesson);
      setLastActiveLessonId(lesson.id);
      setCountdownTargetLesson(null);
    },
    [setLastActiveLessonId]
  );

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

  const handleNextLesson = useCallback(() => {
    if (nextLesson) handleSelectLesson(nextLesson);
  }, [nextLesson, handleSelectLesson]);

  const handlePrevLesson = useCallback(() => {
    if (prevLesson) handleSelectLesson(prevLesson);
  }, [prevLesson, handleSelectLesson]);

  const handleToggleLessonComplete = useCallback(() => {
    if (!activeLesson || !courseContent) return;

    const currentlyDone = isCompleted(activeLesson.id);
    toggleLessonCompletion(activeLesson.id, courseContent.totalLessons);

    if (!currentlyDone && autoplay && nextLesson) {
      setCountdownTargetLesson(nextLesson);
    }
  }, [activeLesson, courseContent, isCompleted, toggleLessonCompletion, autoplay, nextLesson]);

  const handleDeleteCourse = async (courseId: string) => {
    if (!user) return;
    await deleteUserCourse(user.email, courseId);
    loadCourses();
  };

  const { percentage, completedCount } = calculateProgress(courseContent?.totalLessons || 0);

  // Tela de Login (se não autenticado)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-foreground selection:bg-primary/20">
        <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border/80 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto shadow-sm">
            <GraduationCap className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold tracking-tight">Plataforma LMS Google Drive</h1>
            <p className="text-xs text-muted-foreground">
              Acesse seus cursos online consumindo vídeos e materiais diretamente do seu Drive.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={() => loginWithEmail("iury.colombo@gmail.com", "Iury Colombo")}
              className="w-full gap-2.5 font-semibold text-xs sm:text-sm h-11"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar com Google
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loginAsGuest}
              className="w-full text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Entrar como Convidado
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Topbar Global */}
      <Header
        courseTitle={
          view === "player"
            ? selectedUserCourse?.title || courseContent?.courseTitle || "Curso"
            : "Meus Cursos"
        }
        progressPercentage={percentage}
        completedLessons={completedCount}
        totalLessons={courseContent?.totalLessons || 0}
        isMock={isMock}
        isRefreshing={isRefreshing}
        user={user}
        isInPlayer={view === "player"}
        onRefresh={() => {
          if (selectedUserCourse) {
            loadCourseContent(selectedUserCourse.folderId, true);
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTutorial={() => setIsTutorialModalOpen(true)}
        onBackToDashboard={handleBackToDashboard}
        onToggleSidebarMobile={() => setIsSidebarOpenMobile((prev) => !prev)}
        onLogout={logout}
      />

      {/* Roteamento entre Telas */}
      {view === "dashboard" ? (
        <CoursesDashboard
          user={user}
          courses={userCourses}
          onSelectCourse={handleSelectCourse}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenTutorialModal={() => setIsTutorialModalOpen(true)}
          onDeleteCourse={handleDeleteCourse}
        />
      ) : (
        /* Tela de Player LMS */
        <>
          {errorMessage && (
            <div className="bg-destructive/15 border-b border-destructive/30 px-4 py-2 text-xs text-destructive flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Erro ao sincronizar: {errorMessage}</span>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-destructive underline text-xs h-auto p-0"
              >
                Configurar API
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Carregando aulas do Google Drive...</p>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              <Sidebar
                modules={courseContent?.modules || []}
                activeLesson={activeLesson}
                completedLessonIds={completedLessonIds}
                isOpenMobile={isSidebarOpenMobile}
                onSelectLesson={handleSelectLesson}
                onToggleComplete={(lessonId, e) => {
                  e.stopPropagation();
                  toggleLessonCompletion(lessonId, courseContent?.totalLessons);
                }}
                onCloseMobile={() => setIsSidebarOpenMobile(false)}
              />

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
                    <h3 className="text-base font-semibold">Nenhuma aula com vídeo encontrada</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Verifique se os vídeos dentro das subpastas possuem extensão .mp4 ou .webm.
                    </p>
                  </div>
                )}
              </main>
            </div>
          )}
        </>
      )}

      {/* Overlay de Autoplay */}
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

      {/* Modais Globais */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        userEmail={user.email}
        onClose={() => setIsAddModalOpen(false)}
        onOpenTutorial={() => setIsTutorialModalOpen(true)}
        onCourseAdded={(newCourse) => {
          loadCourses();
          handleSelectCourse(newCourse);
        }}
      />

      <DriveFolderTutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        onProceedToAddCourse={() => setIsAddModalOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveAndReload={() => {
          if (selectedUserCourse) {
            loadCourseContent(selectedUserCourse.folderId, true);
          }
          loadCourses();
        }}
      />
    </div>
  );
}

export default App;
