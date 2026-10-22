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
import { FolderGit2, Check, ExternalLink, HelpCircle, AlertCircle } from "lucide-react";
import { getStoredConfig, saveStoredConfig } from "@/services/courseService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveAndReload,
}) => {
  const currentConfig = getStoredConfig();
  const [apiUrl, setApiUrl] = useState(currentConfig.apiUrl);
  const [folderId, setFolderId] = useState(currentConfig.folderId);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    saveStoredConfig({
      apiUrl,
      folderId,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSaveAndReload();
      onClose();
    }, 600);
  };

  const handleResetToMock = () => {
    setApiUrl("");
    setFolderId("");
    saveStoredConfig({ apiUrl: "", folderId: "" });
    onSaveAndReload();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <FolderGit2 className="h-5 w-5" />
            <DialogTitle>Conectar ao Google Drive</DialogTitle>
          </div>
          <DialogDescription>
            Insira a URL do seu Web App publicado no Google Apps Script para sincronizar suas aulas e pastas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Campo 1: URL do Web App */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>URL do Aplicativo da Web (Google Apps Script)</span>
              <span className="text-[10px] text-muted-foreground font-normal">Obrigatório</span>
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full rounded-xl bg-secondary/50 border border-input/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all"
            />
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <HelpCircle className="h-3 w-3 shrink-0" />
              Obtido ao clicar em <strong>Implantar &gt; Nova Implantação &gt; Aplicativo da Web</strong> no Apps Script.
            </p>
          </div>

          {/* Campo 2: ID da Pasta do Drive (Opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>ID da Pasta Raiz no Google Drive</span>
              <span className="text-[10px] text-muted-foreground font-normal">Opcional se já configurado no script</span>
            </label>
            <input
              type="text"
              placeholder="ex: 1A2b3C4d5E6f7G8h9I0"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full rounded-xl bg-secondary/50 border border-input/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all"
            />
            <p className="text-[11px] text-muted-foreground">
              O código final que fica na barra de endereço ao abrir a pasta no Google Drive.
            </p>
          </div>

          {/* Dica de Permissão */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs text-foreground/90 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <AlertCircle className="h-4 w-4" />
              Importante: Compartilhamento da Pasta
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              A pasta raiz no Google Drive precisa estar com permissão <strong>"Qualquer pessoa com o link pode ver"</strong> para que os vídeos carreguem sem bloqueio no navegador.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between items-center w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToMock}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Usar dados de demonstração
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              className="text-xs gap-1.5 font-semibold"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Salvo!
                </>
              ) : (
                "Salvar e Conectar"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
