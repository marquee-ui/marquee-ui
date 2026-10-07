import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function registryItemPath(pathname) {
  return /^\/[a-z][a-z-]*\.json$/.test(pathname) ? pathname.slice(1) : null;
}

export function createRegistryServer(directory) {
  return createServer(async (request, response) => {
    const item = registryItemPath(request.url ?? "");
    if (request.method !== "GET" || !item) {
      response.writeHead(404).end("Registry item not found");
      return;
    }
    try {
      const json = await readFile(join(directory, item));
      response.writeHead(200, { "Content-Type": "application/json" }).end(json);
    } catch {
      response.writeHead(404).end("Registry item not found");
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.CONSUMER_REGISTRY_PORT ?? 4186);
  const directory = join(process.cwd(), "node_modules/@marquee-ui/ui/r");
  const server = createRegistryServer(directory);
  server.listen(port, "127.0.0.1", () => {
    console.log(`Installed npm registry: http://127.0.0.1:${port}/{name}.json`);
  });
}
