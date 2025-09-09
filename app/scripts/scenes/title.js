import { Scene } from "../framework/scene.js";
import { Game } from "../assets/game/game.js";
import database from "../assets/database.js";
import { Item, ItemBundle } from "../assets/game/item.js";
import { StoreScene } from "./store.js";

export class TitleScene extends Scene {

    willCreate() {
        this.newGame();

        globalThis.application.transit(new StoreScene());
    }

    newGame() {
        const game = Game.create({
            'time-speed': 300, // 1초당 게임 시간 5분이 흐름
            'name': 'Player', // 플레이어 이름 받아오기
            'hero-count': 1,
            'hero-names': database.hero.names,
            'hero-statistics': database.hero.statistics,
            'hero-renderables': {
                character: database.assets.renderables.sprites['hero-placeholder'],
            },
            'hero-level-up-points': database.hero.levelUpPoints,
            'hero-growths': database.hero.growths,
            'data': {
                'monster': database.monsters,
                'item': database.items,
                'recipe': database.recipes,
            },
        });

        globalThis.game = game;

        for (const hero of game.heros) {
            hero.goToField();
        }

        game.player.takeItems(
            new ItemBundle({ item: Item.create(database.items['wooden-sword']), count: 10 }),
            new ItemBundle({ item: Item.create(database.items['cherry']), count: 10 }),
            new ItemBundle({ item: Item.create(database.items['herb']), count: 10 }),
        );

        game.heros[0].takeItems(
            // new ItemBundle({ item: Item.create(database.items['cherry']), count: 10 }),
            new ItemBundle({ item: Item.create(database.items['herb']), count: 3 }),
        );
    }

    loadGame() {
        // const game = Game.load();

        // globalThis.game = game;
    }
}