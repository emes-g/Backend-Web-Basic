// load modules
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
const sanitizeHtml = require('sanitize-html');

// create server
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
                var filteredId = path.parse(`${queryData.id}`).base;

                fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                    var title = filteredId;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description);
                    var list = template.list(filelist);
                    var html = template.HTML(sanitizedTitle, list,
                        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                        `<a href="/create">create</a> 
                         <a href="/update?id=${sanitizedTitle}">update</a>
                         <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
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
            var post = qs.parse(body);  // qs to object
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
        var filteredId = path.parse(`${queryData.id}`).base;
        fs.readdir('./data', function (error, filelist) {
            fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                var title = filteredId;
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
            var filteredId = path.parse(id).base;   // 수정 전 제목
            var title = post.title; // 수정 후 제목
            var description = post.description;

            fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
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
            var post = qs.parse(body);  // qs to object
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

// run the server
app.listen(3000);