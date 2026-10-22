import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Course, Lesson, Module, UserCourse } from "@/types/course";
import {
  fetchCourseData,
  fetchUserCourses,
  deleteUserCourse,
  getSharedCourses,
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
import { AlertCircle, Loader2, Sparkles, GraduationCap, Play, FolderLock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function App() {
  const { user, isAuthenticated, loginWithEmail, loginAsGuest, logout } = useAuth();

  // Cursos compartilhados disponíveis para demonstração
  const sharedCourses = useMemo(() => getSharedCourses(), []);
  const [loginEmailInput, setLoginEmailInput] = useState("");

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

  const handleAccessSharedCourse = useCallback(() => {
    loginAsGuest();
    const shared = sharedCourses[0];
    if (shared) {
      setSelectedUserCourse(shared);
      setActiveLesson(null);
      setView("player");
      loadCourseContent(shared.folderId);
    }
  }, [loginAsGuest, sharedCourses, loadCourseContent]);

  const handleLoginSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginEmailInput.trim()) return;
      loginWithEmail(loginEmailInput.trim());
    },
    [loginEmailInput, loginWithEmail]
  );

  // Tela de Boas-Vindas / Escolha de Acesso (se não autenticado)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 text-foreground selection:bg-primary/20">
        <div className="w-full max-w-2xl p-6 sm:p-10 rounded-3xl bg-card border border-border/80 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-200">
          <div className="space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto shadow-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Plataforma LMS Google Drive</h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Assista a cursos diretamente do Google Drive com player 16:9, avanço automático e materiais de apoio.
              </p>
            </div>
          </div>

          {/* Duas opções claras de acesso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {/* Opção 1: Curso Compartilhado */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/70 hover:border-primary/40 transition-all space-y-4 group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary/40 text-primary text-[10px] bg-primary/10">
                    Acesso Aberto
                  </Badge>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  Ver Curso Compartilhado
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Acesse o <strong>Curso JAVA (Rocketseat)</strong> com 6 módulos e 37 aulas disponibilizado pelo autor. Não precisa vincular pasta.
                </p>
              </div>

              <Button
                variant="default"
                size="default"
                onClick={handleAccessSharedCourse}
                className="w-full text-xs font-semibold h-11 gap-2 shadow-md group-hover:shadow-primary/20"
              >
                <Play className="h-4 w-4 fill-current" />
                Assistir Curso Compartilhado
              </Button>
            </div>

            {/* Opção 2: Meu Espaço Pessoal */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/70 hover:border-primary/40 transition-all space-y-4 group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-[10px]">
                    Biblioteca Privada
                  </Badge>
                  <FolderLock className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  Acessar Meus Cursos
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Entre com seu e-mail para ver <strong>apenas o que você tem acesso</strong> e vincular suas próprias pastas do Drive.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="seu-email@gmail.com"
                    value={loginEmailInput}
                    onChange={(e) => setLoginEmailInput(e.target.value)}
                    className="h-11 text-xs bg-background/80"
                    required
                  />
                  <Button type="submit" variant="secondary" className="h-11 text-xs font-semibold px-4 shrink-0">
                    Entrar
                  </Button>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-muted-foreground">É o autor?</span>
                  <button
                    type="button"
                    onClick={() => loginWithEmail("iury.colombo@gmail.com", "Iury Colombo")}
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar como Iury Colombo
                  </button>
                </div>
              </form>
            </div>
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
          sharedCourses={sharedCourses}
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
