// modelInventory: { gold, itemModelBundles }
// probabilisticModelInventory: { gold, itemModelBundles, probabilities }

import random from "../../utility/random.js";
import { Item, ItemBundle } from "../item.js";

export class Inventory {

    golds;
    itemBundles;

    constructor({
        golds=0,
        itemBundles=[],
    }={}) {
        this.golds = golds;
        this.itemBundles = itemBundles.filter(itemBundle => itemBundle.count > 0);
    }

    hasItems(item, count) {
        const itemBundle = this.itemBundles.find(itemBundle => itemBundle.item.equals(item));

        if (itemBundle == null) {
            return count === 0;
        }
        else {
            return count >= 0 &&  itemBundle.count >= count;
        }
    }

    find(item) {
        return this.itemBundles.find(itemBundle => itemBundle.item.equals(item));
    }

    take(item, count) {
        const itemBundle = this.itemBundles.find(itemBundle => itemBundle.item.equals(item));

        if (itemBundle == null) {
            this.itemBundles.push(new ItemBundle({ item, count }));
        }
        else {
            itemBundle.count += count;
        }
    }

    drop(item, count=null) {
        const itemBundle = this.itemBundles.find(itemBundle => itemBundle.item.equals(item));

        if (itemBundle == null) {
            return null;
        }
        else {
            count ??= itemBundle.count;

            const dropCount = Math.min(count, itemBundle.count);
            itemBundle.count -= dropCount;

            if (itemBundle.count <= 0) {
                this.itemBundles.remove(itemBundle);
            }

            return {item: itemBundle.item, count: dropCount};
        }
    }

    count(item) {
        const itemBundle = this.itemBundles.find(itemBundle => itemBundle.item.equals(item));

        if (itemBundle == null) {
            return 0;
        }
        else {
            return itemBundle.count;
        }
    }

    static createWithModelInventory(modelInventory, itemDatabase) {
        return new this({
            golds: modelInventory.golds,
            itemBundles: modelInventory.itemBundles.map(itemModelBundle => {
                const itemId = itemModelBundle.item.id;
                const itemData = itemDatabase[itemId];
                const item = Item.create(itemData);

                const count = itemModelBundle.count;

                return new ItemBundle({ item, count });
            }),
        });
    }

    static createWithProbabilisticModelInventory(probabilisticModelInventory, itemDatabase) {
        return new this({
            golds: probabilisticModelInventory.golds,
            itemBundles: probabilisticModelInventory.itemBundles.map(itemModelBundle => {
                const itemId = itemModelBundle.item.id;
                const itemData = itemDatabase[itemId];
                const item = Item.create(itemData);

                const count = random.binomial(itemModelBundle.count, probabilisticModelInventory.probabilities[itemId])[0];

                return new ItemBundle({ item, count });
            }),
        });
    }
}