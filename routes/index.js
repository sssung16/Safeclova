const express = require('express');
const clova = require('../clova');
const auth = require('../auth');
const router = express.Router();

//모든 데이터는 /auth를 거친다.
router.use(`/auth`, auth);

module.exports = router;
