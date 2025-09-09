import { test, expect } from '../../../libraries/test/test.js';
import { Character } from "../assets/game/character/character.js";
import { Equipment } from "../assets/game/character/equipment.js";
import { Inventory } from "../assets/game/character/inventory.js";
import { CharacterStatistics } from "../assets/game/character/statistics.js";

import {} from '../assets/utility/array.js';

test('character: initiate', () => {
    const character = new Character({
        uuid: globalThis.crypto.randomUUID(),
        id: 'player',
        name: 'player',
        statistics: new CharacterStatistics({
            level: 1,
            experience: 0,
            maxExperience: 10,
            health: 10,
            maxHealth: 10,
            healthRecoveringSpeed: 0,
            attackPower: 10,
            defensePower: 10,
            attackSpeed: 1,
        }),
        inventory: new Inventory({
            golds: 0,
            itemBundles: [],
        }),
        equipment: new Equipment(),
    });

    console.log('character', character);
});

test('character: create', () => {
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
            itemBundles: [],
        },
    });

    console.log('character', character);
});