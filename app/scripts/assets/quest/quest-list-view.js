import { View } from "../ui/view.js";
import { Label } from "../ui/label.js";
import { VStack } from "../ui/stack.js";
import { QuestListItemView } from "./quest-list-item-view.js";
import { Button } from "../ui/button.js";

export class QuestListController {

    constructor({
        guild,
    }={}) {
        this.guild = guild;
    }

    findAvailableQuests() {
        return this.guild.library.findAvailableQuests();
    }

    deregisterQuest(quest) {
        this.guild.library.deregisterQuest(quest);
    }
}

export class QuestListView extends View {

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        const quests = this.controller.findAvailableQuests();

        const objects = [
            new Label({
                name: 'title-label',
                size: [View.Size.Fill, View.Size.Wrap],
                text: '퀘스트 목록',
                font: 'bold 24px sans-serif',
            }),
            new Button({
                name: 'commission-button',
                position: [View.Position.End, 50],
                size: [100, 30],
                text: '의뢰하기',
                borderColor: 'white',
                events: {
                    click: (event, view) => {
                        this.events.emit('commission-quest');
                    },
                },
            }),
            new VStack({
                name: 'quest-list-item-stack',
                position: [View.Position.Center, 90],
                size: [View.Size.Wrap, View.Size.Wrap],
                itemPadding: 10,
                objects: quests.map((quest, i) => new QuestListItemView({
                    name: 'quest-list-item-view',
                    size: [Math.max(400, this.size[0] / 4), 190 + 40],
                    backgroundColor: 'rgb(20, 20, 20)',
                    borderColor: 'white',
                    quest,
                    events: {
                        'deregister-quest': view => {
                            this.events.emit('deregister-quest', quest);
                        },
                    },
                })),
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    refreshQuestList() {
        const questListItemStack = this.findByName('quest-list-item-stack');

        const quests = this.controller.findAvailableQuests();
        questListItemStack.objects = quests.map((quest, i) => new QuestListItemView({
            name: 'quest-list-item-view',
            size: [Math.max(400, this.size[0] / 4), View.Size.Wrap],
            backgroundColor: 'rgb(20, 20, 20)',
            quest,
            events: {
                'deregister-quest': view => {
                    this.events.emit('deregister-quest', quest);
                },
            },
        }));

        questListItemStack.evaluate();

        this.evaluate();
    }
}