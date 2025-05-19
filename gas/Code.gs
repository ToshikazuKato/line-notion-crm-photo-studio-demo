// Googleフォーム送信時のメイン処理
function onFormSubmit(e) {
  try {
    Logger.log('onFormSubmit triggered');
    const formData = parseFormData(e);
    Logger.log('Parsed formData: %s', JSON.stringify(formData));
    const uid = decodeUid(formData.base64uid);
    Logger.log('Decoded UID: %s', uid);
    let customer = searchCustomerByUid(uid);
    Logger.log('Customer search result: %s', JSON.stringify(customer));
    if (!customer) {
      customer = createCustomer(formData);
      Logger.log('Customer created: %s', JSON.stringify(customer));
    } else {
      updateCustomer(customer.id, formData);
      Logger.log('Customer updated: %s', customer.id);
    }
    createCase(formData, customer.id);
    Logger.log('Case created for customerId: %s', customer.id);
  } catch (err) {
    Logger.log('Error in onFormSubmit: %s', err && err.message ? err.message : err);
    notifySlack("GASエラー: " + (err && err.message ? err.message : err));
  }
}

// フォームデータのパース（必要に応じて実装）
function parseFormData(e) {
  Logger.log('parseFormData called');
  // e.namedValues などから必要な値を抽出して返す
  // 例: { base64uid: ..., name: ..., ... }
  return {
    base64uid: e.namedValues["LINE UID"] ? e.namedValues["LINE UID"][0] : "",
    name: e.namedValues["名前"] ? e.namedValues["名前"][0] : "",
    reserve1: e.namedValues["予約日時候補1"] ? e.namedValues["予約日時候補1"][0] : "",
    reserve2: e.namedValues["予約日時候補2"] ? e.namedValues["予約日時候補2"][0] : "",
    reserve3: e.namedValues["予約日時候補3"] ? e.namedValues["予約日時候補3"][0] : "",
    // 他の項目も必要に応じて追加
  };
}

// UIDのbase64デコード
function decodeUid(base64uid) {
  Logger.log('decodeUid called with: %s', base64uid);
  return Utilities.newBlob(Utilities.base64Decode(base64uid)).getDataAsString();
} 