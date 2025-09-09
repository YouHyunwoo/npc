export class Renderable {

    constructor({
        type, source, ...args
    }={}) {
        this.type = type;
        this.source = source;
        this.args = args;
    }

    get size() { return null }

    render(context, screenSize) {}

    static create(renderable) {
        const { type, source, ...args } = renderable;

        return RENDERABLE_TYPES[type].create({ type, source, ...args });
    }
}

class RenderableImage extends Renderable {

    constructor({
        type, source, ...args
    }={}) {
        super({ type, source, ...args });

        this.raw = new Image();
        this.raw._loaded = false;
        this.loadPromise = new Promise((resolve, reject) => {
            this.raw.addEventListener('load', () => {
                this.raw._loaded = true;
                resolve();
            });
        });
        this.raw.src = source;
    }

    get loaded() { return this.raw._loaded }
    get size() { return [this.raw.width, this.raw.height] }

    render(context, ...args) {
        context.drawImage(this.raw, ...args);
    }

    static create({ type, source, ...args }) {
        return new this({ type, source, ...args });
    }
}

class RenderableSprite extends Renderable {

    constructor({
        type, source, ...args
    }={}) {
        super({ type, source, ...args });

        const { anchor=[0, 0], scale=[1, 1], sourceArea, sheet } = args;

        if (sheet == null) {
            this.sheet = new Image();
            this.sheet._loaded = false;
            this.loadPromise = new Promise((resolve, reject) => {
                this.sheet.addEventListener('load', () => {
                    this.sheet._loaded = true;
                    resolve();
                });
            });
            this.sheet.src = source;
        }
        else {
            this.sheet = sheet;
        }

        this.anchor = anchor;
        this.scale = scale;
        this.sourceArea = sourceArea;
    }

    get sourceSize() {
        return (
            this.sourceArea == null
            ? [this.sheet.width, this.sheet.height]
            : this.sourceArea.slice(2, 4)
        );
    }

    set size(value) {
        this.scale = value.div(this.sourceSize);
    }

    get size() {
        return this.sourceSize.mul(this.scale);
    }

    getArea(position=[0, 0], scale=[1, 1]) {
        const size = this.size.mul(scale);
        return [
            position[0] - this.anchor[0] * size[0],
            position[1] - this.anchor[1] * size[1],
            size[0],
            size[1],
        ];
    }

    render(context, scale=[1, 1]) {
        if (this.sheet) {
            const sourceArea = (
                this.sourceArea == null
                ? [0, 0, this.sheet.width, this.sheet.height]
                : this.sourceArea
            );

            const destinationArea = [
                -this.anchor[0] * sourceArea[2] * this.scale[0] * scale[0],
                -this.anchor[1] * sourceArea[3] * this.scale[1] * scale[1],
                sourceArea[2] * this.scale[0] * scale[0],
                sourceArea[3] * this.scale[1] * scale[1],
            ];

            context.drawImage(this.sheet, ...sourceArea, ...destinationArea);
        }
    }

    copy() {
        return new this.constructor({
            type: this.type,
            source: this.source,
            anchor: [...this.anchor],
            scale: [...this.scale],
            sourceArea: this.sourceArea ? [...this.sourceArea] : null,
            sheet: this.sheet,
        });
    }

    static create({ type, source, ...args }) {
        return new this({ type, source, ...args });
    }
}

class RenderableSpriteAnimation extends Renderable {

    constructor({
        type, source, ...args
    }={}) {
        super({ type, source, ...args });

        // type, source, args로 SpriteAnimation 만들기
    }
}

const RENDERABLE_TYPES = {
    image: RenderableImage,
    sprite: RenderableSprite,
    spriteAnimation: RenderableSpriteAnimation,
};