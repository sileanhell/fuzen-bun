import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Fuzen } from "../dist/index";

const port = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
let server: Fuzen;

const example = () => {
  server = new Fuzen({ server: { hostname: "127.0.0.1", port } });

  server.get("/setHeader", (_, response) => response.setHeader("Fuzen", "2.0").send("Test"));
  server.get("/setHeaders", (_, response) => response.setHeaders({ Fuzen: "2.0", Test: "work" }).send("Test"));
  server.get("/setStatus", (_, response) => response.setStatus(228).send("Test"));
  server.get("/sendStatus", (_, response) => response.sendStatus(228));
  server.get("/sendJson", (_, response) => response.sendJson({ work: true }));
  server.get("/send", (_, response) => response.send("Hello, World! Привет, мир! 12345 !@#$%^&*() こんにちは世界 😊🌟🚀 Hello\nWorld"));
  server.get("/pipe", async (_, response) => {
    const stream = (await fetch("https://google.com")).body;
    stream ? response.pipe(stream) : response.send();
  });

  server.listen(false);
};

describe("RESPONSE", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("setHeader", async () => {
    const response = await fetch(`${server.url()}setHeader`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Fuzen")).toBe("2.0");
    expect(text).toBe("Test");
  });

  it("setHeaders", async () => {
    const response = await fetch(`${server.url()}setHeaders`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Fuzen")).toBe("2.0");
    expect(response.headers.get("Test")).toBe("work");
    expect(text).toBe("Test");
  });

  it("setStatus", async () => {
    const response = await fetch(`${server.url()}setStatus`);
    const text = await response.text();

    expect(response.status).toBe(228);
    expect(text).toBe("Test");
  });

  it("sendStatus", async () => {
    const response = await fetch(`${server.url()}sendStatus`);
    const text = await response.text();

    expect(response.status).toBe(228);
    expect(text).toBe("");
  });

  it("sendJson", async () => {
    const response = await fetch(`${server.url()}sendJson`);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(json).toEqual({ work: true });
  });

  it("send", async () => {
    const response = await fetch(`${server.url()}send`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("Hello, World! Привет, мир! 12345 !@#$%^&*() こんにちは世界 😊🌟🚀 Hello\nWorld");
  });

  it("pipe", async () => {
    const response = await fetch(`${server.url()}pipe`);
    const stream = await fetch("https://google.com");

    expect(response.status).toBe(200);
    expect(response.headers.get("Transfer-Encoding")).toBe("chunked");
    expect(response.body).toEqual(stream.body);
  });
});
