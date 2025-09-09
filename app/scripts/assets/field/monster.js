import { EventEmitter } from "../utility/event.js";
import { Progress } from "../utility/progress.js";
import random from "../utility/random.js";
import { ObjectVisible } from "./object.js";

export class Monster {

    #position = [0, 0];

    targetObjectVisible;

    collectSensingRange = 100;
    collectRange = 30;
    collectSpeed = 0.2;

    hp;
    maxHp;

    constructor({
        fieldSize,
        fieldObjectVisibles,
        position,
        speed,
        renderables,
        health,
    }={}) {
        this.fieldSize = fieldSize;
        this.fieldObjectVisibles = fieldObjectVisibles;
        this.position = position;
        this.speed = speed;
        this.renderables = renderables;
        this.hp = health;
        this.maxHp = health;

        this.collectProgress = new Progress({
            speed: this.collectSpeed,
            events: {
                finish: () => {
                    this.targetObjectVisible.controller.collect();
                    this.targetObjectVisible = null;

                    this.collectProgress.reset();

                    this.state = 'idle';
                },
            },
        });

        this.recoverProgress = new Progress({
            speed: 0.1,
            events: {
                finish: () => {
                    this.hp = this.maxHp;

                    this.state = 'idle';
                },
            }
        });

        this.movement = new Movement({
            bindee: this,
            speed: this.speed,
            range: 0,
        });

        this.state = 'idle';
    }

    get position() { return this.#position; }
    set position(value) {
        this.#position.splice(0, 2, ...value);
    }

    get renderable() {
        return this.state === 'recover' ? this.renderables.dead : this.renderables.alive;
    }

    update(deltaTime) {
        if (this.state === 'idle') {
            if (Math.random() < 0.1) {
                this.#moveRandomly();
            }
        }
        else if (this.state === 'wander') {
            this.movement.update(deltaTime);

            const fieldObjectVisible = this.#senseFieldObjectVisible();

            if (fieldObjectVisible != null) {
                this.#follow(fieldObjectVisible);
            }
        }
        else if (this.state === 'follow') {
            if (this.targetObjectVisible.controller.isCollected()) {
                this.#stopToFollow();
            }
            else {
                this.movement.update(deltaTime);
            }
        }
        else if (this.state === 'collect') {
            if (this.targetObjectVisible.controller.isCollected()) {
                this.#stopToCollect();
            }
            else {
                this.collectProgress.update(deltaTime);
            }
        }
        else if (this.state === 'recover') {
            this.recoverProgress.value = this.hp / this.maxHp;
            this.recoverProgress.update(deltaTime);
            this.hp = this.maxHp * this.recoverProgress.value;
        }
    }

    #moveRandomly() {
        const destination = random.generate(2).mul(this.fieldSize);

        this.movement.range = 0;
        this.movement.moveTo(destination);
        this.movement.events.on('arrive', () => {
            this.state = 'idle';

            this.movement.events.remove('arrive');
        });

        this.state = 'wander';
    }

    #senseFieldObjectVisible() {
        return this.fieldObjectVisibles.filter(
            fieldObjectVisible => fieldObjectVisible instanceof ObjectVisible
        ).filter(
            fieldObjectVisible => !fieldObjectVisible.controller.isCollected()
        ).find(fieldObjectVisible => {
            const selfPosition = this.position;
            const fieldObjectVisiblePosition = fieldObjectVisible.controller.getPosition();
            const toward = fieldObjectVisiblePosition.sub(selfPosition);
            const distance = toward.magnitude;
            return distance < this.collectSensingRange;
        });
    }

    #follow(fieldObjectVisible) {
        this.movement.range = this.collectRange;
        this.movement.moveTo(fieldObjectVisible.controller.getPosition());
        this.movement.events.remove('arrive');
        this.movement.events.on('arrive', () => {
            this.state = 'collect';

            this.movement.events.remove('arrive');
        });

        this.targetObjectVisible = fieldObjectVisible;

        this.state = 'follow';
    }

    #stopToFollow() {
        this.movement.stop();
        this.movement.events.remove('arrive');

        this.targetObjectVisible = null;

        this.state = 'idle';
    }

    #stopToCollect() {
        this.collectProgress.reset();

        this.targetObjectVisible = null;

        this.state = 'idle';
    }

    recover() {
        if (this.state === 'recover') { return }

        this.targetObjectVisible = null;

        this.collectProgress.reset();
        this.recoverProgress.reset();

        this.state = 'recover';
    }
}

export class MonsterController {

    constructor({
        monster,
    }={}) {
        this.monster = monster;
    }

    getPosition() {
        return this.monster.position;
    }

    getRenderable() {
        return this.monster.renderable;
    }

    interact() {
        this.monster.hp = Math.max(0, this.monster.hp - 5);

        if (this.monster.hp <= 0) {
            this.monster.recover();
        }
    }

    update(deltaTime) {
        this.monster.update(deltaTime);
    }

    isCollecting() {
        return this.monster.state === 'collect';
    }

    getCollectionRatio() {
        return this.monster.collectProgress.value;
    }

    isRecovering() {
        return this.monster.state === 'recover';
    }

    getRecoveringRatio() {
        return this.monster.recoverProgress.value;
    }

    getHealthRatio() {
        return this.monster.hp / this.monster.maxHp;
    }

    isMoving() {
        return this.monster.movement.isMoving();
    }

    getDestination() {
        return this.monster.movement.destination;
    }

    getCollectSensingRange() {
        return this.monster.collectSensingRange;
    }

    getState() {
        return this.monster.state;
    }
}

export class MonsterVisible {

    constructor({
        controller,
    }) {
        this.controller = controller;
    }

    handle(events, camera) {
        for (const event of events) {
            if (event.type === 'mousedown') {
                const screenPosition = event.position;
                const worldPosition = camera.toWorld(screenPosition);
                const renderableArea = this.controller.getRenderable().getArea(this.controller.getPosition());
                if (renderableArea.contains(worldPosition)) {
                    this.controller.interact();
                    break;
                }
            }
        }
    }

    update(deltaTime) {
        this.controller.update(deltaTime);
    }

    render(context, screenSize) {
        context.save();

        const position = this.controller.getPosition();
        context.translate(...position);

        const renderable = this.controller.getRenderable();
        const renderableArea = renderable.getArea();

        // character
        renderable.render(context);

        // collection
        if (this.controller.isCollecting()) {
            const collectionRatio = this.controller.getCollectionRatio();
            if (collectionRatio > 0) {
                const collectionPosition = renderableArea.slice(0, 2).sub([0, 10]);
                context.fillStyle = 'rgba(255, 255, 255, 0.5)';
                context.fillRect(...collectionPosition, renderableArea[2], 5);
                context.fillStyle = 'rgba(255, 255, 255, 1)';
                context.fillRect(...collectionPosition, renderableArea[2] * collectionRatio, 5);
            }
        }

        // health
        const healthPositon = renderableArea.slice(0, 2).add([0, renderableArea[3] + 5]);
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        context.fillRect(...healthPositon, renderableArea[2], 5);
        context.fillStyle = 'rgba(255, 0, 0, 1)';
        if (this.controller.isRecovering()) {
            context.fillRect(...healthPositon, renderableArea[2] * this.controller.getRecoveringRatio(), 5);
        }
        else {
            context.fillRect(...healthPositon, renderableArea[2] * this.controller.getHealthRatio(), 5);
        }

        context.restore();

        if (this.controller.isMoving()) {
            const destination = this.controller.getDestination();

            context.fillStyle = 'red';
            context.fillRect(...destination.sub(5), 10, 10);

            context.beginPath();
            context.strokeStyle = 'red';
            context.moveTo(...position);
            context.lineTo(...destination);
            context.stroke();
        }

        context.beginPath();
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        context.arc(...position, this.controller.getCollectSensingRange(), 0, Math.PI * 2);
        context.fill();

        context.font = 'bold 12px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'white';
        context.fillText(this.controller.getState(), ...position.add([0, renderableArea[3] + 5]));
    }
}

class Movement {

    destination;
    speed;
    range;

    constructor({
        bindee,
        speed,
        range,
        events,
    }={}) {
        if (bindee == null) { throw 'bindee is required' }
        if (bindee.position == null || bindee.position.length !== 2) { throw 'bindee.position[2] is required' }

        this.bindee = bindee;
        this.speed = speed;
        this.range = range;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    isMoving() {
        return this.destination != null;
    }

    moveTo(destination) {
        this.destination = destination;
    }

    stop() {
        this.destination = null;
    }

    update(deltaTime) {
        if (this.destination == null) { return }

        const sourcePosition = this.bindee.position;
        const destinationPosition = this.destination;
        const toward = destinationPosition.sub(sourcePosition);

        const distance = toward.magnitude;
        if (distance <= this.range) {
            this.#arrive();
            return;
        }

        const delta = this.speed * deltaTime;
        const towardDirection = toward.normalize();

        if (distance - this.range <= delta) {
            const backstep = towardDirection.mul(this.range);
            const nextPosition = destinationPosition.sub(backstep);

            this.bindee.position = nextPosition;

            this.#arrive();
        }
        else {
            const step = towardDirection.mul(delta);
            const nextPosition = sourcePosition.add(step);

            this.bindee.position = nextPosition;
        }
    }

    #arrive() {
        this.destination = null;

        this.events.emit('arrive');
    }
}