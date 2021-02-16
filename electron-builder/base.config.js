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
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    publish: [
      {
        provider: "github"
      }
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
