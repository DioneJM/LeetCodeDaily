const { default: ChromeRuntime } = require("./src/chrome_extensions/runtime/runtime");

const init = () => ChromeRuntime.registerOnInstalledListener();
init();