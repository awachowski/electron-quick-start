// You can also require other files to run in this process
require('../renderer.js');

const electron = require('electron');
const {
    ipcRenderer
} = electron;
const fs = require('fs');
let $ = require('jquery');
const $board = $('#board');
let firstClick = true;

const ROWS = 10;
const COLS = 10;

function createGame() {
    $board.empty();
    for (let i = 0; i < ROWS; i++) {
        const $row = $('<div>').addClass('row');
        for (let j = 0; j < COLS; j++) {
            const $col = $('<div>')
                .addClass('col hidden')
                .attr('data-row', i)
                .attr('data-col', j);
            if (Math.random() < 0.1) {
                $col.addClass('mine');
            }
            $row.append($col);
        }
        $board.append($row);
    }
}

function resetGame() {
    stopwatch.stop();
    stopwatch.reset();
    createGame();
    firstClick = true;
}

class Stopwatch {
    constructor(display) {
        this.running = false;
        this.display = display;
        this.reset();
        this.print(this.times);
    }

    reset() {
        this.times = [0, 0, 0];
        this.print();
    }

    start() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    stop() {
        this.running = false;
        this.time = null;
    }

    restart() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
        this.reset();
    }

    clear() {
        clearChildren(this.results);
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }

    calculate(timestamp) {
        let diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[2] += diff / 10;
        // Seconds are 100 hundredths of a second
        if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }

    pad0(value, count) {
        let result = value.toString();
        for (; result.length < count; --count)
            result = '0' + result;
        return result;
    }

    print() {
        this.display.innerText = this.format(this.times);
    }

    format(times) {
        return `\
${this.pad0(times[0], 2)}:\
${this.pad0(times[1], 2)}:\
${this.pad0(Math.floor(times[2]), 2)}`;
    }

}

let stopwatch;

function gameOver(isWin) {
    stopwatch.stop();
    let message = null;
    let icon = null;
    if (isWin) {
        let name = document.getElementById('inputName').value || "Unknow";
        message = name + ' YOU WON with time: ' + document.getElementById('timer').textContent + ' check record list';
        icon = 'fa fa-flag';
        addRecord(document.getElementById('inputName').value, document.getElementById('timer').textContent);
    } else {
        let name = document.getElementById('inputName').value || "Unknow";
        message = name + ' YOU LOST!';
        icon = 'fa fa-bomb';
    }

    $(".mine").text('O');
    $(".mine").addClass('bomb');
    
    $('.col:not(.mine)')
        .html(function () {
            const $cell = $(this);
            const count = getMineCount(
                $cell.data('row'),
                $cell.data('col'),
            );
            return count === 0 ? '' : count;
        })
    $('.col.hidden').removeClass('hidden');
    setTimeout(function () {
        alert(message);
        resetGame();
    }, 100);
}

function reveal(oi, oj) {
    const seen = {};

    function helper(i, j) {
        if (i >= ROWS || j >= COLS || i < 0 || j < 0) return;
        const key = `${i} ${j}`
        if (seen[key]) return;
        const $cell =
            $(`.col.hidden[data-row=${i}][data-col=${j}]`);
        const mineCount = getMineCount(i, j);
        if (
            !$cell.hasClass('hidden') ||
            $cell.hasClass('mine')
        ) {
            return;
        }

        $cell.removeClass('hidden');

        if (mineCount) {
            $cell.text(mineCount);
            return;
        }

        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                helper(i + di, j + dj);
            }
        }
    }

    helper(oi, oj);
}

function getMineCount(i, j) {
    let count = 0;
    for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
            const ni = i + di;
            const nj = j + dj;
            if (ni >= ROWS || nj >= COLS || nj < 0 || ni < 0) continue;
            const $cell =
                $(`.col.hidden[data-row=${ni}][data-col=${nj}]`);
            if ($cell.hasClass('mine')) count++;
        }
    }
    return count;
}

function addRecord(pName, pTime) {
    pName = pName || "Unknow";
    let dataScore = fs.readFileSync('data.json', 'utf8');
    let arrayScore = JSON.parse(dataScore);

    arrayScore.push({
        name: pName,
        time: pTime
    });
    fs.writeFileSync('data.json', JSON.stringify(arrayScore), 'utf8');
};

function startTime() {
    if (firstClick) {
        stopwatch.start();
        firstClick = false;
    }
}

window.addEventListener('load', function () {
    stopwatch = new Stopwatch(document.querySelector('.stopwatch'));
    createGame();

    document.getElementById('back').addEventListener('click', function () {
        ipcRenderer.send('btn:exit:menu');
    });

    document.getElementById('restart').addEventListener('click', function () {
        resetGame();
    });

    $board.on('click', '.col.hidden', function () {
        const $cell = $(this);
        const row = $cell.data('row');
        const col = $cell.data('col');

        startTime();

        if ($cell.hasClass('mine')) {
            gameOver(false);
        } else {
            reveal(row, col);
            const isGameOver = $('.col.hidden').length === $('.col.mine').length
            if (isGameOver) gameOver(true);
        }
    })
});
