import database from '../database.js';
import { ItemInformationView } from '../information/item.js';
import { Button } from '../ui/button.js';
import { Grid } from '../ui/grid.js';
import { Label } from '../ui/label.js';
import { Slot } from '../ui/slot.js';
import { VStack } from '../ui/stack.js';
import { View } from '../ui/view.js';

export class InventoryController {

    informationView;

    constructor({
        scene,
        screen,
        itemDatabase,
        store,
        player,
    }={}) {
        this.scene = scene;
        this.screen = screen;
        this.itemDatabase = itemDatabase;
        this.store = store;
        this.player = player;
    }

    getInventoryItemBundles() {
        return this.player.inventory.itemBundles;
    }

    getSellingItems() {
        return this.store.sellingItems;
    }

    isSelling(item) {
        return this.store.sellingItems.includes(item);
    }

    toggle(item, view) {
        if (this.store.sellingItems.includes(item)) {
            this.store.sellingItems.remove(item);
            view.borderColor = 'white';
            view.borderWidth = 1;
        } else {
            this.store.sellingItems.push(item);
            view.borderColor = 'red';
            view.borderWidth = 6;
        }
    }

    selectAll(views) {
        const sellingItems = this.store.sellingItems;
        const inventoryItemBundles = this.player.inventory.itemBundles;
        sellingItems.splice(0, sellingItems.length, ...inventoryItemBundles.map(itemBundle => itemBundle.item));

        views.forEach(view => {
            view.borderColor = 'red';
            view.borderWidth = 6;
        });
    }

    showItemInformation(itemId, position) {
        const itemData = this.itemDatabase[itemId];

        const itemInformationView = new ItemInformationView({
            position,
            size: [View.Size.Wrap, View.Size.Wrap],
            backgroundColor: 'rgb(20, 20, 20)',
            borderColor: 'white',
            padding: 10,
            itemData,
        });

        this.#addInformationView(itemInformationView);
    }

    hideItemInformation() {
        this.#removeInformationView();
    }

    #addInformationView(informationView) {
        if (informationView == null) { return }
        if (this.informationView != null) {
            this.#removeInformationView();
        }

        const scene = this.scene;
        const screenSize = this.screen.size;

        scene.add(informationView);

        informationView.create();
        informationView.evaluate(screenSize);

        this.informationView = informationView;
    }

    #removeInformationView() {
        if (this.informationView == null) { return }

        const scene = this.scene;

        scene.remove(this.informationView);

        this.informationView = null;
    }
}

export class InventoryView extends View {

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        const objects = [
            new View({
                size: [View.Size.Fill, View.Size.Fill],
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                events: {
                    click: () => this.rendering = View.TargetPolicy.Ignore,
                },
            }),
            this.containerView = new View({
                position: [View.Position.Center, View.Position.Center],
                size: [View.Size.Wrap, View.Size.Wrap],
                backgroundColor: 'black',
                borderColor: 'white',
                padding: 50,
                objects: [
                    new VStack({
                        size: [View.Size.Wrap, View.Size.Wrap],
                        padding: 10,
                        itemPadding: 10,
                        objects: [
                            new Label({
                                position: [View.Position.Center, 0],
                                size: [View.Size.Wrap, View.Size.Wrap],
                                text: '소지품',
                                font: 'bold 24px sans-serif',
                            }),
                            new Button({
                                position: [View.Position.End, 0],
                                size: [100, 30],
                                borderColor: 'white',
                                text: '전체 선택',
                                events: {
                                    click: () => {
                                        this.controller.selectAll(this.inventoryGrid.objects);
                                    },
                                },
                            }),
                            new View({ size: [0, 20] }),
                            this.inventoryGrid = new Grid({
                                size: [310, 310],
                                borderColor: 'white',
                                padding: 10,
                                itemPadding: 10,
                                itemSize: [50, 50],
                                rows: 5, cols: 5,
                            }),
                        ],
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    onCreate() {
        this.refresh();
    }

    refresh() {
        const inventoryGrid = this.inventoryGrid;

        inventoryGrid.clear();

        const inventoryItemBundles = this.controller.getInventoryItemBundles();
        const sellingItems = this.controller.getSellingItems();

        inventoryGrid.objects = inventoryItemBundles.map(
            itemBundle => new Slot({
                borderColor: sellingItems.includes(itemBundle.item) ? 'red' : 'white',
                borderWidth: sellingItems.includes(itemBundle.item) ? 6 : 1,
                renderable: database.assets.renderables.sprites[itemBundle.item.id],
                value: itemBundle.count,
                events: {
                    mousein: (event, view) => {
                        const position = view.positionInGlobal.add([view.size[0] + 10, 0]);

                        this.controller.showItemInformation(itemBundle.item.id, position);
                    },
                    mouseout: (event, view) => {
                        this.controller.hideItemInformation();
                    },
                    click: (event, view) => {
                        this.controller.toggle(itemBundle.item, view);
                    },
                },
            })
        );

        this.containerView.evaluate();
    }
}