export class Finishable {

    constructor() {
        this.isFinished = false;
    }

    update(deltaTime) {}
    render(context, screenSize) {}

    finish() {
        this.isFinished = true;
    }
}

export class Sequantial extends Finishable {

    constructor(finishables) {
        super();

        this.finishables = finishables;
        this.index = 0;
    }

    update(deltaTime) {
        if (this.isFinished) { return }

        const finishable = this.finishables?.[this.index];
        finishable?.update(deltaTime);

        if (finishable?.isFinished) {
            this.index += 1;
            if (this.index >= this.finishables.length) {
                this.finish();
            }
        }
    }
}

export class Parallel extends Finishable {

    constructor(finishables) {
        super();

        this.finishables = finishables;
    }

    update(deltaTime) {
        if (this.isFinished) { return }

        this.finishables.forEach(finishable => finishable.update(deltaTime));

        const isFinished = this.finishables.every(finishable => finishable.isFinished);
        if (isFinished) {
            this.finish();
        }
    }
}