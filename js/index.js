require('../renderer.js');
const electron = require('electron');
const {ipcRenderer} = electron;

window.addEventListener('load', function () {
    document.getElementById('start').addEventListener('click', () => {
       console.log('start');
        ipcRenderer.send('btn:start');
    });

    document.getElementById('list').addEventListener('click', function () {
        ipcRenderer.send('btn:list');
    });

    document.getElementById('exit').addEventListener('click', function () {
        ipcRenderer.send('btn:exit');
    });
});
