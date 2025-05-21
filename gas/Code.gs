// Googleフォーム送信時のメイン処理
function onFormSubmit(e) {
  try {
    Logger.log('onFormSubmit triggered');
    const formData = parseFormData(e);
    Logger.log('Parsed formData: %s', JSON.stringify(formData));
    // デコード済みUIDをformDataに追加
    formData.uid = decodeUid(formData.base64uid);
    Logger.log('Decoded UID: %s', formData.uid);
    let customer = searchCustomerByUid(formData.uid);
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
    timestamp: e.namedValues["タイムスタンプ"] ? e.namedValues["タイムスタンプ"][0] : "",
    email: e.namedValues["メールアドレス"] ? e.namedValues["メールアドレス"][0] : "",
    name: e.namedValues["名前"] ? e.namedValues["名前"][0] : "",
    furigana: e.namedValues["フリガナ"] ? e.namedValues["フリガナ"][0] : "",
    tel: e.namedValues["電話番号"] ? e.namedValues["電話番号"][0] : "",
    birthday: e.namedValues["生年月日"] ? e.namedValues["生年月日"][0] : "",
    photoType: e.namedValues["撮影種別"] ? e.namedValues["撮影種別"][0] : "",
    detail: e.namedValues["問い合わせ内容・詳細"] ? e.namedValues["問い合わせ内容・詳細"][0] : "",
    image1: e.namedValues["参考画像1"] ? e.namedValues["参考画像1"][0] : "",
    image2: e.namedValues["参考画像2"] ? e.namedValues["参考画像2"][0] : "",
    image3: e.namedValues["参考画像3"] ? e.namedValues["参考画像3"][0] : "",
    base64uid: e.namedValues["LINE_UID"] ? e.namedValues["LINE_UID"][0] : "",
    reserve1: e.namedValues["予約日時候補1"] ? e.namedValues["予約日時候補1"][0] : "",
    reserve2: e.namedValues["予約日時候補2"] ? e.namedValues["予約日時候補2"][0] : "",
    reserve3: e.namedValues["予約日時候補3"] ? e.namedValues["予約日時候補3"][0] : "",
  };
}

// UIDのbase64デコード
function decodeUid(base64uid) {
  Logger.log('decodeUid called with: %s', base64uid);
  return Utilities.newBlob(Utilities.base64Decode(base64uid)).getDataAsString();
}

