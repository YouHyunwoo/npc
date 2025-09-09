import { test, expect } from '../../../libraries/test/test.js';
import { Character } from "../assets/game/character/character.js";

test('character: drop golds', () => {
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
            golds: 100,
            itemBundles: [],
        },
    });

    expect('character has 0 golds', character.hasGolds(0));
    expect('character has 1 golds', character.hasGolds(1));
    expect('character has 50 golds', character.hasGolds(50));
    expect('character has 80 golds', character.hasGolds(80));
    expect('character has 80 golds', character.hasGolds(100));
    expect('character does not have 101 golds', !character.hasGolds(101));
    expect('character does not have 1000 golds', !character.hasGolds(1000));

    character.dropGolds(10);

    expect('character has 80 golds', character.hasGolds(80));
    expect('character has 90 golds', character.hasGolds(90));
    expect('character does not have 91 golds', !character.hasGolds(91));
    expect('character does not have 1000 golds', !character.hasGolds(1000));
});