import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { generate } from "selfsigned";
import { Fuzen } from "../dist/index";

const port = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
let server: Fuzen;

const example = () => {
  const pems = generate();
  server = new Fuzen({ server: { hostname: "127.0.0.1", tls: { cert: pems.cert, key: pems.private }, port } });
  server.get("/", (_, response) => response.send());
  server.listen(false);
};

describe("HTTPS", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("server", async () => {
    const url = server.url();
    const isHttps = url?.toString().slice(0, 5) === "https";
    expect(isHttps).toBe(true);

    const response = await fetch(`${url}`, { tls: { rejectUnauthorized: false } });
    expect(response.status).toBe(200);
  });
});
