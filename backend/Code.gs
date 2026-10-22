/**
 * API Backend para Plataforma de Cursos com Google Drive
 * Google Apps Script - Web App
 */

// Chave padrão da pasta do Drive (pode ser sobrescrita pelo parâmetro ?folderId=... na requisição)
var DEFAULT_FOLDER_ID = "SEU_FOLDER_ID_DO_DRIVE_AQUI";

/**
 * Ponto de entrada do Web App (HTTP GET)
 */
function doGet(e) {
  try {
    var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : DEFAULT_FOLDER_ID;
    var forceRefresh = (e && e.parameter && e.parameter.refresh === "true");

    if (!folderId || folderId === "SEU_FOLDER_ID_DO_DRIVE_AQUI") {
      return createJsonResponse({
        success: false,
        error: "Parâmetro 'folderId' não fornecido ou inválido. Envie ?folderId=ID_DA_PASTA na URL."
      });
    }

    var cache = CacheService.getScriptCache();
    var cacheKey = "course_data_" + folderId;
    
    if (!forceRefresh) {
      var cached = cache.get(cacheKey);
      if (cached) {
        return ContentService.createTextOutput(cached)
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Processa a pasta raiz do Drive
    var rootFolder = DriveApp.getFolderById(folderId);
    var courseTitle = rootFolder.getName();
    var modules = [];
    var totalLessons = 0;

    // Percorre as subpastas (Módulos)
    var subfolders = rootFolder.getFolders();
    var rawModules = [];

    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      var folderName = folder.getName();
      var orderMatch = folderName.match(/^(\d+)[\s-_.]*/);
      var order = orderMatch ? parseInt(orderMatch[1], 10) : 999;
      
      rawModules.push({
        folder: folder,
        name: folderName,
        order: order
      });
    }

    // Ordena os módulos numericamente
    rawModules.sort(function(a, b) {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });

    // Processa o conteúdo de cada módulo
    for (var i = 0; i < rawModules.length; i++) {
      var modItem = rawModules[i];
      var folder = modItem.folder;
      var cleanModuleTitle = modItem.name.replace(/^\d+[\s-_.]+/, "").trim();

      var files = folder.getFiles();
      var videoFiles = [];
      var attachmentFiles = [];

      while (files.hasNext()) {
        var file = files.next();
        var mime = file.getMimeType();
        var fileName = file.getName();

        if (isVideo(mime, fileName)) {
          var vOrderMatch = fileName.match(/^(\d+)[\s-_.]*/);
          videoFiles.push({
            id: file.getId(),
            rawName: fileName,
            order: vOrderMatch ? parseInt(vOrderMatch[1], 10) : 999,
            mime: mime
          });
        } else {
          var aOrderMatch = fileName.match(/^(\d+)[\s-_.]*/);
          attachmentFiles.push({
            id: file.getId(),
            rawName: fileName,
            order: aOrderMatch ? parseInt(aOrderMatch[1], 10) : null,
            mime: mime
          });
        }
      }

      // Ordena as aulas numericamente
      videoFiles.sort(function(a, b) {
        if (a.order !== b.order) return a.order - b.order;
        return a.rawName.localeCompare(b.rawName);
      });

      var moduleLessons = [];

      for (var j = 0; j < videoFiles.length; j++) {
        var v = videoFiles[j];
        totalLessons++;
        
        var cleanLessonTitle = v.rawName
          .replace(/^\d+[\s-_.]+/, "")
          .replace(/\.(mp4|webm|mkv|mov|avi)$/i, "")
          .trim();

        // Encontra anexos vinculados a esta aula pelo prefixo numérico
        var lessonAttachments = [];
        for (var k = 0; k < attachmentFiles.length; k++) {
          var att = attachmentFiles[k];
          if (att.order !== null && att.order === v.order) {
            lessonAttachments.push({
              id: att.id,
              title: att.rawName.replace(/^\d+[\s-_.]+/, "").trim(),
              mimeType: att.mime,
              viewUrl: "https://drive.google.com/file/d/" + att.id + "/view",
              downloadUrl: "https://drive.google.com/uc?export=download&id=" + att.id
            });
          }
        }

        moduleLessons.push({
          id: v.id,
          title: cleanLessonTitle || v.rawName,
          order: j + 1,
          videoUrl: "https://drive.google.com/file/d/" + v.id + "/preview",
          attachments: lessonAttachments
        });
      }

      // Anexos gerais do módulo (sem numeração ou com numeração sem vídeo correspondente)
      var generalAttachments = [];
      for (var k = 0; k < attachmentFiles.length; k++) {
        var att = attachmentFiles[k];
        var isLinked = moduleLessons.some(function(l) {
          return l.attachments.some(function(a) { return a.id === att.id; });
        });
        if (!isLinked) {
          generalAttachments.push({
            id: att.id,
            title: att.rawName.replace(/^\d+[\s-_.]+/, "").trim(),
            mimeType: att.mime,
            viewUrl: "https://drive.google.com/file/d/" + att.id + "/view",
            downloadUrl: "https://drive.google.com/uc?export=download&id=" + att.id
          });
        }
      }

      modules.push({
        id: folder.getId(),
        title: cleanModuleTitle || modItem.name,
        order: i + 1,
        lessons: moduleLessons,
        generalAttachments: generalAttachments
      });
    }

    var resultData = {
      success: true,
      courseTitle: courseTitle,
      totalLessons: totalLessons,
      modules: modules,
      updatedAt: new Date().toISOString()
    };

    var jsonOutput = JSON.stringify(resultData);

    // Salva no cache por 6 horas (21600 segundos) se o tamanho permitir (< 100KB)
    try {
      if (jsonOutput.length < 90000) {
        cache.put(cacheKey, jsonOutput, 21600);
      }
    } catch (cacheErr) {
      // Ignora erro de cache silenciosamente caso o payload exceda limite do Apps Script
    }

    return ContentService.createTextOutput(jsonOutput)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: "Erro ao ler a pasta do Google Drive: " + error.toString(),
      hint: "Verifique se o ID da pasta está correto e se o compartilhamento foi definido como 'Qualquer pessoa com o link pode ver'."
    });
  }
}

/**
 * Identifica se o arquivo é um vídeo válido
 */
function isVideo(mime, fileName) {
  if (mime && mime.indexOf("video/") === 0) return true;
  return /\.(mp4|webm|mkv|mov|avi)$/i.test(fileName);
}

/**
 * Cria resposta formatada em JSON com cabeçalhos apropriados
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
