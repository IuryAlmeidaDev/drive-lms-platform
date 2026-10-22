# Plataforma de Curso com Google Drive & Google Apps Script

[![Acessar Plataforma](https://img.shields.io/badge/Acessar%20Plataforma-Online-brightgreen?style=for-the-badge&logo=vercel)](https://drive-lms-platform.vercel.app)

Uma plataforma LMS moderna, de alta performance e visual impecável (construída com **React + TypeScript + Tailwind CSS + shadcn/ui**), alimentada diretamente por arquivos de vídeo e materiais hospedados em pastas do seu **Google Drive**, através de uma API serverless gratuita criada no **Google Apps Script**.

🔗 **Link de Acesso Direto:** [https://drive-lms-platform.vercel.app](https://drive-lms-platform.vercel.app)

---

## 🚀 Funcionalidades Principais

- 🎥 **Streaming Direto do Google Drive:** Player 16:9 integrado com suporte a legendas, múltiplas resoluções e modo tela cheia.
- ⚡ **Autoplay Inteligente com Contagem Regressiva:** Ao concluir uma aula, avança automaticamente para a próxima com um contador suave de 5 segundos e opção de cancelar/assistir agora.
- 📂 **Módulos & Aulas Automáticos:** Organiza automaticamente os módulos e aulas conforme a hierarquia e numeração das suas pastas no Drive (`01 - Introdução`, `01 - Aula 1.mp4`).
- 📄 **Aba de Materiais de Apoio:** Detecta PDFs, documentos Word, planilhas e arquivos `.zip` anexados a cada aula, permitindo visualização direta e download com 1 clique.
- 📝 **Bloco de Anotações Pessoais:** Espaço para o aluno registrar resumos da aula salvos instantaneamente no navegador.
- 📊 **Acompanhamento de Progresso:** Barra de progresso percentual, checklist visual em cada aula e animação comemorativa com confetes ao concluir aulas e o curso.
- 💾 **Persistência Local (Sem Banco de Dados):** Todo o histórico do aluno e anotações ficam salvos em `localStorage`.
- ⚙️ **Conexão Dinâmica:** Permite configurar a URL da API do Google Apps Script e o ID da pasta do Drive diretamente pela interface, com suporte a modo demonstração (mock).

---

## 📁 Estrutura do Projeto

```text
plataforma-curso-drive/
├── backend/
│   ├── Code.gs                   # Código do Google Apps Script (Web App API)
│   ├── appsscript.json           # Manifesto com permissões do Drive
│   └── INSTRUCOES_APPS_SCRIPT.md # Guia passo a passo de publicação do script
└── frontend/
    ├── src/
    │   ├── components/           # Componentes da interface
    │   │   ├── ui/               # Componentes shadcn/ui (Button, Accordion, Progress, Switch, etc.)
    │   │   ├── Header.tsx        # Topbar com progresso e ações
    │   │   ├── Sidebar.tsx       # Grade curricular sanfonada com busca
    │   │   ├── VideoPlayer.tsx   # Player e barra de controles
    │   │   ├── LessonMaterials.tsx # Abas de PDFs, anotações e detalhes
    │   │   ├── AutoplayCountdown.tsx # Card flutuante de avanço automático
    │   │   └── SettingsModal.tsx # Modal de conexão com o Drive
    │   ├── hooks/
    │   │   └── useCourseProgress.ts # Hook de progresso e persistência
    │   ├── services/
    │   │   ├── courseService.ts  # Cliente de consumo da API do Drive
    │   │   └── mockData.ts       # Dados realistas para testes imediatos
    │   ├── types/
    │   │   └── course.ts         # Tipagem TypeScript
    │   ├── App.tsx               # Orquestrador da aplicação
    │   └── main.tsx
    ├── package.json
    └── tailwind.config.js
```

---

## 🛠️ Como Executar Localmente

### 1. Iniciar o Frontend
```bash
cd plataforma-curso-drive/frontend
npm install
npm run dev
```
Abra o navegador no endereço exibido (geralmente `http://localhost:5173`). O projeto iniciará imediatamente no **Modo Demonstração** para você testar todas as funcionalidades.

### 2. Conectar com suas Pastas Reais do Google Drive
1. Abra o arquivo `backend/INSTRUCOES_APPS_SCRIPT.md` e siga os 5 passos rápidos para publicar o script no [script.google.com](https://script.google.com).
2. Na plataforma frontend aberta no navegador, clique no botão **"Conectar Drive"** no topo.
3. Cole a URL gerada pelo Google Apps Script (`https://script.google.com/macros/s/.../exec`) e salve.
4. Suas pastas, vídeos e PDFs aparecerão automaticamente sincronizados!
