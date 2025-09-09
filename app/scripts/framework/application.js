import { Camera } from "./camera.js";
import { EventQueue } from "./event.js";
import { Scene } from './scene.js';

export class Application {

    scene = null;
    #nextScene = null;

    constructor({
        scene=null,
    }={}) {
        this.scene = scene;

        this.eventQueue = new EventQueue();

        this.channels = {
            screen: null,
            mouse: null,
            keyboard: null,
        };

        // const audio = new Audio('./resources/sounds/walking_on_the_earth.mp3');
        // audio.pause();
    }

    connect(channel) {
        if (channel.type === 'screen') {
            this.channels.screen = channel.object;
            this.channels.screen.connect(this.eventQueue);
        }
        else if (channel.type === 'mouse') {
            this.channels.mouse = channel.object;
            this.channels.mouse.connect(this.eventQueue);
        }
        else if (channel.type === 'keyboard') {
            this.channels.keyboard = channel.object;
            this.channels.keyboard.connect(this.eventQueue);
        }
    }

    disconnect() {
        this.channels.screen.disconnect();
        this.channels.screen = null;
        this.channels.mouse.disconnect();
        this.channels.mouse = null;
        this.channels.keyboard.disconnect();
        this.channels.keyboard = null;
    }

    async load() {
        await this.onLoad();
    }

    async onLoad() {}

    transit(scene) {
        if (!(scene instanceof Scene)) {
            throw `scene is not Scene instance: ${scene}`;
        }

        this.#nextScene = scene;
    }

    create() {
        this.onCreate();

        this.scene?.create();
    }
    onCreate() {}

    destroy() {
        this.onDestroy();

        this.scene?.destroy();
    }
    onDestroy() {}

    update(deltaTime) {
        this.onUpdate(deltaTime);

        this.scene?.handle(this.eventQueue.events);
        this.scene?.update(deltaTime);

        if (this.#nextScene != null) {
            this.#transitNextScene();
        }

        this.eventQueue.clear();
    }
    onUpdate(deltaTime) {}

    #transitNextScene() {
        this.scene?.destroy();

        this.scene = this.#nextScene;
        this.#nextScene = null;

        this.scene?.setCamera(new Camera({ screen: this.channels.screen }));
        this.scene?.create();
    }

    render() {
        if (this.channels.screen == null) { return }

        this.channels.screen.clear();

        this.onRender(this.channels.screen.context, this.channels.screen.size);

        this.scene?.render(this.channels.screen.context, this.channels.screen.size);
    }
    onRender(context, screenSize) {}
}