import { Scene } from "../../framework/scene.js";

const HORIZONTAL_ALIGN = {
    left: 0,
    center: 0.5,
    right: 1,
};

const VERTICAL_ALIGN = {
    top: 0,
    middle: 0.5,
    bottom: 1,
};

export class TestFontScene extends Scene {

    willCreate() {
        this.padding = 0;
        this.position = [300, 300];
        this.size = [300, 300];

        this.fontColor = 'white';
        this.font = 'bold 20px sans-serif';
        this.text = '안녕하세요!';
        this.textAlign = 'center';
        this.textBaseline = 'middle';

        this.camera.position = globalThis.screen.size.div(2);
    }

    onRender(context, screenSize) {
        context.save();
        context.translate(...this.position);
        context.fillStyle = 'rgb(50, 20, 20)';
        context.fillRect(0, 0, ...this.size);

        context.strokeStyle = 'purple';
        context.beginPath();
        context.moveTo(0, this.size[1] / 2);
        context.lineTo(this.size[0], this.size[1] / 2);
        context.stroke();

        context.strokeStyle = 'purple';
        context.beginPath();
        context.moveTo(this.size[0] / 2, 0);
        context.lineTo(this.size[0] / 2, this.size[1]);
        context.stroke();

        context.fillStyle = this.fontColor;
        context.font = this.font;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;

        const align = [
            this.padding + HORIZONTAL_ALIGN[this.textAlign] * (this.size[0] - this.padding * 2),
            this.padding + VERTICAL_ALIGN[this.textBaseline] * (this.size[1] - this.padding * 2),
        ].map(Math.floor);

        const metrics = context.measureText(this.text);
        // Ascent는 text 위치로부터 위로 삐져나온 정도, Descent는 아래로 삐져나온 정도

        if (this.textAlign === 'left') {
            align[0] += metrics.actualBoundingBoxLeft;
        }
        else if (this.textAlign === 'center') {
            align[0] += (metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;
        }
        else if (this.textAlign === 'right') {
            align[0] -= metrics.actualBoundingBoxRight;
        }

        if (this.textBaseline === 'top') {
            align[1] += metrics.actualBoundingBoxAscent; // 위로 삐져나온 정도만큼 아래로 내려가야 함
        }
        else if (this.textBaseline === 'middle') {
            align[1] += (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
        }
        else if (this.textBaseline === 'bottom') {
            align[1] -= metrics.actualBoundingBoxDescent; // 아래로 삐져나온 정도만큼 위로 올라가야 함
        }
        context.fillText(this.text, ...align);

        context.save();
        context.translate(...align);
        context.lineWidth = 2;
        context.strokeStyle = 'red';
        context.beginPath();
        context.moveTo(-metrics.actualBoundingBoxLeft, -metrics.actualBoundingBoxAscent);
        context.lineTo(+metrics.actualBoundingBoxRight, -metrics.actualBoundingBoxAscent);
        context.stroke();
        context.strokeStyle = 'green';
        context.beginPath();
        context.moveTo(-metrics.actualBoundingBoxLeft, +metrics.actualBoundingBoxDescent);
        context.lineTo(+metrics.actualBoundingBoxRight, +metrics.actualBoundingBoxDescent);
        context.stroke();
        context.strokeStyle = 'yellow';
        context.beginPath();
        context.moveTo(-metrics.actualBoundingBoxLeft, (-metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent)/2);
        context.lineTo(+metrics.actualBoundingBoxRight, (-metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent)/2);
        context.stroke();
        context.strokeStyle = 'yellow';
        context.beginPath();
        context.moveTo((-metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) / 2, -metrics.actualBoundingBoxAscent);
        context.lineTo((-metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) / 2, +metrics.actualBoundingBoxDescent);
        context.stroke();
        context.strokeStyle = 'white';
        context.beginPath();
        context.moveTo(-metrics.actualBoundingBoxLeft, -metrics.actualBoundingBoxAscent);
        context.lineTo(-metrics.actualBoundingBoxLeft, +metrics.actualBoundingBoxDescent);
        context.stroke();
        context.restore();

        context.restore();
    }
}