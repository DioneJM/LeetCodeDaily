const { default: ChromeRuntime } = require("./chrome_extensions/runtime/runtime");

const init = () => ChromeRuntime.registerOnInstalledListener();
init();