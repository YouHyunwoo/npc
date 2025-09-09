export class CraftInventory {

    constructor({
        inventory,
    }={}) {
        this.inventory = inventory;

        this.materialSelection = null;
    }

    getInventoryItemBundles() {
        return this.inventory.itemBundles;
    }

    isSelected() {
        return this.materialSelection != null;
    }

    select(materialItemBundle, materialSlot) {
        const existsMaterialItemSelection = this.materialSelection != null;
        if (existsMaterialItemSelection) {
            this.#deselectSlot(this.materialSelection.slot);
        }

        this.materialSelection = {
            itemBundle: materialItemBundle,
            slot: materialSlot,
        };

        this.#selectSlot(materialSlot);
    }

    deselect() {
        const existsMaterialItemSelection = this.materialSelection != null;
        if (existsMaterialItemSelection) {
            this.#deselectSlot(this.materialSelection.slot);
        }

        this.materialSelection = null;
    }

    #selectSlot(slot) {
        slot.borderWidth = 6;
    }

    #deselectSlot(slot) {
        slot.borderWidth = 1;
    }
}