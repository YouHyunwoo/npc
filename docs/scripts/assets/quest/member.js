import { EventEmitter } from "../utility/event.js";
import { Item, ItemBundle } from "../game/item.js";
import random from "../utility/random.js";

export class Member {

    constructor({
        monsterDatabase,
        time,
        player,
        hero,
        guild,
        events={},
    }={}) {
        this.monsterDatabase = monsterDatabase;
        this.time = time;
        this.player = player;
        this.hero = hero;
        this.guild = guild;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    checkQuestFulfillment() {
        const receptionist = this.guild.receptionist;

        const questNote = this.hero.questNote;
        const questRecords = questNote.records;

        [...questRecords].forEach(questRecord => {
            const available = receptionist.checkAvailable(questRecord.quest, this.time.elapsedTime);
            if (available === false) {
                this.hero.removeQuest(questRecord.quest);
                return;
            }

            const fulfilled = receptionist.checkFulfillment(questRecord, this.hero);
            if (fulfilled === false) { return }

            receptionist.finishQuest(questRecord.quest, this.hero.uuid);

            this.#takeComissionResult(questRecord, this.hero); // from hero to player
            this.#giveRewards(questRecord, this.hero); // to hero

            this.hero.removeQuest(questRecord.quest);
        });
    }

    #takeComissionResult(questRecord, hero) {
        const quest = questRecord.quest;
        const objectives = quest.objectives;

        objectives.forEach(objective => {
            switch (objective.type) {
                case 'collect':
                    this.#takeCollectedItems(objective, hero);
                    break;
                case 'hunt':
                    this.#takeHuntedItems(objective);
                    break;
                default:
                    throw new Error(`Unknown objective type: ${objective.type}`);
            }
        });
    }

    #takeCollectedItems(objective, hero) {
        const targetItemId = objective.target.id;
        const targetItemCount = objective.target.amount; // amount -> count

        const itemBundle = hero.inventory.itemBundles.find(itemBundle => itemBundle.item.id === targetItemId && itemBundle.count >= targetItemCount)?.item;

        hero.dropItems(new ItemBundle({ item: itemBundle.item, count: targetItemCount }));
        this.player.takeItems(new ItemBundle({ item: itemBundle.item, count: targetItemCount }));
    }

    #takeHuntedItems(objective) {
        const targetMonsterId = objective.target.id;
        const targetMonsterCount = objective.target.amount; // amount -> count

        const monsterData = this.monsterDatabase[targetMonsterId];
        monsterData.inventory.itemBundles.forEach(itemModelBundle => {
            const itemId = itemModelBundle.item.id;
            const itemCount = itemModelBundle.count;
            const itemProbability = monsterData.inventory.probabilities[itemId];

            const itemBundle = new ItemBundle({
                item: Item.create(this.items[itemId]),
                count: random.binomial(itemCount * targetMonsterCount, itemProbability)[0],
            });

            if (itemBundle.count <= 0) { return }

            this.player.takeItems(itemBundle);
        });
    }

    #giveRewards(questRecord, hero) {
        const quest = questRecord.quest;
        const rewards = quest.rewards;

        rewards.forEach(reward => {
            if (reward.type === 'item') {
                const rewardItemId = reward.id;
                const rewardItemCount = reward.count;

                if (rewardItemId === 'gold') {
                    hero.takeGolds(rewardItemCount);
                    this.player.dropGolds(rewardItemCount);
                }
                else {
                    const rewardItemBundle = this.player.inventory.itemBundles.find(
                        itemBundle => itemBundle.item.id === rewardItemId
                    );
                    const rewardItem = rewardItemBundle.item;

                    this.player.dropItems(new ItemBundle({ item: rewardItem, count: rewardItemCount }));
                    hero.takeItems(new ItemBundle({ item: rewardItem, count: rewardItemCount }));
                }
            }
            else if (reward.type === 'experience') {
                const rewardExperienceAmount = reward.amount;

                hero.getExperience(rewardExperienceAmount);
            }
        });
    }

    lookAround() {
        const guild = this.guild;
        const library = guild.library;

        const time = this.time;
        const currentTime = time.elapsedTime;

        const quests = library.findAvailableQuests(currentTime);

        const fitQuests = quests.filter(quest => {
            const hero = this.hero;
            const level = hero.statistics.level;

            return quest.objectives.every(objective => {
                if (objective.type === 'collect') {
                    const itemId = objective.target.id;
                    const monsters = globalThis.Object.values(this.monsterDatabase).filter(
                        monster => monster.inventory.itemBundles.some(
                            itemModelBundle => itemModelBundle.item.id === itemId
                        )
                    );
                    const requiredLevels = monsters.map(monster => monster.statistics.level);

                    return requiredLevels.some(requiredLevel => requiredLevel <= level);
                }
                else if (objective.type === 'hunt') {
                    const monsterId = objective.target.id;
                    const monster = this.monsterDatabase[monsterId];
                    const monsterLevel = monster.statistics.level;
                    return monsterLevel <= level;
                }
                else {
                    return false;
                }
            });
        });

        return fitQuests;
    }

    acceptQuests(quests) {
        quests.forEach(quest => {
            this.hero.addQuest(quest);
        });
    }
}