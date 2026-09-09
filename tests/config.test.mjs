import test from "node:test";
import assert from "node:assert/strict";
import { hasFirebaseConfig } from "../src/utils/firebase/config.ts";

test("missing or example configuration cannot initialize messaging", () => {
  const config = { apiKey: "key", projectId: "project", messagingSenderId: "123", appId: "app" };
  assert.equal(hasFirebaseConfig(config, "public-key"), true);
  for (const value of [undefined, "", "   ", "your-web-api-key"]) {
    assert.equal(hasFirebaseConfig({ ...config, apiKey: value }, "public-key"), false);
    assert.equal(hasFirebaseConfig(config, value), false);
  }
});
