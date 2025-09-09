import { Label } from "../ui/label.js";
import { View } from "../ui/view.js";

export class ItemInformationView extends View {

    constructor({
        itemData,
        ...args
    }={}) {
        super(args);

        this.itemData = itemData;
    }

    onCreate() {
        const objects = [
            new Label({
                size: [View.Size.Wrap, View.Size.Wrap],
                padding: 10,
                text: `${this.itemData.name}`,
            }),
        ];

        objects.forEach(object => this.add(object));
    }
}