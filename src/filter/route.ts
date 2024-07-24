import { Server } from "bun";
import { IRequest } from "../request.js";
import { IResponse } from "../response.js";
import { Variables } from "./handler.js";

export type IRoute = (request: IRequest, response: IResponse, next: Map<any, any>) => unknown;
export type IRoutes = Map<string, { [key: string]: IRoute[] }>;

export const route = async (request: Request, server: Server, path: string, url: string, middlewares: IRoute[], routes: IRoutes) => {
  if (new RegExp("^" + path.replace(/:([^\/]+)/g, "([^/]+)") + "$").test(url)) {
    const variables: Variables = { next: new Map() };

    const custom_request = new IRequest(request, server, path);
    const custom_response = new IResponse(variables);

    for (const middleware of middlewares) {
      await middleware(custom_request, custom_response, variables.next);
      if (variables.result) return variables.result;
    }

    const methods = routes.get(path);
    if (!methods) return new Response(undefined, { status: 404 });

    const handlers: IRoute[] | undefined = methods[request.method.toLowerCase()];
    if (!handlers) return new Response(undefined, { status: 404 });

    for (const handler of handlers) {
      await handler(custom_request, custom_response, variables.next);
      if (variables.result) return variables.result;
    }

    return new Response(undefined, { status: 404 });
  }
};
