import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import type { Connect, Plugin } from 'vite';

// Mirrors packages/lib/config/rollup.dev.js and packages/server/index.js - loads IS_HTTPS,
// CERT_PATH, CERT_KEY_PATH, CLIENT_KEY, SF_ENV, CLIENT_ENV etc. from the repo-root .env. Without
// this, those env vars are only picked up if exported inline in the shell.
dotenv.config({ path: path.resolve(__dirname, '../../../', '.env') });

const root = path.resolve(__dirname, '../src/pages');
const publicDir = path.resolve(__dirname, '../public');
const libDistDir = path.resolve(__dirname, '../../lib/dist');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 3020;
const isHttps = process.env.IS_HTTPS === 'true';
const certPath = process.env.CERT_PATH ?? path.resolve(__dirname, 'localhost.pem');
const certKeyPath = process.env.CERT_KEY_PATH ?? path.resolve(__dirname, 'localhost-key.pem');

// The mock API (`@adyen/adyen-web-server`) always runs as its own process on port 3030 - see the root `start` script.
// We set apiTarget here, pointing to localhost:3030, and then proxy to it (see around line 151 we set server.proxy).
// By doing this (rather than mounting Express as dev-server middleware), we sidestep a Vite/Node incompatibility where Vite's `server.https` upgrades to
// HTTP/2, which crashes when an Express 5 app handles the request.
// Configuring `server.proxy` makes Vite downgrade to TLS-only, avoiding that entirely.
const apiTarget = `${isHttps ? 'https' : 'http'}://localhost:3030`;

// NOTE: The first page in the array will be considered the index page.
const htmlPages = [
    { name: 'Drop-in', id: 'Dropin' },
    { name: 'Drop-in UMD', id: 'DropinUMD' },
    { name: 'Drop-in Auto', id: 'DropinAuto' },
    { name: 'Cards', id: 'Cards' },
    { name: 'Components', id: 'Components' },
    { name: 'Gift Cards', id: 'GiftCards' },
    { name: 'Helpers', id: 'Helpers' },
    { name: 'Issuer Lists', id: 'IssuerLists' },
    { name: 'Open Invoices', id: 'OpenInvoices' },
    { name: 'QR Codes', id: 'QRCodes' },
    { name: 'Custom Cards', id: 'CustomCards' },
    { name: 'ThreeDS2', id: 'ThreeDS' },
    { name: 'Vouchers', id: 'Vouchers' },
    { name: 'Wallets', id: 'Wallets' },
    { name: 'Result', id: 'Result' }
];

// Replicates the webpack-dev-server "clean URL" routing (`/`, `/cards`, `/dropinauto`, ...)
// by rewriting the request onto the page's physical .html file before Vite's own middlewares run.
const cleanUrlToHtmlFile = (url: string): string | null => {
    const cleanUrl = url.split('?')[0];
    const index = htmlPages.findIndex((page, i) => cleanUrl === `/${i ? page.id.toLowerCase() : ''}`);
    if (index === -1) return null;
    const { id } = htmlPages[index];
    return `/${id}/${id}.html`;
};

const adyenPlaygroundPlugin = (): Plugin => {
    // `yarn start` rebuilds the library in watch mode concurrently. Rollup's rebuild writes many
    // interdependent files (preserveModules) non-atomically, so letting Vite's own watcher
    // granularly HMR-update each one as it's written races ahead of the build and can fetch a
    // module before a file it imports has been rewritten (leads to a "does not provide an
    // export" error). Instead we debounce until the whole rebuild has settled, then force a
    // single full reload. Shared between `configureServer` and `handleHotUpdate` below.
    let reloadTimer: NodeJS.Timeout;

    return {
        name: 'adyen-playground',
        configureServer(server) {
            const cleanUrlMiddleware: Connect.NextHandleFunction = (req, res, next) => {
                const rewritten = req.url && cleanUrlToHtmlFile(req.url);
                if (rewritten) {
                    const [, search = ''] = (req.url as string).split('?');
                    req.url = search ? `${rewritten}?${search}` : rewritten;
                }
                next();
            };

            server.middlewares.use(cleanUrlMiddleware);

            // `libDistDir` is outside the project root, so Vite's watcher doesn't pick it up by
            // default - add it explicitly. Chokidar handles a `dist` that doesn't exist yet (e.g.
            // clean checkout, or before the lib's first build finishes) and starts watching once
            // it's created, so no manual existence polling is needed.
            server.watcher.add(libDistDir);
        },
        handleHotUpdate({ file, server }) {
            if (file.startsWith(libDistDir)) {
                clearTimeout(reloadTimer);
                reloadTimer = setTimeout(() => {
                    // Vite's transform cache for these `/@fs/` modules is never invalidated by the
                    // rebuild itself - clear it manually before reloading.
                    server.moduleGraph.invalidateAll();
                    server.ws.send({ type: 'full-reload' });
                }, 300);
                // Prevents Vite's default granular HMR for these files from racing ahead of the
                // (still in-progress) build - see comment above.
                return [];
            }
        },
        transformIndexHtml(html) {
            return html.replace(/<%=\s*JSON\.stringify\(htmlWebpackPlugin\.htmlPages\)\s*\|\|\s*''\s*%>/g, JSON.stringify(htmlPages));
        }
    };
};

export default defineConfig({
    root,
    publicDir,
    // @preact/preset-vite's default `exclude` is only `[/node_modules/]`. The lib is consumed
    // through a workspace symlink though, and Vite resolves it to its real path
    // (packages/lib/dist/...), which doesn't match that pattern - so its whole pre-built output
    // was being re-run through Preact's JSX/Prefresh Babel transform on every request.
    plugins: [preact({ exclude: [/node_modules/, `${libDistDir}/**`] }), adyenPlaygroundPlugin()],

    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
    },

    css: {
        postcss: __dirname
    },

    define: {
        'process.env.__SF_ENV__': JSON.stringify(process.env.SF_ENV || 'build'),
        'process.env.__CLIENT_KEY__': JSON.stringify(process.env.CLIENT_KEY || null),
        'process.env.__CLIENT_ENV__': JSON.stringify(process.env.CLIENT_ENV || 'test')
    },

    server: {
        host,
        port,
        strictPort: true,
        https: isHttps
            ? {
                  cert: fs.readFileSync(certPath),
                  key: fs.readFileSync(certKeyPath)
              }
            : undefined,
        proxy: {
            '/api': { target: apiTarget, secure: false },
            '/sdk': { target: apiTarget, secure: false }
        }
    }
});
