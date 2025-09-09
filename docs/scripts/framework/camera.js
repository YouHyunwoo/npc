export class Camera {

    constructor({
        screen,
        position=[0, 0],
        scale=[1, 1],
    }={}) {
        this.screen = screen;
        this.position = position;
        this.scale = scale;
    }

    toScreen(position) {
        const screenSize = this.screen.size;
        return position.map((v, i) => (v - this.position[i]) * this.scale[i] + screenSize[i] / 2);
    }

    toWorld(position) {
        const screenSize = this.screen.size;
        return position.map((v, i) => (v - screenSize[i] / 2) / this.scale[i] + this.position[i]);
    }
}