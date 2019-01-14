/**
 * 获取随机guid
 * 
 */
function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
  return (S4()+S4());
}
/**
 * 获取随机验证码
 * num: 验证码位数
 */
function generateCode(num) {
  // TODO...
  return '1111'
}
/**
 * 腾讯云发送手机验证码
 * phoneNumbers:手机号数组
 * params:[] 短信模板参数 {1}：验证码，{2}：验证码有效时间
 * callback：回调函数
 */
function sendCaptcha(phoneNumbers, params, callback) {
  const QcloudSms = require("qcloudsms_js");
  const sdkConfig = require('./sdk.config')
  const qcloudsms = QcloudSms(sdkConfig.APP_ID, sdkConfig.APP_KEY);
  
  const ssender = qcloudsms.SmsSingleSender();
  ssender.sendWithParam(86, phoneNumbers, sdkConfig.template_Id, params, sdkConfig.smsSign, "", "", callback);
}

module.exports = {
  guid,
  generateCode,
  sendCaptcha
}