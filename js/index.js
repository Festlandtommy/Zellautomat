"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const CANVAS_WIDTH = 800; //px
const PALETTE_WIDTH = 150; //px
const PALETTE_COLS = 2;
const SPACE_GRID_DIMENSIONS = [100, 100];
const PLAY_PERIOD = 100;
class Space {
    constructor(width, height, cell = 0) {
        this.width = width;
        this.height = height;
        this.cells = Array(width * height).fill(cell);
    }
    get(x, y) {
        return this.cells[y * this.width + x];
    }
    set(x, y, cell) {
        return this.cells[y * this.width + x] = cell;
    }
}
/**
 * Transition keys are strings joined from the counts of each state.
 * i.e. "53" means 5 times state 0, 3 times state 1
 *
 * We can do this because the maximum amount of occurrences is 8
 */
const GoL = [
    {
        transitions: {
            "53": 1,
        },
        default: 0,
        color: "#202020",
    },
    {
        transitions: {
            "62": 1,
            "53": 1,
        },
        default: 0,
        color: "#FF5050",
    },
];
/**
 * Two stage modulo, ensuring the result is always non-negative
 * @param a
 * @param b
 * @returns non-negative number within [0, b)
 */
function nonNegativeMod(a, b) {
    return (a % b + b) % b;
}
function countNeighbours(space, states, x0, y0) {
    const neighbours = Array(states).fill(0);
    // we start counting at the top left neighbour cell, which is x-1 and y-1
    for (let delta_y = -1; delta_y <= 1; ++delta_y) {
        for (let delta_x = -1; delta_x <= 1; ++delta_x) {
            // we ignore the middle cell, delta == 0
            if (delta_y != 0 || delta_x != 0) {
                const x = nonNegativeMod(x0 + delta_x, space.width);
                const y = nonNegativeMod(y0 + delta_y, space.height);
                neighbours[space.get(x, y)]++;
            }
        }
    }
    return neighbours.join("");
}
function computeNextIteration(automaton, current, next) {
    console.assert(current.width == next.width);
    console.assert(current.height == next.height);
    for (let y = 0; y < current.height; ++y) {
        for (let x = 0; x < current.width; ++x) {
            const neighbours = countNeighbours(current, automaton.length, x, y);
            const state = automaton[current.get(x, y)];
            // we set the cells next state by looking up the transition based on it's neighbours
            next.set(x, y, state.transitions[neighbours]);
            // when no transition is specified for given combination of neighbours, we default
            if (next.get(x, y) == undefined) {
                next.set(x, y, state.default);
            }
        }
    }
}
function render(ctx, automaton, space) {
    var _a;
    const CELL_WIDTH = ctx.canvas.width / space.width;
    const CELL_HEIGHT = ctx.canvas.height / space.height;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let y = 0; y < space.height; ++y) {
        for (let x = 0; x < space.width; ++x) {
            const rx = x * CELL_WIDTH;
            const ry = y * CELL_HEIGHT;
            ctx.fillStyle = (_a = automaton[space.get(x, y)]) === null || _a === void 0 ? void 0 : _a.color;
            ctx.fillRect(rx, ry, CELL_WIDTH, CELL_HEIGHT);
        }
    }
}
function getElementByIdOrError(id) {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Could not find element ${id}`);
    }
    return element;
}
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    const CANVAS_ID = "space";
    const canvas = getElementByIdOrError(CANVAS_ID);
    canvas.width = CANVAS_WIDTH;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error(`Could not initialize 2d context`);
    }
    const palette = getElementByIdOrError("palette");
    palette.width = 150;
    const paletteCtx = palette.getContext("2d");
    if (paletteCtx === null) {
        throw new Error(`Could not initialize 2d context`);
    }
    let currentState = -1;
    let currentAutomaton = GoL;
    let currentSpace = new Space(...SPACE_GRID_DIMENSIONS);
    let nextSpace = new Space(currentSpace.width, currentSpace.height);
    let hoveredState = null;
    const PALETTE_SIZE = palette.width / PALETTE_COLS;
    palette.height = Math.ceil(currentAutomaton.length / PALETTE_COLS) * PALETTE_SIZE;
    const redrawPalette = () => {
        paletteCtx.clearRect(0, 0, palette.width, palette.height);
        for (let i = 0; i < currentAutomaton.length; ++i) {
            const y = Math.floor(i / PALETTE_COLS);
            const x = i % PALETTE_COLS;
            paletteCtx.fillStyle = currentAutomaton[i].color;
            paletteCtx.fillRect(x * PALETTE_SIZE, y * PALETTE_SIZE, PALETTE_SIZE, PALETTE_SIZE);
            const thicc = 3;
            if (i == currentState) {
                paletteCtx.strokeStyle = "white";
                paletteCtx.lineWidth = thicc;
                paletteCtx.strokeRect(x * PALETTE_SIZE + thicc / 2, y * PALETTE_SIZE + thicc / 2, PALETTE_SIZE - thicc, PALETTE_SIZE - thicc);
            }
            else if (i == hoveredState) {
                paletteCtx.strokeStyle = "gray";
                paletteCtx.lineWidth = thicc;
                paletteCtx.strokeRect(x * PALETTE_SIZE + thicc / 2, y * PALETTE_SIZE + thicc / 2, PALETTE_SIZE - thicc, PALETTE_SIZE - thicc);
            }
        }
    };
    palette.addEventListener("mousemove", (e) => {
        const x = Math.floor(e.offsetX / PALETTE_SIZE);
        const y = Math.floor(e.offsetY / PALETTE_SIZE);
        const state = y * PALETTE_COLS + x;
        if (state < currentAutomaton.length) {
            hoveredState = state;
        }
        else {
            hoveredState = null;
        }
        redrawPalette();
    });
    palette.addEventListener("click", (e) => {
        const x = Math.floor(e.offsetX / PALETTE_SIZE);
        const y = Math.floor(e.offsetY / PALETTE_SIZE);
        const state = y * PALETTE_COLS + x;
        if (state < currentAutomaton.length) {
            currentState = state;
            redrawPalette();
        }
    });
    redrawPalette();
    canvas.height = canvas.width * (currentSpace.height / currentSpace.width);
    function pixelToCell(offsetX, offsetY) {
        const CELL_WIDTH = canvas.width / currentSpace.width;
        const CELL_HEIGHT = canvas.height / currentSpace.height;
        const x = Math.floor(offsetX / CELL_WIDTH);
        const y = Math.floor(offsetY / CELL_HEIGHT);
        return [x, y];
    }
    canvas.addEventListener("mousemove", (e) => {
        if (e.buttons & 1) {
            const [x, y] = pixelToCell(e.offsetX, e.offsetY);
            currentSpace.set(x, y, currentState);
            render(ctx, currentAutomaton, currentSpace);
        }
    });
    canvas.addEventListener("mousedown", (e) => {
        const [x, y] = pixelToCell(e.offsetX, e.offsetY);
        currentSpace.set(x, y, currentState);
        render(ctx, currentAutomaton, currentSpace);
    });
    const nextState = () => {
        computeNextIteration(currentAutomaton, currentSpace, nextSpace);
        [currentSpace, nextSpace] = [nextSpace, currentSpace];
        render(ctx, currentAutomaton, currentSpace);
    };
    const next = getElementByIdOrError("next");
    const play = getElementByIdOrError("play");
    let playInterval = null;
    next.addEventListener("click", nextState);
    play.addEventListener("click", () => {
        if (playInterval === null) {
            playInterval = setInterval(nextState, PLAY_PERIOD);
        }
        else {
            clearInterval(playInterval);
            playInterval = null;
        }
        play.innerText = playInterval === null ? "Start" : "Pause";
    });
    play.innerText = playInterval === null ? "Start" : "Pause";
    render(ctx, currentAutomaton, currentSpace);
});
