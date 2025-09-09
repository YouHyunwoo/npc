import { AI } from "./base.js";

export class HeroAI extends AI {

    state = null;

    environments = null;

    update(deltaTime) {
        // 주어진 환경에서 가장 적합한 행동을 선택한다.
        // const place = this.environments[0];
    }

    static create({
        environments=[],
    }={}) {
        const ai = new HeroAI();

        ai.environments = environments;

        return ai;
    }
}