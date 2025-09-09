const ValueModificationPolicy = {
    None: Symbol('value-modification-policy-none'),
    Clip: Symbol('value-modification-policy-clip'),
};

const MaximumValueModificationPolicy = {
    None: Symbol('maximum-value-modification-policy-none'),
    Clip: Symbol('maximum-value-modification-policy-clip'),
    PreserveRatio: Symbol('maximum-value-modification-policy-preserve-ratio'),
};

export class LimitedValue {

    static ValueModificationPolicy = ValueModificationPolicy;
    static MaximumValueModificationPolicy = MaximumValueModificationPolicy;

    #value = 0;
    #maximum = 0;
    valueModificationPolicy = null;
    maximumValueModificationPolicy = null;

    constructor({
        value=0,
        maximum=0,
        valueModificationPolicy=ValueModificationPolicy.Clip,
        maximumValueModificationPolicy=MaximumValueModificationPolicy.PreserveRatio,
    }={}) {
        this.#value = value;
        this.#maximum = maximum;
        this.valueModificationPolicy = valueModificationPolicy;
        this.maximumValueModificationPolicy = maximumValueModificationPolicy;
    }

    get value() { return this.#value; }
    set value(value) {
        if (this.valueModificationPolicy === ValueModificationPolicy.None) {
            this.#value = value;
        }
        else if (this.valueModificationPolicy === ValueModificationPolicy.Clip) {
            this.#value = Math.clamp(value, 0, this.maximum);
        }
    }

    get maximum() { return this.#maximum; }
    set maximum(value) {
        if (this.maximumValueModificationPolicy === MaximumValueModificationPolicy.Clip) {
            this.#value = Math.min(this.value, value);
        }
        else if (this.maximumValueModificationPolicy === MaximumValueModificationPolicy.PreserveRatio) {
            this.#value = value * this.ratio;
        }

        this.#maximum = value;
    }

    get ratio() {
        return this.value / this.maximum;
    }
}