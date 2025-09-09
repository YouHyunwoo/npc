import { Button } from "../assets/ui/button.js";
import { Label } from "../assets/ui/label.js";
import { View } from "../assets/ui/view.js";
import { Scene } from "../framework/scene.js";
import { TitleScene } from "./title.js";

export class GameOverScene extends Scene {

    constructor(isBossDead) {
        super();

        this.isBossDead = isBossDead;
    }

    willCreate() {
        const resultMessage = this.isBossDead ? '플레이해주셔서 감사합니다' : '마왕이 세계를 지배했습니다';

        const screenSize = globalThis.screen.size;

        const objects = [
            new Label({
                position: [View.Position.Center, View.Position.Center],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: resultMessage,
                font: '32px sans-serif',
            }),
            new Button({
                position: [View.Position.Center, screenSize[1] - 200],
                size: [100, 50],
                borderColor: 'white',
                text: '메인으로',
                events: {
                    click: (event, view) => {
                        globalThis.application.transit(new TitleScene());
                    },
                },
            }),
        ];

        objects.forEach(object => this.add(object));
    }
}