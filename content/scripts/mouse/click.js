var config = {
	"icons": ["content/assets/images/png/px1024/ultcoFrutigerAeroBlue_px1024.png",
		"content/assets/images/png/px1024/ultcoFrutigerAeroRed_px1024.png",
		"content/assets/images/png/px1024/ultcoFrutigerAeroLime_px1024.png",
		"content/assets/images/png/px1024/ultcoFrutigerAeroPink_px1024.png",
		"content/assets/images/png/px1024/ultcoFrutigerAeroPurple_px1024.png",
		"content/assets/images/png/px1024/ultcoFrutigerAeroGrey_px1024.png"
	],
	"size": {
		"min": 9,
		"max": 24
	},
	"rotation": {
		"initial": {
			"min": -90,
			"max": 90
		},
		"final": {
			"min": -90,
			"max": 90
		}
	}
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function lerp(a, b, f) {
	return (b - a) * f + a;
}

function heart(x, y) {
	var s = rand(config.size.min, config.size.max);
	x -= s / 2;
	y -= s / 2;
	x = Math.floor(x) + rand(-5, 5);
	y = Math.floor(y) + rand(-5, 5);
	var fx = x + rand(-40, 40);
	var fy = y + rand(-40, 40);
	var i = document.createElement("img");
	i.src = config.icons[rand(0, config.icons.length - 1)];
	var initialRotation = rand(config.rotation.initial.min, config.rotation.initial.max);
	var finalRotation = initialRotation + rand(config.rotation.final.min, config.rotation.final.max); // Ensures rotation changes as it fades
	i.style.cssText = getStyle(x, y, s, initialRotation);
	document.body.appendChild(i);
	var f = 0;
	var interval;
	interval = setInterval(function() {
		var _x = Math.floor(lerp(x, fx, f));
		var _y = Math.floor(lerp(y, fy, f));
		var currentRotation = lerp(initialRotation, finalRotation, f);
		i.style.cssText = getStyle(_x, _y, s, currentRotation);
		i.style.opacity = 1 - f;
		f += 0.01;
		if (f > 1) {
			clearInterval(interval);
			document.body.removeChild(i);
		}
	}, 10);
}

function getStyle(x, y, size, rotation) {
	return `pointer-events: none; position: fixed; width: ${size}px; left: ${x}px; top: ${y}px; transform: rotate(${rotation}deg); -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; z-index: 1000000;`;
}
document.body.addEventListener("click", function(event) {
	var x = event.clientX;
	var y = event.clientY;
	for (var i = 0; i < rand(5, 9); i++) {
		heart(x, y);
	}
});
