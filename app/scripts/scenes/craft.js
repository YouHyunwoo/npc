import { Scene } from '../framework/scene.js';
import { Label } from '../assets/ui/label.js';
import { Button } from "../assets/ui/button.js";
import { StoreScene } from './store.js';
import { GuildScene } from './guild.js';
import { StatisticsScene } from './statistics.js';
import { FieldScene } from './field.js';
import { View } from '../assets/ui/view.js';
import { MenuView } from "../assets/menu/menu-view.js";
import { HStack, VStack } from "../assets/ui/stack.js";
import { CraftInventoryController, CraftInventoryView } from "../assets/craft/craft-inventory-view.js";
import { CraftBenchController, CraftBenchView } from "../assets/craft/craft-bench-view.js";
import { CraftInventory } from "../assets/craft/craft-inventory.js";
import database from "../assets/database.js";

export class CraftScene extends Scene {

    willCreate() {
        const game = globalThis.game;

        const craftInventory = new CraftInventory({
            inventory: game.player.inventory,
        });

        const craftController = new CraftBenchController({
            renderables: database.assets.renderables,
            player: game.player,
            craftBench: game.craftBench,
            craftInventory,
        });

        const craftInventoryController = new CraftInventoryController({
            scene: this,
            screen: globalThis.screen,
            itemDatabase: database.items,
            craftInventory,
            renderables: database.assets.renderables,
        });

        Label.fontColor = 'white';
        Label.textAlign = 'center';
        Label.textBaseline = 'middle';

        const screenSize = globalThis.screen.size;

        const objects = [
            new View({
                position: [0, 70],
                size: [View.Size.Fill, screenSize[1] - 70],
                objects: [
                    new VStack({
                        position: [View.Position.Center, 10],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        padding: 50,
                        itemPadding: 50,
                        objects: [
                            new Label({
                                position: [View.Position.Center, 0],
                                size: [View.Size.Wrap, View.Size.Wrap],
                                text: '제작실',
                                font: 'bold 24px sans-serif',
                            }),
                            new HStack({
                                size: [View.Size.Wrap, View.Size.Wrap],
                                itemPadding: 20,
                                objects: [
                                    new VStack({
                                        size: [View.Size.Wrap, View.Size.Wrap],
                                        padding: 10, itemPadding: 10,
                                        objects: [
                                            new Label({
                                                name: 'craft-bench-label',
                                                position: [View.Position.Center, 0],
                                                size: [View.Size.Wrap, 30],
                                                text: '제작대',
                                                textAlign: 'center',
                                                textBaseline: 'middle',
                                            }),
                                            this.craftBenchView = new CraftBenchView({
                                                name: 'craft-bench-view',
                                                position: [View.Position.Center, 0],
                                                size: [300, 300],
                                                borderColor: 'white',
                                                controller: craftController,
                                            }),
                                        ],
                                    }),
                                    new VStack({
                                        size: [View.Size.Wrap, View.Size.Wrap],
                                        padding: 10, itemPadding: 10,
                                        objects: [
                                            new Label({
                                                position: [View.Position.Center, 0],
                                                size: [View.Size.Wrap, 30],
                                                text: '소지품',
                                                textAlign: 'center',
                                                textBaseline: 'middle',
                                            }),
                                            this.craftInventoryView = new CraftInventoryView({
                                                position: [View.Position.Center, 0],
                                                size: [View.Size.Wrap, View.Size.Wrap],
                                                borderColor: 'white',
                                                controller: craftInventoryController,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Button({
                                position: [View.Position.Center, View.Position.End],
                                size: [100, 50],
                                text: '제작',
                                borderColor: 'white',
                                events: {
                                    click: (event, view) => {
                                        craftController.craft();

                                        this.craftBenchView.clear();
                                        this.craftInventoryView.refresh();
                                    },
                                },
                            }),
                        ],
                    }),
                ],
            }),
            new MenuView({
                size: [View.Size.Fill, 70],
                backgroundColor: 'rgb(20, 20, 20)',
                time: game.time,
                player: game.player,
                events: {
                    'click-menu-item': menuItemId => {
                        const scenes = {
                            store: StoreScene,
                            quest: GuildScene,
                            statistics: StatisticsScene,
                            field: FieldScene,
                        };

                        const sceneType = scenes[menuItemId];
                        const existScene = sceneType != null;
                        if (existScene) {
                            globalThis.application.transit(new sceneType());
                        }
                    },
                },
            }),
        ];

        objects.forEach(object => this.add(object));

        this.camera.position.set(screenSize.div(2));
    }

    onUpdate(deltaTime) {
        globalThis.game.update(deltaTime);
    }
}