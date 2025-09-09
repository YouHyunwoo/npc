import { EventEmitter } from "../utility/event.js";
import { Button } from "../ui/button.js";
import { Label } from "../ui/label.js";
import { View } from "../ui/view.js";
import { Slot } from "../ui/slot.js";
import { HStack, VStack } from "../ui/stack.js";
import database from "../database.js";
import { Image } from "../ui/image.js";
import { Text } from "../ui/text.js";

export class PricingController {

    constructor({
        store,
        events={},
    }={}) {
        this.store = store;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.slots = null;
    }

    getCustomerSprite() {
        if (this.store.owner.isTrading()) {
            return this.store.owner.trade.customer.renderables.character;
        }
        else {
            return null;
        }
    }

    offer(price) {
        const tradeResult = this.store.owner.offer(price);

        if (tradeResult.success) {
            this.events.emit('trade-success', tradeResult.customer, tradeResult.price, tradeResult.itemBundles);
        }
        else {
            this.events.emit('trade-failure', tradeResult.reason, tradeResult.customer, tradeResult.price, tradeResult.itemBundles);
        }
    }

    reject() {
        const customer = this.store.customer;

        this.store.owner.reject();

        this.events.emit('trade-reject', customer);
    }
}

export class PricingView extends View {

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        const objects = [
            new VStack({
                position: [0, View.Position.Center],
                size: [View.Size.Fill, View.Size.Wrap],
                itemPadding: 20,
                objects: [
                    new Label({
                        position: [View.Position.Center, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        text: '혹시 이 물건들 있나요?',
                    }),
                    this.tradeItemStack = new HStack({
                        name: 'trade-item-stack',
                        position: [View.Position.Center, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        backgroundColor: 'black',
                        borderColor: 'white',
                        borderWidth: 2,
                    }),
                    new View({ size: [0, 20]}),
                    this.customerImage = new Image({
                        position: [View.Position.Center, 0],
                        size: [80, 80],
                    }),
                    this.customerNameLabel = new Label({
                        position: [View.Position.Center, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                    }),
                    new View({ size: [0, 20]}),
                    new Label({
                        position: [View.Position.Center, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        text: '판매 금액',
                        font: 'bold 20px sans-serif',
                    }),
                    this.priceText = new Text({
                        position: [View.Position.Center, 0],
                        size: [200, 30],
                        backgroundColor: 'black',
                        borderColor: 'white',
                        borderWidth: 2,
                        padding: 5,
                        font: 'bold 20px sans-serif',
                        textAlign: 'right',
                        type: Text.Type.Number,
                        focus: true,
                    }),
                    new View({ size: [0, 20]}),
                    new HStack({
                        position: [View.Position.Center, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        itemPadding: 10,
                        objects: [
                            new Button({
                                size: [150, 40],
                                borderColor: 'white',
                                text: '확인(Enter)',
                                events: {
                                    click: view => {
                                        const priceText = this.priceText;
                                        const price = parseInt(priceText.text);
                                        if (Number.isNaN(price)) { return }

                                        this.#offer(price);
                                    },
                                },
                            }),
                            new Button({
                                size: [150, 40],
                                borderColor: 'white',
                                text: '취소(Esc)',
                                events: {
                                    click: view => {
                                        this.#cancel();
                                    },
                                },
                            }),
                        ],
                    }),
                    new Button({
                        position: [View.Position.Center, 0],
                        size: [150, 40],
                        borderColor: 'white',
                        text: '넘기기(Del)',
                        events: {
                            click: view => {
                                this.#reject();
                            },
                        },
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    onHandle(events) {
        for (const event of events) {
            if (event.type === 'keydown') {
                if (event.key === 'Enter') {
                    const priceLabel = this.priceText;
                    const price = parseInt(priceLabel.text);
                    if (Number.isNaN(price)) { continue }

                    this.#offer(price);
                }
                else if (event.key === 'Escape') {
                    this.#cancel();
                }
                else if (event.key === 'Delete') {
                    this.#reject();
                }
            }
        }
    }

    #offer(price) {
        this.controller.offer(price);
        this.hide();
    }

    #cancel() {
        this.hide();
    }

    #reject() {
        this.controller.reject();
        this.hide();
    }

    show(customer=null) {
        this.#show();

        if (customer == null) { return }

        this.refresh(customer);
    }

    refresh(customer) {
        this.#refreshCustomerImage(customer);
        this.#refreshCustomerName(customer);
        this.#refreshTradeItemSlots(customer);

        this.evaluate(globalThis.screen.size);
    }

    #show() {
        this.rendering = View.TargetPolicy.Both;
    }

    #refreshCustomerImage(customer) {
        const customerImage = this.customerImage;
        customerImage.renderable = customer.renderables.character;
    }

    #refreshCustomerName(customer) {
        const customerNameLabel = this.customerNameLabel;
        customerNameLabel.text = customer.hero.name;
    }

    #refreshTradeItemSlots(customer) {
        const tradeItemStack = this.tradeItemStack;
        tradeItemStack.clear();

        const needs = customer.needs;
        tradeItemStack.objects = needs.map(itemBundle => {
            const sprite = database.assets.renderables.sprites[itemBundle.item.id];
            const resizedSprite = sprite.copy();
            resizedSprite.size = [50, 50];

            return new Slot({
                size: [50, 50],
                renderable: resizedSprite,
                value: itemBundle.count,
            });
        });
    }

    hide() {
        this.#hide();
        this.reset();
    }

    #hide() {
        this.rendering = View.TargetPolicy.Ignore;
    }

    reset() {
        this.#resetPrice();
    }

    #resetPrice() {
        const priceText = this.priceText;
        priceText.text = '';
    }
}