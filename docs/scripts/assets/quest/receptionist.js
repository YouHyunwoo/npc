import { QuestFulfillmentChecker } from "./quest-fulfillment-checker/fulfillment-checker.js";

export class Receptionist {

    guild = null;

    constructor({
        guild,
    }={}) {
        this.guild = guild;
    }

    registerQuest(quest) {
        this.guild.library.registerQuest(quest);
    }

    deregisterQuest(quest) {
        this.guild.library.deregisterQuest(quest);
    }

    deregisterQuestByUUID(questUUID) {
        this.guild.library.deregisterQuestByUUID(questUUID);
    }

    showTotalQuests() {
        return this.guild.library.findTotalQuests();
    }

    showExpiredQuests() {
        return this.guild.library.findExpiredQuests();
    }

    showFinishedQuests() {
        return this.guild.library.findFinishedQuests();
    }

    showQuests(currentTime) {
        return this.guild.library.findAvailableQuests(currentTime);
    }

    findQuest(questUUID) {
        return this.guild.library.findQuest(questUUID);
    }

    checkAvailable(quest, currentTime) {
        return this.guild.library.findAvailableQuests(currentTime).includes(quest);
    }

    checkFulfillment(questRecord, hero) {
        return QuestFulfillmentChecker.isFulfilled(questRecord, hero);
    }

    finishQuest(quest, heroUuid) {
        quest.finish(heroUuid);

        this.guild.library.save();
    }

    static create({
        guild,
    }={}) {
        const receptionist = new Receptionist({ guild });

        return receptionist;
    }
}