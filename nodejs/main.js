// 1. 사용할 모듈을 변수에 저장
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
    HTML: function (title, list, body, control) {
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
            ${control}
            ${body}
        </body>
    
        </html>
        `
    },
    list: function (filelist) {
        var list = '<ul>';
        for (var i = 0; i < filelist.length; i++)
            list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        list += '</ul>';
        return list;
    }
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
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`);
                response.writeHead(200);    // 200 : 파일을 성공적으로 전달함
                response.end(html);
            })

        } else {
            // 메인 홈페이지가 아닌 경우
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var html = template.HTML(title, list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a> 
                         <a href="/update?id=${title}">update</a>
                         <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                         </form>
                        `);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        // create 버튼을 클릭한 경우
        fs.readdir('./data', function (error, filelist) {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description" cols=120 rows=5></textarea></p>
                <p><input type="submit"></p>
            </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        })
    } else if (pathname === '/create_process') {
        // /create 페이지에서 제출 버튼을 클릭한 경우
        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;

            fs.writeFile(`data/${title}`, description, function (err) {
                response.writeHead(302, {   // 302 : 페이지 리다이렉션
                    location: `/?id=${title}`
                });
                response.end();
            });
        });
    } else if (pathname === '/update') {
        // update 버튼을 클릭한 경우
        fs.readdir('./data', function (error, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.HTML(title, list, `
                    <form action="/update_process" method="post">
                        <p><input type="hidden" name="id" value="${title}"></p>
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p><textarea name="description" placeholder="description" cols=120 rows=5>${description}</textarea></p>
                        <p><input type="submit"></p>
                    </form>
                    `, '');
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === "/update_process") {
        // /update 페이지에서 제출 버튼을 클릭한 경우
        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;

            fs.rename(`data/${id}`, `data/${title}`, function (err) {
                fs.writeFile(`data/${title}`, description, function (err) {
                    response.writeHead(302, {   // 302 : 페이지 리다이렉션
                        location: `/?id=${title}`
                    });
                    response.end();
                });
            });
        });
    } else if (pathname === '/delete_process') {
        // delete 버튼을 클릭한 경우
        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;

            fs.unlink(`data/${id}`, function (err) {
                response.writeHead(302, {   // 302 : 페이지 리다이렉션
                    location: '/'
                });
                response.end();
            });
        });
    } else {
        response.writeHead(404);    // 404 : 파일을 찾을 수 없음
        response.end('Not found');
    }
});

// 3. listen()로 포트 번호가 3000인 서버를 실행
app.listen(3000);