import { Label } from "../ui/label.js";
import { View } from "../ui/view.js";

export class MonsterInformationView extends View {

    constructor({
        monsterData,
        ...args
    }={}) {
        super(args);

        this.monsterData = monsterData;
    }

    onCreate() {
        const objects = [
            new Label({
                size: [View.Size.Wrap, View.Size.Wrap],
                padding: 10,
                text: `${this.monsterData.name}`,
            }),
        ];

        objects.forEach(object => this.add(object));
    }
}