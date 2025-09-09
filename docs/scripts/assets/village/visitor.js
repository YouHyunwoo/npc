import { EventEmitter } from '../utility/event.js';

export class Visitor {

    state = null;

    constructor({
        hero,
        events={},
    }={}) {
        this.hero = hero;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.#enter();
    }

    getState() {
        return {
            'rest': '🛌',
        }[this.state];
    }

    #enter() {
        this.state = 'rest';
    }

    update(deltaTime) {
        if (this.state === 'rest') {
            this.#rest(deltaTime);
            this.#fix(deltaTime);

            if (!this.#needRest() && !this.#needFix()) {
                this.#exit();
            }
        }
    }

    #needRest() {
        return this.hero.stats.health.value < this.hero.stats.health.maximum;
    }

    #needFix() {
        return false;
    }

    #rest(deltaTime) {
        const recoveredHp = deltaTime * this.hero.stats.healthRecoveringSpeed;

        this.hero.stats.health.value += recoveredHp;
    }

    #fix(deltaTime) {}

    #exit() {
        this.events.emit('exit');

        this.state = 'exit';
    }
}