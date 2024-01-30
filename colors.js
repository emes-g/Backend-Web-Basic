var body = {
    setColor: function (color) {
        document.querySelector('body').style.color = color;
    },
    setBackgroundColor: function (color) {
        document.querySelector('body').style.backgroundColor = color;
    }
}
var links = {
    setColor: function (color) {
        var links = document.querySelectorAll('a');

        for (var i = 0; i < links.length; i++) {
            if (window.getComputedStyle(links[i]).color != 'rgb(255, 0, 0)')
                links[i].style.color = color;
        }
    }
}
function dayNightHandler(self) {
    if (self.value == 'night') {
        self.value = 'day';
        body.setBackgroundColor('black');
        body.setColor('white');
        links.setColor('white');
    }
    else {
        self.value = 'night';
        body.setBackgroundColor('white');
        body.setColor('black');
        links.setColor('black');
    }
}