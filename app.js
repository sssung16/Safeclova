const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');

//const connect = require('connect');

const {SERVER_PORT} = require('./config.js');
const routes = require('./routes');

const app = express();

//https
/*const fs = require('fs');
const https = require('https');
const options = {
	key: fs.readFileSync('./keys/key.pem'),
	cert: fs.readFileSync('./keys/server.crt')
};*/

app.use(bodyParser.json())
app.use(morgan('common'));
//안드로이드에서 서버로 upload위해
app.use(express.static(__dirname + '/auth'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => next());


//요청처리
app.use('/', routes);
// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  //error handler로 위임
  next(err);
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_PORT} port`);
});

/*https.createServer(options, app).listen(3001, () => {
  console.log(`Server is running on ${SERVER_PORT} port`);
});*/
