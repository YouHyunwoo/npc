import { View } from "../ui/view.js";
import database from "../database.js";
import { Label } from "../ui/label.js";
import { Image } from "../ui/image.js";

export class RewardsView extends View {

    constructor({
        rewards=[],
        ...args
    }={}) {
        super(args);

        this.rewards = rewards;

        this.setRewards(rewards);
    }

    setRewards(rewards) {
        while (this.objects.length > 0) {
            this.remove(this.objects[0]);
        }

        const objects = [
            ...rewards.map((reward, i) => new SlotView({
                name: 'slot-view',
                position: [i * 50, 0],
                size: [50, 50],
                borderColor: 'white',
                renderable: database.assets.renderables.sprites[reward.id],
                count: reward.count,
            })),
        ];

        objects.forEach(object => this.add(object));
    }
}

class SlotView extends View {

    constructor({
        renderable,
        count,
        ...args
    }={}) {
        super(args);

        const objects = [
            new Image({
                name: 'image',
                position: [5, 5],
                size: this.size.sub(10),
            }),
            new Label({
                name: 'count',
                position: [5, 5],
                size: this.size.sub(10),
                textAlign: 'right',
                textBaseline: 'bottom',
            }),
        ];

        objects.forEach(object => this.add(object));

        this.setRenderable(renderable);
        this.setCount(count);
    }

    setRenderable(renderable) {
        this.findByName('image').renderable = renderable;
    }

    setCount(count) {
        this.findByName('count').text = `${count}`;
    }
}