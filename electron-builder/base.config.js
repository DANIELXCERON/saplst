const base = {
  appId: "com.saplst.app",
  productName: "List Builder For SAP",
  icon: "src/img/icon.ico",
  files: ["src","config"],
  nsis: {
    oneClick: false,
    perMachine: true,
    createDesktopShortcut: "always",
    allowToChangeInstallationDirectory: true,
    installerSidebar: "electron-builder/win-installer-sidebar.bmp",
    uninstallerSidebar: "electron-builder/win-uninstaller-sidebar.bmp",
  },
  directories: {
    buildResources: "electron-builder",
    output: "dist",
  },
  extraMetadata: {
    env: "production",
  },
  win: {
    extraResources: [],
    extraFiles: [
      "README.html",
      // {
      //   from: "config",
      //   to: "config",
      // },
    ],
  },
  fileAssociations: [
    {
      name: "PLST",
      description: "Archivo lista de reproducción",
      ext: "plst",
      icon: "electron-builder/FileTypeIcons/plst.ico"
    }
  ],
};

module.exports = base;
