// load modules
var express = require('express')
var app = express()
var port = 3000
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
const sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var bodyParser = require('body-parser')
var compression = require('compression')

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
// 1. 접속한 페이지가 메인 홈페이지인 경우
app.get('/', function (request, response) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
        `
        <h2>${title}</h2>
        ${description}
        <img src="./images/universe.jpg" style="width:50%; display:block; margin-top:10px">
        `,
        `<a href="/create">create</a>`);
    response.send(html);
})

// 2. 메인 홈페이지가 아닌 경우
app.get('/page/:pageId', function (request, response, next) {
    var filteredId = path.parse(`${request.params.pageId}`).base;

    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        if(err)
            next('err');
        var title = filteredId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description);
        var list = template.list(request.list);
        var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            `<a href="/create">create</a>
                 <a href="/update/${sanitizedTitle}">update</a>
                 <form action="/delete_process" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}">
                    <input type="submit" value="delete">
                 </form>
                `);
        response.send(html);
    })
})

// 3. create 버튼을 클릭한 경우
app.get('/create', function (request, response) {
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description" cols=120 rows=5></textarea></p>
            <p><input type="submit"></p>
        </form>
        `, '');
    response.send(html);
})

// 4. /create 페이지에서 제출 버튼을 클릭한 경우
app.post('/create_process', function (request, response) {
    console.log(request.list);
    var post = request.body;
    var title = post.title;
    var description = post.description;

    fs.writeFile(`data/${title}`, description, function (err) {
        response.redirect(`/page/${title}`);
    });
})

// 5. update 버튼을 클릭한 경우
app.get('/update/:pageId', function (request, response, next) {
    var filteredId = path.parse(`${request.params.pageId}`).base;

    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        if(err)
            next('err');
        var title = filteredId;
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
                <form action="/update_process" method="post">
                    <p><input type="hidden" name="id" value="${title}"></p>
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p><textarea name="description" placeholder="description" cols=120 rows=5>${description}</textarea></p>
                    <p><input type="submit"></p>
                </form>
                `, '');
        response.send(html);
    });
})

// 6. /update 페이지에서 제출 버튼을 클릭한 경우
app.post('/update_process', function (request, response) {
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;   // 수정 전 제목
    var title = post.title; // 수정 후 제목
    var description = post.description;

    fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
        fs.writeFile(`data/${title}`, description, function (err) {
            response.redirect(`/page/${title}`);
        });
    });
})

// 7. delete 버튼을 클릭한 경우
app.post('/delete_process', function (request, response) {
    var post = request.body;
    var id = post.id;

    fs.unlink(`data/${id}`, function (err) {
        response.redirect('/');
    });
})

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