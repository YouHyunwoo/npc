import { Button } from "../../assets/ui/button.js";
import { Label } from '../../assets/ui/label.js';
import { View } from '../../assets/ui/view.js';
import { Scene } from '../../framework/scene.js';

const GRID_SIZE = [10, 10];

export class UIToolScene extends Scene {

    willCreate() {
        Label.textAlign = 'center';
        Label.textBaseline = 'middle';

        const objects = [
            new Canvas({
                name: 'canvas',
                size: globalThis.screen.size,
                backgroundColor: 'gray',
            }),
            new Button({
                name: 'label-button',
                position: [10, 10],
                size: [50, 50],
                borderColor: 'white',
                text: 'Label',
                fontColor: 'white',
                events: {
                    click: (event, view) => {
                        const canvas = this.findViewByName('canvas');
                        const selectedArea = canvas.selectedArea;

                        if (selectedArea == null) {
                            console.log('영역을 선택해주세요.');
                            return;
                        }

                        canvas.add(new Label({
                            name: 'label',
                            position: [selectedArea[0], selectedArea[1]],
                            size: [selectedArea[2], selectedArea[3]],
                            text: 'Label',
                        }));

                        canvas.showPropertyEditor('label');
                    },
                },
            }),
        ];

        objects.forEach(object => this.add(object));

        this.camera.position.set(globalThis.screen.size.div(2));
    }
}

class Canvas extends View {

    constructor({
        ...args
    }={}) {
        super(args);

        this.mousePosition = null;
        this.selectedArea = null;

        const objects = [

        ];

        objects.forEach(object => this.add(object));
    }

    onHandle(events) {
        for (const event of events) {
            if (event.type === 'mousedown') {
                if (event.handled) { continue }
                this.mousePosition = [...event.position];
                const start = this.mousePosition;
                const end = event.position;
                const area = this.getAreaInGrid(start, end);
                this.selectedArea = area;
            }
            else if (event.type === 'mousemove') {
                if (this.mousePosition) {
                    const start = this.mousePosition;
                    const end = event.position;
                    const area = this.getAreaInGrid(start, end);
                    this.selectedArea = area;
                }
            }
            else if (event.type === 'mouseup') {
                if (this.mousePosition) {
                    const start = this.mousePosition;
                    const end = event.position;
                    const area = this.getAreaInGrid(start, end);
                    this.selectedArea = area;
                }
                this.mousePosition = null;
            }
        }
    }

    onRender(context, screenSize) {
        context.save();
        context.fillStyle = 'white';
        for (let y = 0; y < screenSize[1]; y += GRID_SIZE[1]) {
            for (let x = 0; x < screenSize[0]; x += GRID_SIZE[0]) {
                context.fillRect(x, y, 1, 1);
            }
        }
        context.restore();

        if (this.selectedArea) {
            context.save();
            context.strokeStyle = 'white';
            context.strokeRect(...this.selectedArea);
            context.restore();
        }
    }

    getAreaInGrid(start, end) {
        const area = [
            Math.min(start[0], end[0]),
            Math.min(start[1], end[1]),
            Math.abs(start[0] - end[0]),
            Math.abs(start[1] - end[1]),
        ];

        const positionsInGrid = [
            Math.floor(area[0] / GRID_SIZE[0]) * GRID_SIZE[0],
            Math.floor(area[1] / GRID_SIZE[1]) * GRID_SIZE[0],
            Math.ceil((area[0] + area[2]) / GRID_SIZE[0]) * GRID_SIZE[0],
            Math.ceil((area[1] + area[3]) / GRID_SIZE[1]) * GRID_SIZE[1],
        ];

        const areaInGrid = [
            positionsInGrid[0],
            positionsInGrid[1],
            positionsInGrid[2] - positionsInGrid[0],
            positionsInGrid[3] - positionsInGrid[1],
        ]

        return areaInGrid;
    }
}

class PropertyEditor extends View {}

class LabelPropertyEditor extends PropertyEditor {

    constructor({
        ...args
    }={}) {
        super(args);

        const objects = [
            // eventHandling, rendering, updating
            // name, position, size
            // text, font, fontColor, textAlign, textBaseline
        ];

        objects.forEach(object => this.add(object));
    }
}