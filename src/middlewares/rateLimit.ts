import Crypto from "crypto";
import { IRequest } from "../request.js";
import { IResponse } from "../response.js";

type options = {
  windowMs: number;
  limit: number;
  response?: { status?: number; message?: string };
  key?: (request: IRequest, next: Map<any, any>) => string;
  headers?: boolean;
};

const clients = new Map<string, { connections: number; expired: number }>();
let interval: Timer | undefined = undefined;

export const rateLimit = (options?: options) => (request: IRequest, response: IResponse, next: Map<any, any>) => {
  const config = options || { windowMs: 15 * 60 * 1000, limit: 100 };

  if (!interval) {
    interval = setInterval(() => {
      if (clients.size > 0) {
        clients.forEach((value, key) => (Date.now() >= value.expired ? clients.delete(key) : null));
      } else {
        clearInterval(interval);
        interval = undefined;
      }
    }, config.windowMs + 60 * 1000);
  }

  const key = config.key
    ? config.key(request, next)
    : (() => {
        const ip = request.getHeader("CF-Connecting-IP") || request.getHeader("X-Forwarded-For") || request.getRemoteAddress();
        if (!ip) return response.setStatus(400).send("Wrong IP address.");

        const userAgent = request.getHeader("User-Agent");
        if (!userAgent) return response.setStatus(400).send("Wrong User-Agent.");

        return Crypto.createHash("md5").update(`${ip}:${userAgent}`).digest("hex");
      })();

  if (!key) return response.setStatus(500).send("Unique key not found.");

  const client = clients.get(key);

  if (client) {
    if (Date.now() >= client.expired) {
      clients.set(key, { connections: 1, expired: Date.now() + config.windowMs });
    } else if (client.connections >= config.limit) {
      return response.setStatus(config.response?.status || 429).send(config.response?.message || "Too Many Requests.");
    } else {
      clients.set(key, { connections: client.connections + 1, expired: client.expired });
    }
  } else {
    clients.set(key, { connections: 1, expired: Date.now() + config.windowMs });
  }

  const updatedClient = clients.get(key);

  if (config.headers && updatedClient) {
    response.setHeaders({
      "RateLimit-Limit": String(config.limit),
      "RateLimit-Remaining": String(config.limit - updatedClient.connections),
      "RateLimit-Reset": String(updatedClient.expired),
    });
  }

  next.set("rateLimit", updatedClient);
};
