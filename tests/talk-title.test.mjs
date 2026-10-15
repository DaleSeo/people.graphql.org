import test from "node:test";
import assert from "node:assert/strict";
import { talkTitle } from "../scripts/talk-title.mjs";

test("speaker credits are stripped without splitting title punctuation", () => {
  assert.equal(
    talkTitle(
      "GraphQL Mesh - A Federated Gateway - Arda Tanrikulu & Gil Gardosh, The Guild [Pre-Registration Required]",
      [{ name: "Arda Tanrıkulu" }, { name: "Gil Gardosh" }],
    ),
    "GraphQL Mesh - A Federated Gateway",
  );
  assert.equal(
    talkTitle("@async: Defer Even More! - Matt Mahoney, Meta", [
      { name: "Matthew Mahoney" },
    ]),
    "@async: Defer Even More!",
  );
  assert.equal(
    talkTitle("OpenTelemetry Help? - Budha Bhattacharya, Tyk", [
      { name: "Budhaditya Bhattacharya" },
    ]),
    "OpenTelemetry Help?",
  );
  assert.equal(
    talkTitle("Sponsored Keynote: Uri Goldshtein, The Guild", [
      { name: "Uri Goldshtein" },
    ]),
    "Sponsored Keynote",
  );
  assert.equal(
    talkTitle("GraphQL - Past and Future", [{ name: "Lee Byron" }]),
    "GraphQL - Past and Future",
  );
  assert.equal(
    talkTitle("Title - Lee Byronson's Approach", [{ name: "Lee Byron" }]),
    "Title - Lee Byronson's Approach",
  );
  assert.equal(talkTitle("No speakers - Keep this"), "No speakers - Keep this");
});
