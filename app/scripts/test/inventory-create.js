import { test, expect } from '../../../libraries/test/test.js';

import {} from '../assets/utility/array.js';
import database from "../assets/database.js";
import { Inventory } from "../assets/game/character/inventory.js";

test('inventory: create', () => {
    const inventory = new Inventory();

    console.log('inventory', inventory);

    expect('gold is 0', inventory.golds === 0);
    expect('item bundles is empty', inventory.itemBundles.length === 0);
});

test('inventory: createWithProbabilisticModelInventory', () => {
    const monsterDatabase = database.monsters;
    const monsterId = 'deer';
    const monsterData = monsterDatabase[monsterId];
    const probabilisticModelInventory = monsterData.inventory;

    const itemDatabase = database.items;

    let totalCounts = {};

    const loopCount = 10000;
    for (let i = 0; i < loopCount; i++) {
        const inventory = Inventory.createWithProbabilisticModelInventory(
            probabilisticModelInventory, itemDatabase
        );

        inventory.itemBundles.forEach(itemBundle => {
            const itemId = itemBundle.item.id;
            const itemCount = itemBundle.count;

            totalCounts[itemId] = (totalCounts[itemId] ?? 0) + itemCount;
        });
    }

    const averageItemCounts = globalThis.Object.fromEntries(
        globalThis.Object.entries(totalCounts).map(
            ([itemId, totalCount]) => [itemId, totalCount / loopCount]
        )
    );

    const expectedAverageItemCounts = globalThis.Object.fromEntries(
        probabilisticModelInventory.itemBundles.map(
            itemModelBundle => [
                itemModelBundle.item.id,
                itemModelBundle.count * probabilisticModelInventory.probabilities[itemModelBundle.item.id],
            ]
        )
    );

    globalThis.Object.entries(averageItemCounts).forEach(
        ([itemId, averageItemCount]) => {
            const expectedAverageItemCount = expectedAverageItemCounts[itemId];

            console.log(
                `average item count for ${itemId} is ${averageItemCount}, expected ${expectedAverageItemCount}`,
            );

            expect(
                `average item count for ${itemId} is ${averageItemCount}, expected ${expectedAverageItemCount}`,
                Math.abs(averageItemCount - expectedAverageItemCount) < 0.01,
            );
        }
    )
});