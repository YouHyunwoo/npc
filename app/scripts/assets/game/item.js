// item: { id, ... } 단일 아이템
// items: [item, item, ...]
// itemModel: { id[, 변경사항1, ...] } 아이템을 참조하면서 특정 사항들만 변경한 아이템
// itemBundle: { item, count } 같은 효과를 가진 아이템들의 묶음
// itemBundles: [itemBundle, itemBundle, ...]
// itemModelBundle: { itemModel, count } 아이템 모델과 개수를 가진 번들

export class Item {

    uuid;
    data;
    quality; // -1 ~ 1
    effects;

    constructor() {
        if (this.constructor === Item) {
            throw 'cannot instantiate';
        }
    }

    equals(other) {
        return this.id === other.id &&
            this.quality === other.quality &&
            this.effects.every((effect, index) => effect.equals(other.effects[index]));
    }

    static create(data) {
        return ITEM_TYPES[data.type].create(data);
    }
}

export class MaterialItem extends Item {

    constructor({
        data,
        quality=0,
        effects=[],
    }={}) {
        super();

        this.data = data;
        this.quality = quality;
        this.effects = effects;

        this.uuid = globalThis.crypto.randomUUID();

        if (effects.some(effect => !(effect instanceof ItemEffect))) {
            throw `effects should be ItemEffect instance: ${effects}`;
        }
    }

    get id() { return this.data.id }
    get name() { return this.data.name }
    get type() { return this.data.type }

    static create(data) {
        const item = new this({
            data,
            quality: data.quality,
            effects: data.effects?.map(effectData => new ItemEffect(effectData)),
        });

        return item;
    }
}

export class ConsumableItem extends MaterialItem {}

export class EquipmentItem extends MaterialItem {

    get part() { return this.data.part }
}

export class ItemEffect {

    constructor({
        type,
        ...args
    }={}) {
        this.type = type;

        Object.assign(this, args);
    }

    equals(other) {
        return this.type === other.type &&
            Object.keys(this).every(key => this[key] === other[key]);
    }
}

export class ItemBundle {

    constructor({
        item,
        count=1,
    }={}) {
        this.item = item;
        this.count = count;
    }

    get id() { return this.item.id }
    get name() { return this.item.name }
    get type() { return this.item.type }
    get quality() { return this.item.quality }
    get effects() { return this.item.effects }
}

const ITEM_TYPES = {
    material: MaterialItem,
    consumable: ConsumableItem,
    equipment: EquipmentItem,
}