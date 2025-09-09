import { EventEmitter } from "../utility/event.js";

export class Logger {

    messages = [];

    constructor({
        events={},
    }={}) {
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    log(message) {
        this.messages.push(message);

        this.events.emit('log', message);
    }

    clear() {
        this.messages.splice(0);

        this.events.emit('clear');
    }
}