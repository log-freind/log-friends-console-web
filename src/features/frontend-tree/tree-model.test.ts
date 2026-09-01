import { describe, expect, it } from "vitest";
import { buildFrontendTrees } from "./tree-model";

describe("buildFrontendTrees", () => {
  it("groups browser events by page and builds component ancestry", () => {
    const trees = buildFrontendTrees([
      {
        sourceType: "BROWSER",
        pagePath: "/trips/new",
        componentPath: { items: ["TripForm", "SubmitButton"] },
      },
      {
        sourceType: "BROWSER",
        pagePath: "/trips/new",
        componentPath: '{"items":["TripForm","DateRangeInput"]}',
      },
      {
        pagePath: "/trips/new",
        componentName: "ThemeChips",
        parentComponentName: "TripForm",
      },
      { sourceType: "NODE", pagePath: "/trips/new", componentName: "Ignored" },
    ]);

    expect(trees).toEqual([{
      pagePath: "/trips/new",
      eventCount: 3,
      roots: [{
        name: "TripForm",
        eventCount: 3,
        children: [
          { name: "DateRangeInput", eventCount: 1, children: [] },
          { name: "SubmitButton", eventCount: 1, children: [] },
          { name: "ThemeChips", eventCount: 1, children: [] },
        ],
      }],
    }]);
  });
});
