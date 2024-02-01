var body = {
    setColor: function (color) {
        // document.querySelector('body').style.color = color;
        $('body').css('color', color);
    },
    setBackgroundColor: function (color) {
        // document.querySelector('body').style.backgroundColor = color;
        $('body').css('backgroundColor', color);
    }
}
var links = {
    setColor: function (color) {
        // var links = document.querySelectorAll('a');

        // for (var i = 0; i < links.length; i++)
        //     links[i].style.color = color;
        // document.getElementById('active').style.color = 'red';
        $('a').css('color', color);
        $('#active').css('color', 'red');
    }
}
function dayNightHandler(self) {
    if (self.value == 'night') {
        self.value = 'day';
        body.setBackgroundColor('black');
        body.setColor('white');
        links.setColor('yellow');
    }
    else {
        self.value = 'night';
        body.setBackgroundColor('white');
        body.setColor('black');
        links.setColor('black');
    }
}