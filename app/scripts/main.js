import {} from "./assets/utility/vector.js";
import {} from "./assets/utility/array.js";
import {} from "./assets/utility/geometry.js";
import {} from "./assets/utility/math.js";
import {} from "./assets/utility/uuid.js";
import { Screen } from './framework/screen.js';
import { NPCApplication } from "./app.js";

import you from "./framework/you.js";

const screen = Screen.createFromCanvas({
    canvasId: 'screen',
    size: { width: 800, height: 800 },
});

const application = new NPCApplication();

you.start({
    screen, 
    application,
});