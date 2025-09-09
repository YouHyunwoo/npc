import { View } from "../ui/view.js";
import { Label } from "../ui/label.js";
import { Button } from "../ui/button.js";
import { HStack } from "../ui/stack.js";

const MENU_ITEMS = {
    store: '상점',
    craft: '제작',
    quest: '퀘스트',
    statistics: '용사',
    field: '필드',
};

export class MenuView extends View {

    constructor({
        time,
        player,
        ...args
    }={}) {
        super(args);

        this.time = time;
        this.player = player;

        Label.fontColor = 'white';
        Label.textAlign = 'center';
        Label.textBaseline = 'middle';

        const objects = [
            this.goldLabel = new Label({
                size: [View.Size.Fill, View.Size.Fill],
                text: `소지금: ${player.inventory.golds}`,
                textAlign: 'left',
                padding: 10,
            }),
            new HStack({
                position: [View.Position.Center, 0],
                size: [View.Size.Wrap, View.Size.Fill],
                padding: 10,
                itemPadding: 10,
                objects: [
                    ...globalThis.Object.entries(MENU_ITEMS).map(([menuItemId, menuItemText]) =>
                        new Button({
                            size: [50, 50],
                            text: menuItemText,
                            borderColor: 'white',
                            events: {
                                click: view => this.events.emit('click-menu-item', menuItemId),
                            },
                        })
                    ),
                ],
            }),
            this.daysLabel = new Label({
                size: [View.Size.Fill, View.Size.Fill],
                text: '1일',
                textAlign: 'right',
                padding: 10,
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    onCreate() {
        this.updateGold = (() => {
            this.goldLabel.text = `소지금: ${this.player.inventory.golds}`;
        }).bind(this);

        this.player.events.on('take-gold', this.updateGold);
        this.player.events.on('drop-gold', this.updateGold);
    }

    onDestroy() {
        this.player.events.remove('take-gold', this.updateGold);
        this.player.events.remove('drop-gold', this.updateGold);
    }

    onUpdate(deltaTime) {
        this.daysLabel.text = `${this.time.days + 1}일`;
    }
}