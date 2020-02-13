require('../renderer.js');
let fs = require('fs');
const electron = require('electron');
const {
    ipcRenderer
} = electron;
let data = fs.readFileSync('data.json', 'utf8');
let array = JSON.parse(data);


function sortArray() {

    for (let i = array.length - 1; i > 0; i--) {
        for (let j = 0; j < i; j++) {
            console.log(parseSec(array[j].time), parseSec(array[j + 1].time));
            if (parseSec(array[j].time) > parseSec(array[j + 1].time)) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }

        }
    }
    return array;
}



function parseSec(timev) {
    let seconds = 0;
    let time = timev.split(':');
    return 6000 * parseInt(time[0]) + 100 * parseInt(time[1]) + parseInt(time[2])
}


window.addEventListener('load', function () {
    document.getElementById('back').addEventListener('click', () => {
        ipcRenderer.send('btn:exit:menu');
    });

    function updateTable() {
        let recordList = document.getElementById("myTable");
        recordList.innerHTML = "";

        let sortedArray = sortArray();

        sortedArray.forEach(element => {
            let row = recordList.insertRow(-1);
            row.insertCell(0).innerHTML = element.name;
            row.insertCell(1).innerHTML = element.time;
        });
    };

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (!err) {
            array = JSON.parse(data);
        } else {
            array = [];
        }
        updateTable();
    });
});
