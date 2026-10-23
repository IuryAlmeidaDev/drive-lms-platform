import React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Settings2,
  Menu,
  RefreshCw,
  FolderGit2,
  ChevronLeft,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";
import { User } from "@/types/course";
import { UserAvatar } from "@/components/UserAvatar";

interface HeaderProps {
  courseTitle: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  isMock: boolean;
  isRefreshing: boolean;
  user: User | null;
  isInPlayer: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onBackToDashboard: () => void;
  onToggleSidebarMobile: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  courseTitle,
  progressPercentage,
  completedLessons,
  totalLessons,
  isMock,
  isRefreshing,
  user,
  isInPlayer,
  isDark,
  onToggleTheme,
  onRefresh,
  onOpenSettings,
  onOpenTutorial,
  onBackToDashboard,
  onToggleSidebarMobile,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Voltar ou Mobile Menu + Título */}
        <div className="flex items-center gap-3">
          {isInPlayer ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground hover:text-foreground"
                onClick={onToggleSidebarMobile}
                aria-label="Alternar menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onBackToDashboard}
                className="text-xs gap-1.5 h-8 font-medium"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Meus Cursos</span>
              </Button>
            </div>
          ) : null}

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-foreground tracking-tight line-clamp-1">
                  {courseTitle}
                </h1>
                {isMock && (
                  <Badge variant="warning" className="hidden sm:inline-flex text-[10px] py-0 px-2">
                    Modo Demonstração
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Plataforma LMS Google Drive
              </p>
            </div>
          </div>
        </div>

        {/* Right: Progresso (quando no player) + Perfil do Usuário */}
        <div className="flex items-center gap-3 sm:gap-5">
          {isInPlayer && (
            <div className="flex flex-col items-end gap-1.5 min-w-[120px] sm:min-w-[170px]">
              <div className="flex items-center justify-between w-full text-[11px] sm:text-xs">
                <span className="text-muted-foreground font-medium hidden sm:inline">Progresso:</span>
                <span className="font-semibold text-foreground">
                  {completedLessons}/{totalLessons} <span className="text-muted-foreground font-normal">({progressPercentage}%)</span>
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1.5 sm:h-2 w-full" />
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isInPlayer && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Recarregar aulas do Drive"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onOpenTutorial}
              title="Como organizar pastas no Drive"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onOpenSettings}
              title="Configurações da API"
            >
              <Settings2 className="h-4 w-4" />
            </Button>

            {/* Alternador de Tema (Claro / Escuro) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onToggleTheme}
              title={isDark ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500 hover:-rotate-12 transition-transform" />
              )}
            </Button>

            {/* Avatar / Usuário */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                <UserAvatar user={user} size="md" />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground line-clamp-1 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 leading-tight">
                    {user.isGuest ? "Visitante" : user.email}
                  </span>
                </div>

                {user.isGuest ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                    className="h-7 px-2 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10 ml-1"
                    title="Fazer login na sua conta pessoal"
                  >
                    <LogIn className="h-3 w-3" />
                    Entrar
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Sair / Trocar de conta"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
