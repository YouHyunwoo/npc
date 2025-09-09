import { View } from "../../assets/ui/view.js";
import { Scene } from "../../framework/scene.js";

export class TestViewScene extends Scene {

    willCreate() {
        this.angle = 0;

        const objects = [
            new View({
                name: 'view1',
                position: [10, 10],
                size: [100, View.Size.Fill],
                backgroundColor: 'orange',
                objects: [
                    new View({
                        name: 'view1-1',
                        position: [10, 10],
                        size: [View.Size.Fill, 80],
                        backgroundColor: 'lightgreen',
                        objects: [
                            new View({
                                name: 'view1-1-1',
                                position: [20, 20],
                                size: [50, 50],
                                backgroundColor: 'blue',
                            }),
                        ],
                    }),
                    new View({
                        name: 'view1-2',
                        position: [View.Position.Center, View.Position.Center],
                        size: [80, 80],
                        backgroundColor: 'red',
                    }),
                ],
            }),
            new View({
                name: 'view2',
                position: [0, View.Position.End],
                size: [View.Size.Fill, 200],
                backgroundColor: 'brown',
            }),
            new View({
                name: 'view3',
                position: [0, 200],
                size: [200, 200],
                backgroundColor: 'yellow',
                padding: 50,
                objects: [
                    new View({
                        name: 'view3-1',
                        position: [10, View.Position.End],
                        size: [View.Size.Fill, 80],
                        backgroundColor: 'purple',
                    }),
                ],
            }),
            new View({
                name: 'view4',
                position: [View.Position.Center, View.Position.Center],
                size: [View.Size.Wrap, View.Size.Wrap],
                padding: 10,
                backgroundColor: 'pink',
                objects: [
                    new View({
                        name: 'view4-1',
                        position: [0, 0],
                        size: [50, 50],
                        backgroundColor: 'red',
                    }),
                    new View({
                        name: 'view4-2',
                        position: [100, 100],
                        size: [50, 50],
                        backgroundColor: 'blue',
                    }),
                ]
            }),
            new View({
                name: 'view5',
                position: [200, 400],
                size: [View.Size.Wrap, 200],
                backgroundColor: 'lime',
                padding: 10,
                objects: [
                    new View({
                        name: 'view5-1',
                        position: [50, 10],
                        size: [View.Size.Fill, 80],
                        backgroundColor: 'purple',
                    }),
                    new View({
                        name: 'view5-2',
                        position: [10, 100],
                        size: [200, 80],
                        backgroundColor: 'blue',
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    onHandle(events) {
        for (const event of events) {
            if (event.type === 'keydown') {
                this.findViewByName('view1').size = [this.findViewByName('view1').size[0] + 20, View.Size.Fill];
                this.findViewByName('view3').size = [View.Size.Fill, this.findViewByName('view3').innerSize[1] + 20];

                this.angle += .1;

                const view4_1 = this.findViewByName('view4').findByName('view4-1');
                const view4_2 = this.findViewByName('view4').findByName('view4-2');
                const p1 = [Math.cos(this.angle) * 50, Math.sin(this.angle) * 50].sub(25).add(100)
                const p2 = [Math.cos(this.angle + Math.PI) * 50, Math.sin(this.angle + Math.PI) * 50].sub(25).add(100);
                view4_1.position = p1;
                view4_2.position = p2;
            }
        }
    }
}