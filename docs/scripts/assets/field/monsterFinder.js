import random from "../utility/random.js";
import { Item, ItemBundle } from "../game/item.js";
import { Monster } from "../game/character/monster.js";

export class MonsterFinder {

    constructor({
        monsterDatabase,
        itemDatabase,
    }={}) {
        this.monsterDatabase = monsterDatabase;
        this.itemDatabase = itemDatabase;
    }

    find(hero) {
        const properMonsterDataList = this.#findProperMonsterDataList(hero);
        const questMonsterDataList = this.#findMonsterDataListForQuest(hero);

        const totalMonsterDataList = [...properMonsterDataList, ...questMonsterDataList];
        const properMonsterData = random.pick(totalMonsterDataList);

        const monster = this.#createMonster(properMonsterData);

        return monster;
    }

    #findProperMonsterDataList(hero) {
        const monsterDataList = globalThis.Object.values(this.monsterDatabase).filter(
            monsterData => this.#filterProperLevel(monsterData, hero)
        );

        return monsterDataList;
    }

    #findMonsterDataListForQuest(hero) {
        const questNote = hero.questNote;
        const quests = questNote.records.map(record => record.quest);

        // 전지적 시점으로 영웅이 어떤 몬스터가 어떤 아이템을 드랍할 지 안다고 가정한다.
        const monsterDataList = quests.flatMap(
            quest => quest.objectives.flatMap(
                objective => {
                    if (objective.type === 'collect') {
                        const itemId = objective.target.id;
                        const monsterDataList = globalThis.Object.values(this.monsterDatabase).filter(
                            data => data.inventory.itemBundles.some(
                                itemModelBundle => itemModelBundle.item.id === itemId
                            )
                        );

                        return monsterDataList;
                    }
                    else if (objective.type === 'hunt') {
                        const monsterId = objective.target.id;
                        const monsterData = this.monsterDatabase[monsterId];
                        return monsterData;
                    }
                    else {
                        return null;
                    }
                }
            ).filter(monster => monster)
        ).filter(
            monsterData => this.#filterProperLevel(monsterData, hero)
        );

        return monsterDataList;
    }

    #filterProperLevel(monsterData, hero) {
        const level = hero.statistics.level;
        const bravery = hero.statistics.bravery;
        const levelRange = {
            min: level - 10 * (1 - bravery),
            max: level + 10 * bravery,
        };

        return levelRange.min <= monsterData.statistics.level && monsterData.statistics.level <= levelRange.max
    }

    #createMonster(monsterData) {
        const monsterInventoryModel = monsterData.inventory;
        const monsterInventory = {
            golds: random.binomial(monsterInventoryModel.golds, monsterInventoryModel.probabilities.golds ?? 0)[0],
            itemBundles: monsterInventoryModel.itemBundles.map(itemModelBundle => new ItemBundle({
                item: Item.create(this.itemDatabase[itemModelBundle.item.id]),
                count: random.binomial(itemModelBundle.count, monsterInventoryModel.probabilities[itemModelBundle.item.id] ?? 0)[0],
            })),
        };

        const monster = Monster.create({
            ...monsterData,
            inventory: monsterInventory,
        });

        monster.stats.health.maximum = Math.floor(monster.stats.health.maximum * (1 + (Math.random() - 0.5) * 0.1));

        return monster;
    }
}