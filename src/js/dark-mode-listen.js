window.addEventListener("load", () => { DarkModeListen(); });

function DarkModeListen() {
  /**por defento en modo oscuro */
  document.body.setAttribute("data-theme", "dark");

  // if (localStorage.getItem("darkSwitch")) { //comprueva si hay datos
  //   document.body.setAttribute("data-theme", "dark");
  // } else {
  //   document.body.removeAttribute("data-theme");
  // }
}

