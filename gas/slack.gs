// Slack通知ヘルパー

function notifySlack(message) {
  var url = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  if (!url) return;
  var payload = JSON.stringify({ text: message });
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: payload
  });
} 