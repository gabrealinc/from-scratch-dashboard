// Bound to the From Scratch Running Sales Report.
// Store SYNC_SECRET in Project Settings > Script properties, never in source.
const FS = {
  exportsFolder: '1R9FdOIs9Sfn2vPjRYNhs21D1PaJpIt9y',
  paymentsFolder: '1HwwXhVnBAxzuhAYVW_9bvr4RoujhCjxM',
  master: '1y0I6R_wP0d8p6diFDZbJcAuJicLt5BziOwJOpi4Ub08',
  hub: '1FUiJeq0pAG0eFUfa9lJ93xmrFc0EEy1o',
  endpoint: 'https://from-scratch-dashboard.vercel.app/api/sync/kdp',
  tabs: ['eBook Royalty', 'Paperback Royalty', 'Hardcover Royalty']
};
function setupFromScratchSync() {
  if (!PropertiesService.getScriptProperties().getProperty('SYNC_SECRET')) {
    throw new Error('Add SYNC_SECRET to Script properties before running setup.');
  }
  syncFromScratchReports();
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'syncFromScratchReports')) {
    ScriptApp.newTrigger('syncFromScratchReports').timeBased().everyMinutes(15).create();
  }
}
function syncFromScratchReports() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const properties = PropertiesService.getScriptProperties();
    const sources = fsFolderSources(FS.exportsFolder);
    const paymentSources = fsFolderSources(FS.paymentsFolder);
    sources.sort((a,b) => a.id.localeCompare(b.id));
    if (!sources.length) throw new Error('Exports is empty. Previous dashboard data was preserved.');
    const signature = JSON.stringify({sales:sources.map(s => [s.id,s.modifiedTime]),payments:paymentSources.map(s => [s.id,s.modifiedTime])});
    const priorSignature = properties.getProperty('LAST_SUCCESSFUL_SOURCE_SIGNATURE');
    const prior = priorSignature ? JSON.parse(priorSignature) : null;
    const priorSales = Array.isArray(prior) ? prior : prior && prior.sales;
    const priorPayments = prior && !Array.isArray(prior) ? prior.payments : [];
    if (priorSales && priorSales.some(pair => !sources.some(s => s.id === pair[0]))) {
      throw new Error('A previously imported export was removed from the archive. Restore it or review the change before rebuilding the master.');
    }
    if (priorPayments && priorPayments.some(pair => !paymentSources.some(s => s.id === pair[0]))) throw new Error('A previously imported payment report was removed from the archive. Restore it or review the change before rebuilding the master.');
    if (signature === properties.getProperty('LAST_SUCCESSFUL_SOURCE_SIGNATURE')) return;
    const reports = sources.map(source => fsReadReport(source, FS.tabs, properties));
    const paymentReports = paymentSources.map(source => fsReadReport(source, ['Payments'], properties));
    const prepared = fsCall({phase:'prepare',reports:reports,paymentReports:paymentReports});
    const master = SpreadsheetApp.openById(FS.master);
    // Write only generated tabs. Original KDP tabs and raw files are untouched.
    Object.keys(prepared.plan).forEach(name => {
      const rows = prepared.plan[name];
      const tab = master.getSheetByName(name) || master.insertSheet(name);
      if (tab.getMaxRows() < rows.length) tab.insertRowsAfter(tab.getMaxRows(), rows.length - tab.getMaxRows());
      if (tab.getMaxColumns() < rows[0].length) tab.insertColumnsAfter(tab.getMaxColumns(), rows[0].length - tab.getMaxColumns());
      const oldRows = tab.getLastRow();
      tab.getRange(1,1,rows.length,rows[0].length).setValues(rows);
      if (oldRows > rows.length) tab.getRange(rows.length+1,1,oldRows-rows.length,rows[0].length).clearContent();
      tab.setFrozenRows(1);
      tab.getRange(1,1,1,rows[0].length).setBackground('#b9251c').setFontColor('#ffffff').setFontWeight('bold');
      tab.getRange(1,1,rows.length,rows[0].length).setWrap(true);
    });
    SpreadsheetApp.flush();
    Object.keys(prepared.plan).forEach(name => {
      const rows = prepared.plan[name];
      const actual = master.getSheetByName(name).getRange(1,1,rows.length,rows[0].length).getValues();
      if (!fsValuesEqual(actual, rows, master.getSpreadsheetTimeZone())) throw new Error('Readback mismatch in ' + name + '. Dashboard was not updated.');
    });
    fsCall({phase:'commit',reports:reports,paymentReports:paymentReports,sheetVerified:true});
    const log = master.getSheetByName('Import Log');
    log.getRange(2,5,reports.length,1).setValues(reports.map(() => ['Synced']));
    const paymentLog = master.getSheetByName('Payments Import Log');
    if (paymentReports.length) paymentLog.getRange(2,6,paymentReports.length,1).setValues(paymentReports.map(() => ['Synced']));
    properties.setProperty('LAST_SUCCESSFUL_SOURCE_SIGNATURE', signature);
    properties.setProperty('LAST_SUCCESSFUL_SYNC', new Date().toISOString());
  } finally { lock.releaseLock(); }
}
function fsFolderSources(folderId) {
  const files = DriveApp.getFolderById(folderId).getFiles();
  const sources = [];
  while (files.hasNext()) {
    const file = files.next();
    if (file.getId() === FS.master) throw new Error('The master report cannot be stored in an import folder.');
    sources.push({id:file.getId(),name:file.getName(),modifiedTime:file.getLastUpdated().toISOString(),file:file});
  }
  sources.sort((a,b) => a.id.localeCompare(b.id));
  return sources;
}
function fsReadReport(source, tabs, properties) {
  let id = source.id;
  if (source.file.getMimeType() !== MimeType.GOOGLE_SHEETS) {
    if (!source.name.toLowerCase().endsWith('.xlsx')) throw new Error('Unsupported file: ' + source.name + '. Upload a full KDP XLSX report or a native Google Sheet.');
    const cacheKey = 'CONVERTED_' + source.id;
    const existing = JSON.parse(properties.getProperty(cacheKey) || 'null');
    if (existing && existing.modifiedTime === source.modifiedTime) id = existing.id;
    else {
      const hub = DriveApp.getFolderById(FS.hub);
      const working = hub.getFoldersByName('Sync Working Files');
      const workingFolder = working.hasNext() ? working.next() : hub.createFolder('Sync Working Files');
      const converted = Drive.Files.create({name:'Normalized copy · '+source.name,mimeType:MimeType.GOOGLE_SHEETS,parents:[workingFolder.getId()]},source.file.getBlob(),{fields:'id'});
      id = converted.id;
      properties.setProperty(cacheKey,JSON.stringify({id:id,modifiedTime:source.modifiedTime}));
    }
  }
  const book = SpreadsheetApp.openById(id);
  const tables = {};
  tabs.forEach(name => {
    const tab = book.getSheetByName(name);
    if (tab) tables[name] = tab.getDataRange().getValues().map(row => row.map(value => value instanceof Date ? Utilities.formatDate(value, book.getSpreadsheetTimeZone(), 'yyyy-MM-dd') : value));
  });
  return {id:source.id,name:source.name,modifiedTime:source.modifiedTime,tables:tables};
}
function fsValuesEqual(actual, expected, timeZone) {
  const normalize = (value, planned) => {
    if (value instanceof Date && typeof planned === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(planned)) {
      return Utilities.formatDate(value, timeZone, 'yyyy-MM-dd');
    }
    if (typeof value === 'number' && typeof planned === 'string') {
      if (/^\d+(?:\.\d+)?%$/.test(planned)) return String(value * 100).replace(/\.0+$/, '') + '%';
      if (/^\d{10,}$/.test(planned)) return String(value);
    }
    return value;
  };
  if (actual.length !== expected.length) return false;
  return actual.every((row, r) => row.length === expected[r].length && row.every((value, c) => normalize(value, expected[r][c]) === expected[r][c]));
}
function fsCall(body) {
  const secret = PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
  if (!secret) throw new Error('Missing SYNC_SECRET.');
  const response = UrlFetchApp.fetch(FS.endpoint, {method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+secret},payload:JSON.stringify(body),muteHttpExceptions:true});
  const result = JSON.parse(response.getContentText());
  if (response.getResponseCode() !== 200) throw new Error(result.error || 'Dashboard sync failed.');
  return result;
}
