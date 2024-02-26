// load module
var http = require('http')
var cookie = require('cookie')

// create server & listen
/*
    createServer의 인자 : requestListener
*/
http.createServer(function (request, response) {
    console.log(request.headers.cookie)
    var cookies = {};
    if(request.headers.cookie !== undefined)
        cookies = cookie.parse(request.headers.cookie);
    console.log(cookies.yummy_cookie)

    /*
        setHeader()는 writeHeader()로 합쳐질 수 있다.
    */
    response.writeHead(200, {
        'Set-Cookie': [
            // session : 웹브라우저를 끄면 사라지는 휘발성 쿠키
            'yummy_cookie=choco', 
            'tasty_cookie=strawberry',
            // permanent : 지정된 기간동안 살아있는 쿠키
            `Permanent=cookies; Max-age=${60*60*24*30}`
        ]
    })
    response.end('Cookie!!');
}).listen(3000)