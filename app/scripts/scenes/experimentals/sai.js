import { Progress } from "../../assets/utility/progress.js";
import { Scene } from "../../framework/scene.js";

export class SAI extends Scene {

    willCreate() {
        const inputInfos = [
            {
                id: 0,
                label: 'eye',
                neuronCount: 3,
            },
        ];

        const brainInfo = {
            id: 0,
            label: 'brain',
            neuronCount: 5,
            inputNeuronCount: 2,
            outputNeuronCount: 2,
        };

        const outputInfos = [
            {
                id: 0,
                label: 'mouth',
                neuronCount: 2,
            },
        ];

        this.inputs = inputInfos.map(info => ({
            id: info.id,
            label: info.label,
            neuronCount: info.neuronCount,
            neurons: this.#initNeurons(info.neuronCount),
            weights: this.#initWeights(info.neuronCount, brainInfo.inputNeuronCount),
            biases: this.#initBiases(brainInfo.inputNeuronCount),
        }));

        this.brain = {
            id: 0,
            label: 'brain',
            prevNeurons: null,
            neurons: this.#initNeurons(brainInfo.neuronCount),
            weights: this.#initWeights(brainInfo.neuronCount, brainInfo.neuronCount),
            biases: this.#initBiases(brainInfo.neuronCount),
            inputNeuronCount: brainInfo.inputNeuronCount,
            outputNeuronCount: brainInfo.outputNeuronCount,
        };
        this.brain.prevNeurons = this.brain.neurons.slice();

        this.outputs = outputInfos.map(info => ({
            id: info.id,
            label: info.label,
            neuronCount: info.neuronCount,
            neurons: this.#initNeurons(info.neuronCount),
            weights: this.#initWeights(brainInfo.outputNeuronCount, info.neuronCount),
            biases: this.#initBiases(info.neuronCount),
        }));

        console.log(this.inputs);
        console.log(this.brain);
        console.log(this.outputs);

        this.auto = false;
        this.time = 0;

        this.inputSources = [[0, 0, 0]];

        this.loopProgress = new Progress({
            repeat: true,
            events: { exceed: () => this.#loop() }
        });

        this.camera.position.set(globalThis.screen.size.div(2));
    }

    #initNeurons(count) {
        return this.#generateRandomValues(count);
    }

    #initWeights(inputCount, outputCount) {
        return Array(inputCount).fill(0).map(() => this.#generateRandomValues(outputCount));
    }

    #initBiases(count) {
        return this.#generateRandomValues(count);
    }

    #generateRandomValues(count) {
        return Array(count).fill(0).map(() => Math.random() * 0.1);
    }

    onHandle(events) {
        for (const event of events) {
            if (event.type === 'keydown') {
                if (event.key === 'Enter') {
                    this.#loop();
                    this.inputSources[0] = [0, 0, 0];
                }
                else if (event.key === 'KeyQ') {
                    this.inputSources[0][0] = 1 - this.inputSources[0][0];
                }
                else if (event.key === 'KeyW') {
                    this.inputSources[0][1] = 1 - this.inputSources[0][1];
                }
                else if (event.key === 'KeyE') {
                    this.inputSources[0][2] = 1 - this.inputSources[0][2];
                }
            }
        }
    }

    onUpdate(deltaTime) {
        if (this.auto) {
            this.loopProgress.update(deltaTime);
        }
    }

    #loop() {
        console.log(`loop: ${this.time}`);

        this.#generateInputSources();
        this.#updateAgent();
        this.#updateEnvironment();

        this.time += 1;
    }

    #generateInputSources() {
        // 입력을 생성: 눈으로 들어가는 데이터를 갱신

        // environment -> input -> input Source
    }

    #updateAgent() {
        this.#trasferInputs();
        this.#updateBrain();
    }

    #trasferInputs() {
        // 생성된 입력을 입력 뉴런에 전달
        this.inputs.forEach((input, inputIndex) => {
            const inputSource = this.inputSources[inputIndex];

            input.neurons.splice(0, input.neurons.length, ...inputSource);
        });
    }

    #updateBrain() {
        // 뉴런을 갱신: 입력 뉴런의 출력을 뇌 뉴런에 전달

        const [inputWeightNext, brainInputNext, brainInputBiasesNext] = this.#generateNextNeurons(
            this.inputs[0].neurons,
            this.inputs[0].weights,
            this.inputs[0].biases,
        );
        const [brainWeightNext, brainNeuronNext, brainBiasesNext] = this.#generateNextNeurons(
            this.brain.neurons,
            this.brain.weights,
            this.brain.biases,
        );
        const [outputWeightNext, outputNext, outputBiasesNext] = this.#generateNextNeurons(
            this.brain.neurons.slice(this.brain.neurons.length - this.brain.outputNeuronCount),
            this.outputs[0].weights,
            this.outputs[0].biases,
        );

        this.inputs[0].weights.splice(0, this.inputs[0].weights.length, ...inputWeightNext);
        this.inputs[0].biases.splice(0, this.inputs[0].biases.length, ...brainInputBiasesNext);

        this.brain.weights.splice(0, this.brain.weights.length, ...brainWeightNext);
        this.brain.biases.splice(0, this.brain.biases.length, ...brainBiasesNext);
        this.brain.prevNeurons.splice(0, this.brain.prevNeurons.length, ...this.brain.neurons);
        this.brain.neurons.splice(0, brainNeuronNext.length, ...brainNeuronNext);
        for (let i = 0; i < brainInputNext.length; i++) {
            this.brain.neurons[i] += brainInputNext[i];
        }

        this.outputs[0].weights.splice(0, this.outputs[0].weights.length, ...outputWeightNext);
        this.outputs[0].biases.splice(0, this.outputs[0].biases.length, ...outputBiasesNext);
        this.outputs[0].neurons.splice(0, outputNext.length, ...outputNext);
    }

    #generateNextNeurons(neurons, weights, biases) {
        // n[T+1] = W[T].T @ n[T] + b1[T] + b2[T]
        // W[T+1] = on: -ky/kx * W[T] + kx, off: 0.3 * W[T]
        // b1[T+1] = 0.2 * b1[T] + 0.8 * |n[T] - b2[T]|
        // b2[T+1] = 0.8 * b2[T] + 0.2 * b1[T]

        const n = [neurons].transpose; // N -Expand> 1 x N -Transpose> N x 1
        const wT = weights.transpose;
        const wTn = wT.matmul(n);
        const nNextT = wTn.transpose[0].add(biases).map(v => Math.sigmoid(v) - 0.5); // N x 1 -Transpose> 1 x N -Shrink> N

        const kx = 0.9;
        const ky = 0.3;
        const kykx = ky / kx;
        const wTransform = Matrix.createIdentity(neurons.length + 1); // N+1 x N+1
        for (let i = 0; i < neurons.length; i++) {
            if (neurons[i] >= 1) {
                wTransform[i][i] = -kykx;
                wTransform[i][neurons.length] = ky;
            }
            else {
                wTransform[i][i] = -kykx;
                wTransform[i][neurons.length] = -ky + kykx;
            }
        }

        const wDelta = wTransform.matmul([...weights, Array(weights[0].length).fill(1)]).slice(0, -1);
        console.log(weights, wDelta); // wNext가 잘 계산되는지 확인해야함
        const wNext = weights.matadd(wDelta.matmap(v => Math.max(0, v)));
        // N+1 x N+1 @ N+1 x N -delete last row> N x N

        const b1Next = biases.map((b, i) => 0.2 * b + 0.8 * Math.abs(neurons[i] - biases[i]));

        return [wNext, nNextT, b1Next];
    }

    #updateEnvironment() {
        // 환경을 갱신: Agent의 출력에 따른 행동으로 환경을 갱신
        const feedback = this.#generateFeedback();

        this.#applyFeedback(feedback);
    }

    #generateFeedback() {
        // Agent의 출력으로 피드백 생성
        return +1;
    }

    #applyFeedback(feedback) {
        // 생성된 피드백을 뇌에 적용: +1이면 활성화된 뉴런을 강화, -1이면 활성화된 뉴런을 약화
    }

    onRender(context, screenSize) {
        const layerPadding = 100;
        const nodePadding = 10;

        const inputSize = [50, (50 + nodePadding) * this.inputs[0].neurons.length - nodePadding];
        const brainSize = [50, (50 + nodePadding) * this.brain.neurons.length - nodePadding];
        const outputSize = 100;

        const inputX = (screenSize[0] - inputSize[0] - brainSize[0] * 2 - outputSize - layerPadding * 3) / 2;
        const inputY = (screenSize[1] - inputSize[1]) / 2;
        const prevBrainX = inputX + inputSize[0] + layerPadding;
        const prevBrainY = (screenSize[1] - brainSize[1]) / 2;
        const brainX = prevBrainX + brainSize[0] + layerPadding;
        const brainY = (screenSize[1] - brainSize[1]) / 2;
        const outputX = brainX + brainSize[0] + layerPadding;
        const outputY = (screenSize[1] - outputSize) / 2;

        this.#renderConnections(context,
            [inputX, inputY], [prevBrainX, prevBrainY],
            this.inputs[0].neurons.length, this.brain.inputNeuronCount, this.inputs[0].weights,
            [0, 0],
            nodePadding, 50);

        this.#renderConnections(context,
            [prevBrainX, prevBrainY], [brainX, brainY],
            this.brain.neurons.length, this.brain.neurons.length, this.brain.weights,
            [0, 0],
            nodePadding, 50, 'rgb(150, 150, 150)');

        this.#renderConnections(context,
            [brainX, brainY], [outputX, outputY],
            this.brain.outputNeuronCount, this.outputs[0].neurons.length, this.outputs[0].weights,
            [this.brain.neurons.length - this.brain.outputNeuronCount, 0],
            nodePadding, 50);

        this.#renderNeurons(context, [inputX, inputY], this.inputs[0].neurons, nodePadding, 50, 'rgb(200, 0, 0)');
        this.#renderNeurons(context, [prevBrainX, prevBrainY], this.brain.prevNeurons, nodePadding, 50, 'rgb(150, 150, 150)');
        this.#renderNeurons(context, [brainX, brainY], this.brain.neurons, nodePadding, 50);
        this.#renderNeurons(context, [outputX, outputY], this.outputs[0].neurons, nodePadding, 50, 'rgb(0, 0, 200)');
    }

    #renderConnections(context, srcPosition, dstPosition, srcNeuronCount, dstNeuronCount, weights, startIndices, padding, size, color='white') {
        context.save();

        for (let i = 0; i < srcNeuronCount; i++) {
            for (let j = 0; j < dstNeuronCount; j++) {
                const src = srcPosition.add([size, (size + padding) * (i + startIndices[0]) + size / 2]);
                const dst = dstPosition.add([0, (size + padding) * (j + startIndices[1]) + size / 2]);

                context.beginPath();
                context.moveTo(...src);
                context.lineTo(...dst);
                context.strokeStyle = color;
                context.lineWidth = weights[i][j] * 10;
                context.stroke();
            }
        }

        context.restore();
    }

    #renderNeurons(context, position, neurons, padding, size, color='white') {
        context.save();
        context.translate(...position);

        for (let i = 0; i < neurons.length; i++) {
            const neuron = neurons[i];
            const neuronSize = size;
            const neuronY = (neuronSize + padding) * i;

            context.beginPath();
            context.arc(neuronSize / 2, neuronY + neuronSize / 2, neuronSize / 2, 0, Math.PI * 2);
            context.fillStyle = neuron < 1 ? 'black' : 'white';
            context.fill();
            context.strokeStyle = color;
            context.lineWidth = 3;
            context.stroke();

            context.fillStyle = neuron >= 1 ? 'black' : 'white';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(neuron.toFixed(4), neuronSize / 2, neuronY + neuronSize / 2);
        }

        context.restore();
    }
}

class Matrix {

    static createIdentity(size) {
        const result = [];

        for (let i = 0; i < size; i++) {
            const row = Array(size).fill(0);

            row[i] = 1;

            result.push(row);
        }

        return result;
    }

    static createDiagonal(values) {
        const result = [];

        const length = values.length;

        for (let i = 0; i < length; i++) {
            const row = Array(length).fill(0);

            row[i] = values[i];

            result.push(row);
        }

        return result;
    }
}

globalThis.Object.defineProperty(Array.prototype, 'matmap', {
    value: function (f) {
        const result = [];

        for (let i = 0; i < this.length; i++) {
            if (this[i] instanceof Array) {
                result.push(this[i].matmap(f));
            }
            else {
                result.push(f(this[i]));
            }
        }

        return result;
    },
});

globalThis.Object.defineProperty(Array.prototype, 'matadd', {
    value: function (other) {
        if (this.length !== other.length || this[0].length !== other[0].length) {
            throw new Error('shape is not matched');
        }

        const result = [];

        for (let i = 0; i < this.length; i++) {
            const row = [];

            for (let j = 0; j < this[0].length; j++) {
                row.push(this[i][j] + other[i][j]);
            }

            result.push(row);
        }

        return result;
    }
});

globalThis.Object.defineProperty(Array.prototype, 'matmul', {
    value: function (other) {
        if (typeof other === 'number') {
            const result = [];
            for (let i = 0; i < this.length; i++) {
                if (this[i] instanceof Array) {
                    result.push(this[i].matmul(other));
                }
                else {
                    result.push(this[i] * other);
                }
            }
            return result;
        }

        if (this[0].length !== other.length) {
            throw new Error('shape is not matched');
        }

        const result = [];

        for (let i = 0; i < this.length; i++) {
            const row = [];

            for (let j = 0; j < other[0].length; j++) {
                let sum = 0;

                for (let k = 0; k < other.length; k++) {
                    sum += this[i][k] * other[k][j];
                }

                row.push(sum);
            }

            result.push(row);
        }

        return result;
    }
});

globalThis.Object.defineProperty(Array.prototype, 'shape', {
    get: function () {
        if (!(this instanceof Array)) {
            return null;
        }

        const deep =  this[0].shape;

        return deep == null ? [this.length] : [this.length, ...deep];
    }
});

globalThis.Object.defineProperty(Array.prototype, 'transpose', {
    get: function () {
        const result = [];

        for (let i = 0; i < this[0].length; i++) {
            const row = [];

            for (let j = 0; j < this.length; j++) {
                row.push(this[j][i]);
            }

            result.push(row);
        }

        return result;
    }
});