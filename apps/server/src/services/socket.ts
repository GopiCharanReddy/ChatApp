import {Server} from "socket.io";
import Redis from "ioredis";
import prismaClient from "./prisma";
import {produceMessage} from './kafka'
const pub = new Redis({
  host: 'valkey-1612d4bc-gopicharanvgcr-8a87.h.aivencloud.com',
  port: 26766,
  username: 'default',
  password: process.env.REDIS_PASSWORD
});
const sub = new Redis({
  host: 'valkey-1612d4bc-gopicharanvgcr-8a87.h.aivencloud.com',
  port: 26766,
  username: 'default',
  password: process.env.REDIS_PASSWORD
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Service...")
    this._io = new Server({
      cors: {
        allowedHeaders: ['*'],
        origin:  "*"
      }
    });
    sub.subscribe("MESSAGES");
  }

  public initListener() {
    const io = this.io;
    console.log("Init Listeners")
    io.on("connect", (socket) => {
      console.log("New Socket Connected: ", socket.id)
      socket.on("event:message", async({message}:{message:string})=> {
        console.log("New message received: ", message)
        // publish this message to  redis
        await pub.publish('MESSAGES', JSON.stringify({message}));
      })
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("new message from redis",message)
        io.emit("message", message);
        await produceMessage(message);
        console.log("Message produced to Kafka Broker")
      }
    })

  }
  
  get io() {
    return this._io; 
  }
}

export default SocketService;