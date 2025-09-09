import { test, expect } from '../../../libraries/test/test.js';
import database from "../assets/database.js";
import { Character } from "../assets/game/character/character.js";
import { Item, ItemBundle } from "../assets/game/item.js";

test('character: has items', () => {
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

    expect('character has 0 cherries', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 0 }),
    ));

    expect('character has 5 cherries', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 5 }),
    ));

    expect('character dose not have 11 cherries', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 11 }),
    ));

    expect('character has 5 cherries and 2 herbs', character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 5 }),
        new ItemBundle({ item: Item.create(database.items['herb']), count: 2 }),
    ));

    expect('character does not have 11 cherries and 2 herbs', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 11 }),
        new ItemBundle({ item: Item.create(database.items['herb']), count: 2 }),
    ));

    expect('character does not have 2 cherries and 4 herbs', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 2 }),
        new ItemBundle({ item: Item.create(database.items['herb']), count: 4 }),
    ));

    expect('character does not have 20 cherries and 4 herbs', !character.hasItems(
        new ItemBundle({ item: Item.create(database.items['cherry']), count: 20 }),
        new ItemBundle({ item: Item.create(database.items['herb']), count: 4 }),
    ));
});