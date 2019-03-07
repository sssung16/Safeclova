const express = require('express');
const app = express();
const router = express.Router();

//auth
var bool_speaker = false;
var bool_finger = false;

var authTest = function (req, res, next){
  const attributeIntent = req.body.session.sessionAttributes.name
  const intentType = req.body.request.type
  //전 request가 launchrequest일 때 waiting 요구
  if(attributeIntent == 'LaunchRequest'){
   //시간측정
   const timeoutSchedule = Date.now();
   //waiting
   waiting(next, timeoutSchedule, () => {
     console.log('인증 완료!');
     next();
   });
 }
 else{
   if(intentType == 'LaunchRequest'){
     bool_speaker = true;
   }
   next();
 }
}
//waiting 함수
function waiting(next, timeoutSchedule, callback) {
    var delay = Date.now() - timeoutSchedule;
    setImmediate(function() {
      //7초 지나면 timeout
        if(delay > 7000){
            console.log(`Timeout! 인증 실패하였습니다! Delay: ${delay}`);
            return next();
          }
        // 인증 되었을 경우
        if (bool_speaker)
          callback();
        else
          waiting(next, timeoutSchedule, callback);
    });

}
//안드로이드에서 인증여부
router.use('/recogSpeaker', (req, res) => {
	var trueOrFalse = req.body.Bool;
	if(trueOrFalse == 'YES') {
		bool_speaker = true;
	}
	else {
		bool_speaker = false;
	}
  console.log(`사용자 인증 ${trueOrFalse}`);
	res.send(`${trueOrFalse}`);
})
//지문인증 여부
router.use('/recogFinger', (req, res) => {
	var trueOrFalse = req.body.Bool;
	if(trueOrFalse == 'YES') {
		bool_finger = true;
	}
	else {
		bool_finger = false;
	}
  console.log(`지문 인증 ${trueOrFalse}`);
	res.send(`${trueOrFalse}`);
})

router.use('/',authTest ,(req, res) =>{

    require('../checkLED')(req, res, bool_speaker, bool_finger);
    //SessionEndedRequest 시 화자 인증 초기화
    if(req.body.request.type == 'SessionEndedRequest' || req.body.request.type == 'LaunchRequest'){
      bool_speaker = false;
    }
    //클로바 기본 intent일 경우는 지문인증 초기화를 하지 않음
    if(req.body.request.intent.name.indexOf('Clova') != 0){
        bool_finger = false;
    }
});

module.exports = router;
