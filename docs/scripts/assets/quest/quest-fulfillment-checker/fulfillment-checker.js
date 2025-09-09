export class QuestFulfillmentChecker {

    static isFulfilled(questRecord, character) {
        const quest = questRecord.quest;

        return quest.objectives.every(objective => {
            switch (objective.type) {
                case 'collect':
                    return this.isFulfilledCollectObjective(objective, character);
                case 'hunt':
                    return this.isFulfilledHuntObjective(objective, questRecord);
                default:
                    throw `Unknown quest objective type: ${objective.type}`;
            }
        });
    }

    static isFulfilledCollectObjective(objective, character) {
        const inventory = character.inventory;
        const inventoryItemBundles = inventory.itemBundles;

        const targetItemId = objective.target.id;
        const targetItemAmount = objective.target.amount;

        const targetItemBundles = inventoryItemBundles.filter(itemBundle => itemBundle.item.id === targetItemId);
        const targetItemTotalAmount = targetItemBundles.map(itemBundle => itemBundle.count).sum();

        return targetItemTotalAmount >= targetItemAmount;
    }

    static isFulfilledHuntObjective(objective, questRecord) {
        const kills = questRecord.kills;

        const targetMonsterId = objective.target.id;
        const targetMonsterAmount = objective.target.amount;

        const targetMonsterKills = kills[targetMonsterId] ?? 0;

        return targetMonsterKills >= targetMonsterAmount;
    }
}