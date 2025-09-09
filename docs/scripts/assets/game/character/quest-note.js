export class QuestNote {

    records = [];

    addQuest(quest) {
        const record = new QuestRecord({
            quest,
        });

        this.records.push(record);
    }

    removeQuest(quest) {
        const record = this.records.find(record => record.quest === quest);
        if (record == null) { return }

        this.records.remove(record);
    }
}

export class QuestRecord {

    constructor({
        quest,
    }) {
        this.quest = quest;
        this.kills = {};
    }
}