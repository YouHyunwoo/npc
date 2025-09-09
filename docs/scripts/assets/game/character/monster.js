import { Character } from "./character.js";
import { Progress } from "../../utility/progress.js";

export class Monster extends Character {

    fightProgress;

    constructor({
        ...args
    }={}) {
        super(args);

        this.fightProgress = new Progress({
            speed: this.statistics.attackSpeed,
            repeat: true,
            events: {
                exceed: (opponent, progress) => {
                    this.attack(opponent);
                },
            },
        });
    }

    update(deltaTime, opponent) {
        this.fightProgress?.update(deltaTime, opponent);
    }
}