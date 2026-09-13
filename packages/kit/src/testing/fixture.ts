import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * A consumer project and a registry that exist only for one test. The registry is
 * fabricated rather than pointed at the real one, so a test can publish `2.0.0` of
 * something, or change a file between versions, without touching anything that ships.
 */

type FixtureFile = { path: string; content: string; type?: string; target?: string };

type FixtureItem = {
  name: string;
  version: string;
  type?: string;
  track?: "minor" | "patch" | "none";
  files: FixtureFile[];
  registryDependencies?: string[];
  dependencies?: string[];
};

type Registry = {
  url: string;
  /** Publishes a version: served at `/r/v/<name>@<version>.json`, and as the current `/r/<name>.json`. */
  publish: (item: FixtureItem) => void;
  close: () => Promise<void>;
};

function toRegistryItem(item: FixtureItem) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type ?? "registry:ui",
    ...(item.dependencies ? { dependencies: item.dependencies } : {}),
    ...(item.registryDependencies ? { registryDependencies: item.registryDependencies } : {}),
    files: item.files.map((file) => ({ type: "registry:ui", ...file })),
    meta: { version: item.version, tier: "primitive", track: item.track ?? "minor" },
  };
}

async function startRegistry(): Promise<Registry> {
  const routes = new Map<string, string>();
  const server: Server = createServer((request, response) => {
    const body = routes.get(new URL(request.url ?? "/", "http://fixture").pathname);
    response.writeHead(body ? 200 : 404, { "content-type": "application/json" });
    response.end(body ?? JSON.stringify({ error: "not found" }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    publish(item) {
      const json = JSON.stringify(toRegistryItem(item), null, 2);
      routes.set(`/r/v/${item.name}@${item.version}.json`, json);
      routes.set(`/r/${item.name}.json`, json);
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

type Project = { dir: string; remove: () => void };

/**
 * The smallest project `shadcn add` accepts, verified in step 1 of the build. Aliases are
 * deliberately not the defaults (`@/ui`, `@/shared`), so a test that passes can't be passing
 * because registry paths and project paths happen to look alike.
 */
function createProject(registryUrl: string): Project {
  const dir = mkdtempSync(path.join(tmpdir(), "kit-fixture-"));
  mkdirSync(path.join(dir, "app"));
  writeFileSync(path.join(dir, "app", "globals.css"), "");
  writeFileSync(path.join(dir, "package.json"), `${JSON.stringify({ name: "fixture", private: true, type: "module" }, null, 2)}\n`);
  writeFileSync(
    path.join(dir, "tsconfig.json"),
    `${JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["./*"] }, jsx: "preserve", strict: true } }, null, 2)}\n`,
  );
  writeFileSync(
    path.join(dir, "components.json"),
    `${JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "base-nova",
        rsc: true,
        tsx: true,
        tailwind: { config: "", css: "app/globals.css", baseColor: "neutral", cssVariables: true, prefix: "" },
        iconLibrary: "lucide",
        aliases: { components: "@/components", utils: "@/shared/cn", ui: "@/ui", lib: "@/shared", hooks: "@/hooks" },
        registries: { "@ja3dan": `${registryUrl}/r/{name}.json` },
      },
      null,
      2,
    )}\n`,
  );
  const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, stdio: "ignore" });
  git("init", "-q");
  git("add", "-A");
  git("-c", "user.name=fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "fixture");
  return { dir, remove: () => rmSync(dir, { recursive: true, force: true }) };
}

export { createProject, startRegistry, toRegistryItem, type FixtureFile, type FixtureItem, type Project, type Registry };
