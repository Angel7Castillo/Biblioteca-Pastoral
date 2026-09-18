import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import '../server/index.js'; // Arrancar servidor backend

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1000,
    minHeight: 650,
    autoHideMenuBar: true, // Hide default Windows menu bar
    titleBarStyle: 'hidden', // Modern titlebar
    titleBarOverlay: {
      color: '#0F111A',
      symbolColor: '#A6ACCD',
      height: 40
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

import pkg from 'electron-updater';
const { autoUpdater } = pkg;

app.whenReady().then(() => {
  createWindow();
  
  // Buscar actualizaciones si la aplicación está empaquetada
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
