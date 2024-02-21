// load modules
var express = require('express')
var app = express()
var port = 3000
var fs = require('fs');
var template = require('./lib/template.js');

// route, routing
// 접속한 페이지가 메인 홈페이지인 경우
app.get('/', function (request, response) {
    /*
      첫번째 인자로 파일 목록을 읽을 폴더를 가져오고,
      콜백함수의 두번째 인자로 폴더의 파일목록을 가져옴
    */
    fs.readdir('./data', function (error, filelist) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(filelist);
        var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`);
        response.send(html);
    })
})

// listen
app.listen(port, function () {
    console.log(`Example app listening on port ${port}`)
})