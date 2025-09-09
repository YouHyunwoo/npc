export class Time {

    startTime;
    #elapsedTime;
    speed;

    constructor({
        startTime=null,
        elapsedTime=0,
        speed=1,
    }={}) {
        this.startTime = startTime ?? Date.now();
        this.#elapsedTime = elapsedTime;
        this.speed = speed;
    }

    update(deltaTime) {
        this.#elapsedTime += deltaTime * this.speed;
    }

    get elapsedTime() {
        return this.#elapsedTime;
    }

    get days() {
        return Math.floor(this.#elapsedTime / (24 * 60 * 60));
    }
}