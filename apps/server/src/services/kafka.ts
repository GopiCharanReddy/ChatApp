import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";

const kafkaPassword =
  process.env.KAFKA_PASSWORD ??
  (() => {
    throw new Error(
      "Missing KAFKA_PASSWORD environment variable. Server cannot start."
    );
  })();

const kafka = new Kafka({
  brokers: ["kafka-3e6b94ce-gopicharanvgcr-8a87.l.aivencloud.com:26779"],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: "avnadmin",
    password: kafkaPassword,
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

export const connectKafkaProducer = async () => {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
};

export const produceMessage = async (message: string) => {
  const producer = await connectKafkaProducer();
  producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
};

export const connectKafkaConsumer = async () => {
  console.log("Consumer is running.");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    autoCommitInterval: 5,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      console.log("New message received.");
      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (err) {
        console.log("Something is wrong.");
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
};

export default kafka;
