import { Server } from "bun";

export class IRequest {
  private request: Request;
  private server: Server;
  private path: string;

  constructor(request: Request, server: Server, path: string) {
    this.request = request;
    this.server = server;
    this.path = path;
  }

  getMethod() {
    return this.request.method.toLowerCase();
  }

  getRemoteAddress() {
    const addr = this.server.requestIP(this.request)?.address;
    return addr === "::1" ? "127.0.0.1" : addr?.replace("::ffff:", "");
  }

  getHeader(key: string) {
    return this.request.headers.get(key);
  }

  getHeaders() {
    return this.request.headers.toJSON();
  }

  getQuery(key: string) {
    return this.getQueries().get(key);
  }

  getQueries() {
    return new URL(this.request.url).searchParams;
  }

  getParam(name: string): string {
    return this.getParams()[name.toLowerCase()];
  }

  getParams() {
    let params: { [key: string]: string } = {};

    const paramRegex = /:([^\/]+)/g;
    const routeRegex = new RegExp("^" + this.path.replace(paramRegex, "([^/]+)") + "$");
    const match = new URL(this.request.url).pathname.match(routeRegex);

    if (match) {
      const keys = [];
      let matchParam;

      while ((matchParam = paramRegex.exec(this.path)) !== null) {
        keys.push(matchParam[1]);
      }

      keys.forEach((key, index) => {
        params[key?.toLowerCase()] = match[index + 1]?.toLowerCase();
      });
    }

    return params;
  }

  async getBody(): Promise<unknown> {
    if (!this.request.body) return;

    const reader = this.request.body.getReader();
    let body = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      body += new TextDecoder("utf-8").decode(value);
    }

    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
}
