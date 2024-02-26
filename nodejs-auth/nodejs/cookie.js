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
            `Permanent=cookies; Max-age=${60*60*24*30}`,
            // Secure : https가 아닌 통신에서는 쿠키를 전송하지 않음
            'Secure=Secure; Secure',
            // HttpOnly : 클라이언트에서 JS를 이용한 쿠키 탈취문제(XSS)를 예방할 수 있게 함
            'HttpOnly=HttpOnly; HttpOnly'
        ]
    })
    response.end('Cookie!!');
}).listen(3000)