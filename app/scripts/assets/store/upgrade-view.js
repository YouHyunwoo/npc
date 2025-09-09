import { Button } from "../ui/button.js";
import { Label } from "../ui/label.js";
import { VStack } from "../ui/stack.js";
import { View } from "../ui/view.js";

export class UpgradeController {

    constructor({
        storeUpgradeData,
        store,
    }={}) {
        this.storeUpgradeData = storeUpgradeData;
        this.store = store;
    }

    isFullLevel() {
        return this.store.level >= this.storeUpgradeData.length;
    }

    getStoreLevel() {
        return this.store.level;
    }

    getUpgradeCost() {
        return this.storeUpgradeData[this.store.level - 1].cost;
    }

    getCustomerCount() {
        return this.storeUpgradeData[this.store.level - 1].capacity;
    }

    getNextCustomerCount() {
        return this.storeUpgradeData[this.store.level].capacity;
    }

    getTax() {
        return this.storeUpgradeData[this.store.level - 1].tax;
    }

    getNextTax() {
        return this.storeUpgradeData[this.store.level].tax;
    }

    getQuestCommissionCost() {
        return this.storeUpgradeData[this.store.level - 1].questCommissionCost;
    }

    getNextQuestCommissionCost() {
        return this.storeUpgradeData[this.store.level].questCommissionCost;
    }
}

export class UpgradeView extends View {

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;
    }

    onCreate() {
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
                                text: '상점 업그레이드',
                                font: 'bold 24px sans-serif',
                            }),
                            new View({ size: [0, 20] }),
                            this.informationStack = new VStack({
                                size: [View.Size.Wrap, View.Size.Wrap],
                                itemPadding: 10,
                            }),
                            new View({ size: [0, 20] }),
                            this.upgradeButton = new Button({
                                position: [View.Position.Center, 0],
                                size: [View.Size.Wrap, View.Size.Wrap],
                                padding: 20,
                                borderColor: 'white',
                                text: '업그레이드',
                                events: {
                                    click: () => this.events.emit('upgrade'),
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    refresh() {
        const stack = this.informationStack;

        stack.clear();

        if (this.controller.isFullLevel()) {
            stack.add(new Label({
                position: [View.Position.Center, 0],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: '최대 레벨입니다.',
            }));

            this.upgradeButton.rendering = View.TargetPolicy.Ignore;

            this.containerView.evaluate();

            return;
        }

        stack.objects = [
            new Label({
                position: [View.Position.Center, 0],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: `현재 레벨: ${this.controller.getStoreLevel()}`,
            }),
            new Label({
                position: [View.Position.Center, 0],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: `업그레이드 비용: ${this.controller.getUpgradeCost()}`,
            }),
            new Label({
                position: [View.Position.Center, 0],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: `고객 수: ${this.controller.getCustomerCount()} -> ${this.controller.getNextCustomerCount()}`,
            }),
            new Label({
                position: [View.Position.Center, 0],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: `세금: ${this.controller.getTax()} -> ${this.controller.getNextTax()}`,
            }),
            new Label({
                position: [View.Position.Center, 0],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: `퀘스트 의뢰 수수료: ${this.controller.getQuestCommissionCost()} -> ${this.controller.getNextQuestCommissionCost()}`,
            }),
        ];

        this.containerView.evaluate();
    }
}