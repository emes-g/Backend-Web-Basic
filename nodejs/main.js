// 1. 사용할 모듈을 변수에 저장
var http = require('http');
var fs = require('fs');
var url = require('url');

function templateHTML(title, list, body) {
    return `
    <!doctype html>
    <html>

    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
        <script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${body}
    </body>

    </html>
    `;
}

function templateList(filelist) {
    var list = '<ul>';
    for (var i = 0; i < filelist.length; i++)
        list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
    list += '</ul>';
    return list;
}

// 2. http 모듈로 서버를 생성, 사용자로부터 http 요청이 들어오면 function 블럭 내부의 코드를 실행해서 응답 
var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
        // 접속한 페이지가 메인 홈페이지인 경우
        if (queryData.id === undefined) {
            /*
                첫번째 인자로 파일 목록을 읽을 폴더를 가져오고,
                콜백함수의 두번째 인자로 폴더의 파일목록을 가져옴
            */
            fs.readdir('./data', function (error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = templateList(filelist);
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                response.writeHead(200);    // 200 : 파일을 성공적으로 전달함
                response.end(template);
            })

            // 메인 홈페이지가 아닌 경우
        } else {
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }

        // path가 '/'이 아닌 경우
    } else {
        response.writeHead(404);    // 404 : 파일을 찾을 수 없음
        response.end('Not found');
    }
});

// 3. listen()로 포트 번호가 3000인 서버를 실행
app.listen(3000);