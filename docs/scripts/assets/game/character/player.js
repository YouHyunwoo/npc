import { Character } from "./character.js";

export class Player extends Character {

    collections = {
        recipes: new Set(['small-potion', 'medium-potion', 'large-potion', 'wooden-sword']),
        items: new Set(),
        monsters: {},
    };

    tradeAmount = 0;

    addCollection(id, ...args) {
        const collection = this.collections[id];

        if (id === 'items') {
            const [itemId] = args;

            collection.add(itemId);

            this.events.emit('collect', { id, itemId });
        }
        else if (id === 'monsters') {
            const [monsterId, itemId] = args;

            collection[monsterId] = collection[monsterId] ?? new Set();

            if (itemId != null) {
                collection[monsterId].add(itemId);
            }

            this.events.emit('collect', { id, monsterId, itemId });
        }
    }
}