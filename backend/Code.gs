/**
 * API Backend para Plataforma de Cursos com Google Drive & Google Sheets DB
 * Google Apps Script - Web App
 */

var DEFAULT_FOLDER_ID = "1TzxdXZwV3Ful0ad05zWEZpJMc3TLE4oi";

/**
 * Ponto de entrada do Web App (HTTP GET)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
    var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : "";
    var email = (e && e.parameter && e.parameter.email) ? e.parameter.email.trim().toLowerCase() : "";

    // 1. Rota: Listar cursos de um usuário
    if (action === "getCourses") {
      if (!email) {
        return createJsonResponse({ success: false, error: "Parâmetro 'email' é obrigatório." });
      }
      return getCoursesForUser(email);
    }

    // 2. Rota: Buscar progresso de um usuário em um curso
    if (action === "getProgress") {
      var courseId = (e && e.parameter && e.parameter.courseId) ? e.parameter.courseId : "";
      if (!email || !courseId) {
        return createJsonResponse({ success: false, error: "Parâmetros 'email' e 'courseId' são obrigatórios." });
      }
      return getProgressForUserCourse(email, courseId);
    }

    // 3. Rota: Carregar conteúdo de um curso (árvore de módulos, vídeos e PDFs)
    var targetFolderId = folderId || DEFAULT_FOLDER_ID;
    if (!targetFolderId) {
      return createJsonResponse({
        success: false,
        error: "Parâmetro 'folderId' não fornecido ou inválido. Envie ?folderId=ID_DA_PASTA na URL."
      });
    }

    var forceRefresh = (e && e.parameter && e.parameter.refresh === "true");
    return getCourseContentFromDrive(targetFolderId, forceRefresh);

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: "Erro na requisição GET: " + error.toString()
    });
  }
}

/**
 * Ponto de entrada do Web App (HTTP POST)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Corpo da requisição POST vazio ou inválido." });
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";

    if (action === "addCourse") {
      return handleAddCourse(data);
    }

    if (action === "deleteCourse") {
      return handleDeleteCourse(data);
    }

    if (action === "saveProgress") {
      return handleSaveProgress(data);
    }

    return createJsonResponse({ success: false, error: "Ação POST desconhecida: " + action });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: "Erro na requisição POST: " + error.toString()
    });
  }
}

// =========================================================================
// BANCO DE DADOS (Google Sheets LMS_DATABASE)
// =========================================================================

function getOrCreateDatabase() {
  var props = PropertiesService.getScriptProperties();
  var dbId = props.getProperty("DB_SPREADSHEET_ID");
  var spreadsheet;

  if (dbId) {
    try {
      spreadsheet = SpreadsheetApp.openById(dbId);
    } catch (err) {
      spreadsheet = null;
    }
  }

  if (!spreadsheet) {
    // Procura se já existe planilha com nome LMS_DATABASE
    var files = DriveApp.getFilesByName("LMS_DATABASE");
    if (files.hasNext()) {
      var file = files.next();
      spreadsheet = SpreadsheetApp.openById(file.getId());
      props.setProperty("DB_SPREADSHEET_ID", file.getId());
    } else {
      spreadsheet = SpreadsheetApp.create("LMS_DATABASE");
      props.setProperty("DB_SPREADSHEET_ID", spreadsheet.getId());
    }
  }

  // Garante aba 'Cursos'
  var cursosSheet = spreadsheet.getSheetByName("Cursos");
  if (!cursosSheet) {
    cursosSheet = spreadsheet.insertSheet("Cursos");
    cursosSheet.appendRow(["id", "user_email", "folder_id", "title", "total_lessons", "created_at"]);
    cursosSheet.setFrozenRows(1);
  }

  // Garante aba 'Progresso'
  var progressoSheet = spreadsheet.getSheetByName("Progresso");
  if (!progressoSheet) {
    progressoSheet = spreadsheet.insertSheet("Progresso");
    progressoSheet.appendRow(["user_email", "course_id", "lesson_id", "completed", "notes", "updated_at"]);
    progressoSheet.setFrozenRows(1);
  }

  return spreadsheet;
}

// =========================================================================
// HANDLERS DE CURSOS
// =========================================================================

function getCoursesForUser(email) {
  var ss = getOrCreateDatabase();
  var cursosSheet = ss.getSheetByName("Cursos");
  var progressoSheet = ss.getSheetByName("Progresso");

  var cursosData = cursosSheet.getDataRange().getValues();
  var progressoData = progressoSheet.getDataRange().getValues();

  var userCourses = [];

  // Pula linha de cabeçalho (índice 0)
  for (var i = 1; i < cursosData.length; i++) {
    var row = cursosData[i];
    var rowEmail = (row[1] || "").toString().toLowerCase().trim();

    if (rowEmail === email) {
      var courseId = row[0];
      var folderId = row[2];
      var title = row[3];
      var totalLessons = parseInt(row[4] || 0, 10);
      var createdAt = row[5];

      // Conta aulas concluídas na aba de progresso
      var completedCount = 0;
      var lastActiveId = null;

      for (var j = 1; j < progressoData.length; j++) {
        var pRow = progressoData[j];
        var pEmail = (pRow[0] || "").toString().toLowerCase().trim();
        var pCourseId = pRow[1];
        var pLessonId = pRow[2];
        var pCompleted = pRow[3] === true || pRow[3] === "true";

        if (pEmail === email && pCourseId === courseId) {
          if (pCompleted) {
            completedCount++;
          }
          lastActiveId = pLessonId;
        }
      }

      var percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

      userCourses.push({
        id: courseId,
        folderId: folderId,
        title: title,
        totalLessons: totalLessons,
        completedLessons: completedCount,
        progressPercentage: percentage,
        lastActiveLessonId: lastActiveId,
        createdAt: createdAt
      });
    }
  }

  return createJsonResponse({
    success: true,
    courses: userCourses
  });
}

function handleAddCourse(data) {
  var email = (data.email || "").toString().toLowerCase().trim();
  var folderId = (data.folderId || "").trim();

  // Limpa possíveis URLs do Drive para extrair o ID limpo
  if (folderId.indexOf("folders/") !== -1) {
    folderId = folderId.split("folders/")[1].split("?")[0].split("/")[0];
  } else if (folderId.indexOf("id=") !== -1) {
    folderId = folderId.split("id=")[1].split("&")[0];
  }

  if (!email || !folderId) {
    return createJsonResponse({ success: false, error: "E-mail e Folder ID são obrigatórios." });
  }

  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: "Não foi possível acessar a pasta no Google Drive. Verifique se o ID está correto e compartilhado."
    });
  }

  var courseTitle = (data.customTitle && data.customTitle.trim()) ? data.customTitle.trim() : folder.getName();
  
  // Conta aulas de vídeo rapidamente
  var subfolders = folder.getFolders();
  var count = 0;
  while (subfolders.hasNext()) {
    var sub = subfolders.next();
    var files = sub.getFiles();
    while (files.hasNext()) {
      var f = files.next();
      if (isVideo(f.getMimeType(), f.getName())) {
        count++;
      }
    }
  }

  var courseId = Utilities.getUuid();
  var now = new Date().toISOString();

  var ss = getOrCreateDatabase();
  var cursosSheet = ss.getSheetByName("Cursos");
  cursosSheet.appendRow([courseId, email, folderId, courseTitle, count, now]);
  SpreadsheetApp.flush();

  return createJsonResponse({
    success: true,
    course: {
      id: courseId,
      folderId: folderId,
      title: courseTitle,
      totalLessons: count,
      completedLessons: 0,
      progressPercentage: 0,
      createdAt: now
    }
  });
}

function handleDeleteCourse(data) {
  var email = (data.email || "").toString().toLowerCase().trim();
  var courseId = data.courseId;

  if (!email || !courseId) {
    return createJsonResponse({ success: false, error: "E-mail e courseId são obrigatórios." });
  }

  var ss = getOrCreateDatabase();
  var cursosSheet = ss.getSheetByName("Cursos");
  var progressoSheet = ss.getSheetByName("Progresso");

  var cursosData = cursosSheet.getDataRange().getValues();
  for (var i = cursosData.length - 1; i >= 1; i--) {
    if (cursosData[i][0] === courseId && (cursosData[i][1] || "").toString().toLowerCase().trim() === email) {
      cursosSheet.deleteRow(i + 1);
    }
  }

  var progressoData = progressoSheet.getDataRange().getValues();
  for (var j = progressoData.length - 1; j >= 1; j--) {
    if (progressoData[j][1] === courseId && (progressoData[j][0] || "").toString().toLowerCase().trim() === email) {
      progressoSheet.deleteRow(j + 1);
    }
  }

  SpreadsheetApp.flush();
  return createJsonResponse({ success: true, message: "Curso removido com sucesso." });
}

// =========================================================================
// HANDLERS DE PROGRESSO
// =========================================================================

function getProgressForUserCourse(email, courseId) {
  var ss = getOrCreateDatabase();
  var progressoSheet = ss.getSheetByName("Progresso");
  var data = progressoSheet.getDataRange().getValues();

  var completedLessonIds = [];
  var notes = {};

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowEmail = (row[0] || "").toString().toLowerCase().trim();
    var rowCourseId = row[1];
    var lessonId = row[2];
    var isDone = row[3] === true || row[3] === "true";
    var noteText = row[4] || "";

    if (rowEmail === email && rowCourseId === courseId) {
      if (isDone) completedLessonIds.push(lessonId);
      if (noteText) notes[lessonId] = noteText;
    }
  }

  return createJsonResponse({
    success: true,
    completedLessonIds: completedLessonIds,
    notes: notes
  });
}

function handleSaveProgress(data) {
  var email = (data.email || "").toString().toLowerCase().trim();
  var courseId = data.courseId;
  var lessonId = data.lessonId;
  var completed = data.completed === true || data.completed === "true";
  var notes = data.notes !== undefined ? data.notes : "";

  if (!email || !courseId || !lessonId) {
    return createJsonResponse({ success: false, error: "email, courseId e lessonId são obrigatórios." });
  }

  var ss = getOrCreateDatabase();
  var sheet = ss.getSheetByName("Progresso");
  var rows = sheet.getDataRange().getValues();
  var foundRowIndex = -1;

  for (var i = 1; i < rows.length; i++) {
    if ((rows[i][0] || "").toString().toLowerCase().trim() === email &&
        rows[i][1] === courseId &&
        rows[i][2] === lessonId) {
      foundRowIndex = i + 1;
      break;
    }
  }

  var now = new Date().toISOString();

  if (foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, 4).setValue(completed);
    if (notes !== undefined && notes !== "") {
      sheet.getRange(foundRowIndex, 5).setValue(notes);
    }
    sheet.getRange(foundRowIndex, 6).setValue(now);
  } else {
    sheet.appendRow([email, courseId, lessonId, completed, notes, now]);
  }

  SpreadsheetApp.flush();
  return createJsonResponse({ success: true, message: "Progresso salvo com sucesso." });
}

// =========================================================================
// DRIVE PARSER COM CACHE
// =========================================================================

function getCourseContentFromDrive(folderId, forceRefresh) {
  var cache = CacheService.getScriptCache();
  var cacheKey = "course_data_" + folderId;
  
  if (!forceRefresh) {
    var cached = cache.get(cacheKey);
    if (cached) {
      return ContentService.createTextOutput(cached)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  var rootFolder = DriveApp.getFolderById(folderId);
  var courseTitle = rootFolder.getName();
  var modules = [];
  var totalLessons = 0;

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

  rawModules.sort(function(a, b) {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });

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

  try {
    if (jsonOutput.length < 90000) {
      cache.put(cacheKey, jsonOutput, 21600);
    }
  } catch (cacheErr) {}

  return ContentService.createTextOutput(jsonOutput)
    .setMimeType(ContentService.MimeType.JSON);
}

function isVideo(mime, fileName) {
  if (mime && mime.indexOf("video/") === 0) return true;
  return /\.(mp4|webm|mkv|mov|avi)$/i.test(fileName);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
