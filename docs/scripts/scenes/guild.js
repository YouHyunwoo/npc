import { Scene } from '../framework/scene.js';
import { StoreScene } from './store.js';
import { CraftScene } from './craft.js';
import { StatisticsScene } from './statistics.js';
import { FieldScene } from './field.js';
import { QuestListController, QuestListView } from "../assets/quest/quest-list-view.js";
import { QuestCommissionController, QuestCommissionView } from "../assets/quest/quest-commission-view.js";
import { View } from "../assets/ui/view.js";
import { ConfirmView } from "../assets/quest/confirm-view.js";
import { MenuView } from "../assets/menu/menu-view.js";
import { QuestCommission } from "../assets/quest/quest-commission.js";
import database from "../assets/database.js";
import { Quest } from "../assets/quest/quest.js";

export class GuildScene extends Scene {

    willCreate() {
        const screen = globalThis.screen;

        const game = globalThis.game;
        this.guild = game.guild;

        const questCommission = new QuestCommission();
        const questCommissionController = new QuestCommissionController({
            scene: this,
            screen,
            player: game.player,
            questCommission,
            renderables: database.assets.renderables,
            items: database.items,
            monsters: database.monsters,
            itemCollection: game.player.collections.items,
            monsterCollection: game.player.collections.monsters,
        });

        const questListController = new QuestListController({
            scene: this,
            guild: this.guild,
        });

        const screenSize = screen.size;
        const innerViewWidth = Math.max(420, screenSize[0] / 3);

        const objects = [
            new View({
                position: [0, 70],
                size: [View.Size.Fill, screenSize[1] - 70],
                objects: [
                    this.questListView = new QuestListView({
                        name: 'quest-list-view',
                        position: [View.Position.Center, 10],
                        size: [innerViewWidth, View.Size.Wrap],
                        padding: 50,
                        controller: questListController,
                        events: {
                            'deregister-quest': (quest, view) => {
                                this.confirmView.rendering = View.TargetPolicy.Both;
                                this.confirmView.data = quest;
                            },
                            'commission-quest': view => {
                                this.questCommissionView.rendering = View.TargetPolicy.Both;
                            },
                        },
                    }),
                ],
            }),
            this.confirmView = new ConfirmView({
                rendering: View.TargetPolicy.Ignore,
                name: 'confirm-view',
                position: [View.Position.Center, View.Position.Center],
                size: [View.Size.Wrap, View.Size.Wrap],
                backgroundColor: 'rgb(20, 20, 20)',
                borderColor: 'white',
                text: '의뢰한 퀘스트를 취소하시겠습니까?',
                events: {
                    confirm: view => {
                        this.guild.library.deregisterQuest(view.data);
                        view.data = null;
                        this.questListView.refreshQuestList();
                        view.rendering = View.TargetPolicy.Ignore;
                    },
                    cancel: view => {
                        view.rendering = View.TargetPolicy.Ignore;
                    },
                }
            }),
            this.questCommissionView = new QuestCommissionView({
                rendering: View.TargetPolicy.Ignore,
                name: 'commission-view',
                size: [...screenSize],
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                controller: questCommissionController,
                events: {
                    confirm: this.onConfirmQuestCommission.bind(this),
                    cancel: view => {
                        view.rendering = View.TargetPolicy.Ignore;
                    },
                },
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

    onConfirmQuestCommission(objectives, rewards, charge, view) {
        const hasEnoughGold = globalThis.game.player.hasGolds(charge);
        if (!hasEnoughGold) {
            console.log('수수료가 부족합니다.');
            return;
        }

        globalThis.game.player.dropGolds(charge);

        const quest = Quest.create({
            objectives: [
                ...objectives,
            ],
            deadline: globalThis.game.time.elapsedTime + 60 * 60,
            rewards: [
                ...rewards
            ],
        });

        this.guild.library.registerQuest(quest);
        this.questListView.refreshQuestList();
        view.rendering = View.TargetPolicy.Ignore;
    }
}