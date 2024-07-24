<div align="center">
<img src="https://i.imgur.com/GpACQET.png" width="200" />
<p>
<a href="https://npmjs.com/package/fuzen-bun"><img src="https://img.shields.io/npm/v/fuzen-bun?color=%23B38BEA" /></a>
<a href="https://npmjs.com/package/fuzen-bun"><img src="https://img.shields.io/npm/d18m/fuzen-bun?color=%23B38BEA" /></a>
</p>

<br />
<p align="center">
<b>FUZEN BUN</b> is a high performance HTTP & WEBSOCKET server with a simple-to-use API powered by
<a href="https://bun.sh/">Bun</a>.
</p>
</div>
<br />

## 📦 Key Features

- **HTTP Middleware** - Easily integrate custom middleware functions to process requests and responses.
- **Raw & JSON body parse from POST** - Automatically parse incoming POST request bodies, supporting both raw data and JSON formats.
- **Async requests** - Effortlessly handle asynchronous operations within your request handlers.
- **Implemented middlewares** - Cors, Rate Limit - all included, with no third-party libraries.
  <br />
  <br />
  _And much more coming soon..._

## 🚀 Getting Started

### ⚙️ Installation

```sh
bun add fuzen-bun
```

### 🤖 Basic usage example

```ts
import { Fuzen } from "fuzen-bun";

const server = new Fuzen({ server: { port: 8080 } });

server.get("/", (request, response) => {
  response.send("Hello, Fuzen! 👋");
});

server.listen();
```

### 👷 Advanced examples

You can see the examples in our 
[tests](https://github.com/sileanhell/fuzen-bun/tree/main/tests).

## 🤝 Contributing

We welcome contributions from the community to make FUZEN even more robust and feature-rich. Feel free to open issues, submit pull requests, or provide feedback to help us improve and evolve this tool.

- **[Submit Pull Requests](https://github.com/sileanhell/fuzen/pulls)**: Review open PRs, and submit your own PRs.
- **[Report Issues](https://github.com/sileanhell/fuzen/issues)**: Submit bugs found or log feature requests for Fuzen.
