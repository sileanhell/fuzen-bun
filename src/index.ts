import { Server, ServerWebSocket, TLSOptions, WebSocketCompressor } from "bun";
import chalk from "chalk";
import { filterHandler } from "./filter/handler.js";
import { IRoute, IRoutes } from "./filter/route.js";
import { cors } from "./middlewares/cors.js";
import { rateLimit } from "./middlewares/rateLimit.js";
import { Client } from "./websocket/client.js";
import { ClientData, IEvent, IWebsocket, onConnect, onDisconnect, onDrain, onMessage } from "./websocket/handlers.js";

type Params = {
  server?: {
    development?: boolean;
    hostname?: string;
    id?: string | null;
    maxRequestBodySize?: number;
    port?: string | number;
    reusePort?: boolean;
    tls?: TLSOptions | Array<TLSOptions>;
    unix?: never;
  };
  websocket?: {
    maxPayloadLength?: number;
    backpressureLimit?: number;
    closeOnBackpressureLimit?: boolean;
    idleTimeout?: number;
    publishToSelf?: boolean;
    sendPings?: boolean;
    perMessageDeflate?:
      | boolean
      | {
          compress?: WebSocketCompressor | boolean;
          decompress?: WebSocketCompressor | boolean;
        };
  };
};

const Middlewares = { cors, rateLimit };
const Clients: Map<string, Client> = new Map();

class Fuzen {
  private params: Params;
  private server: Server | undefined;

  private middlewares: IRoute[] = [];
  private websockets: Map<string, IWebsocket> = new Map();
  private routes: IRoutes = new Map();

  constructor(params?: Params) {
    this.params = params || {};
  }

  url() {
    return this.server?.url;
  }

  use(module: IRoute) {
    this.middlewares.push(module);
  }

  get(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, get: handlers });
  }

  post(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, post: handlers });
  }

  options(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, options: handlers });
  }

  delete(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, delete: handlers });
  }

  patch(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, patch: handlers });
  }

  put(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, put: handlers });
  }

  head(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, head: handlers });
  }

  ws(path: string, options: IWebsocket) {
    this.websockets.set(path, options);
  }

  listen(logo: boolean = true) {
    this.server = Bun.serve({
      ...this.params.server,
      fetch: (request, server) => filterHandler(request, server, this.websockets, this.routes, this.middlewares),
      websocket: {
        ...this.params.websocket,
        open: (ws) => onConnect(ws as ServerWebSocket<ClientData>, this.websockets, Clients),
        message: (ws, message) => onMessage(ws as ServerWebSocket<ClientData>, message, this.websockets),
        close: (ws, code, reason) => onDisconnect(ws as ServerWebSocket<ClientData>, code, reason, this.websockets, Clients),
        drain: (ws) => onDrain(ws as ServerWebSocket<ClientData>, this.websockets),
      },
    });

    if (logo) {
      console.log(chalk.blue.bold(" _____ _____ _____ _____ _____"));
      console.log(chalk.blue.bold("|   __|  |  |__   |   __|   | |"));
      console.log(chalk.blue.bold("|   __|  |  |   __|   __| | | |"));
      console.log(chalk.blue.bold("|__|  |_____|_____|_____|_|___|"));
      console.log(chalk.white.bold(`\nLink: ${this.server.url}\n`));
    }

    return this;
  }

  close() {
    this.server?.stop(true);
  }
}

export { Clients, Fuzen, IEvent, IRoute, Middlewares };
