import { expect, test } from "../../../libraries/test/test.js";

import database from "../assets/database.js";
import { Item } from "../assets/game/item.js";

test('item equals', () => {
    const itemId = 'cherry';
    const itemData = database.items[itemId];
    const item1 = Item.create(itemData);
    const item2 = Item.create(itemData);

    console.log('item1', item1);
    console.log('item2', item2);

    expect('item1 equals item2', item1.equals(item2));

    item1.quality = 1;

    expect('item1 does not equal item2', !item1.equals(item2));

    item2.quality = 1;

    expect('item1 equals item2', item1.equals(item2));
});