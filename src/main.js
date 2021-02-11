const {app,BrowserWindow,Menu,MenuItem,ipcMain,dialog,Notification,} = require("electron");

const electron = require("electron");
const url = require("url");
const path = require("path");

/* ruta de imagenes */
// icono de la app
const imgPath_icon = path.join(__dirname, "img/logo-icon.png");

let mainWindow = null;

// solicitar bloqueo de instancia única
const gotTheLock = app.requestSingleInstanceLock();

// cuando la app este lista se crean las ventanas
app.on("ready", () => {
  // bloqueo de instancia única
  if (gotTheLock) {
    openMainWindow();
  } else {
    app.quit();
  }
});

// La ventana principal
function openMainWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    width: 950,
    height: 710,
    title: `${app.getName()} ${app.getVersion()}`,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.setIcon(imgPath_icon);

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true,
    })
  );

  // Menu
  const mainMenu = Menu.buildFromTemplate(MainWindowMenu);
  // Establecer el menú en la ventana principal
  Menu.setApplicationMenu(mainMenu);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (process.platform == "win32" && process.argv.length >= 2) {
      mainWindow.webContents.send("open:fileType", process.argv[1]);
    }
  });
  // Si cerramos la ventana principal, la segunda ventana se cierra
  mainWindow.on("closed", () => {
    app.quit();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Menu
const MainWindowMenu = [
  {
    label: "Archivo",
    submenu: [
      {
        label: "Abrir...",
        accelerator: "Ctrl+O",
        click() {
          mainWindow.webContents.send("openListJsonFile");
        },
      },
      {
        label: "Guardar",
        accelerator: "Ctrl+S",
        click() {
          mainWindow.webContents.send("saveListJsonFile");
        },
      },
      {
        label: "Guardar como...",
        accelerator: "Ctrl+Shift+S",
        click() {
          mainWindow.webContents.send("saveAsListJsonFile");
        },
      },
      { type: "separator" },
      {
        label: "Salir",
        accelerator: "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

// Herramientas para desarrolladores en entornos de desarrollo
// si la app no esta empaquetada
if (app.isPackaged === false) {
  MainWindowMenu.push({
    label: "dev",
    submenu: [
      {
        label: "toggle Dev Tools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
    ],
  });
}