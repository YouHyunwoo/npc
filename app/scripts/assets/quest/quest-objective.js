// type: 'collect' | 'hunt'
// target: { id: 'cherry', amount: 1 } | { id: 'green-slime', amount: 10 }

const Type = {
    Collect: Symbol('quest-objective-type-collect'),
    Hunt: Symbol('quest-objective-type-hunt'),
};

export class QuestObjective {

    static Type = Type;

    type = null;
    target = null;

    constructor({
        type,
        target,
    }={}) {
        this.type = type;
        this.target = target;
    }

    static create({
        type,
        target,
    }={}) {
        const questObjective = new QuestObjective({
            type,
            target,
        });

        return questObjective;
    }
}