import { Reader } from "./reader.js";

window.ResizeObserver = undefined;

export const main = (path, settings) => new Reader(path, settings);