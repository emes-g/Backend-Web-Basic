// load modules
var express = require('express')
var app = express()
var port = 3000
var fs = require('fs')
var template = require('./lib/template.js')
var bodyParser = require('body-parser')
var compression = require('compression')
var topicRouter = require('./routes/topic.js')
var indexRouter = require('./routes/index.js')

// middle-ware
// 1. third-party
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())  // compress all responses

// 2. my middle-ware
app.get('*', function (request, response, next) {
    /*
      첫번째 인자로 파일 목록을 읽을 폴더를 가져오고,
      콜백함수의 두번째 인자로 폴더의 파일목록을 가져옴
    */
    fs.readdir('./data', function (error, filelist) {
        request.list = filelist;
        next();
    })
})

// 3. static files
app.use(express.static('public'))

// route, routing
app.use('/topic', topicRouter)
app.use('/', indexRouter)   // 메인 홈페이지

// error-handling
// 1. 404 error
app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

// 2. else
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen
app.listen(port, function () {
    console.log(`Example app listening on port ${port}`)
})