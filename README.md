# webpack4react

A hand-rolled Webpack 4 development setup for a small React 16 page.

**Wan Yau** · London · [WanCodes](https://github.com/WanCodes)

[![Webpack 4.29.6](https://img.shields.io/badge/Webpack-4.29.6-8DD6F9?logo=webpack&logoColor=white)](https://github.com/webpack/webpack/tree/v4.29.6)
[![React 16.8.6](https://img.shields.io/badge/React-16.8.6-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Babel 7.4](https://img.shields.io/badge/Babel-7.4-F9DC3E?logo=babel&logoColor=black)](https://babeljs.io/)

Webpack compiles `src/index.js`, Babel turns the JSX and class fields into plain JavaScript, and webpack-dev-server serves the page at [http://localhost:8080](http://localhost:8080). The screen is a class component with a counter and a three-item list, enough to show that the bundle mounts and that a click updates state.

The first commit is from April 2019. Versions in the tables below are the ones locked in `package-lock.json`.

## Page

[`src/index.html`](src/index.html) is the HtmlWebpackPlugin template. The mount node is `#app`, and the document title is “Webpack 4 React”. [`src/index.js`](src/index.js) renders `<App />` with `ReactDOM.render`.

[`src/App.js`](src/App.js) keeps the demo in one class:

- `state` starts as `{ counter: 0, data: ["a", "b", "c"] }`.
- `componentDidMount` sets `counter` to `1`, so the first paint shows `0` and the update shows `1`.
- **Click Me!** adds `1` to `counter`.
- `data` is rendered as a `<ul>` of `<li>` elements, with the array index as the key.

The class field (`state = …`) and the arrow handler (`buttonHandler = …`) go through `@babel/plugin-proposal-class-properties`. React 16.8.6 is the release that shipped Hooks; this page stays on a class so that plugin is on the compile path.

## Stack

| Piece | Locked version | Role |
| --- | --- | --- |
| Webpack | 4.29.6 | Bundler. `mode` is `"development"`, so `devtool` defaults to `"eval"` and `output.hashFunction` defaults to `"md4"`. |
| webpack-cli | 3.3.0 | CLI for a one-off `npx webpack` build. |
| webpack-dev-server | 3.2.1 | Dev server used by `npm start`. |
| React / ReactDOM | 16.8.6 | UI. Development builds are what get bundled. |
| `@babel/core` | 7.4.3 | Transform pipeline. |
| `@babel/preset-env` | 7.4.3 | Syntax for the browserslist targets shipped with that release. |
| `@babel/preset-react` | 7.0.0 | Classic JSX (`React.createElement`). `React` stays in scope. |
| `@babel/plugin-proposal-class-properties` | 7.4.0 | Instance fields and class arrow functions. |
| babel-loader | 8.0.5 | Runs Babel on `.js`. |
| html-webpack-plugin | 3.2.0 | Writes `index.html` from `src/index.html` and injects `bundle.js`. |
| css-loader | 2.1.1 | Reads `.css` imports. |
| style-loader | 0.23.1 | Injects that CSS into the page. |

`package.json` names the license ISC. This repository has no `LICENSE` file.

## Scripts

| Command | What it runs |
| --- | --- |
| `npm start` | `webpack-dev-server --open` |

That is the only script in `package.json`. There is no `build`, `test`, or `lint` script.

`npx webpack` reads the same config and writes `dist/bundle.js` plus `dist/index.html`. Because `mode` is fixed to `development`, that folder is an unminified development bundle (eval-wrapped modules, React development build). A fresh `npx webpack` here produced about 787 KiB of `bundle.js`. The dev server keeps its bundle in memory and does not write `dist/`. Its in-memory bundle is larger because the webpack-dev-server client is prepended to the entry.

## Run

```bash
npm install
```

The lockfile is `lockfileVersion` 1, from the npm 5–6 era. npm 10 prints an “old lockfile” warning and still installs. That install was run here with npm 10.9.9.

Webpack 4.29.6 hashes with MD4 (`output.hashFunction` defaults to `"md4"`). Node 17 and later ship OpenSSL 3, which refuses MD4 and aborts the build:

```text
Error: error:0308010C:digital envelope routines::unsupported
code: 'ERR_OSSL_EVP_UNSUPPORTED'
```

On those Node versions, turn the legacy OpenSSL provider on, then start the server:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

`npm start` binds to `localhost` on port **8080** and asks the OS to open that URL in the default browser. The server logs:

```text
ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
```

Leave that process running and open [http://localhost:8080](http://localhost:8080). The page title is “Webpack 4 React”. The body shows `Hello World!`, the counter, **Click Me!**, and the list `a`, `b`, `c`.

On a machine with no browser, `--open` can fail after the server is already listening. Start it without that flag:

```bash
NODE_OPTIONS=--openssl-legacy-provider npx webpack-dev-server
```

Port 8080 is fixed. If it is already taken, the process exits with `EADDRINUSE`.

Node 16 and earlier use OpenSSL 1.1.1, which still accepts MD4, so `NODE_OPTIONS` is for Node 17 and later. The failure without the flag, and a successful compile with it, were both checked on Node 22.23.4. With the flag, `npm`’s dev server logged `Compiled successfully.` and `GET /` returned the template with `<script src="bundle.js">` injected.

### Warnings that do not fail the build

- `Browserslist: caniuse-lite is outdated` comes from the browserslist data bundled with `@babel/preset-env` 7.4.3.
- `[BABEL] Note: The code generator has deoptimised the styling of …/react-dom.development.js` appears because the `.js` rule has no `exclude`, so Babel also parses dependencies, including the large ReactDOM development file.

## Configuration

[`webpack.config.js`](webpack.config.js):

| Setting | Value |
| --- | --- |
| `entry` | `./src/index.js` |
| `output.path` | `dist/` |
| `output.filename` | `bundle.js` |
| `mode` | `development` |
| `.js` rule | `babel-loader`, no `exclude` |
| `.css` rule | `style-loader`, then `css-loader` |
| plugins | `HtmlWebpackPlugin`, template `src/index.html` |

[`.babelrc`](.babelrc) lists `@babel/preset-env`, `@babel/preset-react`, and `@babel/plugin-proposal-class-properties`.

`package.json` sets `"main": "index.js"`. There is no root `index.js`. Webpack uses the `entry` above and does not read `main`.

Dev-server defaults in webpack-dev-server 3.2.1 are `host: "localhost"` and `inline: true`. `hot` is left unset, so `HotModuleReplacementPlugin` is not added. The inline client is prepended to the entry and reloads the whole page after a successful rebuild, which resets component state.

`.gitignore` ignores `/build` and `node_modules`. A CLI build writes `dist/`, and that directory is untracked.

Nothing under `src/` imports CSS. An `import` of a `.css` file from application code is injected by `style-loader`.

## Layout

```text
.babelrc
package.json
package-lock.json
webpack.config.js
src/
  index.html
  index.js
  App.js
```

## License

ISC, as declared in `package.json`.
