export class Equipment {

    hand;
    body;

    equip(item) {
        if (item.type !== 'equipment') { return }

        const part = item.part;
        const equippedItem = this[part];
        this[part] = item;

        return equippedItem;
    }

    unequip(part) {
        const unequippedItem = this[part];
        this[part] = null;

        return unequippedItem;
    }
}