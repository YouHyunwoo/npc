import { Scene } from '../framework/scene.js';
import { Label } from '../assets/ui/label.js';
import { View } from '../assets/ui/view.js';
import { CraftScene } from './craft.js';
import { GuildScene } from './guild.js';
import { StatisticsScene } from './statistics.js';
import { FieldScene } from './field.js';
import database from '../assets/database.js';
import { Progress } from '../assets/utility/progress.js';
import { CustomerController, CustomerVisible } from '../assets/store/customer.js';
import { MenuView } from "../assets/menu/menu-view.js";
import { PricingController, PricingView } from "../assets/store/pricing-view.js";
import { LogController, LogView } from "../assets/log/log-view.js";
import { UpgradeController, UpgradeView } from "../assets/store/upgrade-view.js";
import { Button } from "../assets/ui/button.js";
import { VStack } from '../assets/ui/stack.js';
import { InventoryController, InventoryView } from '../assets/store/inventory-view.js';

// Hero 마다 캐릭터 그래픽 다르게 하기
// 거래가 끝나면 어떻게 끝났는지 보여주기: 거래 성사, 거래 실패(Hero가 돈이 없음 or 내가 아이템이 없음), 거래 거부

export class StoreScene extends Scene {

    willCreate() {
        const game = globalThis.game;

        const logController = new LogController({
            logger: game.logger,
            maxLogCount: 5,
        });

        const pricingController = new PricingController({
            store: game.store,
            events: {
                'trade-success': (customer, price, items, controller) => {
                    const resultMessageLabel = this.resultMessageLabel;
                    resultMessageLabel.showMessage({ text: '감사합니다! 안녕히 가세요😄' });
                },
                'trade-failure': (reason, customer, price, items, controller) => {
                    const resultMessageLabel = this.resultMessageLabel;
                    resultMessageLabel.showMessage({ text: '다음에 또 오세요😭' });
                },
                'trade-reject': (customer, controller) => {
                    const resultMessageLabel = this.resultMessageLabel;
                    resultMessageLabel.showMessage({ text: '다음에 또 오세요😅' });
                },
            },
        });

        const inventoryController = new InventoryController({
            scene: this,
            screen: globalThis.screen,
            itemDatabase: database.items,
            store: game.store,
            player: game.player,
        });

        const upgradeController = new UpgradeController({
            storeUpgradeData: database.store.upgrade,
            store: game.store,
        });

        Label.fontColor = 'white';
        Label.textAlign = 'center';
        Label.textBaseline = 'middle';

        const screenSize = globalThis.screen.size;

        const objects = [
            this.waitingMessageLabel = new Label({
                size: [View.Size.Fill, View.Size.Fill],
                text: '용사가 방문하기를 기다리는 중...',
            }),
            this.resultMessageLabel = new ResultMessage({
                rendering: View.TargetPolicy.Ignore,
                name: 'result-message-label',
                position: [0, screenSize[1] / 4 - 50],
                size: [View.Size.Fill, 100],
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                font: 'bold 48px sans-serif',
            }),
            this.storeLevelLabel = new Label({
                position: [View.Position.End, 70],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: `상점 Lv. ${game.store.level}`,
                padding: 10,
            }),
            new VStack({
                position: [10, View.Position.Center],
                size: [View.Size.Wrap, View.Size.Wrap],
                padding: 10,
                itemPadding: 10,
                objects: [
                    new Button({
                        size: [50, 50],
                        text: '📦',
                        borderColor: 'white',
                        borderWidth: 2,
                        padding: 10,
                        events: {
                            click: view => {
                                this.inventoryView.refresh();
                                this.inventoryView.rendering = View.TargetPolicy.Both;
                            },
                        },
                    }),
                    new Button({
                        size: [50, 50],
                        text: '⚒',
                        borderColor: 'white',
                        borderWidth: 2,
                        padding: 10,
                        events: {
                            click: view => {
                                this.upgradeView.refresh();
                                this.upgradeView.rendering = View.TargetPolicy.Both;
                            },
                        },
                    }),
                ],
            }),
            this.logView = new LogView({
                position: [0, 70],
                size: [View.Size.Wrap, View.Size.Wrap],
                padding: 10,
                controller: logController,
            }),
            this.pricingView = new PricingView({
                rendering: View.TargetPolicy.Ignore,
                position: [View.Position.Center, View.Position.Center],
                size: screenSize.sub(200),
                backgroundColor: 'black',
                borderColor: 'white',
                borderWidth: 2,
                padding: 50,
                controller: pricingController,
            }),
            this.inventoryView = new InventoryView({
                rendering: View.TargetPolicy.Ignore,
                position: [0, 70],
                size: [View.Size.Fill, screenSize[1] - 70],
                controller: inventoryController,
            }),
            this.upgradeView = new UpgradeView({
                rendering: View.TargetPolicy.Ignore,
                position: [0, 70],
                size: [View.Size.Fill, screenSize[1] - 70],
                controller: upgradeController,
                events: {
                    'upgrade': () => {
                        const cost = upgradeController.getUpgradeCost();
                        if (game.player.hasGolds(cost) === false) {
                            this.logger.log('소지금이 부족합니다.');
                            return;
                        }

                        game.player.dropGolds(cost);

                        this.store.upgrade();
                        this.storeLevelLabel.text = `상점 Lv. ${game.store.level}`;

                        this.logger.log('상점이 업그레이드 되었습니다.');

                        this.camera.position.set(this.store.getStreetSize().div(2));
                        this.upgradeView.rendering = View.TargetPolicy.Ignore;
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
                            craft: CraftScene,
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

        this.store = game.store;
        this.logger = game.logger;

        this.camera.position.set(this.store.getStreetSize().div(2));
    }

    didCreate() {
        this.onEnter = (customer, store) => {
            this.#enterCustomer(customer, store);
        };

        this.onExit = (customer, store) => {
            this.#exitCustomer(customer, store);
        };

        this.store.events.on('enter', this.onEnter);
        this.store.events.on('exit', this.onExit);

        this.onLog = (message, log) => {
            this.logView.refresh();
        }

        this.logger.events.on('log', this.onLog);

        const customers = this.store.getCustomers();
        customers.forEach(customer => this.#enterCustomer(customer));
    }

    onDestroy() {
        this.store.events.remove('enter', this.onEnter);
        this.store.events.remove('exit', this.onExit);

        this.logger.events.remove('log', this.onLog);
    }

    #enterCustomer(customer, store) {
        this.onExiting = customer => {
            this.#endTradeWith(customer);

            customer.events.remove('exiting', this.onExiting);
        };

        customer.events.on('exiting', this.onExiting);

        this.#addCustomerVisible(customer);

        this.#hideWaitingMessage();
    }

    #addCustomerVisible(customer) {
        const customerController = new CustomerController({
            customer,
            renderables: {
                balloon: database.assets.renderables.sprites['speech-balloon'],
            },
        });

        const customerVisible = new CustomerVisible({
            controller: customerController,
            events: {
                click: customerVisible => {
                    const controller = customerVisible.controller;
                    const customer = controller.customer;

                    if (customer.isWaitingForTrade()) {
                        this.#startTrade(customer);
                    }
                },
            },
        });

        this.add(customerVisible);
    }

    #startTrade(customer) {
        this.store.owner.startTrade(customer);

        this.pricingView.show(customer);
    }

    #hideWaitingMessage() {
        this.waitingMessageLabel.rendering = View.TargetPolicy.Ignore;
    }

    #exitCustomer(customer, store) {
        customer.events.remove('exiting');

        this.#removeCustomerVisible(customer);

        if (store.getCustomerCount() === 0) {
            this.#showWaitingMessage();
        }
    }

    #removeCustomerVisible(customer) {
        const customerVisible = this.objects.find(customerVisible => customerVisible.controller.customer === customer);

        this.remove(customerVisible);
    }

    #endTradeWith(customer) {
        if (this.#isTradingWith(customer)) {
            this.pricingView.hide();

            this.store.owner.endTrade();
        }
    }

    #isTradingWith(customer) {
        return this.store.owner.isTradingWith(customer);
    }

    #showWaitingMessage() {
        this.waitingMessageLabel.rendering = View.TargetPolicy.Self;
    }

    onUpdate(deltaTime) {
        globalThis.game.update(deltaTime);
    }

    onRender(context, screenSize) {
        const streetSize = this.store.getStreetSize();

        context.fillStyle = 'rgb(190, 150, 40)';
        context.fillRect(0, 0, ...streetSize);
    }
}

class ResultMessage extends Label {

    constructor({
        speed,
        ...args
    }={}) {
        super(args);

        this.progress = new Progress({
            speed,
            events: {
                finish: progress => {
                    progress.reset();

                    this.rendering = View.TargetPolicy.Ignore;
                },
            },
        });
    }

    get speed() {
        return this.progress.speed;
    }

    set speed(value) {
        this.progress.speed = value;
    }

    onUpdate(deltaTime) {
        if (this.text == null) { return }

        this.progress.update(deltaTime);
    }

    showMessage({
        text,
    }={}) {
        if (text == null) {
            this.text = null;
            this.progress.reset();
            this.rendering = View.TargetPolicy.Ignore;
        }
        else {
            this.text = text;
            this.progress.reset();
            this.rendering = View.TargetPolicy.Self;
        }
    }
}