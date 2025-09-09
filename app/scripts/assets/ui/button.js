import { Label } from "./label.js";
import { View } from "./view.js";

export class Button extends Label {

    constructor({
        ...args
    }={}) {
        super({
            eventHandling: View.TargetPolicy.Self,
            rendering: View.TargetPolicy.Self,
            updating: View.TargetPolicy.Ignore,
            ...args
        });
    }
}