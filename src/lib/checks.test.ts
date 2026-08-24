import { describe, expect, it } from "vitest";
import { runLocalChecks } from "./checks";
import { EMPTY_APPLICATION } from "./types";

describe("runLocalChecks", () => {
  it("flags invalid travel dates", () => {
    const data = structuredClone(EMPTY_APPLICATION);
    data.trip.arrivalDate = "2026-10-10";
    data.trip.departureDate = "2026-10-09";
    expect(runLocalChecks(data).some((item) => item.code === "invalid-trip-dates")).toBe(true);
  });
  it("flags a funding gap", () => {
    const data = structuredClone(EMPTY_APPLICATION);
    data.finance.estimatedCost = "2000";
    data.finance.personalFunds = "500";
    data.finance.sponsorAmount = "1000";
    expect(runLocalChecks(data).some((item) => item.code === "funding-gap")).toBe(true);
  });
  it("accepts a funded case", () => {
    const data = structuredClone(EMPTY_APPLICATION);
    data.finance.estimatedCost = "2000";
    data.finance.personalFunds = "2500";
    expect(runLocalChecks(data).some((item) => item.code === "funding-gap")).toBe(false);
  });
});
