import { expect, test } from "../../../libraries/test/test.js";

import database from "../assets/database.js";
import { Item } from "../assets/game/item.js";

test('item create', () => {
    const itemId = 'cherry';
    const itemData = database.items[itemId];
    const item = Item.create(itemData);

    console.log('item', item);

    expect('item has uuid', item.uuid != null);
    expect('item has data', item.data != null);
    expect('item has id', item.id == itemId);
    expect('item has name', item.name == itemData.name);
    expect('item has type', item.type == itemData.type);
    expect('item has quality', item.quality == (itemData.quality ?? 0));
    expect('item has effects', item.effects.every((effect, index) => effect.equals(itemData.effects[index])));

    item.effects[0].amount = 100;

    expect('item has effects', !item.effects[0].equals(itemData.effects[0]));
});