import { ItemBundle } from "../game/item.js";
import { EventEmitter } from '../utility/event.js';
import { Progress } from '../utility/progress.js';

export class Customer {

    hero;
    store;
    position;
    speed;
    renderables;
    events;

    state;
    destination;
    needs;

    waitingProgress;

    constructor({
        hero,
        store,
        position=[0, 0],
        speed=40,
        renderables={},
        events={},
    }={}) {
        this.hero = hero;
        this.store = store;
        this.position = position;
        this.speed = speed;
        this.renderables = renderables;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        renderables.character = renderables.character ?? hero.renderables.character;

        this.waitingProgress = new Progress({
            speed: 1 / 10,
            events: {
                finish: progress => {
                    this.finishTrade();
                }, // 기다리기가 끝나면 포기하고 (애니매이션을 보여주고) 나가기
            },
        });

        this.#enter();
    }

    getState() {
        return {
            'entering': '🏥🚶‍♂️',
            'look-around': '👀',
            'wait-for-trade': '💰',
            'exiting': '🚶‍♂️🏥',
            'exit': '',
        }[this.state];
    }

    #enter() {
        this.#setInitialPosition();
        this.#setRandomDestinationOnStoreStreet();

        this.state = 'entering';
    }

    #setInitialPosition() {
        const entrancePosition = this.#findEntrancePosition();

        this.position = entrancePosition;
    }

    #findEntrancePosition() {
        const streetSize = this.store.getStreetSize();
        const renderableSize = this.renderables.character.size;

        const entranceLocation = Math.random() < 0.5 ? 'left' : 'right';

        const entranceHorizontalPosition = {
            left: 0 - renderableSize[0],
            right: streetSize[0] + renderableSize[0],
        }[entranceLocation];

        const entranceVerticalPosition = Math.random() * (streetSize[1] - renderableSize[1] * 2) + renderableSize[1];

        const entrancePosition = [
            entranceHorizontalPosition,
            entranceVerticalPosition,
        ];

        return entrancePosition;
    }

    #setRandomDestinationOnStoreStreet() {
        const streetSize = this.store.getStreetSize();
        const streetWidth = streetSize[0];

        const renderableSize = this.renderables.character.size;
        const renderableWidth = renderableSize[0];
        const renderableLeftSide = renderableWidth / 2;

        this.destination = [
            Math.floor(Math.random() * (streetWidth - renderableWidth) + renderableLeftSide),
            this.position[1],
        ];
    }

    update(deltaTime) {
        if (this.state === 'entering') {
            if (this.destination == null) {
                this.#lookAround();
            }
            else {
                this.#moveToDestination(deltaTime);
            }
        }
        else if (this.state === 'look-around') {
            if (this.destination == null) {
                if (Math.random() < 0.01) {
                    this.#setRandomDestinationOnStoreStreet();
                }
            }
            else {
                this.#moveToDestination(deltaTime);
            }
        }
        else if (this.state === 'wait-for-trade') {
            this.waitingProgress.update(deltaTime);
        }
        else if (this.state === 'exiting') {
            if (this.destination == null) {
                this.#exit();
            }
            else {
                this.#moveToDestination(deltaTime);
            }
        }
    }

    #lookAround() {
        this.state = 'look-around';

        this.needs = null;

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        (async () => {
            const availableItemBundles = this.store.owner.getSellingItemBundles();

            const itemBundles = [];

            // 상점에서 파는 장비 중에서 현재 장비보다 좋은 장비를 기억해둠
            // await delay(1000 + Math.random() * 10000);
            await delay(Math.random() * availableItemBundles.length * 50);

            const heroWeapon = this.hero.equipment.hand;
            const availableWeaponBundles = availableItemBundles.filter(itemBundle => {
                const item = itemBundle.item; 
                return this.#isWeapon(item) &&
                    (heroWeapon == null || this.#compareWeapon(heroWeapon, item) < 0);
            });

            if (availableWeaponBundles.length > 0) {
                await delay(Math.random() * availableWeaponBundles.length * 50);

                const bestWeapon = availableWeaponBundles.sort(
                    (itemBundle1, itemBundle2) => {
                        (itemBundle2.item.effects.find(effect => effect.type === 'increase-attack-power')?.amount ?? 0) -
                        (itemBundle1.item.effects.find(effect => effect.type === 'increase-attack-power')?.amount ?? 0)
                    }
                )[0].item;

                const bestWeaponItemBundle = new ItemBundle({ item: bestWeapon });

                itemBundles.push(bestWeaponItemBundle);
            }

            // 현재 체력보다 적지만 최대한 많이 채울 수 있는 포션을 기억해둠
            const availableRecoverableBundles = availableItemBundles.filter(
                itemBundle => {
                    const item = itemBundle.item;
                    return this.#isRecoverable(item) &&
                        item.effects.hp < this.hero.maxHp;
                }
            );

            if (availableRecoverableBundles.length > 0) {
                await delay(Math.random() * availableRecoverableBundles.length * 50);

                const bestRecoverableBundle = availableRecoverableBundles.sort(
                    (itemBundle1, itemBundle2) => {
                        (itemBundle2.item.effects.find(effect => effect.type === 'increase-health')?.amount ?? 0) -
                        (itemBundle1.item.effects.find(effect => effect.type === 'increase-health')?.amount ?? 0)
                    }
                )[0];

                // 정책에 따라 다름: 오래 모험하고 싶거나 퀘스트를 다수 수행하고 싶거나 마왕을 잡으러 가고 싶거나
                const bestRecoveringAmount = bestRecoverableBundle.item.effects.find(
                    effect => effect.type === 'increase-health'
                )?.amount ?? 0;

                const count = Math.floor(this.hero.maxHp / bestRecoveringAmount);

                const itemBundle = new ItemBundle({
                    item: bestRecoverableBundle.item,
                    count: Math.min(count, bestRecoverableBundle.count)
                });

                itemBundles.push(itemBundle);
            }

            if (itemBundles.length > 0) {
                this.needs = itemBundles;

                this.#waitForTrade();
            }
            else {
                this.#startExiting();
            }
        })();
    }

    #isWeapon(item) {
        return item.type === 'equipment' && item.part === 'hand';
    }

    #compareWeapon(weapon1, weapon2) {
        return weapon1.effects.map(effect => effect.type === 'increase-attack-power' ? effect.amount : 0).sum() -
            weapon2.effects.map(effect => effect.type === 'increase-attack-power' ? effect.amount : 0).sum();
    }

    #isRecoverable(item) {
        return item.type === 'consumable' && item.effects.some(effect => effect.type === 'increase-health');
    }

    #waitForTrade() {
        this.waitingProgress.reset();

        this.state = 'wait-for-trade';
    }

    #moveToDestination(deltaTime) {
        const distance = Math.abs(this.destination[0] - this.position[0]);
        const delta = this.speed * deltaTime;
        if (distance > delta) {
            const direction = Math.sign(this.destination[0] - this.position[0]);

            this.position[0] += direction * delta;
        }
        else {
            this.position[0] = this.destination[0];
            this.destination = null;
        }
    }

    #exit() {
        this.state = 'exit';

        this.events.emit('exit');
    }

    isWaitingForTrade() {
        return this.state === 'wait-for-trade';
    }

    hasGolds(amount) {
        return this.hero.hasGolds(amount);
    }

    buy(price, itemBundles) {
        if (!this.hasGolds(price)) { return false }

        this.hero.dropGolds(price);
        this.hero.takeItems(...itemBundles);

        itemBundles.forEach(itemBundle => {
            if (itemBundle.item.type === 'equipment') {
                this.hero.equipItem(itemBundle.item);
            }
        });
    }

    finishTrade() {
        this.#startExiting();
    }

    #startExiting() {
        this.#setDestinationForExit();

        this.state = 'exiting';

        this.events.emit('exiting');
    }

    #setDestinationForExit() {
        const entrancePosition = this.#findEntrancePosition();

        this.destination = entrancePosition;
    }

    // 장비 애니매이션
    // 소모 애니매이션
}

export class CustomerController {

    constructor({
        store,
        customer,
        renderables,
        events={},
    }={}) {
        this.store = store;
        this.customer = customer;
        this.renderables = renderables;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    getInteractionArea() {
        // const renderable = this.customer.renderable;
        const renderable = this.customer.renderables.character;
        if (renderable.type === 'sprite') {
            return renderable.getArea(this.customer.position);
        }

        return null;
    }

    updateCustomer(deltaTime) {
        this.customer.update(deltaTime);
    }

    getCustomerPosition() {
        return this.customer.position;
    }

    getCustomerRenderable() {
        return this.customer.renderables.character;
    }

    getBalloonOffset() {
        const customerRenderableArea = this.customer.renderables.character.getArea();
        const balloonSpriteArea = this.renderables.balloon.getArea();

        return [0, customerRenderableArea[1] - 5 - (balloonSpriteArea[1] + balloonSpriteArea[3])];
    }

    getBalloonSprite() {
        return this.renderables.balloon;
    }


    isWaitingForTrade() {
        return this.customer.isWaitingForTrade();
    }

    getHero() {
        return this.customer.hero;
    }
}

export class CustomerVisible {

    constructor({
        controller,
        events={},
    }={}) {
        this.controller = controller;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    handle(events, camera) {
        for (const event of events) {
            if (event.handled) { continue }

            if (event.type === 'mousedown') {
                const screenPosition = event.position;
                const worldPosition = camera.toWorld(screenPosition);
                const interactionArea = this.controller.getInteractionArea();
                if (interactionArea.contains(worldPosition)) {
                    this._mouseDown = true;
                }
            }
            else if (event.type === 'mouseup') {
                const screenPosition = event.position;
                const worldPosition = camera.toWorld(screenPosition);
                const interactionArea = this.controller.getInteractionArea();
                if (interactionArea.contains(worldPosition)) {
                    if (this._mouseDown) {
                        this.events.emit('click');
                    }
                }
                this._mouseDown = false;
            }
        }
    }

    update(deltaTime) {
        this.controller.updateCustomer(deltaTime);
    }

    render(context, screenSize) {
        context.save();

        const customerPosition = this.controller.getCustomerPosition();
        context.translate(...customerPosition);

        const customerRenderable = this.controller.getCustomerRenderable();
        customerRenderable?.render(context);

        if (this.controller.isWaitingForTrade()) {
            const balloonOffset = this.controller.getBalloonOffset();
            context.translate(...balloonOffset);
            const balloonSprite = this.controller.getBalloonSprite();
            balloonSprite.render(context);
        }

        context.restore();
    }
}