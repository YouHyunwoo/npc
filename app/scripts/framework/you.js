import { Core } from "./core.js";

const configurations = {
    registerInGlobal: true,
};

function start({
    screen,
    application,
}={}) {
    const core = new Core();

    core.screen = screen;

    if (configurations.registerInGlobal) {
        globalThis.core = core;
        globalThis.application = application;
        globalThis.screen = screen;
        globalThis.mouse = core.mouse;
        globalThis.keyboard = core.keyboard;
        globalThis.canvas = globalThis.document.createElement('canvas');
    }

    core.start(application);

    return core;
}

export default {
    configurations,
    start,
};