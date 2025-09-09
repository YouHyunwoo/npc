if (globalThis.requestAnimationFrame == null || globalThis.cancelAnimationFrame == null) {
    const startTime = Date.now();

	let lastTime = 0;

	globalThis.requestAnimationFrame = function (callback) {
		const currentTime = Date.now();

		const timeToCall = Math.max(0, 16 - (currentTime - lastTime));

		const id = globalThis.setTimeout(
            () => callback(currentTime + timeToCall - startTime),
            timeToCall
        );

		lastTime = currentTime + timeToCall;

		return id;
	};

    globalThis.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}

export class Looper {

    type = 'requestAnimationFrame';
    running = false;

    lastTime;

    constructor() {
        this.onVisibilityChangeCallback = this.onVisibilityChangeCallback.bind(this);
        this.loopWithRequestAnimationFrameCallback = this.loopWithRequestAnimationFrame.bind(this);

        this.useWithVisibilityState = {
            visible: () => this.use('requestAnimationFrame'),
            hidden: () => this.use('worker'),
        };

        this.startWithType = {
            requestAnimationFrame: this.startWithRequestAnimationFrame,
            worker: this.startWithWorker,
        };

        this.stopWithType = {
            requestAnimationFrame: this.stopWithRequestAnimationFrame,
            worker: this.stopWithWorker,
        };
    }

    onVisibilityChangeCallback(event) {
        this.useWithVisibilityState[globalThis.document.visibilityState]();
    }

    start(updateHandler) {
        this.updateHandler = updateHandler;

        globalThis.document.addEventListener('visibilitychange', this.onVisibilityChangeCallback);

        this.running = true;

        this.startFunction = this.startWithType[this.type];
        this.startFunction();
    }

    stop() {
        globalThis.document.removeEventListener('visibilitychange', this.onVisibilityChangeCallback);

		this.running = false;

        this.stopFunction = this.stopWithType[this.type];
        this.stopFunction();
	}

    startWithRequestAnimationFrame() {
        this.handle = globalThis.requestAnimationFrame(elapsedTime => {
            this.lastTime = elapsedTime;

            this.loopWithRequestAnimationFrame(elapsedTime);
        });
    }

    stopWithRequestAnimationFrame() {
        this.handle && globalThis.cancelAnimationFrame(this.handle);
        this.handle = null;
    }

    loopWithRequestAnimationFrame(elapsedTime) {
        const deltaTime = elapsedTime - this.lastTime;
        this.lastTime = elapsedTime;

        this.running && this.updateHandler(deltaTime / 1000.0);

        if (this.running === false) { return }

        this.handle = globalThis.requestAnimationFrame(this.loopWithRequestAnimationFrameCallback);
    }

    startWithWorker() {
        this.worker = new Worker('./scripts/framework/worker.js');
        this.worker.addEventListener('message', e => {
            this.loopWithWorker(e.data);
        });
        this.worker.postMessage({ type: 'request-update' });
    }

    stopWithWorker() {
        this.worker.postMessage({ type: 'cancel-update' });
        this.worker.terminate();
        this.worker = null;
    }

    loopWithWorker(deltaTime) {
        this.running && this.updateHandler(deltaTime);

        if (this.running === false) { return }

        this.worker.postMessage({ type: 'request-update' });
    }

    use(type) {
        this.stop();
        this.type = type;
        this.start(this.updateHandler);
    }
}