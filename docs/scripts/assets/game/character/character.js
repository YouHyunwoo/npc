import { CharacterStatistics } from "./statistics.js";
import { Inventory } from "./inventory.js";
import { Equipment } from "./equipment.js";
import { EventEmitter } from "../../utility/event.js";

export class Character {

    uuid;
    id;
    name;
    statistics;
    inventory;
    equipment;
    events;

    constructor({
        uuid,
        id, name,
        statistics,
        inventory,
        equipment,
        events,
    }={}) {
        this.uuid = uuid;
        this.id = id;
        this.name = name;
        this.statistics = statistics;
        this.inventory = inventory;
        this.equipment = equipment;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    get stats() { return this.statistics }

    hasGolds(amount) {
        return this.inventory.golds >= amount;
    }

    takeGolds(count) {
        this.inventory.golds += count;

        this.events.emit('take-gold', count);
    }

    dropGolds(count=null) {
        const dropAmount = Math.min(this.inventory.golds, count ?? this.inventory.golds);
        this.inventory.golds -= dropAmount;

        this.events.emit('drop-gold', dropAmount);
    }

    hasItems(...itemBundles) {
        return itemBundles.every(
            itemBundle => this.inventory.hasItems(itemBundle.item, itemBundle.count)
        );
    }

    takeItems(...itemBundles) {
        itemBundles = itemBundles.filter(itemBundle => itemBundle.count > 0);
        if (itemBundles.length <= 0) { return }

        itemBundles.forEach(itemBundle => {
            this.inventory.take(itemBundle.item, itemBundle.count);
        });

        this.events.emit('take-items', itemBundles);
    }

    dropItems(...itemBundles) {
        itemBundles = itemBundles.filter(itemBundle => itemBundle.count > 0);
        if (itemBundles.length <= 0) { return }

        itemBundles.forEach(itemBundle => {
            this.inventory.drop(itemBundle.item, itemBundle.count);
        });

        this.events.emit('drop-items', itemBundles);
    }

    equipItem(item) {
        if (item.type !== 'equipment') { return null }

        const equippedItem = this.equipment.equip(item);

        this.events.emit('equip', item, equippedItem);

        return equippedItem;
    }

    unequipItem(part) {
        const unequippedItem = this.equipment.unequip(part);

        this.events.emit('unequip', unequippedItem);

        return unequippedItem;
    }

    useItem(item) {
        const itemBundle = this.inventory.find(item);
        if (itemBundle == null) { return }

        if (itemBundle.count <= 0) {
            this.inventory.drop(item, 1);
            return;
        }

        itemBundle.count -= 1;

        // 아이템 사용 임시 구현 -> 아이템 사용 클래스 구현
        if ('health' in item.effects) {
            this.statistics.health.value += item.effects.health;
        }

        this.events.emit('use-item', item);
    }

    takeExperience(amount) {
        const experience = this.statistics.experience;

        experience.value += amount;
        this.events.emit('take-experience', amount);

        while (experience.ratio >= 1) {
            experience.value -= experience.maximum;
            experience.maximum = Math.floor(experience.maximum * (1.3 + Math.random() * 0.7));

            this.levelUp();
        }
    }

    dropExperience(amount=null) {
        const experience = this.statistics.experience;

        const dropAmount = Math.min(experience.value, amount ?? experience.value);
        experience.value -= dropAmount;
        this.events.emit('drop-experience', dropAmount);
    }

    levelUp() {
        this.stats.level += 1;
        this.events.emit('level-up');

        console.log(`%c💪레벨 업: ${this.name}, Level ${this.stats.level}`, 'color: rgb(100, 100, 230)');
    }

    attack(target) {
        if (target == null) { return }

        const damage = Math.max(1, this.getAttackPower() - target.getDefensePower());
        console.log(`%c🔪공격: ${this.name} -> ${target.name}(💥피해 ${damage})`,
            'color: rgb(230, 100, 100)');

        const isDead = target.getDamagedBy(damage, this);
        if (isDead) {
            this.kill(target);
        }
    }

    getAttackPower() {
        let additionalAttackPower = 0;

        if (this.equipment.hand != null) {
            additionalAttackPower += this.equipment.hand.effects?.attackPower ?? 0;
        }

        return this.stats.attackPower + additionalAttackPower;
    }

    getDefensePower() {
        let additionalDefensePower = 0;

        if (this.equipment.body != null) {
            additionalDefensePower += this.equipment.hand.effect?.defensePower ?? 0;
        }

        return this.stats.defensePower + additionalDefensePower;
    }

    getDamagedBy(damage, attacker) {
        this.stats.health.value -= damage;

        if (this.stats.health.value <= 0) {
            this.dead(attacker);

            return true;
        }

        return false;
    }

    dead(attacker) {
        this.events.emit('dead', attacker);
    }

    kill(target) {
        this.events.emit('kill', target);
    }

    static create(configurations) {
        const character = new this({
            uuid: globalThis.crypto.randomUUID(),
            id: configurations.id,
            name: configurations.name,
            statistics: new CharacterStatistics(configurations.statistics),
            inventory: new Inventory(configurations.inventory),
            equipment: new Equipment(),
        });

        return character;
    }
}