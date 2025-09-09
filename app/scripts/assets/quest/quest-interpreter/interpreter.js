import database from "../../database.js";

export class QuestInterpreter {

    constructor({
        quest,
    }={}) {
        this.quest = quest;
    }

    getObjectives() {
        return this.quest.objectives.map(objective => this.#getObjective(objective));
    }

    #getObjective(objective) {
        switch (objective.type) {
            case 'collect':
                return this.#getCollectObjective(objective);
            case 'hunt':
                return this.#getHuntObjective(objective);
            default:
                throw `Unknown quest objective type: ${objective.type}`;
        }
    }

    #getCollectObjective(objective) {
        const name = database.items[objective.target.id].name;
        return `${name} ${objective.target.amount}개 수집`;
    }

    #getHuntObjective(objective) {
        const name = database.monsters[objective.target.id].name;
        return `${name} ${objective.target.amount}마리 처치`;
    }

    getDeadline() {
        const timeLeft = this.quest.deadline;
        const day = parseInt(timeLeft / 86400);
        const hour = parseInt(timeLeft / 3600) % 24;
        const minute = parseInt(timeLeft / 60) % 60;
        const second = parseInt(timeLeft) % 60;

        return `${day}일 ${hour}시 ${minute}분 ${second}초`;
    }

    getTimeLeft(currentTime) {
        if (this.quest.isExpired(currentTime)) {
            return '만료됨';
        }

        const timeLeft = this.quest.deadline - currentTime;
        const hour = parseInt(timeLeft / 3600);
        const minute = parseInt(timeLeft / 60) % 60;
        const second = parseInt(timeLeft) % 60;

        return `${hour}시간 ${minute}분 ${second}초 남음`;
    }

    getRewards() {
        return this.quest.rewards.map(reward => this.#getReward(reward));
    }

    #getReward(reward) {
        switch (reward.type) {
            case 'item':
                return this.#getItemReward(reward);
            case 'gold':
                return this.#getGoldReward(reward);
            default:
                throw `Unknown quest reward type: ${reward.type}`;
        }
    }

    #getItemReward(reward) {
        const name = database.items[reward.id].name;
        return `${name} ${reward.amount}개`;
    }

    #getGoldReward(reward) {
        return `${reward.amount} 골드`;
    }

    getStatus() {
        return this.quest.dedicator == null ? '미완료' : '완료';
    }

    getDedicator() {
        return this.quest.dedicator == null ? '없음' : this.quest.dedicator;
    }
}