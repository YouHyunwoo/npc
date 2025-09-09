export class Recipe {

    id;
    blueprint;
    materialItemIds;
    resultItemModelBundles;

    constructor({
        id,
        blueprint,
        materialItemIds,
        resultItemModelBundles,
    }={}) {
        this.id = id;
        this.blueprint = blueprint;
        this.materialItemIds = materialItemIds;
        this.resultItemModelBundles = resultItemModelBundles;
    }

    getBlueprintSize() {
        return [Math.max(...this.blueprint.map(row => row.length)), this.blueprint.length];
    }
}