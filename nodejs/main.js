// 1. 서버 사용을 위한 모듈을 변수에 저장
var http = require('http');
var fs = require('fs');
var url = require('url');

// 2. http 모듈로 서버를 생성, 사용자로부터 http 요청이 들어오면 function 블럭 내부의 코드를 실행해서 응답
var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
            // 메인 홈페이지로 접속한 경우
            var title = queryData.id;
            if (title === undefined) {
                title = 'Welcome';
                description = 'Hello, Node.js';
            }

            // 파일 리스트 변동
            fs.readdir('data', function (error, filelist) {
                var list = '<ul>';
                for (var i = 0; i < filelist.length; i++) {
                    list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
                }
                list += '</ul>';

                // 웹브라우저에 출력할 기본 템플릿
                var template = `
                <!DOCTYPE html>
                <html>
            
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                    <script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
                </head>
            
                <body>
                    <h1><a href="/">WEB</a></h1>
                    <div id="grid">
                        ${list}
                        <div id="article">
                            <h2>${title}</h2>
                            ${description}
                        </div>
                    </div>
                </body>
            
                </html>
                `;
                response.writeHead(200);    // 200 : 파일을 성공적으로 전송했음
                response.end(template);
            });

        });
    } else {
        response.writeHead(404);    // 404 : 파일을 찾을 수 없음
        response.end('Not found');
    }


});
// listen()로 3000 포트를 가진 서버를 실행
app.listen(3000);