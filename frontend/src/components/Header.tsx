import React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Settings2, Menu, RefreshCw, FolderGit2 } from "lucide-react";

interface HeaderProps {
  courseTitle: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  isMock: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  courseTitle,
  progressPercentage,
  completedLessons,
  totalLessons,
  isMock,
  isRefreshing,
  onRefresh,
  onOpenSettings,
  onToggleSidebarMobile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Menu + Course Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={onToggleSidebarMobile}
            aria-label="Alternar menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight line-clamp-1">
                  {courseTitle}
                </h1>
                {isMock && (
                  <Badge variant="warning" className="hidden sm:inline-flex text-[10px] py-0 px-2">
                    Modo Demonstração
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Streaming direto via Google Drive
              </p>
            </div>
          </div>
        </div>

        {/* Right: Progress Tracker + Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Progress Bar Container */}
          <div className="flex flex-col items-end gap-1.5 min-w-[130px] sm:min-w-[190px]">
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-muted-foreground font-medium hidden sm:inline">Seu Progresso:</span>
              <span className="font-semibold text-foreground">
                {completedLessons}/{totalLessons} <span className="text-muted-foreground font-normal">({progressPercentage}%)</span>
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 w-full" />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Recarregar aulas do Drive"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex text-xs font-medium"
              onClick={onOpenSettings}
            >
              <FolderGit2 className="h-4 w-4 text-primary" />
              Conectar Drive
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-muted-foreground"
              onClick={onOpenSettings}
              title="Configurações da API"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
