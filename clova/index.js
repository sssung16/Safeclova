const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN } = require('../config')
//onoff의 Gpio모듈을 사용
const Gpio = require('onoff').Gpio;
var bool = false;
//LED
var led_red = new Gpio(26, 'out');
var led_yellow = new Gpio(19, 'out');
var led_green = new Gpio(13, 'out');
//전 Request에 대한 request 기록
var attributes;
var attributeSlots;
var attributeIntent;
//LED 상태
var ledRed = false;
var ledYellow = false;
var ledGreen = false;
//현재 request 기록
var intent;
var slots;
//FCM
var FCM = require('fcm-node');
//Server Key from FCM Homepage
var serverKey = 'AAAAnRghGrE:APA91bEoetZKaToiGGb-PeP2VE_tY1TvLJlRVlQU6Yr5dln9rUazfQqYrzRkPv8H6mYuUmPBdeR0CPqaa1lDcUz6AyCNpzQjCnFKM-gSJIC_1hcfWJffQU68kwoH3Ucjo7K43RgQ46vs';
//Client token from Android
var client_token = 'dpeoAPrMLKQ:APA91bFmQePJWhZ7Dp8TrJuREN0YbwUiTZtRL-e7dcPsqQX-3aQzIHGT-UU56devkMSxp6beG3SSKUkSeIgLA7pXpKIDrVrQDbvZ-mnufvvrmaNioc-nbKnYwiNGcsZcjdU6w6Dqf-LN';
//Speaker recognition push message
var push_speaker = {
  to: client_token,
  notification: {
    title : "safeclova",
    body : "목소리 인증을 해주세요",
    sound: "default",
       click_action: "FCM_PLUGIN_ACTIVITY",
       icon: "fcm_push_icon"
   },
   // 메시지 중요도
   priority: "high",
   // App 패키지 이름
   restricted_package_name: "com.example.safeclova",
   // App에게 전달할 데이터
   data: {
       num1: 2000,
       num2: 3000
   }
};
//Fingerprint authentication push message
var push_fingerprint = {
  to: client_token,
  notification: {
    title : "safeclova",
    body : "지문 인증을 해주세요",
    sound: "default",
       click_action: "OPEN_ACTIVITY",
       icon: "fcm_push_icon"
   },
   // 메시지 중요도
   priority: "high",
   // App 패키지 이름
   restricted_package_name: "com.example.safeclova",
   // App에게 전달할 데이터
   data: {
       num1: 2000,
       num2: 3000
   }
};

//정보 제공
function information(){
  console.log("information")
  cekResponse.setMultiturn({
      name: 'Information',
      slots: '',
  })
  cekResponse.setSimpleSpeechText("빨강, 노랑, 초록 세 가지 LED를 키고 끌수 있습니다. ")
}
//등록되지 않은 발화 처리
function guide(){
  console.log('Guide')
  cekResponse.setMultiturn(attributes)
  cekResponse.appendSpeechText('이해할수 없습니다.','speech')
  cekResponse.appendSpeechText('다시 시도해 주세요.','speech')
}
//전원 on
function turnOn(){
  console.log('Turn On')
  var countLED = 0;
  //On 상태인데 On을 요청하는 경우 예외처리를 위한 변수
  var onRed = false;
  var onYellow = false;
  var onGreen = false;
  // Slots에 어느 색깔이 왔는지 확인
  if(slots.hasOwnProperty('red') || attributeSlots.hasOwnProperty('red')) {
    //이미 불이 켜져 있는지 확인
    if(ledRed == true){
      onRed = false;
    }
    else{
      console.log('Red On');
      led_red.writeSync(1);
      ledRed = true;
      onRed = true;
    }
    countLED++;
  }
  if(slots.hasOwnProperty('yellow') || attributeSlots.hasOwnProperty('yellow')){
    //이미 불이 켜져 있는지 확인
    if(ledYellow == true){
      onYellow = false;
    }
    else{
      console.log('Yellow On');
      led_yellow.writeSync(1);
      ledYellow = true;
      onYellow = true;
    }
    countLED++;
  }
  if(slots.hasOwnProperty('green') || attributeSlots.hasOwnProperty('green')){
    //이미 불이 켜져 있는지 확인
    if(ledGreen == true){
      onGreen = false;
    }
    else{
      console.log('Red On');
      led_green.writeSync(1);
      ledGreen = true;
      onGreen = true;
    }
    countLED++;
  }
  cekResponse.setMultiturn({
      name: 'TurnOn',
      slots: '',
  })
  if(countLED > 0){
    //만약 전원 키는 행위를 했다면 전원을 켰다는 발화, 아니라면 이미 켜져 있다는 발화
    if(onRed == true || onYellow == true || onGreen == true){
      cekResponse.setSimpleSpeechText('LED 전원이 켜졌습니다')
    }
    else{
      cekResponse.setSimpleSpeechText('이미 LED 전원이 켜져 있습니다.')
    }
  }
  else{
    cekResponse.setSimpleSpeechText('해당 LED는 존재하지 않습니다.')
  }

}
//전원 off
function turnOff(){
  console.log('Turn Off')
  //Off상태일때 Off를 요청하는 경우 예외처리를 위해
  var offRed = false;
  var offYellow = false;
  var offGreen = false;
  var countLED = 0;
  // Slots에 어느 색깔이 왔는지 확인
  if(slots.hasOwnProperty('red') || attributeSlots.hasOwnProperty('red')) {
    //이미 불이 꺼져 있는지 확인
    if(ledRed == false){
      offRed = false;
    }
    else{
      console.log('Red OFF');
      led_red.writeSync(0);
      ledRed = false;
      offRed = true;
    }
    countLED++;
  }
  if(slots.hasOwnProperty('yellow') || attributeSlots.hasOwnProperty('yellow')){
    //이미 불이 꺼져 있는지 확인
    if(ledYellow == false){
      offYellow = false;
    }
    else{
      console.log('Yellow OFF');
      led_yellow.writeSync(0);
      ledYellow = false;
      offYellow = true;
    }
    countLED++;
  }
  if(slots.hasOwnProperty('green') || attributeSlots.hasOwnProperty('green')){
    //이미 불이 꺼져 있는지 확인
    if(ledGreen == false){
      offGreen = false;
    }
    else{
      console.log('Red OFF');
      led_green.writeSync(0);
      ledGreen = false;
      offGreen = true;
    }
    countLED++;
  }
  cekResponse.setMultiturn({
      name: 'TurnOff',
      slots: '',
  })
  if(countLED > 0){
    //만약 전원 끄는 행위를 했다면 전원을 껐다는 발화, 아니라면 이미 꺼져 있다는 발화
    if(offRed == true || offYellow == true || offGreen == true){
      cekResponse.setSimpleSpeechText('LED 전원이 꺼졌습니다')
    }
    else{
      cekResponse.setSimpleSpeechText('이미 LED 전원이 꺼져 있습니다.')
    }
  }
  else{
    cekResponse.setSimpleSpeechText('해당 LED는 존재하지 않습니다.')
  }
}
//지문인증 완료요청시 실행되는 함수
function determineAuth(){
  console.log('Authrization 완료 요청')
  if(bool == true){
    if(attributeIntent  == "TurnOn"){
      turnOn()
    }
    else{
      turnOff()
    }
  }
  else{
    cekResponse.setMultiturn(attributes)
    cekResponse.setSimpleSpeechText("지문 인증에 실패하였습니다.")
  }
}
//화자인증 결과 전달
function recogResult(){
  cekResponse.setMultiturn({
      name: 'Recognition',
      slots: '',
  })
  if(attributeIntent == 'LaunchRequest' && intent == 'Recognition'){
    cekResponse.setSimpleSpeechText("인증에 성공하였습니다. 명령을 내려 주세요.")
  }
  else{
    cekResponse.setSimpleSpeechText("이미 인증되었습니다.")
  }
}
//Sleep 스피커와 안드로이드의 마이크 켜지는 타이밍을 맞추기 위한 함수
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session

    console.log('CEK Request')
   console.log(`session: ${JSON.stringify(this.session)}`)
   console.log(`context: ${JSON.stringify(this.context)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case "LaunchRequest":
        return this.launchRequest(cekResponse)
      case "IntentRequest":
        return this.intentRequest(cekResponse)
      case "SessionEndedRequest":
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    //Speaker로 발화 보냄
    cekResponse.setMultiturn({
      name: 'LaunchRequest',
      slots: '',
    })
    cekResponse.setSimpleSpeechText('목소리 인증을 해주세요')
  }
//발화 끝내달라는 요청
 sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.clearMultiturn()
    cekResponse.setSimpleSpeechText("종료하겠습니다.")
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.log(JSON.stringify(this.request))
    intent = this.request.intent.name
    slots = this.request.intent.slots
    attributes = this.session.sessionAttributes
    attributeSlots = this.session.sessionAttributes.slots
    attributeIntent = this.session.sessionAttributes.name
    switch (intent) {
    case "Information":
      information();
      break;
    case "TurnOn":
      turnOn();
      break;
    case "TurnOff":
      turnOff();
      break;
    case "Auth":
      determineAuth();
      break;
    case "Recognition":
      recogResult();
      break;
    default:
      guide();
      break;
    }
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
    }
    this.version = "0.1.0"
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: "SimpleSpeech",
      values: {
          type: "PlainText",
          lang: "ko",
          value: outputText,
      },
    }
  }

  appendSpeechText(outputText, type) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string' && type == 'speech') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    }
    else if(typeof(outputText) == 'string' && type == 'url') {
      outputSpeech.values.push({
        type: 'URL',
        lang: '',
        value: outputText,
      })
    }
    else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, bool_speaker, bool_finger, led_count) {
  cekResponse = new CEKResponse()
  //test
  bool = bool_finger;
  console.log(`clovaReq, bool finger: ${bool_finger}`);
  console.log(`clovaReq, bool: ${bool_speaker}`);

  if(bool_speaker == false){
      cekResponse.setSimpleSpeechText("목소리 인증에 실패하였습니다.")
      return httpRes.send(cekResponse)
  }
  if(led_count > 1){
    //FCM push message(fingerprint authentication)
    var fcm = new FCM(serverKey);
    fcm.send(push_fingerprint, function(err, response) {
       if (err) {
           console.error('Push메시지 발송에 실패했습니다.');
           console.error(err);
           return;
       }
       console.log('Push메시지가 발송되었습니다.');
       console.log(response);
    });
    //RainSound, Multiturn,
    cekResponse.appendSpeechText("지문 인증을 해주세요",'speech')
    cekResponse.appendSpeechText("http://pds21.egloos.com/pds/201805/16/45/sample.mp3",'url')
    cekResponse.setMultiturn(httpReq.body.request.intent)
    httpRes.send(cekResponse)
  }
  else{
    cekRequest = new CEKRequest(httpReq)
    cekRequest.do(cekResponse)
    console.log('CEK Response')
    console.log(JSON.stringify(cekResponse))
    httpRes.send(cekResponse)
    //LaunchRequest의 경우 FCM 메시지를 보낸다.
    if(httpReq.body.request.type == 'LaunchRequest'){
      //스피커와 앱의 타이밍을 맞춘다.
      sleep(2300);
      //FCM push message (speaker recognition)
      var fcm = new FCM(serverKey);
      fcm.send(push_speaker, function(err, response) {
        if (err) {
            console.error('Push메시지 발송에 실패했습니다.');
            console.error(err);
            return;
          }
          console.log('Push메시지가 발송되었습니다.');
          console.log(response);
        });
  }
  }
};


module.exports = clovaReq;
