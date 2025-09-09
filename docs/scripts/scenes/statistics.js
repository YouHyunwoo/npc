import { Scene } from '../framework/scene.js';
import { Label } from '../assets/ui/label.js';
import { StoreScene } from './store.js';
import { CraftScene } from './craft.js';
import { GuildScene } from './guild.js';
import { FieldScene } from './field.js';
import { View } from '../assets/ui/view.js';
import { MenuView } from "../assets/menu/menu-view.js";
import { Slot } from "../assets/ui/slot.js";
import database from "../assets/database.js";
import { HStack, VStack } from "../assets/ui/stack.js";
import { ItemInformationView } from '../assets/information/item.js';

export class StatisticsScene extends Scene {

    willCreate() {
        const game = globalThis.game;
        const heros = game.heros;

        Label.fontColor = 'white';
        Label.textAlign = 'center';
        Label.textBaseline = 'middle';

        const screenSize = globalThis.screen.size;

        const objects = [
            this.containerView = new View({
                position: [0, View.Position.Center],
                size: [View.Size.Wrap, 610],
                padding: 100,
                backgroundColor: 'rgb(20, 20, 20)',
                objects: [
                    new HStack({
                        size: [View.Size.Wrap, View.Size.Wrap],
                        itemPadding: 20,
                        objects: [
                            ...heros.map(hero => new HeroView({
                                size: [300, 410],
                                backgroundColor: 'black',
                                borderColor: 'white',
                                padding: 10,
                                controller: new HeroController({
                                    scene: this,
                                    screen: globalThis.screen,
                                    itemDatabase: database.items,
                                    hero,
                                }),
                            })),
                        ],
                    }),
                ]
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
                            craft: CraftScene,
                            quest: GuildScene,
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

    didCreate() {
        const screenSize = globalThis.screen.size;

        if (this.containerView.size[0] <= screenSize[0]) {
            this.containerView.x = View.Position.Center;
            this.containerView.evaluate(screenSize);
        }
    }

    onHandle(events) {
        const screenSize = globalThis.screen.size;

        for (const event of events) {
            if (event.type === 'mousewheel') {
                const deltaY = event.deltaY; // up: -100, down: 100

                const containerView = this.containerView;
                if (containerView.size[0] <= screenSize[0]) {
                    containerView.x = View.Position.Center;
                    containerView.evaluate(screenSize);
                }
                else {
                    containerView.x -= deltaY;
                    containerView.x = Math.clamp(containerView.x, screenSize[0] - containerView.size[0], 0);
                }
            }
        }
    }

    onUpdate(deltaTime) {
        globalThis.game.update(deltaTime);
    }

    onRender(context, screenSize) {
        context.fillStyle = 'rgb(0, 100, 200)';
        context.fillRect(0, 100, ...screenSize.sub([0, 200]));
    }
}

class HeroController {

    informationView;

    constructor({
        scene,
        screen,
        itemDatabase,
        hero,
    }={}) {
        this.scene = scene;
        this.screen = screen;
        this.itemDatabase = itemDatabase;
        this.hero = hero;
    }

    getHeroName() {
        return this.hero.name;
    }

    getHero() {
        return this.hero;
    }

    getInventoryItemBundles() {
        return this.hero.inventory.itemBundles;
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

class HeroView extends View {

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        Label.textAlign = 'left';
        Label.textBaseline = 'middle';

        const objects = [
            new Label({
                name: 'image-view',
                size: [100, 100],
                borderColor: 'white',
                borderWidth: 2,
                text: '(용사 이미지)',
                font: 'bold 12px sans-serif',
                fontColor: 'gray',
                textAlign: 'center',
            }),
            new HStack({
                position: [100 + 10, 0],
                size: [View.Size.Wrap, 30],
                itemPadding: 10,
                objects: [
                    this.nameLabel = new Label({
                        size: [View.Size.Wrap, 30],
                        text: this.controller.getHeroName(),
                        font: 'bold 22px sans-serif',
                    }),
                    this.stateLabel = new Label({
                        size: [View.Size.Wrap, 30],
                        font: 'bold 22px sans-serif',
                    }),
                ],
            }),
            this.placeLabel = new Label({
                position: [100 + 10, 0],
                size: [this.size[0] - 10 - 100 - 10 - 10, 30],
                textAlign: 'right',
            }),
            this.levelLabel = new Label({
                position: [100 + 10, 30 + 20],
                size: [this.size[0] - 10 - 100 - 10 - 10, 30],
                font: 'bold 18px sans-serif',
            }),
            this.experienceBarView = new View({
                position: [100 + 10, (30 + 10) * 2],
                size: [0, 20],
                backgroundColor: 'green',
            }),
            this.experienceLabel = new Label({
                position: [100 + 10, (30 + 10) * 2],
                size: [this.size[0] - 10 - 100 - 10 - 10, 20],
                borderColor: 'white',
                borderWidth: 2,
                font: 'bold 12px sans-serif',
                textAlign: 'center',
            }),
            new VStack({
                position: [0, 100 + 10],
                size: [View.Size.Fill, View.Size.Wrap],
                itemPadding: 10,
                objects: [
                    new VStack({
                        size: [View.Size.Fill, View.Size.Wrap],
                        itemPadding: 10,
                        objects: [
                            new Label({
                                size: [View.Size.Fill, 30],
                                text: '능력치',
                                font: 'bold 18px sans-serif',
                            }),
                            new View({
                                size: [View.Size.Fill, View.Size.Wrap],
                                objects: [
                                    this.hpBarView = new View({
                                        size: [View.Size.Fill, 20],
                                        backgroundColor: 'red',
                                    }),
                                    this.hpLabel = new Label({
                                        size: [View.Size.Fill, 20],
                                        borderColor: 'white',
                                        borderWidth: 2,
                                        font: 'bold 12px sans-serif',
                                        textAlign: 'center',
                                    }),
                                ],
                            }),
                            this.attackPowerLabel = new Label({
                                size: [View.Size.Fill, 20],
                                font: 'bold 12px sans-serif',
                            }),
                            this.defensePowerLabel = new Label({
                                size: [View.Size.Fill, 20],
                                font: 'bold 12px sans-serif',
                            }),
                            this.braveryLabel = new Label({
                                size: [View.Size.Fill, 20],
                                font: 'bold 12px sans-serif',
                            }),
                        ],
                    }),
                    new VStack({
                        size: [View.Size.Fill, View.Size.Wrap],
                        itemPadding: 10,
                        objects: [
                            new Label({
                                size: [View.Size.Fill, 30],
                                text: '가방',
                                font: 'bold 18px sans-serif',
                            }),
                            this.goldLabel = new Label({
                                size: [View.Size.Fill, 20],
                                font: 'bold 12px sans-serif',
                            }),
                            this.inventoryView = new HStack({
                                size: [View.Size.Fill, 50],
                                itemPadding: 10,
                            }),
                        ],
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));

        this.onTakeItemCallback = ((item, count, hero) => {
            this.refreshInventory();
        }).bind(this);

        this.onUseItemCallback = ((item, hero) => {
            this.refreshInventory();
        }).bind(this);
    }

    onCreate() {
        const hero = this.controller.getHero();

        hero.events.on('take-items', this.onTakeItemCallback);
        hero.events.on('use-item', this.onUseItemCallback);

        this.#updateStatistics();

        this.refreshInventory();
    }

    onDestroy() {
        const hero = this.controller.getHero();

        hero.events.remove('take-items', this.onTakeItemCallback);
        hero.events.remove('use-item', this.onUseItemCallback);
    }

    onUpdate(deltaTime) {
        this.#updateStatistics();
    }

    #updateStatistics() {
        const hero = this.controller.getHero();

        const nameLabel = this.nameLabel;
        nameLabel.text = `${hero.name}`;

        const stateLabel = this.stateLabel;
        stateLabel.text = `${hero.getState()}`;

        const placeLabel = this.placeLabel;
        placeLabel.text = `${hero.getPlaceName()}`;

        const levelLabel = this.levelLabel;
        levelLabel.text = `레벨 ${hero.statistics.level}`;

        const experienceBarView = this.experienceBarView;
        const experienceLabel = this.experienceLabel;
        experienceBarView.width = experienceLabel.size[0] * hero.statistics.experience.ratio;
        experienceLabel.text = `${Math.floor(hero.statistics.experience.value * 10) / 10}/${hero.statistics.experience.maximum}`;

        const hpBarView = this.hpBarView;
        const hpLabel = this.hpLabel;
        hpBarView.width = hpLabel.size[0] * hero.statistics.health.ratio;
        hpLabel.text = `${Math.floor(hero.statistics.health.value * 10) / 10}/${hero.statistics.health.maximum}`;

        const attackPowerLabel = this.attackPowerLabel;
        const baseAttackPower = hero.statistics.attackPower;
        const additionalAttackPower = hero.equipment.hand?.effects?.map(
            effect => effect.type === 'increase-attack-power' ? effect.amount : 0
        ).sum() ?? 0;
        attackPowerLabel.text = `공격력: ${hero.getAttackPower()} (${baseAttackPower} + ${additionalAttackPower})`;

        const defensePowerLabel = this.defensePowerLabel;
        const baseDefensePower = hero.statistics.defensePower;
        const additionalDefensePower = hero.equipment.body?.effects?.map(
            effect => effect.type === 'increase-defense-power' ? effect.amount : 0
        ).sum() ?? 0;
        defensePowerLabel.text = `방어력: ${hero.getDefensePower()} (${baseDefensePower} + ${additionalDefensePower})`;

        const braveryLabel = this.braveryLabel;
        braveryLabel.text = `용맹: ${Math.floor(hero.statistics.bravery * 1000) / 1000}`;

        const goldLabel = this.goldLabel;
        goldLabel.text = `소지금: ${hero.inventory.golds}`;
    }

    refreshInventory() {
        this.inventoryView.clear();

        const inventoryItemBundle = this.controller.getInventoryItemBundles();
        this.inventoryView.objects = inventoryItemBundle.map(
            itemBundle => new Slot({
                size: [50, 50],
                borderColor: 'white',
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
                },
            })
        );

        this.evaluate();
    }
}