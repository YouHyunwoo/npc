import { EventEmitter } from './event.js';

export class Progress {

    value;
    speed;
    repeat;
    events;

    constructor({
        value=0,
        speed=1,
        repeat=false,
        events={},
    }={}) {
        this.value = value;
        this.speed = speed;
        this.repeat = repeat;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    update(deltaTime, ...args) {
        if (this.value < 1) {
            this.value += deltaTime * this.speed;

            if (this.value >= 1) {
                if (this.repeat) {
                    const count = Math.floor(this.value);
                    this.value -= count;

                    for (let i = 0; i < count; i++) {
                        this.events.emit('exceed', ...args);
                    }
                }
                else {
                    this.value = 1;
                    this.events.emit('finish', ...args);
                }
            }
        }
    }

    reset() {
        this.value = 0;
    }

    dispose() {
        this.value = null;
        this.speed = null;
        this.repeat = null;
        this.events.dispose();
        this.events = null;
    }
}