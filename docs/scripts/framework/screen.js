export class Screen {

    #originalSize = [0, 0];
    #size = [0, 0];

    eventQueue = null;

    constructor({
        id,
        canvas,
        size,
    }={}) {
        this.id = id;
        this.canvas = canvas;
        this.#originalSize.splice(0, 2, size.width, size.height);
        this.#size.splice(0, 2, size.width, size.height);

        this.canvas.width = size.width;
        this.canvas.height = size.height;

        this.context = canvas.getContext('2d');

        this.resizeType = 'fill';

        this.onResizeCallback = this.onResize.bind(this);
    }

    connect(eventQueue) {
        this.eventQueue = eventQueue;
    }

    disconnect() {
        this.eventQueue = null;
    }

    fill() {
        this.resizeType = 'fill';
        this.size = [globalThis.window.innerWidth, globalThis.window.innerHeight];
    }

    pack() {
        this.resizeType = 'pack';
        this.size = this.#originalSize;
    }

    onResize(event) {
        if (this.resizeType === 'fill') {
            this.size = [globalThis.window.innerWidth, globalThis.window.innerHeight];
        }
        else if (this.resizeType === 'pack') {
            this.size = this.#originalSize;
        }

        this.eventQueue?.push({ type: 'resize', size: [globalThis.window.innerWidth, globalThis.window.innerHeight] });
    }

    get size() {
        return [...this.#size];
    }

    set size(value) {
        this.#size.splice(0, 2, ...value);

        this.canvas.width = value[0];
        this.canvas.height = value[1];
    }

    get width() {
        return this.#size[0];
    }

    set width(value) {
        this.#size[0] = value;
        this.canvas.width = value;
    }

    get height() {
        return this.#size[1];
    }

    set height(value) {
        this.#size[1] = value;
        this.canvas.height = value;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    static createFromCanvas({
        canvasId,
        size,
    }={}) {
        const canvas = document.getElementById(canvasId);

        return new Screen({
            id: canvasId,
            canvas,
            size,
        });
    }
}