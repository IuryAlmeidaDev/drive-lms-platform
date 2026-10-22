# Guia Passo a Passo: Publicando o Google Apps Script (Backend)

Siga estes passos simples para colocar sua API do Google Drive no ar em menos de 3 minutos. Não é necessário cartão de crédito nem configuração no Google Cloud Platform.

---

### Passo 1: Preparar a Pasta no Google Drive
1. Crie uma pasta principal no seu Google Drive (ex: `Meu Curso Online`).
2. Clique com o botão direito na pasta > **Compartilhar** > **Compartilhar**.
3. Em **Acesso geral**, altere de *Restrito* para: **Qualquer pessoa com o link** (como *Leitor*).
4. Copie o link da pasta ou pegue o **ID da Pasta** da URL do navegador:
   * Exemplo: `https://drive.google.com/drive/folders/`**`1a2B3c4D5e6F7g8H9i0`**
   * O ID é a parte em negrito após `/folders/`.

---

### Passo 2: Criar o Projeto no Google Apps Script
1. Acesse: [https://script.google.com/home/start](https://script.google.com/home/start)
2. Clique no botão azul **Novo projeto** (canto superior esquerdo).
3. Renomeie o projeto no topo de *Projeto sem título* para **API Curso Drive**.
4. Apague todo o conteúdo do arquivo `Código.gs` existente.
5. Copie e cole todo o conteúdo do arquivo `Code.gs` deste projeto.
6. (Opcional) Você pode colar o ID da sua pasta na linha 7 (`DEFAULT_FOLDER_ID`), ou pode passar o ID direto pela URL no frontend.
7. Pressione `Ctrl + S` para salvar o script.

---

### Passo 3: Implantar como Web App
1. No canto superior direito, clique no botão azul **Implantar** (Deploy) > **Nova implantação**.
2. Na engrenagem ao lado de "Selecione o tipo", escolha **Aplicativo da Web** (Web app).
3. Preencha as opções exatamente assim:
   * **Descrição:** `Versão 1 - API de Aulas`
   * **Executar como:** `Eu (seu_email@gmail.com)`
   * **Quem pode acessar:** `Qualquer pessoa` *(Importantíssimo para o frontend conseguir carregar os dados)*
4. Clique em **Implantar**.

---

### Passo 4: Conceder Autorização do Google
1. Uma janela pop-up chamada **"Autorização necessária"** aparecerá.
2. Clique em **Revisar permissões**.
3. Escolha a sua conta Google.
4. O Google mostrará uma tela de aviso: *"O Google não verificou este app"*. Isso é normal porque é um script pessoal seu!
5. Clique em **Avançado** (canto inferior esquerdo do aviso) e depois em **Acessar API Curso Drive (não seguro)**.
6. Clique em **Permitir**.

---

### Passo 5: Copiar a URL do Web App
1. Após a autorização, a tela mostrará a **URL do aplicativo da Web**:
   * Será algo como: `https://script.google.com/macros/s/AKfycbx.../exec`
2. Clique em **Copiar**.
3. Cole essa URL no painel de configurações da plataforma frontend!
