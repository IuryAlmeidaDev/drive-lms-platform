import React, { useState } from "react";
import { UserCourse, User } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  GraduationCap,
  Plus,
  Play,
  HelpCircle,
  FolderTree,
  Trash2,
  BookOpen,
  Sparkles,
  Share2,
  FolderLock,
} from "lucide-react";

interface CoursesDashboardProps {
  user: User;
  courses: UserCourse[];
  sharedCourses: UserCourse[];
  onSelectCourse: (course: UserCourse) => void;
  onOpenAddModal: () => void;
  onOpenTutorialModal: () => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CoursesDashboard: React.FC<CoursesDashboardProps> = ({
  user,
  courses,
  sharedCourses,
  onSelectCourse,
  onOpenAddModal,
  onOpenTutorialModal,
  onDeleteCourse,
}) => {
  // Se for visitante ou não tiver cursos próprios, pode iniciar na aba de compartilhados
  const [selectedTab, setSelectedTab] = useState<string>(
    user.isGuest || courses.length === 0 ? "personal" : "personal"
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card to-card/60 border border-border/80 shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/30 text-xs">
              {user.isGuest ? "Modo Visitante" : "Sua Conta Pessoal"}
            </Badge>
            <span className="text-xs text-muted-foreground">• {user.email}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Olá, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Acesse seus próprios cursos do Google Drive ou explore o curso modelo compartilhado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTutorialModal}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            Como Organizar Pastas
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onOpenAddModal}
            className="text-xs gap-1.5 font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" />
            Adicionar Novo Curso
          </Button>
        </div>
      </div>

      {/* Navegação por Abas (Meus Cursos vs Cursos Compartilhados) */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <TabsList className="bg-secondary/40 p-1 rounded-xl h-11 border border-border/50">
            <TabsTrigger
              value="personal"
              className="text-xs sm:text-sm gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              <FolderLock className="h-4 w-4" />
              Meus Cursos ({courses.length})
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="text-xs sm:text-sm gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              <Share2 className="h-4 w-4" />
              Cursos Compartilhados ({sharedCourses.length})
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground">
            {selectedTab === "personal"
              ? "Exibindo apenas os cursos da sua conta."
              : "Exibindo cursos de demonstração compartilhados para todos."}
          </div>
        </div>

        {/* ABA 1: MEUS CURSOS */}
        <TabsContent value="personal" className="space-y-4 m-0 focus-visible:outline-none">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-border/70 rounded-3xl p-8 bg-card/30 space-y-5">
              <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <FolderTree className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-bold text-foreground">
                  Nenhum curso adicionado na sua conta ainda
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta é a sua biblioteca privativa. Cole o link ou ID de uma pasta pública do seu Google Drive para assistir aos seus vídeos com progresso salvo.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="default" size="sm" onClick={onOpenAddModal} className="text-xs gap-1.5 shadow-md">
                  <Plus className="h-4 w-4" />
                  Adicionar Meu Primeiro Curso
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedTab("shared")} className="text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10">
                  <Sparkles className="h-4 w-4" />
                  Ver Curso Java Compartilhado
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => {
                const isFinished = course.progressPercentage === 100;

                return (
                  <Card
                    key={course.id}
                    className="group flex flex-col justify-between overflow-hidden bg-card/60 hover:bg-card border-border/70 hover:border-border transition-all hover:shadow-xl rounded-2xl"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Cabeçalho do Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Deseja remover "${course.title}" da sua lista?`)) {
                                onDeleteCourse(course.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Remover curso"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Informações */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {course.totalLessons} {course.totalLessons === 1 ? "aula" : "aulas"} • Google Drive
                        </p>
                      </div>

                      {/* Progresso */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progresso:</span>
                          <span className="font-semibold text-foreground">
                            {course.completedLessons}/{course.totalLessons} ({course.progressPercentage}%)
                          </span>
                        </div>
                        <Progress value={course.progressPercentage} className="h-2 w-full" />
                      </div>

                      {/* Ação */}
                      <div className="pt-2">
                        <Button
                          variant={isFinished ? "secondary" : "default"}
                          size="sm"
                          onClick={() => onSelectCourse(course)}
                          className="w-full text-xs gap-1.5 font-semibold group-hover:shadow-md transition-all"
                        >
                          {isFinished ? (
                            <>
                              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                              Rever Curso Completo
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 fill-current" />
                              Continuar Assistindo
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ABA 2: CURSOS COMPARTILHADOS */}
        <TabsContent value="shared" className="space-y-4 m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sharedCourses.map((course) => {
              const isFinished = course.progressPercentage === 100;

              return (
                <Card
                  key={course.id}
                  className="group flex flex-col justify-between overflow-hidden bg-card/70 hover:bg-card border-primary/30 hover:border-primary/60 transition-all hover:shadow-xl rounded-2xl relative"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Cabeçalho do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary group-hover:scale-105 transition-transform">
                        <Share2 className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                        Compartilhado
                      </Badge>
                    </div>

                    {/* Informações */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {course.totalLessons} aulas • 6 módulos • Rocketseat
                      </p>
                      <p className="text-[11px] text-primary/80 font-medium">
                        Disponibilizado por: {course.sharedBy || "Iury Colombo"}
                      </p>
                    </div>

                    {/* Progresso do usuário no curso compartilhado */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Seu Progresso:</span>
                        <span className="font-semibold text-foreground">
                          {course.completedLessons}/{course.totalLessons} ({course.progressPercentage}%)
                        </span>
                      </div>
                      <Progress value={course.progressPercentage} className="h-2 w-full" />
                    </div>

                    {/* Ação */}
                    <div className="pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onSelectCourse(course)}
                        className="w-full text-xs gap-1.5 font-semibold shadow-md group-hover:shadow-lg transition-all"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Assistir Curso Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
