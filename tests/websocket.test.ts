import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Fuzen } from "../dist/index";

const port = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
let server: Fuzen;

const example = () => {
  server = new Fuzen({ server: { hostname: "127.0.0.1", port } });
  server.ws("/", {
    events: [
      {
        event: "text",
        handler: (client, message) => {
          client.send("text", message);
        },
      },
      {
        event: "json",
        handler: (client, message) => {
          client.send("json", message);
        },
      },
    ],
  });
  server.listen(false);
};

describe("WEBSOCKET", () => {
  beforeAll(example);
  afterAll(() => server.close());

  test("connect", (done) => {
    const socket = new WebSocket(`ws://localhost:${port}`, "Fuzen");

    socket.addEventListener("open", () => {
      expect(true);
      socket.close();
    });

    socket.addEventListener("open", () => {
      expect(true);
      done();
    });
  });

  test("send text", (done) => {
    const socket = new WebSocket(`ws://localhost:${port}`, "Fuzen");

    socket.addEventListener("message", (message) => {
      const payload = JSON.parse(message.data);
      if (payload.event === "text") {
        expect(payload.message).toBe("work");
        done();
      } else {
        done("Invalid event.");
      }
    });

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ event: "text", message: "work" }));
    });
  });

  test("send json", (done) => {
    const socket = new WebSocket(`ws://localhost:${port}`, "Fuzen");

    socket.addEventListener("message", (message) => {
      const payload = JSON.parse(message.data);
      if (payload.event === "json") {
        expect(payload.message).toEqual({ test: "work" });
        done();
      } else {
        done("Invalid event.");
      }
    });

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ event: "json", message: { test: "work" } }));
    });
  });
});
