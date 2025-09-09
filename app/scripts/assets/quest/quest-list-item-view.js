import { View } from "../ui/view.js";
import { Label } from "../ui/label.js";
import { Progress } from "../utility/progress.js";
import { RewardsView } from "./reward-view.js";
import { Button } from "../ui/button.js";
import { QuestInterpreter } from "./quest-interpreter/interpreter.js";
import { VStack } from "../ui/stack.js";

export class QuestListItemView extends View {

    #quest = null;
    #interpreter = null;

    constructor({
        quest,
        ...args
    }={}) {
        super(args);

        Label.textAlign = 'left';
        Label.textBaseline = 'middle';

        const objects = [
            new View({
                size: [View.Size.Fill, View.Size.Wrap],
                padding: 10,
                objects: [
                    new VStack({
                        size: [View.Size.Fill, View.Size.Wrap],
                        itemPadding: 20,
                        objects: [
                            new Label({
                                size: [View.Size.Fill, View.Size.Wrap],
                                text: '목표',
                                font: 'bold 20px sans-serif',
                            }),
                            this.objectivesStack = new VStack({
                                size: [View.Size.Fill, View.Size.Wrap],
                            }),
                            this.rewardsLabel = new Label({
                                size: [View.Size.Fill, View.Size.Wrap],
                                text: '보상',
                                font: 'bold 20px sans-serif',
                            }),
                            this.rewardsView = new RewardsView({
                                size: [View.Size.Fill, 50],
                            }),
                            this.timeLeftLabel = new Label({
                                position: [View.Position.End, 0],
                                size: [View.Size.Wrap, View.Size.Wrap],
                                font: '14px sans-serif',
                            }),
                        ],
                    }),
                    new Button({
                        position: [View.Position.End, 0],
                        size: [View.Size.Wrap, View.Size.Wrap],
                        font: 'bold 16px sans-serif',
                        text: '✖',
                        textAlign: 'center',
                        events: {
                            click: (event, view) => this.events.emit('deregister-quest'),
                        },
                    }),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));

        this.quest = quest;

        this.updateProgress = new Progress({
            speed: 10,
            repeat: true,
            events: {
                exceed: progress => this.#refreshTimeLeft(globalThis.game.time.elapsedTime),
            },
        });
    }

    get quest() { return this.#quest }
    set quest(value) {
        this.#quest = value;
        this.#interpreter = new QuestInterpreter({ quest: value });

        this.refresh();
    }

    onUpdate(deltaTime) {
        this.updateProgress.update(deltaTime);
    }

    refresh() {
        const currentTime = globalThis.game.time.elapsedTime;

        this.#refreshObjectives();
        this.#refreshTimeLeft(currentTime);
        this.#refreshRewards();

        this.evaluate();
    }

    #refreshObjectives() {
        this.objectivesStack.clear();

        const objectives = this.#interpreter.getObjectives();
        objectives.forEach((objective, index) => {
            const label = new Label({
                position: [20, 0],
                size: [View.Size.Wrap, View.Size.Wrap],
                text: `◽ ${objective}`,
            });

            this.objectivesStack.add(label);
        });
    }

    #refreshTimeLeft(currentTime) {
        this.timeLeftLabel.text = `${this.#interpreter.getTimeLeft(currentTime)}`;
        this.timeLeftLabel.evaluate();
    }

    #refreshRewards() {
        this.rewardsView.setRewards(this.#quest.rewards);
    }
}