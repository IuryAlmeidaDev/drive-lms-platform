import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderPlus, HelpCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { addUserCourse } from "@/services/courseService";
import { UserCourse } from "@/types/course";

interface AddCourseModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onOpenTutorial: () => void;
  onCourseAdded: (course: UserCourse) => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  userEmail,
  onClose,
  onOpenTutorial,
  onCourseAdded,
}) => {
  const [folderInput, setFolderInput] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const result = await addUserCourse(userEmail, folderInput, customTitle);

    setIsLoading(false);

    if (result.success && result.course) {
      onCourseAdded(result.course);
      setFolderInput("");
      setCustomTitle("");
      onClose();
    } else {
      setErrorMessage(
        result.error ||
          "Não foi possível ler a pasta. Verifique se o link está correto e compartilhado publicamente."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <FolderPlus className="h-5 w-5" />
            <DialogTitle className="text-lg">Adicionar Novo Curso</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Cole o link ou ID da pasta do seu curso no Google Drive para adicioná-lo à sua biblioteca.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Campo: Link ou ID da pasta */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Link ou ID da Pasta no Drive</span>
              <span className="text-[10px] text-primary font-normal">*Obrigatório</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: https://drive.google.com/drive/folders/1a2B3c..."
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              className="w-full rounded-xl bg-secondary/50 border border-input/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all"
            />
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTutorial();
                }}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <HelpCircle className="h-3 w-3" />
                Como organizar as pastas? (Ver tutorial)
              </button>
            </div>
          </div>

          {/* Campo Opcional: Título Customizado */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Título do Curso</span>
              <span className="text-[10px] text-muted-foreground font-normal">Opcional</span>
            </label>
            <input
              type="text"
              placeholder="Deixe em branco para usar o nome da pasta no Drive"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full rounded-xl bg-secondary/50 border border-input/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isLoading || !folderInput.trim()}
              className="text-xs gap-1.5 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Validando Pasta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Adicionar Curso
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
