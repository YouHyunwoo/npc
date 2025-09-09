import { Image } from "./image.js";
import { Label } from "./label.js";
import { View } from "./view.js";

export class Slot extends View {

    constructor({
        text='',
        renderable,
        value='',
        ...args
    }={}) {
        super({
            eventHandling: View.TargetPolicy.Self,
            rendering: View.TargetPolicy.Both,
            updating: View.TargetPolicy.Ignore,
            ...args
        });

        const objects = [
            new Label({
                size: [View.Size.Fill, View.Size.Fill],
                padding: 5,
                text: `${text}`,
                textAlign: 'left',
                textBaseline: 'top',
            }),
            new Image({
                size: [View.Size.Fill, View.Size.Fill],
                renderable,
            }),
            new Label({
                size: [View.Size.Fill, View.Size.Fill],
                padding: 5,
                text: `${value}`,
                textAlign: 'right',
                textBaseline: 'bottom',
            }),
        ];

        objects.forEach(object => this.add(object));
    }
}