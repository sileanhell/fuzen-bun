import { Server } from "bun";
import { IRequest } from "../request.js";
import { IResponse } from "../response.js";
import { IWebsocket } from "../websocket/handlers.js";
import { Variables } from "./handler.js";

export const websocket = async (request: Request, server: Server, path: string, url: string, handler: IWebsocket) => {
  if (new RegExp("^" + path.replace(/:([^\/]+)/g, "([^/]+)") + "$").test(url)) {
    const protocol = request.headers.get("sec-websocket-protocol");
    if (protocol !== "Fuzen") return new Response("Use fuzen-client package.", { status: 400 });

    const id = request.headers.get("sec-websocket-key");
    const variables: Variables = { next: new Map() };

    const custom_request = new IRequest(request, server, path);
    const custom_response = new IResponse(variables);

    if (handler.middlewares) {
      for (const middleware of handler.middlewares) {
        await middleware(custom_request, custom_response, variables.next);
      }
    }

    const ok = server.upgrade(request, {
      data: {
        id,
        ip: custom_request.getRemoteAddress(),
        headers: custom_request.getHeaders(),
        queries: custom_request.getQueries(),
        params: custom_request.getParams(),
        path,
        next: variables.next,
      },
    });

    return ok ? new Response() : new Response("Upgrade failed", { status: 500 });
  }
};
