//onoff의 Gpio모듈을 사용
var Gpio = require('onoff').Gpio;
    //GPIO 21번을 출력으로 사용할 수 있는 객체를 생성
    led = new Gpio(21, 'out');

var led_state = 0;

//setInterval안에 있는 내용을 200ms마다 실행함
var iv = setInterval(function(){

    //led가 연결된 GPIO의 핀값을 읽어와서
    led_state=led.readSync();

    //해당값의 반전된 값을 다음 LED의 상태값으로 결정함
    //결과적으로 LED가 깜박이게됨
    if (led_state == 0 ) led_state = 1;
    else led_state = 0;

    //led_state값을 gpio에 기록
    led.writeSync(led_state)
}, 200);

// 5초 후에 LED를 깜박이는게 중지됨
setTimeout(function() {
    clearInterval(iv); // LED를 깜박이게 했던 인터벌을 제거
    led.writeSync(0);  // LED를 끈다.
    led.unexport();    // 사용했던 GPIO자원을 해제한다.
}, 5000);
