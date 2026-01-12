var config = {
    "effectEnabled": true, // Control the activation of the effect here
    "icons": {
        "content/assets/images/png/px1024/ultcoFrutigerAeroBlue_px1024.png": true,
        "content/assets/images/png/px1024/ultcoFrutigerAeroRed_px1024.png": true, // Example: Disabled icon
        "content/assets/images/png/px1024/ultcoFrutigerAeroLime_px1024.png": true,
        "content/assets/images/png/px1024/ultcoFrutigerAeroPink_px1024.png": true,
        "content/assets/images/png/px1024/ultcoFrutigerAeroPurple_px1024.png": true,
        "content/assets/images/png/px1024/ultcoFrutigerAeroGrey_px1024.png": true
    },
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
};

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function lerp(a, b, f) {
    return (b - a) * f + a;
}

function getStyle(x, y, size, rotation) {
    return `pointer-events: none; position: fixed; width: ${size}px; left: ${x}px; top: ${y}px; transform: rotate(${rotation}deg); -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; z-index: 1000000;`;
}

function heart(x, y) {
    var enabledIcons = Object.keys(config.icons).filter(function(key) {
        return config.icons[key];
    });

    if (enabledIcons.length === 0) {
        return; // No enabled icons, exit the function
    }

    var s = rand(config.size.min, config.size.max);
    x -= s / 2;
    y -= s / 2;
    x = Math.floor(x) + rand(-5, 5);
    y = Math.floor(y) + rand(-5, 5);
    var fx = x + rand(-40, 40);
    var fy = y + rand(-40, 40);
    var i = document.createElement("img");
    i.src = enabledIcons[rand(0, enabledIcons.length - 1)]; // Select from enabled icons only
    var initialRotation = rand(config.rotation.initial.min, config.rotation.initial.max);
    var finalRotation = initialRotation + rand(config.rotation.final.min, config.rotation.final.max);
    i.style.cssText = getStyle(x, y, s, initialRotation);
    document.body.appendChild(i);
    var f = 0;
    var interval = setInterval(function() {
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

// Add the event listener if effectEnabled is true
if (config.effectEnabled) {
    document.body.addEventListener("click", function(event) {
        var x = event.clientX;
        var y = event.clientY;
        for (var i = 0; i < rand(5, 9); i++) {
            heart(x, y);
        }
    });
}
