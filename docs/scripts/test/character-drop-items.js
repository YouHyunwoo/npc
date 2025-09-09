import { test, expect } from '../../../libraries/test/test.js';
import database from "../assets/database.js";
import { Character } from "../assets/game/character/character.js";
import { Item, ItemBundle, ItemEffect } from "../assets/game/item.js";

test('character: drop items', () => {
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

    character.dropItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 3 }),
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 1 }),
        new ItemBundle({ item: Item.create(database.items['herb']), count: 1 }),
        new ItemBundle({ item: Item.create(database.items['bone']), count: 1 }),
    );

    expect('character has 6 cherries', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 6 }),
    ));
    expect('character does not have 7 cherries', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 7 }),
    ));

    expect('character has 2 herbs', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['herb']), count: 2 }),
    ));
    expect('character does not have 3 herbs', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['herb']), count: 3 }),
    ));

    expect('character does not have 1 bone', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['bone']), count: 1 }),
    ));
});