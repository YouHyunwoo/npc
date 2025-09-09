import { ItemInformationView } from '../information/item.js';
import { Grid } from "../ui/grid.js";
import { Slot } from "../ui/slot.js";
import { View } from "../ui/view.js";

export class CraftInventoryController {

    informationView;

    constructor({
        scene,
        screen,
        itemDatabase,
        craftInventory,
        renderables,
    }={}) {
        this.scene = scene;
        this.screen = screen;
        this.itemDatabase = itemDatabase;
        this.craftInventory = craftInventory;
        this.renderables = renderables;
    }

    getInventoryItemBundles() {
        return this.craftInventory.getInventoryItemBundles();
    }

    getMaterialItemSprite(materialItemId) {
        return this.renderables.sprites[materialItemId];
    }

    selectMaterial(materialInventoryItem, materialSlot) {
        this.craftInventory.select(materialInventoryItem, materialSlot);
    }

    deselectMaterial() {
        this.craftInventory.deselect();
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

export class CraftInventoryView extends View {

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        const objects = [
            new View({
                size: [310, 310],
                objects: [
                    this.grid = new Grid({
                        size: [View.Size.Fill, View.Size.Fill],
                        padding: 10,
                        itemPadding: 10,
                        itemSize: [50, 50],
                        rows: 5, cols: 5,
                        events: {
                            click: (event, view) => {
                                this.controller.deselectMaterial();
                            },
                        },
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
        const availableInventoryItemBundles = this.controller.getInventoryItemBundles();

        this.grid.clear();
        this.grid.objects = availableInventoryItemBundles.map(itemBundle =>
            new Slot({
                borderColor: 'white',
                renderable: this.controller.getMaterialItemSprite(itemBundle.id),
                value: `${itemBundle.count}`,
                events: {
                    mousein: (event, view) => {
                        const position = view.positionInGlobal.add([view.size[0] + 10, 0]);

                        this.controller.showItemInformation(itemBundle.item.id, position);
                    },
                    mouseout: (event, view) => {
                        this.controller.hideItemInformation();
                    },
                    click: (event, view) => {
                        this.controller.selectMaterial(itemBundle, view);
                    },
                },
            })
        );
    }
}