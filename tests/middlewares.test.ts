import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Fuzen, IRoute, Middlewares } from "../dist/index";

const port = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
let server: Fuzen;

const example = () => {
  server = new Fuzen({ server: { hostname: "127.0.0.1", port } });

  server.use(
    Middlewares.cors({
      origin: ["test"],
      methods: ["default"],
      allowedHeaders: ["test"],
      exposedHeaders: ["test"],
      credentials: true,
      maxAge: 228,
    })
  );

  server.use(
    Middlewares.rateLimit({
      key: () => "test",
      windowMs: 60 * 1000,
      limit: 3,
      headers: true,
      response: {
        message: "Test",
        status: 228,
      },
    })
  );

  server.get("/cors", (req, res) => res.send("Test"));

  server.get("/rateLimit", (_, res, next) => res.sendJson(next.get("rateLimit")));

  const middleware1: IRoute = (req, res, next) => next.set("middleware1", true);
  const middleware2: IRoute = (req, res, next) => res.sendJson([next.get("middleware1"), true]);
  server.get("/route", middleware1, middleware2, (_, response) => response.send());

  server.listen(false);
};

describe("MIDDLEWARES", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("global", async () => {
    const options = await fetch(`${server.url()}cors`, { method: "OPTIONS" });

    expect(options.status).toBe(204);
    expect(options.headers.get("Access-Control-Allow-Origin")).toBe("test");
    expect(options.headers.get("Access-Control-Allow-Methods")).toBe("GET,HEAD,PUT,PATCH,POST,DELETE");
    expect(options.headers.get("Access-Control-Allow-Headers")).toBe("test");
    expect(options.headers.get("Access-Control-Expose-Headers")).toBe("test");
    expect(options.headers.get("Access-Control-Max-Age")).toBe("228");

    const cors = await fetch(`${server.url()}cors`);

    expect(cors.status).toBe(200);
    expect(cors.headers.get("Access-Control-Allow-Origin")).toBe("test");
    expect(cors.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(await cors.text()).toBe("Test");

    const rateLimit = await fetch(`${server.url()}rateLimit`);

    expect(rateLimit.status).toBe(200);
    expect(rateLimit.headers.get("Ratelimit-Limit")).toBe("3");
    expect(rateLimit.headers.get("Ratelimit-Remaining")).toBe("1");
    expect(rateLimit.headers.get("Ratelimit-Reset")).toBeString();
    expect(await rateLimit.json()).toBeObject();
  });

  it("route", async () => {
    const response = await fetch(`${server.url()}route`);
    const json = await response.json();

    expect(json[0]).toBe(true);
    expect(json[1]).toBe(true);
  });
});
