import { describe, it, expect } from "vitest";
import { distanceKm, CITY_COORDS } from "./geo";

describe("distanceKm", () => {
  it("is zero for identical points", () => {
    expect(distanceKm(12.9716, 77.5946, 12.9716, 77.5946)).toBeCloseTo(0, 5);
  });

  it("is symmetric", () => {
    const [aLat, aLng] = CITY_COORDS.Bengaluru;
    const [bLat, bLng] = CITY_COORDS.Mumbai;
    expect(distanceKm(aLat, aLng, bLat, bLng)).toBeCloseTo(distanceKm(bLat, bLng, aLat, aLng), 6);
  });

  it("matches the known Bengaluru–Mumbai great-circle distance (~837 km)", () => {
    const [aLat, aLng] = CITY_COORDS.Bengaluru;
    const [bLat, bLng] = CITY_COORDS.Mumbai;
    const d = distanceKm(aLat, aLng, bLat, bLng);
    expect(d).toBeGreaterThan(820);
    expect(d).toBeLessThan(850);
  });

  it("computes ~111 km for one degree of latitude", () => {
    expect(distanceKm(0, 0, 1, 0)).toBeCloseTo(111.19, 0);
  });
});
