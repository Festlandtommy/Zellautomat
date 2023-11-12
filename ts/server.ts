import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const PATH = "./index.html"
const JS_PATH = "/js/index.js"
const CSS_PATH = "/css/main.css"
const CSS_RESET_PATH = "/css/reset.css"
// const FONT_PATH = "/fonts/todo"
const PORT = 4000;

http.createServer((req, res) => {
    try {
        console.log(req.url)
        if (req.url?.startsWith(JS_PATH)) {
            console.log(`> sending ${JS_PATH}`)
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            return fs.readFile("." + JS_PATH, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('Error: File not found');
                } else {
                    res.write(data);
                }
                res.end();
            });
        }

        else if (req.url?.startsWith(CSS_PATH)) {
            console.log(`> sending ${CSS_PATH}`)
            res.writeHead(200, { 'Content-Type': 'text/css' });
            return fs.readFile("." + CSS_PATH, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('Error: File not found');
                } else {
                    res.write(data);
                }
                res.end();
            });
        }

        else if (req.url?.startsWith(CSS_RESET_PATH)) {
            console.log(`> sending ${CSS_RESET_PATH}`)
            res.writeHead(200, { 'Content-Type': 'text/css' });
            return fs.readFile("." + CSS_RESET_PATH, function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write('Error: File not found');
                } else {
                    res.write(data);
                }
                res.end();
            });
        }

        else if (req.url?.startsWith("/favicon.ico")) {
            console.log(`> sending favicon.ico`)
            res.writeHead(200);
            res.end();
        }

        else {
            console.log("> sending html")
            const fileStream = fs.createReadStream(PATH);
            fileStream.pipe(res);
            fileStream.on('open', function () {
                res.writeHead(200, { 'Content-Type': 'text/html' })
            })
            fileStream.on('error', function (e) {
                res.writeHead(404)     // assume the file doesn't exist
                res.end()
            })
        }
    } catch (error) {
        res.writeHead(500);
        res.end()
        console.log(error);
    }
}).listen(PORT);

console.log(`listening on port ${PORT}`);