const SUBMISSION_SHEETS = Object.freeze({
  musical_feedback: 'ミュージカル感想', bottle_mail: 'ボトルメール', wish_star: '願い星',
});
const SUBMISSION_HEADERS = ['日時', '名前', '本文', '確認状態', 'requestId', 'fingerprint'];

function setupSubmissionSheets() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('スプレッドシートの拡張機能から実行してください。');
  book.setSpreadsheetTimeZone('Asia/Tokyo');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', book.getId());
  Object.keys(SUBMISSION_SHEETS).forEach(function(type) {
    const title = SUBMISSION_SHEETS[type];
    const sheet = book.getSheetByName(title) || book.insertSheet(title);
    const existing = sheet.getRange(1, 1, 1, 4).getValues()[0];
    if (sheet.getLastRow() && existing.join('|') !== SUBMISSION_HEADERS.slice(0, 4).join('|')) {
      throw new Error('既存見出しが一致しません: ' + title);
    }
    if (!sheet.getLastRow()) sheet.getRange(1, 1, 1, 6).setValues([SUBMISSION_HEADERS]);
    else if (!sheet.getRange(1, 5).getValue()) sheet.getRange(1, 5, 1, 2).setValues([SUBMISSION_HEADERS.slice(4)]);
    sheet.setFrozenRows(1); sheet.hideColumns(5, 2);
    sheet.getRange('A:A').setNumberFormat('yyyy/mm/dd hh:mm:ss');
    sheet.getRange('B:D').setNumberFormat('@');
    sheet.getRange('D2:D').setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList(['未確認', '確認済み'], true).setAllowInvalid(false).build());
    sheet.setColumnWidth(1, 155); sheet.setColumnWidth(2, 110);
    sheet.setColumnWidth(3, 300); sheet.setColumnWidth(4, 100);
    sheet.getRange('C:C').setWrap(true);
    sheet.getRange('A1:D1').setBackground('#eeeeee').setFontWeight('bold');
  });
  const summary = book.getSheetByName('まとめ') || book.insertSheet('まとめ');
  if (!summary.getLastRow()) {
    summary.getRange('A1:B8').setValues([
      ['項目', '件数'], ['ミュージカル感想 総件数', ''], ['ボトルメール 総件数', ''],
      ['願い星 総件数', ''], ['全体総件数', ''], ['未確認件数 合計', ''],
      ['今日届いた件数', ''], ['今月届いた件数', ''],
    ]);
  }
  summary.getRange('B2:B8').setFormulas(summaryFormulas_().map(function(f) { return [f]; }));
  summary.setColumnWidth(1, 230); summary.setColumnWidth(2, 90);
  summary.getRange('A1:B1').setBackground('#eeeeee').setFontWeight('bold');
}

function summaryFormulas_() {
  const names = Object.keys(SUBMISSION_SHEETS).map(function(k) { return SUBMISSION_SHEETS[k]; });
  const today = names.map(function(n) { return 'COUNTIFS(\''+n+'\'!A2:A,">="&TODAY(),\''+n+'\'!A2:A,"<"&TODAY()+1)'; });
  const month = names.map(function(n) { return 'COUNTIFS(\''+n+'\'!A2:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),\''+n+'\'!A2:A,"<"&EDATE(DATE(YEAR(TODAY()),MONTH(TODAY()),1),1))'; });
  return names.map(function(n) { return '=COUNTIF(\''+n+'\'!C2:C,"<>")'; }).concat([
    '=SUM(B2:B4)', '=' + names.map(function(n) { return 'COUNTIF(\''+n+'\'!D2:D,"未確認")'; }).join('+'),
    '=' + today.join('+'), '=' + month.join('+'),
  ]);
}

function validateSubmission_(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('invalid_payload');
  if (!Object.prototype.hasOwnProperty.call(SUBMISSION_SHEETS, payload.type)) throw new Error('invalid_type');
  if (typeof payload.message !== 'string' || !payload.message.trim() || payload.message.length > 300) throw new Error('invalid_message');
  if (typeof payload.name !== 'string' || payload.name.length > 80) throw new Error('invalid_name');
  if (/<\/?[a-z][^>]*>/i.test(payload.message + payload.name) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(payload.message + payload.name)) throw new Error('invalid_text');
  if (typeof payload.requestId !== 'string' || typeof payload.clientId !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(payload.requestId) || !/^[a-zA-Z0-9-]{16,64}$/.test(payload.clientId)) throw new Error('invalid_id');
  if (payload.type === 'musical_feedback' && payload.workId !== 'boku-no-takaramono') throw new Error('invalid_work');
  return payload;
}

function doPost(e) {
  let payload, lock;
  try {
    const raw = e && e.postData && e.postData.contents;
    if (typeof raw !== 'string' || raw.length > 6000) throw new Error('invalid_payload');
    payload = validateSubmission_(JSON.parse(raw));
    const bookId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!bookId) throw new Error('not_configured');
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error('busy');
    const book = SpreadsheetApp.openById(bookId), sheet = book.getSheetByName(SUBMISSION_SHEETS[payload.type]);
    if (!sheet || sheet.getRange(1, 1, 1, 4).getValues()[0].join('|') !== SUBMISSION_HEADERS.slice(0,4).join('|')) throw new Error('not_configured');
    const fingerprint = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
      JSON.stringify([payload.type, payload.name, payload.message, payload.workId || '']))
      .map(function(b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
    const previous = sheet.getRange('E:E').createTextFinder(payload.requestId).matchEntireCell(true).findNext();
    if (previous) {
      if (sheet.getRange(previous.getRow(), 6).getValue() !== fingerprint) throw new Error('id_conflict');
      return submissionResponse_({ok:true, requestId:payload.requestId, duplicate:true});
    }
    const cache = CacheService.getScriptCache(), rateKey = 'submission:' + payload.clientId;
    if (cache.get(rateKey)) throw new Error('rate_limited');
    const row = sheet.getLastRow() + 1;
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    // One row write includes the receipt. Leading '=' is escaped as literal sheet text.
    const literal = function(value) { return value.charAt(0) === '=' ? "'" + value : value; };
    sheet.getRange(row, 1, 1, 6).setValues([[
      new Date(), literal(payload.name), literal(payload.message), '未確認', payload.requestId, fingerprint,
    ]]);
    SpreadsheetApp.flush();
    cache.put(rateKey, '1', 30);
    return submissionResponse_({ok:true, requestId:payload.requestId});
  } catch (error) {
    const known = ['invalid_payload','invalid_type','invalid_message','invalid_name','invalid_text','invalid_id','invalid_work','rate_limited','busy','not_configured','id_conflict'];
    console.error('[TeaMerry submissions]', error.message);
    return submissionResponse_({ok:false, requestId:payload && payload.requestId || '', code:known.indexOf(error.message) >= 0 ? error.message : 'save_failed'});
  } finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}

function submissionResponse_(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
