import { test, expect } from '../../../libraries/test/test.js';
import database from "../assets/database.js";
import { Character } from "../assets/game/character/character.js";
import { Item, ItemBundle, ItemEffect } from "../assets/game/item.js";

test('character: take items', () => {
    const character = Character.create({
        id: 'player',
        name: 'player',
        statistics: {
            level: 1,
            experience: 0,
            maxExperience: 10,
            health: 10,
            maxHealth: 10,
            healthRecoveringSpeed: 0,
            attackPower: 10,
            defensePower: 10,
            attackSpeed: 1,
        },
        inventory: {
            golds: 0,
            itemBundles: [
                new ItemBundle({ item: Item.create(database.items['cherry']), count: 10 }),
                new ItemBundle({ item: Item.create(database.items['herb']), count: 3 }),
            ],
        },
    });

    character.takeItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 10 }),
        new ItemBundle({ item: Item.create(database.items['herb']), count: 3 }),
        new ItemBundle({ item: Item.create(database.items['herb']), count: 4 }),
        new ItemBundle({ item: Item.create(database.items['bone']), count: 1 }),
        new ItemBundle({ item: Item.create(database.items['stone']), count: 0 }),
    );

    expect('character has 20 cherries', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 20 }),
    ));
    expect('character does not have 21 cherries', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 21 }),
    ));

    expect('character has 10 herbs', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['herb']), count: 10 }),
    ));
    expect('character does not have 11 cherries', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['herb']), count: 11 }),
    ));

    expect('character has 1 bone', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['bone']), count: 1 }),
    ));
    expect('character does not have 2 bones', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['bone']), count: 2 }),
    ));

    expect('character does not have 1 stone', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['stone']), count: 1 }),
    ));

    const itemBundle = character.inventory.itemBundles[0];
    const item = itemBundle.item;
    const itemId = item.id;

    item.effects.push(new ItemEffect({ type: 'test' }));

    console.log('생성된 item', item);
    console.log('데이터베이스의 item', database.items[itemId]);

    expect('item is deep-copied', item.effects.length === database.items[itemId].effects.length + 1);
});