import { View } from "../ui/view.js";

export class CraftBenchController {

    constructor({
        renderables,
        player,
        craftBench,
        craftInventory,
    }={}) {
        this.renderables = renderables;
        this.player = player;
        this.craftBench = craftBench;
        this.craftInventory = craftInventory;
    }

    getCraftBenchSize() {
        return this.craftBench.size;
    }

    getMaterialId(location) {
        const inventoryItem = this.craftBench.getMaterial(location);
        if (inventoryItem == null) { return null }

        return inventoryItem.id;
    }

    getMaterialSprite(materialId) {
        return this.renderables.sprites[materialId];
    }

    locateMaterial(location) {
        if (!this.craftInventory.isSelected()) { return }

        const materialSelection = this.craftInventory.materialSelection;

        const materialItemBundle = materialSelection.itemBundle;

        const locatedCount = this.craftBench.getMaterialCount(materialItemBundle.item);
        const availableCount = materialItemBundle.count;

        const isLocatable = availableCount > locatedCount;
        if (!isLocatable) { return }

        this.craftBench.locate(location, materialItemBundle.item);
    }

    delocateMaterial(location) {
        this.craftBench.delocate(location);
    }

    craft() {
        const recipeCollection = this.player.collections.recipes;

        const craftResult = this.craftBench.craft(recipeCollection);
        if (craftResult == null) { return }

        this.player.dropItems(...craftResult.materialItemBundles);
        this.player.takeItems(...craftResult.resultItemBundles);

        craftResult.dispose();
    }
}

export class CraftBenchView extends View {

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        this.mouseDown = null;
    }

    onHandle(events) {
        for (const event of events) {
            if (event.type === 'mousedown') {
                this.mouseDown = event.which;
                this.#handleInteraction(event.which, event.position);
            }
            else if (event.type === 'mousemove') {
                if (this.mouseDown != null) {
                    this.#handleInteraction(this.mouseDown, event.position);
                }
            }
            else if (event.type === 'mouseup') {
                this.mouseDown = null;
            }
        }
    }

    #handleInteraction(mouseButton, globalMouseScreenPosition) {
        const containsPosition = this.areaInGlobal.contains(globalMouseScreenPosition);
        if (!containsPosition) { return }

        const localMouseScreenPosition = this.#getLocalPosition(globalMouseScreenPosition);
        const location = this.#getLocation(localMouseScreenPosition);

        if (mouseButton === 1) {
            this.controller.locateMaterial(location);
        }
        else if (mouseButton === 3) {
            this.controller.delocateMaterial(location);
        }
    }

    #getLocalPosition(globalPosition) {
        return globalPosition.sub(this.positionInGlobal);
    }

    #getLocation(localPosition) {
        const cellSize = this.#getCellSize();
        return localPosition.div(cellSize).map(Math.floor);
    }

    #getCellSize() {
        const craftBenchSize = this.controller.getCraftBenchSize();
        return this.size.div(craftBenchSize);
    }

    onRender(context, screenSize) {
        const craftBenchSize = this.controller.getCraftBenchSize();
        const cellSize = this.size.div(craftBenchSize);

        this.#renderGrid(context, craftBenchSize, cellSize);
        this.#renderMaterials(context, craftBenchSize, cellSize);
    }

    #renderGrid(context, craftBenchSize, cellSize) {
        context.save();

        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.beginPath();

        for (let i = 0; i < craftBenchSize[1]; i++) {
            context.moveTo(0, Math.floor(i * cellSize[1]));
            context.lineTo(this.size[0], Math.floor(i * cellSize[1]));
        }

        for (let i = 0; i < craftBenchSize[0]; i++) {
            context.moveTo(Math.floor(i * cellSize[0]), 0);
            context.lineTo(Math.floor(i * cellSize[0]), this.size[1]);
        }
        context.stroke();

        context.restore();
    }

    #renderMaterials(context, craftBenchSize, cellSize) {
        context.save();

        for (let r = 0; r < craftBenchSize[1]; r++) {
            for (let c = 0; c < craftBenchSize[0]; c++) {
                const materialId = this.controller.getMaterialId([c, r]);
                if (materialId == null) { continue }

                const materialSprite = this.controller.getMaterialSprite(materialId);
                if (materialSprite == null) { continue }

                context.save();
                context.translate(c * cellSize[0], r * cellSize[1]);
                context.translate(...cellSize.div(2));
                materialSprite.render(context);
                context.restore();
            }
        }

        context.restore();
    }
}