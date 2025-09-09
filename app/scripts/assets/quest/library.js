import { LibraryDataManagementFactory } from "./library-data-management/factory.js";

export class Library {

    dataManagementName = null;

    quests = [];

    registerQuest(quest) {
        this.quests.push(quest);

        this.save();
    }

    deregisterQuest(quest) {
        this.quests.remove(quest);

        this.save();
    }

    deregisterQuestByUUID(questUUID) {
        const quest = this.findQuest(questUUID);

        this.deregisterQuest(quest);
    }

    findAllQuests() {
        return this.quests;
    }

    findExpiredQuests(currentTime) {
        return this.quests.filter(quest => quest.isExpired(currentTime));
    }

    findFinishedQuests() {
        return this.quests.filter(quest => quest.isFinished());
    }

    findAvailableQuests(currentTime) {
        return this.quests.filter(quest => quest.isAvailable(currentTime));
    }

    findQuest(questUUID) {
        return this.quests.find(quest => quest.uuid === questUUID);
    }

    save({
        dataManagementName=null,
    }={}) {
        this.dataManagementName = dataManagementName ?? this.dataManagementName;

        if (this.dataManagementName == null) { return }

        LibraryDataManagementFactory.create({ dataManagementName: this.dataManagementName }).save(this);
    }

    static create({
        dataManagementName=null,
    }={}) {
        const library = new Library();

        library.dataManagementName = dataManagementName;

        return library;
    }
}