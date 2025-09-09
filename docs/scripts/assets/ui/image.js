import { View } from './view.js';

export class Image extends View {

    constructor({
        renderable,
        ...args
    }={}) {
        super(args);

        this.renderable = renderable;
    }

    render(context, screenSize) {
        if (this.rendering === View.TargetPolicy.Ignore) { return }
        if (this._realSize[0] == null || this._realSize[1] == null) { return }
        if (this._realSize[0] === 0 || this._realSize[1] === 0) { return }

        context.save();
        context.translate(...this._realPosition.map(Math.floor));

        context.beginPath();
        context.rect(0, 0, ...this._realSize.map(Math.floor));
        context.clip();

        if (this.rendering !== View.TargetPolicy.Children) {
            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(0, 0, ...this._realSize.map(Math.floor));
            }

            if (this.renderable) {
                if (this.renderable.type === 'image') {
                    if (this.renderable.loaded) {
                        context.save();
                        context.translate(...this.size.sub(this.renderable.size).div(2));
                        this.renderable.render(context);
                        context.restore();
                    }
                }
                else if (this.renderable.type === 'sprite') {
                    context.save();
                    context.translate(...this.size.div(2));
                    this.renderable.render(context);
                    context.restore();
                }
            }

            this.onRender(context, screenSize);
            this.events.emit('render', context, screenSize);
        }

        if (this.rendering !== View.TargetPolicy.Self) {
            context.save();
            context.translate(Math.floor(this.padding), Math.floor(this.padding));
            this._objects.forEach(object => object.render(context, screenSize));
            context.restore();
        }

        if (this.rendering !== View.TargetPolicy.Children) {
            if (this.borderColor && this.borderWidth > 0) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(.5, .5, ...this._realSize.add([-1, -1]));
            }
        }

        context.restore();
    }
}