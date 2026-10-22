import React from "react";
import { UserCourse, User } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Plus,
  Play,
  HelpCircle,
  FolderTree,
  Trash2,
  ExternalLink,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface CoursesDashboardProps {
  user: User;
  courses: UserCourse[];
  onSelectCourse: (course: UserCourse) => void;
  onOpenAddModal: () => void;
  onOpenTutorialModal: () => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CoursesDashboard: React.FC<CoursesDashboardProps> = ({
  user,
  courses,
  onSelectCourse,
  onOpenAddModal,
  onOpenTutorialModal,
  onDeleteCourse,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card to-card/60 border border-border/80 shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/30 text-xs">
              Sua Biblioteca Pessoal
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Olá, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Acesse seus cursos hospedados no Google Drive ou adicione novas pastas para estudar.
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

      {/* Grid de Cursos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Meus Cursos ({courses.length})
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/60 rounded-3xl p-6 bg-card/30 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <FolderTree className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold">Nenhum curso cadastrado ainda</h3>
              <p className="text-xs text-muted-foreground">
                Cole o link de uma pasta compartilhada do seu Google Drive para começar a assistir suas aulas.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onOpenTutorialModal} className="text-xs">
                Ver Tutorial
              </Button>
              <Button variant="default" size="sm" onClick={onOpenAddModal} className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                Adicionar Meu Primeiro Curso
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
      </div>
    </div>
  );
};
