import { ServerWebSocket } from "bun";
import { ClientData } from "./handlers.js";

export class Client {
  private ws;

  constructor(ws: ServerWebSocket<ClientData>) {
    this.ws = ws;
  }

  getIdentifier() {
    return this.ws.data.id;
  }

  getRemoteAddress() {
    return this.ws.data.ip;
  }

  getHeader(key: string) {
    return this.ws.data.headers[key];
  }

  getHeaders() {
    return this.ws.data.headers;
  }

  getQuery(key: string) {
    return this.ws.data.queries[key];
  }

  getQueries() {
    return this.ws.data.queries;
  }

  getParam(name: string): string {
    return this.ws.data.params[name];
  }

  getParams() {
    return this.ws.data.params;
  }

  send(event: string, message?: unknown) {
    const payload = JSON.stringify({ event, message });
    this.ws.send(payload);
  }

  close() {
    this.ws.close();
  }
}
