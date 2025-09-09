export class QuestCommission {

    constructor() {
        this.selection = null;
    }

    isSelected(targetId=null) {
        return this.selection != null && (targetId == null || this.selection.targetId === targetId);
    }

    select(targetId, targetSlot) {
        const existsSelection = this.selection != null;
        if (existsSelection) {
            this.#deselectSlot(this.selection.slot);
        }

        this.selection = {
            targetId,
            slot: targetSlot,
        };

        this.#selectSlot(targetSlot);
    }

    deselect() {
        const existsSelection = this.selection != null;
        if (existsSelection) {
            this.#deselectSlot(this.selection.slot);
        }

        this.selection = null;
    }

    #selectSlot(slot) {
        slot.borderWidth = 6;
    }

    #deselectSlot(slot) {
        slot.borderWidth = 1;
    }
}