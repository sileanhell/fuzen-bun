import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Fuzen } from "../dist/index";

const port = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
let server: Fuzen;

const example = () => {
  server = new Fuzen({ server: { hostname: "127.0.0.1", port } });

  server.get("/getMethod", (request, response) => response.send(request.getMethod()));
  server.get("/getRemoteAddress", (request, response) => response.send(request.getRemoteAddress()));
  server.get("/getHeader", (request, response) => response.send(request.getHeader("Test")));
  server.get("/getHeaders", (request, response) => response.sendJson(request.getHeaders()));
  server.get("/getQuery", (request, response) => response.send(request.getQuery("test")));
  server.get("/getQueries", (request, response) => response.sendJson(request.getQueries()));
  server.get("/getParam/:test", (request, response) => response.send(request.getParam("test")));
  server.get("/getParams/:test1/:test2", (request, response) => response.sendJson(request.getParams()));
  server.post("/body", async (request, response) => {
    const body = await request.getBody();
    response.sendJson({ body });
  });

  server.listen(false);
};

describe("REQUEST", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("getMethod", async () => {
    const response = await fetch(`${server.url()}getMethod`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("get");
  });

  it("getRemoteAddress", async () => {
    const response = await fetch(`${server.url()}getRemoteAddress`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("127.0.0.1");
  });

  it("getHeader", async () => {
    const random = { Test: crypto.randomUUID() };
    const response = await fetch(`${server.url()}getHeader`, { headers: random });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe(random.Test);
  });

  it("getHeaders", async () => {
    const random = { Fuzen: crypto.randomUUID(), Test: crypto.randomUUID() };
    const response = await fetch(`${server.url()}getHeaders`, { headers: random });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json["fuzen"]).toBe(random.Fuzen);
    expect(json["test"]).toBe(random.Test);
  });

  it("getQuery", async () => {
    const random = crypto.randomUUID();
    const response = await fetch(`${server.url()}getQuery?test=${random}`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe(random);
  });

  it("getQueries", async () => {
    const random = { test1: crypto.randomUUID(), test2: crypto.randomUUID() };
    const response = await fetch(`${server.url()}getQueries?test1=${random.test1}&test2=${random.test2}`);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(random);
  });

  it("getParam", async () => {
    const random = crypto.randomUUID();
    const response = await fetch(`${server.url()}getParam/${random}`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe(random);
  });

  it("getParams", async () => {
    const random = { test1: crypto.randomUUID(), test2: crypto.randomUUID() };
    const response = await fetch(`${server.url()}getParams/${random.test1}/${random.test2}`);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(random);
  });

  it("body", async () => {
    const random = crypto.randomUUID();
    const response = await fetch(`${server.url()}body`, { method: "POST", body: random });
    const json1 = await response.json();

    expect(response.status).toBe(200);
    expect(json1.body).toBe(random);

    const response2 = await fetch(`${server.url()}body`, { method: "POST", body: JSON.stringify({ test1: random, test2: random }) });
    const json2 = await response2.json();

    expect(response2.status).toBe(200);
    expect(json2.body).toEqual({ test1: random, test2: random });
  });
});
