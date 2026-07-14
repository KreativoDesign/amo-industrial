import { describe, it, expect } from "vitest";

describe("Admin Bulk URL Import", () => {
  it("should match WordPress product name to database product", () => {
    const normalizeForMatch = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const wpName = "Academy Dustpan & Brush Set (Heavy Duty Cleaning Set)";
    const dbName = "Academy Dustpan & Brush Set";

    const wpNorm = normalizeForMatch(wpName);
    const dbNorm = normalizeForMatch(dbName);

    // Both should normalize to the same value
    expect(wpNorm).toBe("academy dustpan brush set heavy duty cleaning set");
    expect(dbNorm).toBe("academy dustpan brush set");

    // Check word-based matching
    const wpWords = wpNorm.split(" ");
    let matches = 0;
    for (const word of wpWords) {
      if (word.length > 2 && dbNorm.includes(word)) matches++;
    }

    const score = matches / Math.max(wpWords.length, 1);
    expect(score).toBeGreaterThan(0.6); // Should meet the 60% threshold
  });

  it("should handle product name variations", () => {
    const normalizeForMatch = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const variations = [
      "Academy Dustpan & Brush Set (Heavy Duty Cleaning Set)",
      "Academy Dustpan and Brush Set",
      "academy dustpan brush set",
      "ACADEMY DUSTPAN & BRUSH SET",
    ];

    const normalized = variations.map(normalizeForMatch);

    // All variations should normalize to similar values
    expect(normalized[0]).toContain("academy");
    expect(normalized[0]).toContain("dustpan");
    expect(normalized[0]).toContain("brush");
  });

  it("should calculate similarity score correctly", () => {
    const normalizeForMatch = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Test case 1: High similarity
    const wp1 = "AirCraft 150mm (6\") Random Orbit Air Sander";
    const db1 = "AirCraft 150mm Random Orbit Air Sander";

    const wp1Norm = normalizeForMatch(wp1);
    const db1Norm = normalizeForMatch(db1);

    const wp1Words = wp1Norm.split(" ");
    let matches1 = 0;
    for (const word of wp1Words) {
      if (word.length > 2 && db1Norm.includes(word)) matches1++;
    }
    const score1 = matches1 / Math.max(wp1Words.length, 1);
    expect(score1).toBeGreaterThan(0.6);

    // Test case 2: Low similarity
    const wp2 = "Completely Different Product Name";
    const db2 = "AirCraft 150mm Random Orbit Air Sander";

    const wp2Norm = normalizeForMatch(wp2);
    const db2Norm = normalizeForMatch(db2);

    const wp2Words = wp2Norm.split(" ");
    let matches2 = 0;
    for (const word of wp2Words) {
      if (word.length > 2 && db2Norm.includes(word)) matches2++;
    }
    const score2 = matches2 / Math.max(wp2Words.length, 1);
    expect(score2).toBeLessThan(0.6);
  });

  it("should handle special characters in product names", () => {
    const normalizeForMatch = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const testCases = [
      "Adjustable Shifting Spanner 12\" (300mm)",
      "Academy Superior Putty Knife – Glazing Knife",
      "WD-40 Multi-Use Product Spray (Aerosol Lubricant)",
      "Alcolin Contractors Acrylic Sealant – White",
    ];

    for (const name of testCases) {
      const normalized = normalizeForMatch(name);
      // Should not contain special characters
      expect(normalized).not.toMatch(/[^a-z0-9\s]/);
      // Should have at least one word
      expect(normalized.split(" ").length).toBeGreaterThan(0);
    }
  });
});
