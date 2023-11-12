"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const PATH = "./index.html";
const JS_PATH = "/js/index.js";
const CSS_PATH = "/css/main.css";
const CSS_RESET_PATH = "/css/reset.css";
// const FONT_PATH = "/fonts/todo"
const PORT = 4000;
http_1.default.createServer((req, res) => {
    var _a, _b, _c, _d;
    try {
        console.log(req.url);
        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith(JS_PATH)) {
            console.log(`> sending ${JS_PATH}`);
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            return fs_1.default.readFile("." + JS_PATH, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('Error: File not found');
                }
                else {
                    res.write(data);
                }
                res.end();
            });
        }
        else if ((_b = req.url) === null || _b === void 0 ? void 0 : _b.startsWith(CSS_PATH)) {
            console.log(`> sending ${CSS_PATH}`);
            res.writeHead(200, { 'Content-Type': 'text/css' });
            return fs_1.default.readFile("." + CSS_PATH, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('Error: File not found');
                }
                else {
                    res.write(data);
                }
                res.end();
            });
        }
        else if ((_c = req.url) === null || _c === void 0 ? void 0 : _c.startsWith(CSS_RESET_PATH)) {
            console.log(`> sending ${CSS_RESET_PATH}`);
            res.writeHead(200, { 'Content-Type': 'text/css' });
            return fs_1.default.readFile("." + CSS_RESET_PATH, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('Error: File not found');
                }
                else {
                    res.write(data);
                }
                res.end();
            });
        }
        else if ((_d = req.url) === null || _d === void 0 ? void 0 : _d.startsWith("/favicon.ico")) {
            console.log(`> sending favicon.ico`);
            res.writeHead(200);
            res.end();
        }
        else {
            console.log("> sending html");
            const fileStream = fs_1.default.createReadStream(PATH);
            fileStream.pipe(res);
            fileStream.on('open', function () {
                res.writeHead(200, { 'Content-Type': 'text/html' });
            });
            fileStream.on('error', function (e) {
                res.writeHead(404); // assume the file doesn't exist
                res.end();
            });
        }
    }
    catch (error) {
        res.writeHead(500);
        res.end();
        console.log(error);
    }
}).listen(PORT);
console.log(`listening on port ${PORT}`);
