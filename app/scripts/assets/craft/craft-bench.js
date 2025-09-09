import { Item, ItemBundle } from "../game/item.js";
import { Recipe } from './recipe.js';

export class CraftBench {

    itemDatabase;
    recipeDatabase;
    size;
    grid;
    materials = [];

    constructor({
        itemDatabase,
        recipeDatabase,
        size=[1, 1],
    }={}) {
        this.itemDatabase = itemDatabase;
        this.recipeDatabase = recipeDatabase;
        this.size = size;
        this.grid = new Uint32Array(size[0] * size[1]);
    }

    getLocatedMaterialItemBundles() {
        const materialItemBundles = this.materials.map(item => {
            const materialIndex = this.materials.indexOf(item);
            const materialValue = materialIndex + 1;
            return new ItemBundle({
                item,
                count: this.grid.filter(v => v === materialValue).length,
            });
        });

        return materialItemBundles;
    }

    getMaterial(location) {
        const index = location[1] * this.size[0] + location[0];
        const materialIndex = this.grid[index] - 1;
        return materialIndex < 0 ? null : this.materials[materialIndex];
    }

    getMaterialCount(material) {
        if (!this.materials.includes(material)) { return 0 }

        const materialIndex = this.materials.indexOf(material);
        const materialValue = materialIndex + 1;
        const materialCount = this.grid.filter(v => v === materialValue).length;

        return materialCount;
    }

    locate(location, material) {
        if (!this.materials.includes(material)) {
            const nullIndex = this.materials.indexOf(null);
            if (nullIndex >= 0) {
                this.materials[nullIndex] = material;
            }
            else {
                this.materials.push(material);
            }
        }

        const materialIndex = this.materials.indexOf(material);

        const index = location[1] * this.size[0] + location[0];
        this.grid[index] = materialIndex + 1;
    }

    delocate(location) {
        const index = location[1] * this.size[0] + location[0];
        const materialIndex = this.grid[index] - 1;
        this.grid[index] = 0;

        if (!this.grid.includes(materialIndex + 1)) {
            this.materials[materialIndex] = null;
        }
    }

    craft(candidateRecipeIds) {
        const foundSuitableRecipe = this.findMostSuitableRecipe(candidateRecipeIds);
        if (foundSuitableRecipe == null) { return null }

        const { recipe, similarity } = foundSuitableRecipe;

        const materialItemBundles = this.getLocatedMaterialItemBundles();

        const resultItemBundles = recipe.resultItemModelBundles.map(resultItemModelBundle => {
            const { itemModel: resultItemModel, count: resultItemCount } = resultItemModelBundle;

            const itemData = this.itemDatabase[resultItemModel.id];
            const resultItem = Item.create({
                ...itemData,
                quality: similarity * 2 - 1,
            });
            const resultItemBundle = new ItemBundle({ item: resultItem, count: resultItemCount });

            return resultItemBundle;
        });

        this.reset();

        const craftResult = new CraftResult({
            recipe,
            similarity,
            materialItemBundles,
            resultItemBundles,
        });

        return craftResult;
    }

    findMostSuitableRecipe(candidateRecipeIds) {
        const recipeSuitablities = [];

        for (const candidateRecipeId of candidateRecipeIds) {
            const existsRecipe = candidateRecipeId in this.recipeDatabase;
            if (!existsRecipe) { continue }

            const recipeData = this.recipeDatabase[candidateRecipeId];
            const recipe = new Recipe(recipeData);
            if (!this.isCraftable(recipe)) { continue }

            const similarity = this.#getSimilarity(recipe);
            if (similarity >= 0.2) {
                recipeSuitablities.push({ recipe, similarity });
            }
        }

        if (recipeSuitablities.length > 0) {
            return recipeSuitablities.toSorted((a, b) => b.similarity - a.similarity)[0];
        }
        else {
            return null;
        }
    }

    reset() {
        this.grid.fill(0);
        this.materials.splice(0);
    }

    isCraftable(recipe) {
        return this.#isBlueprintSizeValid(recipe.blueprint) &&
            this.#isMaterialCountValid(recipe.materialItemIds) &&
            this.#isMaterialTypeValid(recipe.materialItemIds);
    }

    #isBlueprintSizeValid(blueprint) {
        const blueprintSize = [
            Math.max(...blueprint.map(row => row.length)),
            blueprint.length
        ];

        const isBlueprintSizeValid = blueprintSize[0] <= this.size[0] && blueprintSize[1] <= this.size[1];
        return isBlueprintSizeValid;
    }

    #isMaterialCountValid(materialIds) {
        const materialCount = materialIds.length;
        const locatedMaterialCount = this.materials.filter(v => v != null).length;

        const isMaterialCountValid = materialCount === locatedMaterialCount;
        return isMaterialCountValid;
    }

    #isMaterialTypeValid(materialIds) {
        const isMaterialTypeValid = materialIds.every(materialId => this.materials.find(m => m.id === materialId));
        return isMaterialTypeValid;
    }

    #getSimilarity(recipe) {
        let maxSimilarity = 0;

        const blueprintSize = recipe.getBlueprintSize();

        for (let y = 0; y <= this.size[1] - blueprintSize[1]; y++) {
            for (let x = 0; x <= this.size[0] - blueprintSize[0]; x++) {
                const location = [x, y];

                const similarity = this.#match(location, recipe.blueprint, recipe.materialItemIds);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                }
            }
        }

        return maxSimilarity;
    }

    #match(location, blueprint, materialItemIds) {
        const [x, y] = location;

        let sameCount = 0;
        let total = 0;

        for (let gy = 0; gy < this.size[1]; gy++) {
            for (let gx = 0; gx < this.size[0]; gx++) {
                const materialIndex = this.grid[gy * this.size[0] + gx] - 1;
                const materialId = this.materials[materialIndex]?.id;

                if (y <= gy && gy < y + blueprint.length && x <= gx && gx < x + blueprint[gy - y].length) {
                    const materialIndexOfRecipe = blueprint[gy - y][gx - x] - 1;
                    const materialIdOfRecipe = materialItemIds[materialIndexOfRecipe];

                    if (materialIndexOfRecipe === -1) {
                        if (materialIndex !== -1) {
                            total += 1;
                        }
                    }
                    else {
                        if (materialId === materialIdOfRecipe) {
                            sameCount += 1;
                        }
                        total += 1;
                    }
                }
                else {
                    if (materialIndex !== -1) {
                        total += 1;
                    }
                }
            }
        }

        return sameCount / total;
    }
}

class CraftResult {

    recipe;
    similarity;
    materialItemBundles;
    resultItemBundles;

    constructor({
        recipe,
        similarity,
        resultItemBundles,
        materialItemBundles,
    }={}) {
        this.recipe = recipe;
        this.similarity = similarity;
        this.materialItemBundles = materialItemBundles;
        this.resultItemBundles = resultItemBundles;
    }

    dispose() {
        this.recipe = null;
        this.similarity = null;
        this.materialItemBundles = null;
        this.resultItemBundles = null;
    }
}