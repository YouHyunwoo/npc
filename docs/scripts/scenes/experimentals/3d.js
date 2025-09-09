import { Scene } from "../../framework/scene.js";

export class ThreeDimensionScene extends Scene {

    willCreate() {
        const points = [
            [0, 0, 2],
            [0, 1, 6],
            [1, 1, 20],
            [20, 0, 50],
        ];

        this.points = points;

        const screenSize = globalThis.screen.size;
        this.aspectRatio = screenSize[1] / screenSize[0];

        this.cam = {
            position: [0, 0, 0],
            direction: [0, 0, 1],
        };

        this.near = 1;
        this.far = 100;

        this.fov = Math.PI / 2;
        this.tanHalfFov = Math.tan(this.fov / 2);
    }

    onHandle(events) {
        for (const event of events) {
            if (event.type === 'keydown') {
                if (event.key === 'KeyW') {
                    this.cam.position[2] += 1;
                }
                else if (event.key === 'KeyS') {
                    this.cam.position[2] -= 1;
                }
                if (event.key === 'ArrowLeft') {
                    const angle = Math.PI / 180;
                    const hr = [
                        [Math.cos(angle), -Math.sin(angle)],
                        [Math.sin(angle), Math.cos(angle)],
                    ];
                    [this.cam.direction[0], this.cam.direction[2]] = matmul(hr, [this.cam.direction[0], this.cam.direction[2]]);
                }
                else if (event.key === 'ArrowRight') {
                    const angle = -Math.PI / 180;
                    const hr = [
                        [Math.cos(angle), -Math.sin(angle)],
                        [Math.sin(angle), Math.cos(angle)],
                    ];
                    [this.cam.direction[0], this.cam.direction[2]] = matmul(hr, [this.cam.direction[0], this.cam.direction[2]]);
                }
                else if (event.key === 'ArrowUp') {
                    const angle = -Math.PI / 180;
                    const hr = [
                        [Math.cos(angle), -Math.sin(angle)],
                        [Math.sin(angle), Math.cos(angle)],
                    ];
                    [this.cam.direction[1], this.cam.direction[2]] = matmul(hr, [this.cam.direction[1], this.cam.direction[2]]);
                }
                else if (event.key === 'ArrowDown') {
                    const angle = Math.PI / 180;
                    const hr = [
                        [Math.cos(angle), -Math.sin(angle)],
                        [Math.sin(angle), Math.cos(angle)],
                    ];
                    [this.cam.direction[1], this.cam.direction[2]] = matmul(hr, [this.cam.direction[1], this.cam.direction[2]]);
                }
            }
        }
    }

    onRender(context, screenSize) {
        context.fillStyle = 'white';

        const [cdx, cdy, cdz] = this.cam.direction;
        const horizontalRotation = [
            [cdz, -cdx],
            [cdx, cdz],
        ];
        const verticalRotation = [
            [cdz, -cdy],
            [cdy, cdz],
        ];

        for (const point of this.points) {
            const [x, y, z] = point;

            const mx = x - this.cam.position[0];
            const my = y - this.cam.position[1];
            const mz = z - this.cam.position[2];

            const [rhx, rhz] = matmul(horizontalRotation, [mx, mz]);
            const [rvy, rvz] = matmul(verticalRotation, [my, rhz]);

            const d = rvz;
            const ux = rhx / d / this.tanHalfFov;
            const uy = rvy / d / this.tanHalfFov;

            const sx = ux * screenSize[0];
            const sy = -uy * screenSize[0];

            const radius = 100 / d;
            if (radius < 0.1) { continue }

            context.beginPath();
            context.arc(sx, sy, radius, 0, Math.PI * 2);
            context.fill();
        }

        context.strokeStyle = 'white';

        context.beginPath();
        context.moveTo(-screenSize[0] / 2, 0);
        context.lineTo(screenSize[0] / 2, 0);
        context.stroke();

        context.beginPath();
        context.moveTo(0, -screenSize[1] / 2);
        context.lineTo(0, screenSize[1] / 2);
        context.stroke();
    }
}

function matmul(A, v) {
    const result = [];
    for (const row of A) {
        let sum = 0;
        for (let i = 0; i < row.length; i++) {
            sum += row[i] * v[i];
        }
        result.push(sum);
    }
    return result;
}