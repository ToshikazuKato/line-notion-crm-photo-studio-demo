// Notion API連携ヘルパー

function searchCustomerByUid(uid) {
  var notionToken = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  var dbId = PropertiesService.getScriptProperties().getProperty('CUSTOMER_DB_ID');
  var url = 'https://api.notion.com/v1/databases/' + dbId + '/query';
  var payload = {
    filter: {
      property: 'LINE_UID',
      rich_text: { equals: uid }
    }
  };
  var res = notionApiRequest(url, 'post', payload);
  if (res && res.results && res.results.length > 0) {
    return { id: res.results[0].id };
  }
  return null;
}

function createCustomer(data) {
  var notionToken = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  var dbId = PropertiesService.getScriptProperties().getProperty('CUSTOMER_DB_ID');
  var url = 'https://api.notion.com/v1/pages';
  var payload = {
    parent: { database_id: dbId },
    properties: {
      '名前': { title: [{ text: { content: data.name } }] },
      'LINE_UID': { rich_text: [{ text: { content: data.uid || data.lineUid } }] },
      'LINE友達ブロック': { checkbox: false },
      // 必要に応じて他のプロパティも追加
    }
  };
  var res = notionApiRequest(url, 'post', payload);
  return res ? { id: res.id } : null;
}

function updateCustomer(id, data) {
  var url = 'https://api.notion.com/v1/pages/' + id;
  var props = {};
  if (data.lineBlocked !== undefined) {
    props['LINE友達ブロック'] = { checkbox: !!data.lineBlocked };
  }
  // 他の更新項目も必要に応じて追加
  var payload = { properties: props };
  notionApiRequest(url, 'patch', payload);
}

function createCase(data, customerId) {
  var dbId = PropertiesService.getScriptProperties().getProperty('CASE_DB_ID');
  var url = 'https://api.notion.com/v1/pages';
  // 案件名: YYYYMMDD_名前
  var date = Utilities.formatDate(new Date(data.timestamp), 'Asia/Tokyo', 'yyyyMMdd');
  var caseName = date + '_' + data.name;
  var payload = {
    parent: { database_id: dbId },
    properties: {
      '案件名': { title: [{ text: { content: caseName } }] },
      '主顧客': { relation: [{ id: customerId }] },
      '予約日時候補1': data.reserve1 ? { date: { start: data.reserve1 } } : undefined,
      '予約日時候補2': data.reserve2 ? { date: { start: data.reserve2 } } : undefined,
      '予約日時候補3': data.reserve3 ? { date: { start: data.reserve3 } } : undefined,
      // 他のプロパティも必要に応じて追加
    }
  };
  // undefinedプロパティを除去
  Object.keys(payload.properties).forEach(function(key){
    if(payload.properties[key] === undefined) delete payload.properties[key];
  });
  notionApiRequest(url, 'post', payload);
}

function notionApiRequest(url, method, payload) {
  var notionToken = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  var options = {
    method: method,
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + notionToken,
      'Notion-Version': '2022-06-28'
    },
    muteHttpExceptions: true
  };
  if (payload) options.payload = JSON.stringify(payload);
  var res = UrlFetchApp.fetch(url, options);
  return JSON.parse(res.getContentText());
} 