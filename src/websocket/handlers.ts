import { ServerWebSocket } from "bun";
import chalk from "chalk";
import { IRoute } from "../filter/route.js";
import { Client } from "./client.js";

export type IEvent = { event: string; handler: (client: Client, message?: unknown) => unknown };

export type IWebsocket = {
  events?: IEvent[];
  middlewares?: IRoute[];
  onConnect?: (client: Client) => void | Promise<void>;
  onDisconnect?: (client: Client, code: number, reason: string) => void | Promise<void>;
  onDrain?: (client: Client) => void | Promise<void>;
};

export type ClientData = {
  id: string;
  ip: string;
  headers: { [key: string]: string };
  queries: { [key: string]: string };
  params: { [key: string]: string };
  path: string;
  next: Map<any, any>;
};

export const onConnect = async (ws: ServerWebSocket<ClientData>, websockets: Map<string, IWebsocket>, clients: Map<string, Client>) => {
  const route = websockets.get(ws.data.path);

  const client = new Client(ws);
  clients.set(client.getIdentifier(), client);

  if (route?.onConnect) await route.onConnect(client);
};

export const onMessage = async (ws: ServerWebSocket<ClientData>, message: string | Buffer, websockets: Map<string, IWebsocket>) => {
  const route = websockets.get(ws.data.path);

  if (route?.events) {
    try {
      const payload = JSON.parse(Buffer.from(message).toString()) as { event: string; message: unknown };
      const event = route.events.find((item) => item.event === payload.event);

      if (event) {
        await event.handler(new Client(ws), payload.message);
      } else {
        console.log(`[ ${chalk.yellowBright("WARNING")} ] Unhandled websocket event: ${payload.event}`);
      }
    } catch {
      console.log(`[ ${chalk.yellowBright("WARNING")} ] Unsupported websocket message: ${message}`);
    }
  }
};

export const onDisconnect = async (ws: ServerWebSocket<ClientData>, code: number, reason: string, websockets: Map<string, IWebsocket>, clients: Map<string, Client>) => {
  const route = websockets.get(ws.data.path);

  const client = new Client(ws);
  clients.delete(client.getIdentifier());

  if (route?.onDisconnect) return await route.onDisconnect(client, code, reason);
};

export const onDrain = async (ws: ServerWebSocket<ClientData>, websockets: Map<string, IWebsocket>) => {
  const route = websockets.get(ws.data.path);
  if (route?.onDrain) return await route.onDrain(new Client(ws));
};
