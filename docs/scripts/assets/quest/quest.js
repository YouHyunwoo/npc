export class Quest {

    id = null;
    objectives = [];
    deadline = null;
    rewards = [];

    dedicator = null;

    isAvailable(currentTime) {
        return !this.isExpired(currentTime) && !this.isFinished();
    }

    isExpired(currentTime) {
        return this.deadline < currentTime;
    }

    isFinished() {
        return this.dedicator != null;
    }

    finish(characterId) {
        this.dedicator = characterId;
    }

    toJSON() {
        return {
            ...this,
        };
    }

    static fromJSON(data) {
        const quest = new Quest();

        quest.id = data.id;
        quest.objectives = data.objectives;
        quest.deadline = data.deadline;
        quest.rewards = data.rewards;
        quest.dedicator = data.dedicator ?? null;

        return quest;
    }

    static create({
        objectives, deadline, rewards,
    }={}) {
        const quest = new Quest();

        quest.id = globalThis.crypto.randomUUID();
        quest.objectives = objectives;
        quest.deadline = deadline;
        quest.rewards = rewards;

        return quest;
    }
}