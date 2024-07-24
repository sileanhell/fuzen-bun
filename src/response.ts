import { Variables } from "./filter/handler.js";

export class IResponse {
  private headers: Record<string, string> = {};
  private status: number = 200;
  private variables: Variables;

  constructor(variables: Variables) {
    this.variables = variables;
  }

  setHeader(key: string, value: string) {
    this.headers = { ...this.headers, [key]: value };
    return this;
  }

  setHeaders(headers: { [key: string]: string }) {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  setStatus(status: number) {
    this.status = status;
    return this;
  }

  sendStatus(status: number) {
    this.status = status;
    this.variables.result = new Response(undefined, { status: this.status, headers: this.headers });
  }

  sendJson(data: { [key: string]: any } | { [key: string]: any }[]) {
    this.headers = { ...this.headers, "Content-Type": "application/json" };
    this.variables.result = new Response(JSON.stringify(data, null, 2), { status: this.status, headers: this.headers });
  }

  send(body?: BodyInit | null | undefined) {
    this.variables.result = new Response(body, { status: this.status, headers: this.headers });
  }

  pipe(stream: ReadableStream) {
    this.variables.result = new Response(stream, { status: this.status, headers: this.headers });
  }
}
