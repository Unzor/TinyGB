var {
    spawnSync
} = require('child_process');
var {
    loadImage
} = require('canvas');

var fs = require('fs');
var ac = require('./ansc');
var imageboy = require('imageboy');
var canvas = ac();
var ctx = canvas.getContext('2d');
var keypress = require('keypress');
keypress(process.stdin);
var isWindows = process.platform == "win32"
var size = [process.stdout.columns, process.stdout.rows]

if (isWindows) {
    function setSize(x, y) {
        spawnSync('mode con: cols=' + x + ' lines=' + y, {
            stdio: "inherit",
            shell: true
        }) // resize window.
    }
    spawnSync('mode con: cols=73 lines=35', {
        stdio: "inherit",
        shell: true
    }) // resize window.
    var onExit = () => {
        setSize(size[0], size[1])
    };

    process.on('exit', onExit);
    process.on('SIGINT', onExit)
}

var keys = {
    "37": "left",
    "39": "right",
    "38": "up",
    "40": "down",
    "65": "a",
    "66": "b",
    "13": "start",
    "32": "select"
};

if (process.argv[2]) {
    if (!fs.existsSync(process.argv[2])) {
        console.log('Error! File does not exist.')
    }

    var emulator = imageboy.runDataURL({
        path: process.argv[2],
        fps: 60,
        onFrame: function(frame) {
            loadImage(frame).then(img => {
                ctx.drawImage(img, process.stdout.columns / 68, 0, 70, 70)
                canvas.render()
            })
        }
    })

    var keycon1 = (s) => s !== '\x1B[D' || s !== '\x1B[C' || s !== '\x1B[A' || s !== '\x1B[B';
    var keycon2 = (s) => s == '\x1B[D' || s == '\x1B[C' || s == '\x1B[A' || s == '\x1B[B';

    var getType = (s) => {
        if (s == '\x1B[D') {
            return '37';
        } else if (s == '\x1B[C') {
            return '39';
        } else if (s == '\x1B[A') {
            return '38';
        } else if (s == '\x1B[B') {
            return '40';
        }
    }

    process.stdin.on('keypress', function(ch, key) {
        var keyCode = key.sequence.toUpperCase().charCodeAt();
        if (keys[keyCode] != undefined && keycon1(key.sequence)) {
            emulator.pressKeys(emulator.gameboy, [keys[keyCode]]);
        } else if (keycon2(key.sequence)) {
            var t = getType(key.sequence)
            emulator.pressKeys(emulator.gameboy, [keys[t]])
        }

        if (keyCode == 3) {
            process.exit(0)
        }

    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
} else {
    var file = require('prompt-sync')()('What ROM would you like to use? ');
    var emulator = imageboy.runDataURL({
        path: file,
        fps: 60,
        onFrame: function(frame) {
            loadImage(frame).then(img => {
                ctx.drawImage(img, process.stdout.columns / 68, 0, 70, 70)
                canvas.render()
            })
        }
    })

    var keycon1 = (s) => s !== '\x1B[D' || s !== '\x1B[C' || s !== '\x1B[A' || s !== '\x1B[B';
    var keycon2 = (s) => s == '\x1B[D' || s == '\x1B[C' || s == '\x1B[A' || s == '\x1B[B';

    var getType = (s) => {
        if (s == '\x1B[D') {
            return '37';
        } else if (s == '\x1B[C') {
            return '39';
        } else if (s == '\x1B[A') {
            return '38';
        } else if (s == '\x1B[B') {
            return '40';
        }
    }

    process.stdin.on('keypress', function(ch, key) {
        var keyCode = key.sequence.toUpperCase().charCodeAt();
        if (keys[keyCode] != undefined && keycon1(key.sequence)) {
            emulator.pressKeys(emulator.gameboy, [keys[keyCode]]);
        } else if (keycon2(key.sequence)) {
            var t = getType(key.sequence)
            emulator.pressKeys(emulator.gameboy, [keys[t]])
        }

        if (keyCode == 3) {
            process.exit(0)
        }

    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
}
