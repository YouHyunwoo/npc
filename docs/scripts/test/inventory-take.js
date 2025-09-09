import { test, expect } from '../../../libraries/test/test.js';

import database from "../assets/database.js";
import { Inventory } from "../assets/game/character/inventory.js";
import { Item } from "../assets/game/item.js";

test('inventory: take', () => {
    const inventory = new Inventory();

    const itemId = 'cherry';
    const itemCount = 10;

    const itemData = database.items[itemId];
    expect('item data exists', itemData != null);

    const item = Item.create(itemData);
    console.log('item', item);

    inventory.take(item, itemCount);
    console.log('inventory', inventory);
});