const express = require('express');
const app = express();
const router = express.Router();

//현재 On 상태의 LED 개수
var cur_led = 0;
//현재 LED 상태
var led_red = false;
var led_yellow = false;
var led_green = false;

//요청 lED 개수를 파악하고 실시간 반영하는 함수
const ledCount = (req, res, bool_speaker, bool_finger) =>{
    const intent = req.body.request.intent.name;
    //req_count - 요청에 대해 실제로 수행할 LED 개수 파악,req_led - 요청된 LED 개수 파악
    var req_count = 0;
    var req_led = 0;

    var req_red = led_red;
    var req_yellow = led_yellow;
    var req_green = led_green;
    //TurnOn일때 LED 요청 개수 확인


    if(intent == 'TurnOn'){
      const slots = req.body.request.intent.slots;
      if(slots.hasOwnProperty('red') && led_red == false){
        console.log('Red request');
        req_red = true;
        req_count++;
      }
      if(slots.hasOwnProperty('yellow') && led_yellow == false){
        console.log('Yellow request');
        req_yellow = true;
        req_count++;
      }
      if(slots.hasOwnProperty('green') && led_green == false){
        console.log('Green request');
        req_green = true;
        req_count++;
      }
    }
    //TurnOff일 때 LED 요청 개수 확인
    if(intent == 'TurnOff'){
      const slots = req.body.request.intent.slots;
      //LED 요청 개수 확인
      if(slots.hasOwnProperty('red')){
        //요청 LED개수 파악
        req_led++;
        if(led_red == true){
          console.log('Red request');
          req_red = false;
          req_count++;
         }
      }
      if(slots.hasOwnProperty('yellow')){
        //요청 LED개수 파악
        req_led++;
        if(led_yellow == true){
          console.log('Yellow request');
          req_yellow = false;
          req_count++;
        }
      }
      if(slots.hasOwnProperty('green')){
        //요청 LED개수 파악
        req_led++;
        if(led_green == true){
          console.log('Green request');
          req_green = false;
          req_count++;
        }
      }
    }
    //Intent가 Auth일 경우 전 request의 Intent확인
    if(intent == 'Auth'){
      const attributeSlots = req.body.session.sessionAttributes.slots;
      const attributeIntent = req.body.session.sessionAttributes.name;
      if(bool_finger == true){
        //전 request가 TurnOn일 때 LED 요청 개수 확인
        if(attributeIntent == 'TurnOn'){
          if(attributeSlots.hasOwnProperty('red') && led_red == false){
            console.log('Red request');
            cur_led++;
            led_red = true;
          }
          if(attributeSlots.hasOwnProperty('yellow') && led_yellow == false){
            console.log('Yellow request');
            cur_led++;
            led_yellow = true;
          }
          if(attributeSlots.hasOwnProperty('green') && led_green == false){
            console.log('Green request');
            cur_led++;
            led_green = true;
          }
        }
        else{
          //Turn On이 아닐 때 LED 요청 개수 확인
          if(attributeSlots.hasOwnProperty('red') && led_red == true){
            console.log('Red request');
            cur_led--;
            led_red = false;
          }
          if(attributeSlots.hasOwnProperty('yellow') && led_yellow == true){
            console.log('Yellow request');
            cur_led--;
            led_yellow = false;
          }
          if(attributeSlots.hasOwnProperty('green') && led_green == true){
            console.log('Green request');
            cur_led--;
            led_green = false;
          }
        }
      }
    }
    //실제 명령 수행하는 /clova/index.js 파일에  request 전달
    if(intent == 'TurnOn'){
      //켜져 있는 LED를 켜달라고 하는 등의 의미 없는 명령 구분
      if(req_count == 0){
          require('../clova')(req, res, bool_speaker, bool_finger, req_count);
      }
      else{
          require('../clova')(req, res, bool_speaker, bool_finger, cur_led + req_count);
      }
    }
    else if(intent == 'TurnOff'){
      //꺼져 있는 LED를 꺼달라고 하는 등의 의미 없는 명령 구분
      if(req_count == 0){
          require('../clova')(req, res, bool_speaker, bool_finger, req_count);
      }
      else{
          require('../clova')(req, res, bool_speaker, bool_finger, req_led);
      }

    }
    else{
      require('../clova')(req, res, bool_speaker, bool_finger, 0);
    }
    //정상적인 명령일 경우 LED 요구 반영
    if(req_count == 1){
      if(cur_led == 0 && intent == 'TurnOn'){
        cur_led += req_count;
        led_red = req_red;
        led_yellow = req_yellow;
        led_green = req_green;
      }
      if(cur_led > 0 && intent == 'TurnOff'){
        cur_led -= req_count;
        led_red = req_red;
        led_yellow = req_yellow;
        led_green = req_green;
      }
    }
    console.log(`현재 LED ON: ${cur_led}개`);
};
module.exports = ledCount;
