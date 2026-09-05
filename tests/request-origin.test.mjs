import test from "node:test";
import assert from "node:assert/strict";
import { sameOrigin } from "../lib/request-origin.ts";
test("origin checks accept deployment Host without trusting forwarded host", () => {
  const request = (origin, host = "127.0.0.1:4174") =>
    new Request("http://localhost:4174/api", {
      headers: { origin, host, "x-forwarded-host": "evil.test" },
    });
  assert.equal(sameOrigin(request("http://127.0.0.1:4174")), true);
  for (const origin of [
    "null",
    "invalid",
    "https://127.0.0.1:4174",
    "http://evil.test",
    "http://127.0.0.1:4174/path",
  ])
    assert.equal(sameOrigin(request(origin)), false);
  assert.equal(
    sameOrigin(
      new Request("https://career.example/api", {
        headers: { host: "career.example", origin: "https://career.example" },
      }),
    ),
    true,
  );
});
