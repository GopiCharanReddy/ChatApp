"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class SocketService {
    _io;
    constructor() {
        console.log("Init Socket Service...");
        this._io = new socket_io_1.Server();
    }
    initListener() {
        const io = this.io;
        console.log("Init Listeners");
        io.on("connect", (socket) => {
            console.log("New Socket Connected: ", socket.id);
            socket.on("event:message", async ({ message }) => {
                console.log("New message received: ", message);
            });
        });
    }
    get io() {
        return this._io;
    }
}
exports.default = SocketService;
