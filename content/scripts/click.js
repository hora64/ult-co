var b = document.body;
var imgurl = [
  'content/assets/images/png/ultcoFrutigerAeroBlue_px1024.png',
  'content/assets/images/png/ultcoFrutigerAeroRed_px1024.png',
  'content/assets/images/png/ultcoFrutigerAeroLime_px1024.png',
  'content/assets/images/png/ultcoFrutigerAeroPink_px1024.png',
  'content/assets/images/png/ultcoFrutigerAeroPurple_px1024.png',
  'content/assets/images/png/ultcoFrutigerAeroGrey_px1024.png'
];
var size = [9, 18];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getSize() {
  return rand(size[0], size[1]);
}

function lerp(a, b, f) {
  return (b - a) * f + a;
}

function getRotation() {
  return `rotate(${rand(0, 360)}deg)`;
}

function heart(x, y) {
  var s = getSize();
  x -= s / 2;
  y -= s / 2;
  x = Math.floor(x) + rand(-5, 5);
  y = Math.floor(y) + rand(-5, 5);
  var fx = x + rand(-40, 40);
  var fy = y + rand(-40, 40);
  var i = document.createElement("img");
  i.src = imgurl[rand(0, imgurl.length - 1)];
  i.style.cssText = `pointer-events: none; position: fixed; width: ${s}px; left: ${x}px; top: ${y}px; transform: ${getRotation()}; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; z-index: 1000000;`;
  b.appendChild(i);
  var f = 0;
  var interval;
  interval = setInterval(function () {
    var _x = Math.floor(lerp(x, fx, f));
    var _y = Math.floor(lerp(y, fy, f));
    i.style.cssText = `pointer-events: none; position: fixed; width: ${s}px; left: ${_x}px; top: ${_y}px; transform: ${getRotation()}; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; z-index: 1000000; opacity: ${1 - f};`;
    f += 0.01;
    if (f > 1) {
      clearInterval(interval);
      b.removeChild(i);
    }
  }, 10);
}

function bro(x, y) {
  for (var i = 5; i < 9; i++) {
    heart(x, y);
  }
}

b.addEventListener("click", function (event) {
  var x = event.clientX;
  var y = event.clientY;
  bro(x, y);
});
