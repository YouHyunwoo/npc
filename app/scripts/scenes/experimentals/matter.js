import { Scene } from "../../framework/scene.js";
import random from "../../assets/utility/random.js";

export class MatterScene extends Scene {

    willCreate() {
        const screenSize = globalThis.screen.size;

        this.whites = this.createBodies({
            count: 50,
            color: 'white',
            positionGenerator: () => random.generate(2).mul(screenSize),
            massGenerator: () => random.generate(1) * 10 + 10,
        });

        this.reds = this.createBodies({
            count: 50,
            color: 'red',
            positionGenerator: () => random.generate(2).mul(screenSize),
            massGenerator: () => random.generate(1) * 10 + 10,
        });

        this.bodies = [];
        this.bodies.splice(0, ...this.whites, ...this.reds);

        console.assert(this.bodies.some(body => body.mass > 0));

        this.camera.position.set(screenSize.div(2));
    }

    onHandle(events) {
        for (const event of events) {
            if (event.type === 'mousewheel') {
                if (event.deltaY > 0) {
                    this.camera.scale = this.camera.scale.mul(0.5);
                }
                else if (event.deltaY < 0) {
                    this.camera.scale = this.camera.scale.mul(2);
                }
            }
        }
    }

    onUpdate(deltaTime) {
        this.updatePhysics(deltaTime);
    }

    onRender(context, screenSize) {
        context.fillStyle = 'rgb(20, 20, 20)';
        context.fillRect(0, 0, ...screenSize);

        for (const body of this.bodies) {
            body.render(context);
        }

        context.font = '16px sans-serif';
        context.textBaseline = 'middle';

        context.fillStyle = 'white';
        context.fillRect(10, 10, 10, 10);
        context.fillText(`${this.whites.length}`, 30, 15);
        context.fillStyle = 'red';
        context.fillRect(10, 40, 10, 10);
        context.fillStyle = 'white';
        context.fillText(`${this.reds.length}`, 30, 45);
    }

    createBodies({
        count=1,
        color,
        positionGenerator,
        massGenerator,
    }={}) {
        const bodies = [];

        for (let i = 0; i < count; i++) {
            const position = positionGenerator();
            const mass = massGenerator();

            const body = new Body({
                position,
                size: 10,
                color,
                mass,
            });

            bodies.push(body);
        }

        return bodies;
    }

    applyRule(deltaTime, subjects, objects, attraction=1) {
        const k = 0.01;

        for (const subject of subjects) {
            if (subject.dead) { continue }

            for (const object of objects) {
                if (object.dead) { continue }

                const towardVector = subject.position.sub(object.position);
                const distance = towardVector.magnitude;
                if (distance < subject.size + object.size) {
                    // 충돌
                    const totalMass = subject.mass + object.mass;
                    const mass = k * subject.mass * object.mass / totalMass;

                    subject.mass += mass;
                    object.mass -= mass;

                    if (object.mass <= 10e-5) {
                        object.dead = true;
                    }
                }

                if (distance < 10) { continue }

                const gravity = attraction * object.mass / distance ** 2;
                const directionVector = towardVector.normalize();
                const gravityVector = directionVector.mul(gravity * deltaTime);

                const nextAvelocity = subject.velocity.sub(gravityVector);

                subject.velocity = nextAvelocity;
            }
        }

        subjects.splice(0, subjects.length, ...subjects.filter(subject => !subject.dead));
        objects.splice(0, objects.length, ...objects.filter(object => !object.dead));
    }

    updatePhysics(deltaTime) {
        deltaTime *= 20;
        this.applyRule(deltaTime, this.whites, this.reds, 20);
        this.applyRule(deltaTime, this.reds, this.whites, -10);
        this.applyRule(deltaTime, this.whites, this.whites, 1);
        this.applyRule(deltaTime, this.reds, this.reds, 1);

        const screenSize = globalThis.screen.size;
        const screenArea = [0, 0, ...screenSize];
        const center = screenSize.div(2);
        const k = 0.001;
        for (const body of this.bodies) {
            body.position = body.position.add(body.velocity.mul(deltaTime));
            body.velocity = body.velocity.mul(0.95);

            if (screenArea.contains(body.position)) { continue }

            body.velocity.splice(0, 2, ...body.velocity.add(center.sub(body.position).mul(k * deltaTime)));
        }

        this.bodies.splice(0, this.bodies.length, ...this.bodies.filter(body => !body.dead));
    }
}

class Body {

    _size = 0;
    _halfsize = 0;
    dead = false;

    constructor({
        name,
        position, size, color,
        mass,
        velocity = [0, 0],
    }={}) {
        this.name = name;
        this.position = position;
        this.size = size;
        this.color = color;
        this.mass = mass;
        this.velocity = velocity;
    }

    get size() { return this._size }
    set size(value) {
        this._size = value;
        this._halfsize = value / 2;
    }

    render(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.position[0], this.position[1], this.size, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = 'white';
        context.fillText(`${Math.floor(this.mass * 10) / 10}`, this.position[0], this.position[1]);
    }

    createWave({
        color,
    }={}) {

    }
}

class Wave {

    constructor({
        position, size, color,
    }={}) {
        this.position = position;
        this.size = size;
        this.color = color;
    }

    update(deltaTime) {
        this.size += deltaTime;
    }

    render(context) {
        context.strokeStyle = this.color;
        context.beginPath();
        context.arc(this.position[0], this.position[1], this.size, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    }
}