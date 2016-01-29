"use strict";
const createServer = require("http").createServer;
const spawn = require("child_process").spawn;

const PORT = 10666;
const MIN_INTERVAL = 10000;
const TOKEN = "88812348591249124883";
const MAIN_DIR = process.env.MAIN_DIR;
let previousTime = 0;

function executeInBackground (cmd, args, cwd) {
    spawn(cmd, args, {
        stdio: "inherit",
        detached: true,
        cwd: cwd,
    })
        .on("error", error => {
            console.error("[%s] %s", new Date().toISOString(), error.message || error);
        })
        .unref();
}

createServer(function (req, res) {
    if( req.url !== "/" + TOKEN ) {
        console.error("[%s] unauthorized connection", new Date().toISOString());
        res.writeHead(404);
        res.end();
        return;
    }
    res.writeHead(200, {});
    res.end();
    const now = Date.now();
    if ( now < previousTime + MIN_INTERVAL ) {
        console.error("[%s] MIN_INTERVAL(%s) exceeded, dropped request", new Date().toISOString(), MIN_INTERVAL);
        return;
    }
    console.log("[%s] Firing deploy", new Date().toISOString());
    previousTime = now;
    executeInBackground("git", ["pull"], MAIN_DIR);
}).listen(PORT);

console.log("[%s] Listening to port %s", new Date().toISOString(), PORT);
