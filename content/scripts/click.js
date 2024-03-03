var b = document.body;
var imgurl = [
  'https://cdn.discordapp.com/attachments/958072385746133062/1212568134410706954/ult__co._Frutiger_Aero_Blue.png?ex=65f24f13&is=65dfda13&hm=a4eedcf61218f215254e4979d58e86638232a357dcbd7780f5f306925ae7b014&',
  'https://cdn.discordapp.com/attachments/958072385746133062/1212568134741925908/ult__co._Frutiger_Aero_Lime.png?ex=65f24f13&is=65dfda13&hm=c959eef9d40b804d2e85877c48c58fd12785afc7d254b373b4d3c2db202702d1&',
  'https://cdn.discordapp.com/attachments/958072385746133062/1212568135144706140/ult__co._Frutiger_Aero_Pink.png?ex=65f24f13&is=65dfda13&hm=ab468404951191d572053a91ca4823804a29c76ca5cda62f0a49470657694600&',
  'https://cdn.discordapp.com/attachments/958072385746133062/1212568135471726602/ult__co._Frutiger_Aero_Purple.png?ex=65f24f13&is=65dfda13&hm=57edf6bf5a9980a59615163c5733b8df1ebcfcbc1298f803949b574dd266e60f&',
  'https://cdn.discordapp.com/attachments/958072385746133062/1212568135815929897/ult__co._Frutiger_Aero_Red.png?ex=65f24f14&is=65dfda14&hm=09d6d40e5a804615980c6ecf9aa431778cd3e8239ce5c60723ef5861938321ca&'
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
