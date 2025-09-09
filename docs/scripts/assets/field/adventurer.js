import { EventEmitter } from '../utility/event.js';
import { MonsterFinder } from "./monsterFinder.js";
import { Progress } from '../utility/progress.js';
import random from '../utility/random.js';
import { ItemBundle } from "../game/item.js";

export class Adventurer {

    player;
    hero;
    boss;
    events;

    monsterFinder;

    state;

    findingProgress;

    fightOpponent;
    fightProgress;

    constructor({
        player,
        monsterDatabase,
        itemDatabase,
        hero,
        boss,
        events={},
    }={}) {
        this.player = player;
        this.hero = hero;
        this.boss = boss;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.monsterFinder = new MonsterFinder({
            monsterDatabase,
            itemDatabase,
        });

        this.#enter();
    }

    getState() {
        return {
            'finding-monster': '👀',
            'fighting': '🪓',
            'exit': '',
        }[this.state];
    }

    #enter() {
        if (this.boss) {
            const bossMonster = this.monsterFinder.find(this.boss);
            this.#startFighting(bossMonster);
            return;
        }

        this.#startFindingMonster();
    }

    #startFindingMonster() {
        this.findingProgress = new Progress({
            repeat: true,
            events: { exceed: progress => this.#onFind() },
        });

        this.state = 'finding-monster';
    }

    #stopFindingMonster() {
        this.findingProgress.dispose();
        this.findingProgress = null;

        this.state = null;
    }

    #onFind() {
        const isNotEnoughHealth = this.hero.stats.health.ratio < 0.2;
        const isBadCondition = this.hero.stats.health.ratio < 0.5 && Math.random() < 0.5;

        if (isNotEnoughHealth || isBadCondition) {
            this.#exit();
            return;
        }

        const monster = this.#encounterMonster();
        this.#makeDecisionToFight(monster);
    }

    #encounterMonster() {
        const hero = this.hero;
        const monster = this.monsterFinder.find(hero);
        if (monster == null) { return }

        this.#logFindingMonster(monster);

        this.player.addCollection('monsters', monster.id);

        return monster;
    }

    #logFindingMonster(monster) {
        console.groupCollapsed(`%c👀적 발견: ${monster.name}`, 'color: orange');
        console.log(`공격력: ${monster.ap}, 공격속도: ${monster.attackSpeed}, 방어력: ${monster.dp}`);
        console.log(`소지품: ${Object.entries(monster.inventory).map(([itemId, count]) => `${itemId} ${count}개`).join(', ')}`);
        console.groupEnd();
    }

    #makeDecisionToFight(monster) {
        // decision: 0: 도망 ~ 1: 전투
        const heroDecision = this.#makeHeroDecision(monster);
        const monsterDecision = this.#makeMonsterDecision(monster);

        if ((heroDecision + monsterDecision) / 2 > 0.6) {
            if (heroDecision < monsterDecision) {
                console.groupCollapsed(`🪓전투 시작`);
                console.log(`어려운 상대이므로 용기 상승: ${this.hero.statistics.bravery} -> ${Math.min(this.hero.statistics.bravery + 0.1, 1)}`, 'color: green');
                console.groupEnd();

                this.hero.becomeBrave(0.1);
            }
            else {
                console.log('🪓전투 시작');
            }

            this.#stopFindingMonster();
            this.#startFighting(monster);
        }
        else if (heroDecision <= monsterDecision) {
            const randomnessOfCatch = Math.random() * 0.02 - 0.01;
            if (Math.random() < 0.1 + randomnessOfCatch) {
                console.log('%c💥몬스터에게 붙잡힘', 'color: orange');

                this.#stopFindingMonster();
                this.#startFighting(monster);
            }
            else {
                console.log(`%c🏃도망: ${this.hero.name}`, 'color: gray');
            }
        }
        else if (heroDecision > monsterDecision) {
            console.log(`%c🏃도망: ${monster.name}`, 'color: gray');
        }
    }

    #makeHeroDecision(monster) {
        const survivalTimeRate = this.#predictSurvivalTimeRate(monster);
        const bravery = this.hero.statistics.bravery;

        return 1.2 * Math.sigmoid(5 * (survivalTimeRate - 1 + bravery * 0.5));
    }

    #makeMonsterDecision(monster) {
        const heroLevel = this.hero.statistics.level;
        const monsterLevel = monster.statistics.level;

        return Math.sigmoid(monsterLevel - heroLevel) + 0.2;
    }

    #predictSurvivalTimeRate(monster) {
        const damagePerSecondOfHero = Math.max(1, this.hero.stats.attackPower - monster.stats.defensePower) * this.hero.stats.attackSpeed;
        const damagePerSecondOfMonster = Math.max(1, monster.stats.attackPower - this.hero.stats.defensePower) * monster.stats.attackSpeed;

        const recoveringItemBundles = this.hero.inventory.itemBundles.filter(
            itemBundle => itemBundle.item.effects.some(
                effect => effect.type === 'increase-health'
            )
        );
        const recoveringAmount = recoveringItemBundles.map(
            itemBundle => itemBundle.item.effects.map(
                effect => {
                    if (effect.type === 'increase-health') { return effect.amount }
                    else { return 0 }
                }
            ).sum() * itemBundle.count
        ).sum();

        const durationUntilHeroDead = (this.hero.stats.health.value + recoveringAmount) / damagePerSecondOfMonster;
        const durationUntilMonsterDead = monster.stats.health.value / damagePerSecondOfHero;

        return durationUntilHeroDead / durationUntilMonsterDead;
    }

    #startFighting(fightOpponent) {
        const additionalAttackSpeed = [this.hero.equipment.hand, this.hero.equipment.body].filter(
            item => item
        ).map(
            item => item.effects.map(
                effect => {
                    if (effect.type === 'increase-attack-speed') { return effect.amount }
                    else if (effect.type === 'decrease-attack-speed') { return -effect.amount }
                    else { return 0 }
                }
            ).sum()
        ).sum();

        const attackSpeed = this.hero.statistics.attackSpeed + additionalAttackSpeed;

        this.fightOpponent = fightOpponent;
        this.fightProgress = new Progress({
            speed: attackSpeed,
            repeat: true,
            events: { exceed: (progress) => this.#onFight() },
        });

        this.hero.events.on('kill', (opponent, hero) => this.#onKill(opponent));
        this.hero.events.on('dead', (attacker, hero) => this.#onDead(attacker));

        this.state = 'fighting';
    }

    #stopFighting() {
        this.fightOpponent = null;
        this.fightProgress.dispose();
        this.fightProgress = null;

        this.hero.events.remove('kill');
        this.hero.events.remove('dead');

        this.state = null;
    }

    #onFight() {
        const survivalTimeRate = this.#predictSurvivalTimeRate(this.fightOpponent);

        if (survivalTimeRate < 1 - this.hero.statistics.bravery * 0.4 && Math.random() < 0.9) {
            this.#runAway();
            return;
        }

        const hasEnoughHealth = this.hero.stats.health.ratio >= 0.3;

        if (hasEnoughHealth) {
            this.hero.attack(this.fightOpponent);
            return;
        }

        const existRecoveringItem = this.hero.inventory.itemBundles.some(
            itemBundle => itemBundle.item.effects.some(
                effect => effect.type === 'increase-health'
            )
        );

        if (existRecoveringItem && Math.random() < 0.5) {
            this.#useRecoveringItem();
        }
        else {
            this.#runAway();
        }
    }

    #runAway() {
        this.#logRunAway();

        this.hero.becomeTimid(0.01);

        this.#stopFighting();
        this.#decideNextAction();
    }

    #logRunAway() {
        console.groupCollapsed('%c🏃도망치기', 'color: gray');
        console.log(`용기 하락: ${this.hero.statistics.bravery} -> ${Math.max(0, this.hero.statistics.bravery - 0.01)}`);
        console.groupEnd();
    }

    #useRecoveringItem() {
        console.log('%c💊회복 아이템 사용', 'color: green');

        const recoveringItemBundles = this.hero.inventory.itemBundles.filter(
            itemBundle => itemBundle.item.effects.some(
                effect => effect.type === 'increase-health'
            )
        );
        const recoveringItemBundle = random.pick(recoveringItemBundles);
        if (recoveringItemBundle == null) { return }

        this.hero.useItem(recoveringItemBundle.item);
    }

    #onKill(opponent) {
        this.#logKill(opponent);

        this.hero.becomeBrave(0.01);
        this.hero.takeGolds(opponent.inventory.golds);
        this.hero.takeItems(...opponent.inventory.itemBundles);
        this.hero.takeExperience(opponent.stats.experience.value);

        // #addCollection(opponent)
        for (const itemBundle of opponent.inventory.itemBundles) {
            this.player.addCollection('items', itemBundle.item.id);
            this.player.addCollection('monsters', opponent.id, itemBundle.item.id);
        }

        // noteQuest(oppenent)
        this.hero.questNote.records.forEach(questRecord => {
            questRecord.kills[opponent.id] = (questRecord.kills[opponent.id] ?? 0) + 1;
        });

        this.#stopFighting();

        if (opponent.id === 'demon') {
            this.#exit(true);
        }
        else {
            this.#decideNextAction();
        }
    }

    #logKill(opponent) {
        console.groupCollapsed(`%c🏆적 처치: ${opponent.name}`, 'color: rgb(100, 230, 100)');
        console.log(`보상: 경험치 %c${opponent.stats.experience.value}%c, 골드 %c${opponent.inventory.golds}%c`,
            'color: yellow', 'color: default',
            'color: yellow', 'color: default',
        );
        console.log(`보상: 아이템 ${opponent.inventory.itemBundles.map(itemBundle => `${itemBundle.item.name} ${itemBundle.count}개`).join(', ')}`);
        console.groupEnd();
    }

    #onDead(attacker) {
        this.#logDead(attacker);

        const dropItemBundles = this.#pickRandomItems();

        this.hero.dropGolds();
        this.hero.dropItems(...dropItemBundles);
        this.hero.dropExperience();

        this.#stopFighting();
        this.#decideNextAction();
    }

    #logDead(attacker) {
        console.groupCollapsed(`💫기절: ${this.hero.name}`);
        console.log(`패널티: 경험치 %c0%c, 골드 %c0%c, 소지아이템 %c2개 랜덤 드랍%c`,
            'color: red', 'color: default',
            'color: red', 'color: default',
            'color: red', 'color: default',
        );
        console.groupEnd();
    }

    #pickRandomItems() {
        const itemBundles = [];

        const inventory = this.hero.inventory;
        const dropItemCount = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < dropItemCount; i++) {
            const randomItemBundle = random.pick(inventory.itemBundles);
            if (randomItemBundle == null) { return }

            itemBundles.push(new ItemBundle({ item: randomItemBundle.item, count: 1 }));
        }

        return itemBundles;
    }

    #decideNextAction() {
        const isNotEnoughHealth = this.hero.stats.health.ratio < 0.2;
        const isBadCondition = this.hero.stats.health.ratio < 0.5 && Math.random() < 0.5;

        if (isNotEnoughHealth || isBadCondition) {
            this.#exit();
        }
        else {
            this.#startFindingMonster();
        }
    }

    #exit(boss=false) {
        this.events.emit('exit', boss);

        this.state = 'exit';
    }

    update(deltaTime) {
        if (this.state === 'finding-monster') {
            this.findingProgress?.update(deltaTime);
        }
        else if (this.state === 'fighting') {
            this.fightOpponent?.update(deltaTime, this.hero);
            this.fightProgress?.update(deltaTime);
        }
    }
}