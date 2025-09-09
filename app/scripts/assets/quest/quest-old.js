import database from '../database.js';

export class Quest {

    constructor({
        uuid=null,
        type,
        rewards=[],
        deadline,
        ...args
    }={}) {
        this.uuid = uuid ?? globalThis.crypto.randomUUID();
        this.type = type;
        this.rewards = rewards;
        this.deadline = deadline;
        Object.assign(this, args);

        this.finisherId = null;
    }

    getType() {
        if (this.type === 'hunt') {
            return '사냥';
        }
        else if (this.type === 'collect') {
            return '수집';
        }
        else {
            throw new Error(`Unknown quest type: ${this.type}`);
        }
    }

    getContent() {
        if (this.type === 'hunt') {
            const name = database.monsters[this.targetMonster.id].name;
            return `${name} ${this.targetMonster.count}마리 처치`;
        }
        else if (this.type === 'collect') {
            const name = database.items[this.targetItem.id].name;
            return `${name} ${this.targetItem.count}개 수집`;
        }
        else {
            throw new Error(`Unknown quest type: ${this.type}`);
        }
    }

    getTimeLeft() {
        const timeLeft = this.deadline - Date.now();
        const hour = Math.floor(timeLeft / (1000 * 60 * 60));
        const minute = Math.floor(timeLeft / (1000 * 60)) % 60;
        const second = Math.floor(timeLeft / 1000) % 60;

        return `${hour}시간 ${minute}분 ${second}초 남음`;
    }

    isAvailable() {
        return !this.isExpired() && !this.isFinished();
    }

    isExpired() {
        return this.deadline < Date.now();
    }

    isSatisfied(visitor) {
        if (this.type === 'hunt') {
            return globalThis.Object.entries(visitor.inventory).reduce((result, [itemId, count]) => 
                result + (itemId === this.targetMonster.id + '-dead' ? count : 0), 0) >= this.targetMonster.count;
        }
        else if (this.type === 'collect') {
            return globalThis.Object.entries(visitor.inventory).reduce((result, [itemId, count]) =>
                result + (itemId === this.targetItem.id ? count : 0), 0) >= this.targetItem.count;
        }
        else {
            throw new Error(`Unknown quest type: ${this.type}`);
        }
    }

    finish(visitor) {
        this.finisherId = visitor.id;
    }

    isFinished() {
        return this.finisherId !== null;
    }

    toJSON() {
        return {
            ...this,
        };
    }

    static fromJSON(data) {
        const quest = new Quest(data);
        return quest;
    }
}