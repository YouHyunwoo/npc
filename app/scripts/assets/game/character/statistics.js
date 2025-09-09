import { LimitedValue } from "./limited-value.js";

export class Statistics {

    constructor(args) {
        Object.assign(this, args);
    }
}

export class CharacterStatistics extends Statistics {

    level;
    experience;
    health;
    healthRecoveringSpeed;
    attackPower;
    defensePower;
    attackSpeed;

    constructor({
        level,
        experience,
        maxExperience,
        health,
        maxHealth,
        healthRecoveringSpeed,
        attackPower,
        defensePower,
        attackSpeed,
        ...args
    }={}) {
        super(args);

        this.level = level;
        this.experience = new LimitedValue({
            value: experience,
            maximum: maxExperience,
            valueModificationPolicy: LimitedValue.ValueModificationPolicy.None,
            maximumValueModificationPolicy: LimitedValue.MaximumValueModificationPolicy.None,
        });
        this.health = new LimitedValue({
            value: health, maximum: maxHealth ?? health,
        });

        this.healthRecoveringSpeed = healthRecoveringSpeed;
        this.attackPower = attackPower;
        this.defensePower = defensePower;
        this.attackSpeed = attackSpeed;
    }
}