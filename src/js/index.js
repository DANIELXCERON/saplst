/** modulos node y electron */
const fs = require("fs");
const path = require("path");
const { dialog, app } = require("electron").remote;
const { ipcRenderer } = require("electron");
const { shell } = require("electron");

/** Mis modulos */
const nTF = require("../src/js/modules/nice-time-format");
const getTime = require("../src/js/modules/reloj");

/** modulo para la informacion de la media */
var ffprobeStaticPath = "";
if (!__dirname.includes(".asar")) {
  // Si es dev
  ffprobeStaticPath = require("ffprobe-static");
} else {
  // si se compila
  let ext = "";
  // if (process.platform === 'win32') ext = '.exe' // si windows
  // ffprobeStaticPath = path.join(process.resourcesPath + '/ffprobe' + ext)
  ffprobeStaticPath = require(path.join(
    process.resourcesPath + "/app.asar.unpacked/node_modules/ffprobe-static"
  ));
}
var ffprobe = require("ffprobe"),
  ffprobeStatic = ffprobeStaticPath;

agGrid.LicenseManager.setLicenseKey(
  "CompanyName=Daniel,LicensedGroup=Multi,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=0,AssetReference=AG-0,ExpiryDate=28_July_2046_[v2]_MjQxNjM2NjgwMDAwMA==ab77e95735c4bae98770c2d74cfc7c32"
);

/** crear nueva lista en make_new_list */
const gridDiv = document.querySelector("#make_new_list_container");

/**idioma de la grilla */
var localeText = AG_GRID_LOCALE_ES;
// deje que la grilla sepa qué columnas y qué datos usar
const gridOptions = {
  onRowDoubleClicked: doSomething,
  columnDefs: [
    {
      width: 403,
      headerName: "Nombre",
      field: "namefile",
      rowDrag: true,
      pinned: "left",
    },
    {
      width: 100,
      headerName: "Duracion",
      field: "duration",
      cellRenderer: "durationRender",
    },
    { width: 105, headerName: "Tipo", field: "ref", cellRenderer: "refRender" },
    { width: 105, headerName: "Fecha", field: "date" },
    { width: 430, headerName: "Ruta", field: "path" },
  ],
  components: {
    durationRender: durationRender,
    refRender: refRender,
  },
  defaultColDef: {
    minWidth: 100,
    sortable: true,
    resizable: true,
    filter: true,
  },
  rowSelection: "multiple",
  rowHeight: 25,
  localeText: localeText,
  rowDragManaged: true,
  onSelectionChanged: onSelectionChanged,
  getContextMenuItems: getContextMenuItems,
};

function doSomething(row){
  videoPlay(row.data.path);
}

// clase de renderizador de celda
function durationRender() {}
function refRender() {}

// El método init obtiene los detalles de la celda que se va a representar.
durationRender.prototype.init = function (params) {
  this.eGui = document.createElement("span");
  this.eGui.innerHTML = `<i class="fad fa-clock"></i> ${nTF.secToHHMMSS(
    parseFloat(params.value)
  )}`;
};
refRender.prototype.init = function (params) {
  this.eGui = document.createElement("span");
  this.eGui.innerHTML = `<i class="fas fa-${params.value}"></i> ${params.value}`;
};

durationRender.prototype.getGui = function () {
  return this.eGui;
};
refRender.prototype.getGui = function () {
  return this.eGui;
};

new agGrid.Grid(gridDiv, gridOptions);
gridOptions.api.applyTransaction({ add: [] });

/**menu contextual */
function getContextMenuItems(params) {
  var result = [
    {
      // custom item
      name: "Revelar en el explorador de archivos",
      action: function () {
        shell.showItemInFolder(params.node.data.path);
      },
      shortcut: "Shift+Alt+R",
      tooltip: "Se abrira una ventana del explorador mostrando el archivo",
      icon: '<span class="material-icons">folder</span>',
    },
    {
      // custom item
      name: "Reproducir",
      action: function () {
        videoPlay(params.node.data.path);
      },
      shortcut: "Shift+P",
      tooltip: "Reproduce el video",
      icon: '<span class="material-icons">play_arrow</span>',
    },
    "separator",
    {
      // custom item
      name: "Eliminar",
      action: function () {
        gridOptions.api.applyTransaction({ remove: [params.node.data] });
        var selectedData = gridOptions.api.getSelectedRows();
        gridOptions.api.applyTransaction({ remove: selectedData });
      },
      shortcut: "Delete",
      tooltip: "Elimina el archivo de la lista pero no del disco",
      icon: '<span class="material-icons">delete_outline</span>',
    },
  ];

  return result;
}

/**Reproducir Video */
function videoPlay(path) {
  videoPlayLocal.src = path;
  videoPlayLocal.load();
}

/**al seleccionar una fila */
function onSelectionChanged() {
  var selectedRows = gridOptions.api.getSelectedRows();
  var sumDuration = 0;

  selectedRows.forEach(function (selectedRow, index) {
    sumDuration += parseFloat(selectedRow.duration);
  });
  InfoListViewDOM_selection.innerHTML = `duracion: ${nTF.secToHHMMSS(
    sumDuration
  )}`;
}

/** barra de menu */
/** abrir lista desde archivo plst */
ipcRenderer.on("openListJsonFile", () => {
  dialog
    .showOpenDialog({
      title: "Abrir Lista",
      buttonLabel: "Abrir",
      properties: ["openFile"],
      filters: [
        { name: "playlist file", extensions: ["plst"] },
        { name: "Json", extensions: ["json"] },
      ],
    })
    .then((result) => {
      /**si no ha sido canselado */
      if (!result.canceled) {
        openPlst(result.filePaths[0]);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

/**Funcion para abrir archivo en la app */
function openPlst(ruta) {
  /**se guarda la ruta del archivo plst guardado */
  sessionStorage.setItem("plst-path", ruta.toString());
  fetch(ruta)
    .then((results) => results.json())
    .then(function (data) {
      gridOptions.api.setRowData(data);
    });
}

/**Funcion para guardar archivo en la app */
function savePlst(ruta) {
  /**se guarda la ruta del archivo plst guardado */
  sessionStorage.setItem("plst-path", ruta.toString());
  fs.writeFile(ruta.toString(), getContentList()[0], function (err) {
    if (err) throw err;
    iziToast.show({
      title: "Lista guardada con exito",
      message: "",
      color: "green", // blue, red, green, yellow
    });
  });
}

/**Funcion obtener datos de lista */
function getContentList() {
  /**se genera una lista por medio
   * de una suma de forEach
   * se retorna en array 0
   * la lista en string y en 1
   * la lista en array
   */
  var lstArray = [];
  gridOptions.api.forEachNodeAfterFilterAndSort(function (rowNode, index) {
    lstArray.push(rowNode.data);
  });
  var lstString = JSON.stringify(lstArray);
  return [lstString, lstArray];
}

/** guardar lista */
ipcRenderer.on("saveListJsonFile", () => {
  if (getContentList()[1].length > 0) {
    // si hay datos en la lista
    console.log("nada");
    if (sessionStorage.getItem("plst-path")) {
      // si es la misma lista en session
      savePlst(sessionStorage.getItem("plst-path"));
    } else {
      saveAsListJsonFile();
    }
  } else {
    iziToast.show({
      title: "Guardar",
      message: "No hay datos que guardar ❗",
      color: "red", // blue, red, green, yellow
    });
  }
});

/** guardar lista como... */
ipcRenderer.on("saveAsListJsonFile", () => {
  saveAsListJsonFile();
});
function saveAsListJsonFile() {
  // si hay datos en la lista
  if (getContentList()[1].length > 0) {
    const options = {
      defaultPath: app.getPath("documents") + "/000-Playlist",
      title: "Guarda PlayList",
      buttonLabel: "Guardar",
      filters: [
        { name: "playlist file", extensions: ["plst"] },
        { name: "Json", extensions: ["json"] },
      ],
    };
    dialog
      .showSaveDialog(null, options)
      .then((result) => {
        if (!result.canceled) {
          savePlst(result.filePath);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    iziToast.show({
      title: "Guardar como...",
      message: "No hay datos que guardar ❗",
      color: "red", // blue, red, green, yellow
    });
  }
}
/** END Controles de la lista */

/** ver duracion de la seleccion */
const InfoListViewDOM = document.querySelector("#InfoListViewDOM");
const InfoListViewDOM_selection = document.querySelector(
  "#InfoListViewDOM_selection"
);

const videoPlayLocal = document.querySelector("#videoPlayLocal");

/**al presionar una tecla en ventana */
function keyPress(e) {
  // console.log(e.key)
  /** Eliminar item */
  if (e.key === "Delete") {
    var selectedData = gridOptions.api.getSelectedRows();
    gridOptions.api.applyTransaction({ remove: selectedData });
  }
}
/**Obtener la ultima fecha de modificacion del archivo */
function getFileModDateLast(mil) {
  var dm = new Date(mil.lastModified);
  var d = dm.getDate() < 10 ? "0" + dm.getDate() : dm.getDate();
  var m = dm.getMonth() < 9 ? "0" + (dm.getMonth() + 1) : dm.getMonth() + 1;
  var a = dm.getFullYear();
  return `${a}/${m}/${d}`;
}
/**Drop & Drag Files */
gridDiv.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();

  for (const file of e.dataTransfer.files) {
    if (validExts(file.path, ["plst", "json"])) {
      //si el archivo es una lista plst o json
      openPlst(file.path);
    } else {
      // si no, lo toma como archivo de video
      ffprobe(file.path, { path: ffprobeStatic.path })
        .then(function (info) {
          info.streams.forEach((streams) => {
            if (streams.codec_type === "video") {
              // si el codec es válido es válida codec_name: "h264"
              const codecs = ["h264", "av1", "vp8", "vp9", "theora"];
              if (validVideoCodec(streams.codec_name, codecs)) {
                gridOptions.api.applyTransaction({
                  add: [
                    {
                      namefile: filename(file.path),
                      ref: "file-video",
                      path: file.path,
                      duration: info.streams[1].duration,
                      temp: false,
                      custom: "bg_id_plst",
                      in: 0,
                      date: getFileModDateLast(file),
                    },
                  ],
                });
              } else {
                gridOptions.api.applyTransaction({
                  add: [
                    {
                      namefile: "[ARCHIVO NO VÁLIDO] " + filename(file.path),
                      ref: "invalid",
                      path: file.path,
                      duration: 0,
                      temp: false,
                      custom: "bg_id_plst",
                      in: 0,
                    },
                  ],
                });
                iziToast.show({
                  title: "codec no compatible❗ 😢",
                  message: streams.codec_long_name,
                  color: "yellow", // blue, red, green, yellow
                });
                console.log(
                  "notificacion",
                  "codec " + streams.codec_long_name + " no compatible❗ 😢"
                );
              }
            }
          });
        })
        .catch(function (err) {
          console.error(err);
        });
    }
  }

  /**estilos de filas */
  gridOptions.getRowStyle = function (params) {
    /**si el archivo no es valido lo pinta de rojo */
    if (params.data.ref === "invalid") {
      return { background: "red" };
    }
  };
});
gridDiv.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});
/** Drop & Drag Files, Ends*/

////////////////////////////////////////////////////////////////////////////////////////////

// después de que la página haya terminado de cargarse
document.addEventListener("DOMContentLoaded", function () {});

/*** CONVERTIR A MODULOS!!!! */
/**Obtiene el index para agregar de ultimo un elemento */
function getIndexAddGrid(grid) {
  if (grid._currentData) {
    return grid._currentData.length;
  } else {
    return 0;
  }
}
/** funcion para extraer nombre del archivo de una url */
function filename(rutaAbsoluta) {
  var nombreArchivo = rutaAbsoluta.replace(/^.*(\\|\/|\:)/, ""); // dejar solo nombre
  var nombreArchivo = nombreArchivo.replace(/(.*)\.(.*?)$/, "$1"); // eliminar extencion
  //.replace(/^.*[\\\/]/, "")
  return nombreArchivo;
}
/**valida la extension desde un nombre de archivo o ruta completa */
function validExts(nameFile = "", exts = []) {
  const even = (ext) => ext === nameFile.split(".").pop();
  return exts.some(even);
}
/**valida el codec de un video se requiere usar ffprobe */
function validVideoCodec(getVideoCodec, codecs) {
  const even = (codec) => codec === getVideoCodec;
  return codecs.some(even);
}

/**abrir tipo de archivo con la aplicación */
ipcRenderer.on("open:fileType", (e, pathFile) => {
  if (pathFile !== ".") {
    openPlst(pathFile);
  }
});
