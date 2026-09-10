import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyRestaurantLeadPitch,
  chunkRestaurantLeadItems,
  clampRestaurantLeadChunkSize,
  parseRestaurantLeadBulkFilters,
  parseRestaurantLeadBulkSource,
  restaurantLeadDraftQuality,
  restaurantLeadFactSafety,
} from "@/lib/admin/restaurant-lead-bulk";

test("bulk source defaults to restaurant leads, not CRM groups", () => {
  assert.equal(parseRestaurantLeadBulkSource(undefined), "leads");
  assert.equal(parseRestaurantLeadBulkSource("crm"), "crm");
});

test("status filter defaults to READY_FOR_REVIEW never ALL", () => {
  assert.equal(parseRestaurantLeadBulkFilters({}).status, "READY_FOR_REVIEW");
  assert.equal(parseRestaurantLeadBulkFilters({ status: "ALL" }).status, "ALL");
});

test("chunk size is internal only and defaults to 10", () => {
  assert.equal(clampRestaurantLeadChunkSize("20"), 20);
  assert.equal(clampRestaurantLeadChunkSize("7"), 10);
  assert.equal(clampRestaurantLeadChunkSize(undefined), 10);
});

test("internal chunking covers every selected recipient in one plan", () => {
  const chunks = chunkRestaurantLeadItems(Array.from({ length: 50 }, (_, index) => index), 10);
  assert.equal(chunks.length, 5);
  assert.deepEqual(
    chunks.map((chunk) => chunk.length),
    [10, 10, 10, 10, 10],
  );
  assert.equal(chunks.flat().length, 50);
});

test("pitch classifier uses the lead draft, not a generic template", () => {
  assert.equal(
    classifyRestaurantLeadPitch({ primaryOpportunity: "Yeni premium website + SEO" }),
    "PREMIUM_WEBSITE",
  );
  assert.equal(classifyRestaurantLeadPitch({ primaryOpportunity: "Mobil rezervasyon" }), "RESERVATION");
  assert.equal(classifyRestaurantLeadPitch({ salkayPitch: "Local SEO ve Google Maps" }), "LOCAL_SEO");
});

test("fact safety and draft quality keep personalized restaurant drafts", () => {
  const lead = {
    restaurantName: "Palukçu Restaurant",
    emailStatus: "READY_FOR_REVIEW",
    emailSubject: "Palukçu için premium website",
    emailBody:
      "Merhaba Palukçu ekibi,\n\nSALKAY olarak Palukçu için mevcut siteyi premium bir web katmanına taşıyabiliriz. Mobil kullanım, rezervasyon yolu ve SEO aynı paketin parçası.\n\nSalih Kaya\nSALKAY",
  };
  assert.equal(restaurantLeadFactSafety(lead).ok, true);
  assert.equal(restaurantLeadDraftQuality(lead).ok, true);
});
