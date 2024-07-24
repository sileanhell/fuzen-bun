import { Server } from "bun";
import { IWebsocket } from "../websocket/handlers.js";
import { IRoute, IRoutes, route } from "./route.js";
import { websocket } from "./websocket.js";

export type Variables = {
  next: Map<string, string>;
  result?: Response;
};

export const filterHandler = async (request: Request, server: Server, websockets: Map<string, IWebsocket>, routes: IRoutes, middlewares: IRoute[]) => {
  const promises: Promise<Response | undefined>[] = [];
  const url = new URL(request.url).pathname;

  websockets.forEach((value, key) => promises.push(websocket(request, server, key, url, value)));
  routes.forEach(async (_, key) => promises.push(route(request, server, key, url, middlewares, routes)));

  const result = (await Promise.all(promises)).filter((value) => value !== undefined)[0];

  return result ? result : new Response(undefined, { status: 404 });
};
