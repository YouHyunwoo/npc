import { Button } from "../ui/button.js";
import { Label } from "../ui/label.js";
import { HStack, VStack } from "../ui/stack.js";
import { View } from "../ui/view.js";

export class ConfirmView extends View {

    constructor({
        text,
        ...args
    }={}) {
        super(args);

        const objects = [
            new VStack({
                name: 'background-stack',
                size: [View.Size.Wrap, View.Size.Wrap],
                padding: 10,
                itemPadding: 10,
                objects: [
                    new Label({
                        name: 'title-label',
                        size: [Label.Size.Wrap, 30],
                        text,
                        textAlign: 'center',
                    }),
                    new HStack({
                        name: 'buttons-stack',
                        position: [View.Position.Center, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        itemPadding: 10,
                        objects: [
                            new Button({
                                name: 'confirm-button',
                                size: [100, 40],
                                borderColor: 'white',
                                text: '확인',
                                textAlign: 'center',
                                events: {
                                    click: (event, view) => {
                                        this.events.emit('confirm');
                                    },
                                },
                            }),
                            new Button({
                                name: 'cancel-button',
                                size: [100, 40],
                                borderColor: 'white',
                                text: '취소',
                                textAlign: 'center',
                                events: {
                                    click: (event, view) => {
                                        this.events.emit('cancel');
                                    },
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));
    }
}