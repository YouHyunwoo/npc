export class QuestObjectiveGenerator {

    static generate(configurations) {
        switch (configurations.type) {
            case 'collect':
                return this.generateCollectObjective(configurations);
            case 'hunt':
                return this.generateHuntObjective(configurations);
            default:
                throw `Unknown quest objective type: ${configurations.type}`;
        }
    }

    generateCollectObjective({
        name,
    }={}) {
        return {
            type: 'collect',
        };
    }

    generateHuntObjective({
        name,
    }={}) {
        return {
            type: 'hunt',
        };
    }
}