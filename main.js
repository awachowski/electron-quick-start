const {
    app,
    BrowserWindow,ipcMain
} = require('electron')
const path = require('path')

let mainWindow
let gameWindow
let recordListWindow

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    gameWindow = recordWindow = mainWindow;
    mainWindow.loadFile('html/index.html')
    mainWindow.on('closed', function () {
        app.quit()
    })
}

function createGameWindow() {
    mainWindow.loadFile('html/game.html');
    mainWindow.on('closed', () => {
        app.quit()
    })
};

function createRecordListWindow() {
    mainWindow.loadFile('html/recordList.html');
    mainWindow.on('closed', () => {
        app.quit()
    })
};


app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})

ipcMain.on('btn:exit', function () {
    app.quit();
});

ipcMain.on('btn:exit:menu', function () {
    mainWindow.loadFile('html/index.html');
});

ipcMain.on('btn:list', function () {
    createRecordListWindow();
});

ipcMain.on('btn:start', function () {
    createGameWindow();
});

ipcMain.on('save:score', function () {});
