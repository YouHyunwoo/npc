import { EventEmitter } from "../utility/event.js";

export class Object {

    #position = [0, 0];

    collected = false;

    constructor({
        position,
        renderables,
    }={}) {
        this.position = position;
        this.renderables = renderables;
    }

    get position() { return this.#position }
    set position(value) {
        this.#position.splice(0, 2, ...value);
    }
}

export class ObjectController {

    constructor({
        object,
    }={}) {
        this.object = object;
    }

    getPosition() {
        return this.object.position;
    }

    getRenderable() {
        return this.object.renderables.default;
    }

    collect() {
        this.object.collected = true;
    }

    isCollected() {
        return this.object.collected;
    }
}

export class ObjectVisible {

    constructor({
        controller,
        events={},
    }={}) {
        this.controller = controller;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    handle(events, camera) {
        for (const event of events) {
            if (event.type === 'mousedown') {
                const screenPosition = event.position;
                const worldPosition = camera.toWorld(screenPosition);
                const spriteArea = this.controller.getRenderable().getArea(this.controller.getPosition(), [3, 3]);
                if (spriteArea.contains(worldPosition)) {
                    this.controller.collect();
                    this.events.emit('collect');
                    break;
                }
            }
        }
    }

    render(context, screenSize) {
        context.save();

        const position = this.controller.getPosition();
        context.translate(...position);

        const renderable = this.controller.getRenderable();
        renderable.render(context, [3, 3]);

        context.restore();
    }
}