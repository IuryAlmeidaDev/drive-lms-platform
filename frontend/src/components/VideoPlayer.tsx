import React from "react";
import { Lesson } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface VideoPlayerProps {
  lesson: Lesson;
  moduleTitle: string;
  isCompleted: boolean;
  autoplay: boolean;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  onToggleComplete: () => void;
  onNextLesson: () => void;
  onPrevLesson: () => void;
  onToggleAutoplay: (enabled: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  moduleTitle,
  isCompleted,
  autoplay,
  hasPrevLesson,
  hasNextLesson,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
  onToggleAutoplay,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Container do Player com Proporção 16:9 Estilo Cinema */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-2xl border border-border/70 group">
        <iframe
          key={lesson.id}
          src={lesson.videoUrl}
          title={lesson.title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Barra de Controles e Navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border/60 shadow-sm">
        {/* Lado Esquerdo: Título & Módulo */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-medium text-primary border-primary/30">
              {moduleTitle}
            </Badge>
            {isCompleted && (
              <Badge variant="success" className="text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Concluída
              </Badge>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {lesson.order}. {lesson.title}
          </h2>
        </div>

        {/* Lado Direito: Ações (Anterior, Concluir, Próxima, Autoplay) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-auto">
          {/* Switch de Autoplay */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-muted-foreground select-none font-medium">Autoplay:</span>
            <Switch
              checked={autoplay}
              onCheckedChange={onToggleAutoplay}
              aria-label="Ativar reprodução automática"
            />
          </div>

          {/* Navegação entre aulas */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              className="text-xs gap-1"
              title="Ir para aula anterior"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <Button
              variant={isCompleted ? "secondary" : "default"}
              size="sm"
              onClick={onToggleComplete}
              className="text-xs gap-1.5 font-medium transition-all"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Concluída</span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" />
                  <span>Concluir</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextLesson}
              disabled={!hasNextLesson}
              className="text-xs gap-1"
              title="Avançar para próxima aula"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
