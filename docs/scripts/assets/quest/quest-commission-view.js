import { ItemInformationView } from "../information/item.js";
import { MonsterInformationView } from "../information/monster.js";
import { Button } from "../ui/button.js";
import { Grid } from "../ui/grid.js";
import { Label } from "../ui/label.js";
import { Slot } from "../ui/slot.js";
import { HStack, VStack } from "../ui/stack.js";
import { Text } from "../ui/text.js";
import { View } from "../ui/view.js";
import { QuestObjective } from "./quest-objective.js";

export class QuestCommissionController {

    constructor({
        scene,
        screen,
        player,
        questCommission,
        renderables,
        items,
        monsters,
        itemCollection,
        monsterCollection,
    }={}) {
        this.scene = scene;
        this.screen = screen;
        this.player = player;
        this.questCommission = questCommission;
        this.renderables = renderables;
        this.items = items;
        this.monsters = monsters;
        this.itemCollection = itemCollection;
        this.monsterCollection = monsterCollection;

        this.commissionType = null;
        this.informationView = null;
    }

    getPlayer() {
        return this.player;
    }

    getItemCollection() {
        return this.itemCollection;
    }

    getMonsterCollection() {
        return this.monsterCollection;
    }

    getItemRenderable(itemId) {
        return this.renderables.sprites[itemId];
    }

    getMonsterRenderable(monsterId) {
        return this.renderables.sprites[monsterId];
    }

    getObjective(quantity) {
        return QuestObjective.create({
            type: this.commissionType,
            target: {
                id: this.questCommission.selection.targetId,
                amount: quantity,
            },
        });
    }

    selectCollectionQuest() {
        this.questCommission.deselect();
        this.commissionType = 'collect';
    }

    selectHuntingQuest() {
        this.questCommission.deselect();
        this.commissionType = 'hunt';
    }

    isSelected(targetId) {
        return this.questCommission.isSelected(targetId);
    }

    selectItem(targetId, targetSlot) {
        this.questCommission.select(targetId, targetSlot);
    }

    selectMonster(targetId, targetSlot) {
        this.questCommission.select(targetId, targetSlot);
    }

    deselect() {
        this.questCommission.deselect();
    }

    showItemInformation(itemId, position) {
        const itemData = this.items[itemId];

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

    showMonsterInformation(monsterId, position) {
        const monsterData = this.monsters[monsterId];

        const monsterInformationView = new MonsterInformationView({
            position,
            size: [View.Size.Wrap, View.Size.Wrap],
            backgroundColor: 'rgb(20, 20, 20)',
            borderColor: 'white',
            padding: 10,
            monsterData,
        });

        this.#addInformationView(monsterInformationView);
    }

    hideMonsterInformation() {
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

export class QuestCommissionView extends View {

    selectedItemId = null;
    selectedMonsterId = null;

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        const objects = [
            new VStack({
                name: 'background-stack',
                position: [View.Position.Center, View.Position.Center],
                size: [View.Size.Wrap, View.Size.Wrap],
                backgroundColor: 'rgb(20, 20, 20)',
                borderColor: 'white',
                padding: 10,
                itemPadding: 10,
                objects: [
                    new View({
                        size: [310, 30],
                        objects: [
                            new HStack({
                                name: 'quest-buttons-stack',
                                size: [310, 50],
                                itemPadding: 10,
                                objects: [
                                    this.collectButton = new Button({
                                        name: 'collect-button',
                                        size: [100, 30],
                                        borderColor: 'white',
                                        text: '수집',
                                        textAlign: 'center',
                                        events: {
                                            click: (event, view) => {
                                                this.#selectCollectionQuest();
                                            },
                                        },
                                    }),
                                    this.huntButton = new Button({
                                        name: 'hunt-button',
                                        size: [100, 30],
                                        borderColor: 'white',
                                        text: '사냥',
                                        textAlign: 'center',
                                        events: {
                                            click: (event, view) => {
                                                this.#selectHuntingQuest();
                                            },
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new View({
                        size: [View.Size.Wrap, View.Size.Wrap],
                        borderColor: 'white',
                        objects: [
                            this.itemGrid = new Grid({
                                rendering: View.TargetPolicy.Ignore,
                                size: [330, 270],
                                padding: 10,
                                itemPadding: 10,
                                itemSize: [50, 50],
                                rows: 4,
                                cols: 5,
                            }),
                            this.monsterGrid = new Grid({
                                rendering: View.TargetPolicy.Ignore,
                                size: [330, 270],
                                padding: 10,
                                itemPadding: 10,
                                itemSize: [50, 50],
                                rows: 4,
                                cols: 5,
                            }),
                        ],
                    }),
                    new View({
                        size: [310, View.Size.Wrap],
                        objects: [
                            new Label({
                                name: 'quantity-label',
                                size: [View.Size.Fill, View.Size.Fill],
                                text: '수량',
                                textAlign: 'left',
                            }),
                            this.quantityText = new Text({
                                name: 'quantity-text',
                                position: [View.Position.End, 0],
                                size: [310 - 70, 30],
                                backgroundColor: 'black',
                                borderColor: 'white',
                                padding: 5,
                                textAlign: 'right',
                                type: Text.Type.Number,
                                events: {
                                    change: (text, view) => {
                                        this.chargeLabel.text = `${parseInt(text) * 10}`;
                                    }
                                }
                            }),
                        ],
                    }),
                    new View({
                        size: [310, View.Size.Wrap],
                        objects: [
                            new Label({
                                name: 'reward-label',
                                size: [View.Size.Fill, View.Size.Fill],
                                text: '보상',
                                textAlign: 'left',
                            }),
                            this.rewardText = new Text({
                                name: 'reward-text',
                                position: [View.Position.End, 0],
                                size: [310 - 70, 30],
                                backgroundColor: 'black',
                                borderColor: 'white',
                                padding: 5,
                                textAlign: 'right',
                                type: Text.Type.Number,
                            }),
                        ]
                    }),
                    new View({
                        size: [310, View.Size.Wrap],
                        objects: [
                            new Label({
                                size: [View.Size.Fill, View.Size.Fill],
                                text: '수수료',
                                textAlign: 'left',
                            }),
                            this.chargeLabel = new Label({
                                position: [View.Position.End, 0],
                                size: [310 - 70, 30],
                                text: '0',
                                textAlign: 'left',
                            }),
                        ]
                    }),
                    new HStack({
                        name: 'buttons-stack',
                        position: [View.Position.Center, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        itemPadding: 10,
                        objects: [
                            new Button({
                                name: 'confirm-button',
                                size: [100, 30],
                                borderColor: 'white',
                                text: '확인',
                                textAlign: 'center',
                                events: {
                                    click: (event, view) => {
                                        const quantity = parseInt(this.quantityText.text);
                                        const reward = parseInt(this.rewardText.text);

                                        const objectives = [
                                            this.controller.getObjective(quantity),
                                        ];
                                        const rewards = [
                                            { type: 'item', id: 'gold', count: reward },
                                        ];
                                        const charge = quantity * 10;

                                        this.events.emit('confirm', objectives, rewards, charge);
                                    },
                                },
                            }),
                            new Button({
                                name: 'cancel-button',
                                size: [100, 30],
                                borderColor: 'white',
                                text: '취소',
                                textAlign: 'center',
                                events: {
                                    click: (event, view) => {
                                        this.events.emit('cancel');
                                    },
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    onCreate() {
        this.events.on('click', (event, view) => {
            view.rendering = View.TargetPolicy.Ignore;
            this.reset();
        });

        const player = this.controller.getPlayer();
        player.events.on('collect', (collectionInformation, player) => {
            if (collectionInformation.id === 'items') {
                this.refreshItemGrid();
            }
            else if (collectionInformation.id === 'monsters') {
                this.refreshMonsterGrid();
            }
        });

        this.itemGrid.events.on('click', (event, view) => {
            this.controller.deselect();
        });

        this.monsterGrid.events.on('click', (event, view) => {
            this.controller.deselect();
        });

        this.reset();
    }

    reset() {
        this.#selectCollectionQuest();
        this.#resetTexts();
    }

    #selectCollectionQuest() {
        this.collectButton.backgroundColor = 'white';
        this.collectButton.fontColor = 'black';
        this.huntButton.backgroundColor = null;
        this.huntButton.fontColor = 'white';

        this.itemGrid.rendering = View.TargetPolicy.Both;
        this.monsterGrid.rendering = View.TargetPolicy.Ignore;

        this.controller.selectCollectionQuest();

        this.refreshItemGrid();
    }

    #selectHuntingQuest() {
        this.collectButton.backgroundColor = null;
        this.collectButton.fontColor = 'white';
        this.huntButton.backgroundColor = 'white';
        this.huntButton.fontColor = 'black';

        this.itemGrid.rendering = View.TargetPolicy.Ignore;
        this.monsterGrid.rendering = View.TargetPolicy.Both;

        this.controller.selectHuntingQuest();

        this.refreshMonsterGrid();
    }

    #resetTexts() {
        this.quantityText.text = '0';
        this.rewardText.text = '0';
    }

    refreshItemGrid() {
        const itemCollection = this.controller.getItemCollection();
        const itemIds = Array.from(itemCollection);

        this.itemGrid.objects = itemIds.map((itemId, i) => new Slot({
            backgroundColor: 'black',
            borderColor: 'white',
            borderWidth: this.controller.isSelected(itemId) ? 6 : 1,
            renderable: this.controller.getItemRenderable(itemId),
            events: {
                mousein: (event, view) => {
                    const position = view.positionInGlobal.add([view.size[0] + 10, 0]);

                    this.controller.showItemInformation(itemId, position);
                },
                mouseout: (event, view) => {
                    this.controller.hideItemInformation();
                },
                click: (event, view) => {
                    this.controller.selectItem(itemId, view);

                    this.quantityText.focus = true;
                },
            },
        }));

        this.evaluate();
    }

    refreshMonsterGrid() {
        const monsterCollection = this.controller.getMonsterCollection();
        const monsterIds = globalThis.Object.keys(monsterCollection);

        this.monsterGrid.objects = monsterIds.map((monsterId, i) => new Slot({
            backgroundColor: 'black',
            borderColor: 'white',
            borderWidth: this.controller.isSelected(monsterId) ? 6 : 1, 
            renderable: this.controller.getMonsterRenderable(monsterId),
            events: {
                mousein: (event, view) => {
                    const position = view.positionInGlobal.add([view.size[0] + 10, 0]);

                    this.controller.showMonsterInformation(monsterId, position);
                },
                mouseout: (event, view) => {
                    this.controller.hideMonsterInformation();
                },
                click: (event, view) => {
                    this.controller.selectMonster(monsterId, view);

                    this.quantityText.focus = true;
                },
            },
        }));

        this.evaluate();
    }
}

