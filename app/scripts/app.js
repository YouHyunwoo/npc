import { Application } from "./framework/application.js";
import database from "./assets/database.js";
import { Renderable } from "./assets/graphic/renderable.js";
import { TitleScene } from './scenes/title.js';

/*
    1. 플레이어 미션 구현하기
        매일 플레이어가 수행해야할 미션이 주어진다. 그걸 수행하면 하루가 지날 때 지원금이 주어진다.
        미션 종류: 몬스터 사냥, 아이템 수집, 아이템 제작, 아이템 판매, 퀘스트 의뢰
        mission: { type, ...args }
        1) 몬스터 사냥: { type: 'hunt', monsterId, monsterCount }
        2) 아이템 수집: { type: 'collect', itemId, itemCount }
        3) 아이템 제작: { type: 'craft', itemId, itemCount }
        4) 아이템 판매: { type: 'sell', itemId, itemCount }
        5) 퀘스트 의뢰: { type: 'quest', questContents: [{ type: 'hunt|collect', target: {...} }, ...] }
    2. 영웅 Renderable Animation 구현하기: 걸어다니기
    3. 상점 배경 이미지 구현하기
*/

export class NPCApplication extends Application {

    async onLoad() {
        database.assets = {
            renderables: {
                sprites: {
                    ...globalThis.Object.fromEntries(
                        globalThis.Object.entries(database.renderables.sprites).map(([key, value]) =>
                            [key, Renderable.create(value)]
                        )
                    ),
                },
            },
        };

        await Promise.all(Object.values(database.assets.renderables.sprites).map(sprite => sprite.loadPromise));
    }

    onCreate() {
        const screen = globalThis.screen;

        screen.fill();
        screen.context.imageSmoothingEnabled = false;

        this.transit(new TitleScene());
    }
}