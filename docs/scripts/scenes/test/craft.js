import { Scene } from "../../framework/scene.js";
import { CraftBench } from "../../assets/craft/craft-bench.js";
import database from "../../assets/database.js";

export class TestCraftScene extends Scene {

    willCreate() {
        const craftBench = new CraftBench({
            recipes: database.recipes,
            size: [5, 5],
        });

        console.log(craftBench);
    }
}