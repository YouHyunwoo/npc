import { Label } from "../ui/label.js";
import { VStack } from "../ui/stack.js";
import { View } from "../ui/view.js";

export class LogController {

    log;
    maxLogCount;

    constructor({
        logger,
        maxLogCount=5,
    }={}) {
        this.logger = logger;
        this.maxLogCount = maxLogCount;
    }

    getMessages() {
        return this.logger.messages;
    }
}

export class LogView extends View {

    controller;

    constructor({
        controller,
        ...args
    }={}) {
        super(args);

        this.controller = controller;

        const objects = [
            this.logStack = new VStack({
                eventHandling: View.TargetPolicy.Ignore,
                size: [View.Size.Wrap, View.Size.Wrap],
                itemPadding: 10,
                objects: [
                    ...Array(controller.maxLogCount).fill(null).map(() =>
                        new Label({
                            size: [View.Size.Wrap, View.Size.Wrap],
                            textAlign: 'left',
                        })
                    ),
                ],
            }),
        ];

        objects.forEach(object => this.add(object));
    }

    onCreate() {
        this.refresh();
    }

    refresh() {
        const logStack = this.logStack;
        const controller = this.controller;

        const messages = controller.getMessages();
        const maxLogCount = controller.maxLogCount;

        const logCount = messages.length;
        const logCountToDisplay = Math.min(logCount, maxLogCount);

        const logStackObjects = logStack.objects;

        for (let i = 0; i < logCountToDisplay; ++i) {
            const logLabel = logStackObjects[i];
            logLabel.text = messages[logCount - logCountToDisplay + i];
        }

        for (let i = logCountToDisplay; i < maxLogCount; ++i) {
            const logLabel = logStackObjects[i];
            logLabel.text = '';
        }

        this.evaluate(globalThis.screen.size);
    }
}