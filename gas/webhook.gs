// LINE Webhook受信・署名検証・友だち追加/ブロック対応

function doPost(e) {
  try {
    if (!isValidLineSignature(e)) {
      return ContentService.createTextOutput('Invalid signature').setMimeType(ContentService.MimeType.TEXT).setResponseCode(403);
    }
    var body = JSON.parse(e.postData.contents);
    var events = body.events || [];
    events.forEach(function(event) {
      if (event.type === 'follow') {
        handleFollowEvent(event);
      } else if (event.type === 'unfollow') {
        handleUnfollowEvent(event);
      }
    });
    return ContentService.createTextOutput('ok');
  } catch (err) {
    notifySlack('Webhookエラー: ' + (err && err.message ? err.message : err));
    return ContentService.createTextOutput('error').setMimeType(ContentService.MimeType.TEXT).setResponseCode(500);
  }
}

function isValidLineSignature(e) {
  var signature = e.headers['X-Line-Signature'];
  var channelSecret = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_SECRET');
  var contents = e.postData.contents;
  var computedSignature = Utilities.base64Encode(Utilities.computeHmacSha256Signature(contents, channelSecret));
  return signature === computedSignature;
}

function handleFollowEvent(event) {
  var uid = event.source && event.source.userId;
  if (!uid) return;
  var customer = searchCustomerByUid(uid);
  if (!customer) {
    createCustomer({ base64uid: '', name: '', lineUid: uid, lineBlocked: false });
  } else {
    updateCustomer(customer.id, { lineBlocked: false });
  }
}

function handleUnfollowEvent(event) {
  var uid = event.source && event.source.userId;
  if (!uid) return;
  var customer = searchCustomerByUid(uid);
  if (customer) {
    updateCustomer(customer.id, { lineBlocked: true });
  }
} 