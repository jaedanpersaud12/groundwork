import { afterEach, describe, expect, test } from "bun:test";

import { getJson } from "./registry";

let server: ReturnType<typeof Bun.serve> | null = null;

afterEach(() => {
  server?.stop(true);
  server = null;
});

describe("getJson", () => {
  test("retries a 5xx and succeeds on a later attempt", async () => {
    let calls = 0;
    server = Bun.serve({
      port: 0,
      fetch: () => (++calls < 3 ? new Response("busy", { status: 503 }) : Response.json({ ok: true })),
    });
    expect(await getJson<{ ok: boolean }>(`http://localhost:${server.port}/r/registry.json`, [1, 1, 1])).toEqual({ ok: true });
    expect(calls).toBe(3);
  });

  test("doesn't retry a 4xx: it's an answer, not a blip", async () => {
    let calls = 0;
    server = Bun.serve({ port: 0, fetch: () => (calls++, new Response("nope", { status: 404 })) });
    await expect(getJson(`http://localhost:${server.port}/missing.json`, [1, 1, 1])).rejects.toThrow("returned 404");
    expect(calls).toBe(1);
  });

  test("gives up on a refused connection with a message that says it's usually transient", async () => {
    const probe = Bun.serve({ port: 0, fetch: () => new Response() });
    const port = probe.port;
    probe.stop(true);
    await expect(getJson(`http://localhost:${port}/r/registry.json`, [1, 1])).rejects.toThrow(/after 3 attempts.*usually transient/);
  });
});
