// 보류
export class Animator {

    animationId = null;
    isPlaying = false;

    constructor({
        animations,
    }={}) {
        this.animations = animations;

        this.play(globalThis.Object.keys(this.animations)?.[0])
    }

    update(deltaTime) {
        if (this.isPlaying) {
            this.animations[this.animationId]?.update(deltaTime);
        }
    }

    render(context, screenSize) {
        this.animations[this.animationId]?.render(context, screenSize);
    }

    play(id) {
        if (!id || this.animationId === id) { return }

        this.animationId = id;
        this.animations[this.animationId]?.reset();

        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }
}