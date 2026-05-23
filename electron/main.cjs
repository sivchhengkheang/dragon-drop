const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const createWindow = () => {
    // Remove the default application menu (cleaner for a game)
    Menu.setApplicationMenu(null);

    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'Dragon Drop',
        icon: path.join(__dirname, '../public/dragon-logo.png'),
        frame: true,        // Keep native title bar — minimize / close always work
        fullscreen: false,  // Never fullscreen — preserve window controls
        resizable: true,
        center: true,       // Start centered on screen at default size
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false,        // Avoid white flash on startup
    });

    // Show at default size — user can maximize manually if they want
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Clearly separate dev and production loading
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open DevTools only in development
        mainWindow.webContents.openDevTools();
    } else {
        // Production: load bundled dist files — fully offline, no internet needed
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
