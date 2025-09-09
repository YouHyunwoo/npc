import { View } from '../assets/ui/view.js';

export class Scene {

    camera = null;

    constructor() {
        this.objects = [];
        this.views = [];
    }

    add(object) {
        if (object instanceof View) {
            this.views.push(object);
        }
        else {
            this.objects.push(object);
        }
    }

    remove(object) {
        if (object instanceof View) {
            this.views.remove(object);
        }
        else {
            this.objects.remove(object);
        }
    }

    findObjectById(objectId) {
        return this.objects.find(object => object.id === objectId);
    }

    findObjectByName(objectName) {
        return this.objects.find(object => object.name === objectName);
    }

    findObjectsByName(objectName) {
        return this.objects.filter(object => object.name === objectName);
    }

    findViewById(viewId) {
        return this.views.find(view => view.id === viewId);
    }

    findViewByName(viewName) {
        return this.views.find(view => view.name === viewName);
    }

    findViewsByName(viewName) {
        return this.views.filter(view => view.name === viewName);
    }

    create() {
        this.willCreate();

        const screenSize = globalThis.screen.size;

        this.views.forEach(view => {
            view.create(screenSize);
        });

        this.views.forEach(object => {
            object.evaluate(screenSize);
        });

        this.didCreate();
    }
    willCreate() {}
    didCreate() {}
    destroy() {
        this.onDestroy();

        this.views.forEach(view => view.destroy());
    }
    onDestroy() {}
    handle(events) {
        this.onHandle(events);
        this.objects.toReversed().forEach(object => object.handle?.(events, this.camera));
        this.views.toReversed().forEach(view => view.handle?.(events));
    }
    onHandle(events) {}
    update(deltaTime) {
        this.onUpdate(deltaTime);
        this.objects.forEach(object => object.update?.(deltaTime));
        this.views.forEach(view => view.update?.(deltaTime));
    }
    onUpdate(deltaTime) {}
    render(context, screenSize) {
        this.withCamera(context, screenSize, (context, screenSize) => {
            this.onRender(context, screenSize);
            this.objects.forEach(object => object.render?.(context, screenSize));
        });
        this.views.forEach(view => view.render?.(context, screenSize));
    }
    onRender(context, screenSize) {}

    setCamera(camera) {
        this.camera = camera;

        return this;
    }

    withCamera(context, screenSize, render) {
        const camera = this.camera;

        context.save();

        if (camera !== null) {
            context.translate(...screenSize.div(2).sub(camera.position.mul(camera.scale)).map(Math.floor));
            context.scale(...camera.scale);
        }

        render(context, screenSize);

        context.restore();
    }
}