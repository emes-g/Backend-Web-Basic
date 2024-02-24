var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require('fs')
const sanitizeHtml = require('sanitize-html')
var template = require('../lib/template.js')

// create 버튼을 클릭한 경우
router.get('/create', function (request, response) {
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description" cols=120 rows=5></textarea></p>
            <p><input type="submit"></p>
        </form>
        `, '');
    response.send(html);
})

// /create 페이지에서 제출 버튼을 클릭한 경우
router.post('/create_process', function (request, response) {
    console.log(request.list);
    var post = request.body;
    var title = post.title;
    var description = post.description;

    fs.writeFile(`data/${title}`, description, function (err) {
        response.redirect(`/topic/${title}`);
    });
})

// 메인 홈페이지가 아닌 경우
router.get('/:pageId', function (request, response, next) {
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
            `
            <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
            </form>
            `);
        response.send(html);
    })
})

// update 버튼을 클릭한 경우
router.get('/update/:pageId', function (request, response, next) {
    var filteredId = path.parse(`${request.params.pageId}`).base;

    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        if(err)
            next('err');
        var title = filteredId;
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
                <form action="/topic/update_process" method="post">
                    <p><input type="hidden" name="id" value="${title}"></p>
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p><textarea name="description" placeholder="description" cols=120 rows=5>${description}</textarea></p>
                    <p><input type="submit"></p>
                </form>
                `, '');
        response.send(html);
    });
})

// /update 페이지에서 제출 버튼을 클릭한 경우
router.post('/update_process', function (request, response) {
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;   // 수정 전 제목
    var title = post.title; // 수정 후 제목
    var description = post.description;

    fs.rename(`data/${filteredId}`, `data/${title}`, function (err) {
        fs.writeFile(`data/${title}`, description, function (err) {
            response.redirect(`/topic/${title}`);
        });
    });
})

// delete 버튼을 클릭한 경우
router.post('/delete_process', function (request, response) {
    var post = request.body;
    var id = post.id;

    fs.unlink(`data/${id}`, function (err) {
        response.redirect('/');
    });
})

module.exports = router