import React, { useState, useMemo } from "react";
import { Module, Lesson } from "@/types/course";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Play, FileText, Search, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  modules: Module[];
  activeLesson: Lesson | null;
  completedLessonIds: string[];
  isOpenMobile: boolean;
  onSelectLesson: (lesson: Lesson) => void;
  onToggleComplete: (lessonId: string, e: React.MouseEvent) => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  modules,
  activeLesson,
  completedLessonIds,
  isOpenMobile,
  onSelectLesson,
  onToggleComplete,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Determina quais módulos devem iniciar abertos (por padrão todos ou o módulo da aula ativa)
  const defaultOpenModules = useMemo(() => {
    return modules.map((m) => m.id);
  }, [modules]);

  // Filtro de busca nas aulas
  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return modules;
    const term = searchTerm.toLowerCase();

    return modules
      .map((mod) => {
        const matchesModule = mod.title.toLowerCase().includes(term);
        const filteredLessons = mod.lessons.filter(
          (l) =>
            l.title.toLowerCase().includes(term) ||
            l.attachments.some((a) => a.title.toLowerCase().includes(term))
        );

        if (matchesModule || filteredLessons.length > 0) {
          return {
            ...mod,
            lessons: matchesModule ? mod.lessons : filteredLessons,
          };
        }
        return null;
      })
      .filter(Boolean) as Module[];
  }, [modules, searchTerm]);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card border-r border-border/80 text-card-foreground">
      {/* Header da Sidebar com busca */}
      <div className="p-4 border-b border-border/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Grade Curricular
            </h2>
          </div>
          <Badge variant="secondary" className="text-[11px] font-medium">
            {modules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas
          </Badge>
        </div>

        {/* Input de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar aula ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-secondary/50 border border-input/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Módulos & Aulas com Scroll Suave */}
      <ScrollArea className="flex-1 px-3 py-2">
        {filteredModules.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Nenhuma aula encontrada para "{searchTerm}".
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={defaultOpenModules} className="space-y-1">
            {filteredModules.map((module) => {
              const moduleCompletedCount = module.lessons.filter((l) =>
                completedLessonIds.includes(l.id)
              ).length;
              const isModuleCompleted =
                module.lessons.length > 0 && moduleCompletedCount === module.lessons.length;

              return (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border border-border/40 rounded-xl overflow-hidden bg-card/50 shadow-sm transition-colors hover:border-border/80"
                >
                  <AccordionTrigger className="px-3.5 py-3 hover:no-underline group">
                    <div className="flex flex-col items-start gap-1 pr-2 text-left">
                      <div className="flex items-center gap-2">
                        {isModuleCompleted && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {module.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {moduleCompletedCount} de {module.lessons.length} concluídas
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-2 pt-1 px-1.5 space-y-1">
                    {module.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isDone = completedLessonIds.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            onSelectLesson(lesson);
                            onCloseMobile();
                          }}
                          className={cn(
                            "group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-all cursor-pointer select-none",
                            isActive
                              ? "bg-primary/15 text-primary font-medium border border-primary/30 shadow-xs"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {/* Checkbox de Conclusão */}
                          <button
                            type="button"
                            onClick={(e) => onToggleComplete(lesson.id, e)}
                            className="p-1 rounded-md text-muted-foreground/60 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors shrink-0"
                            title={isDone ? "Marcar como não concluída" : "Marcar como concluída"}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </button>

                          {/* Título da Aula */}
                          <div className="flex-1 min-w-0 pr-1">
                            <p
                              className={cn(
                                "truncate transition-colors",
                                isDone && !isActive && "text-muted-foreground/80 line-through decoration-muted-foreground/40",
                                isActive && "text-foreground font-semibold"
                              )}
                            >
                              {lesson.order}. {lesson.title}
                            </p>
                          </div>

                          {/* Indicadores: Play ativo ou Anexos */}
                          <div className="flex items-center gap-1 shrink-0">
                            {lesson.attachments.length > 0 && (
                              <span
                                className="flex items-center gap-0.5 text-[10px] text-muted-foreground/80 bg-secondary/80 px-1.5 py-0.5 rounded"
                                title={`${lesson.attachments.length} anexo(s)`}
                              >
                                <FileText className="h-2.5 w-2.5" />
                                {lesson.attachments.length}
                              </span>
                            )}
                            {isActive && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                                <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Fixa */}
      <aside className="hidden md:block w-80 lg:w-96 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Drawer Mobile Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col w-4/5 max-w-sm h-full z-10 bg-card shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border/80">
              <span className="text-sm font-bold text-foreground">Menu de Aulas</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
