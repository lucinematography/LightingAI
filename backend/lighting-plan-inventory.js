import {isBlockedCompatibilityStatus} from "./accessory-graph.js";

function fail(reason, details = {}, input = false) {
  throw Object.assign(new Error(reason), {
    code: input ? "LIGHTING_INVENTORY_INVALID" : "LIGHTING_PLAN_INVENTORY",
    status: input ? 422 : 502, inventory: {reason, ...details}
  });
}
const label = item => [item.manufacturer, item.model].filter(Boolean).join(" ");
const sameName = (name, item) => typeof name === "string" &&
  [item.model, label(item)].some(value => value && value.trim().toLowerCase() === name.trim().toLowerCase());

export function prepareLightingInventory(equipment, catalog) {
  if (!Array.isArray(equipment) || !equipment.length) fail("selection_required", {}, true);
  const fixtureById = new Map(catalog.fixtures.map(item => [item.id, item]));
  const accessoryById = new Map(catalog.accessories.map(item => [item.id, item]));
  const selected = new Map();
  for (const item of equipment) {
    const ids = [item?.id, item?.fixtureId, item?.accessoryId].filter(value => value !== undefined && value !== "");
    if (!ids.length || ids.some(id => typeof id !== "string" || id !== ids[0]) || item?.kitId) {
      fail("selection_id", {}, true);
    }
    const id = ids[0];
    const fixture = fixtureById.get(id), accessory = accessoryById.get(id);
    if ((!fixture && !accessory) || (fixture && accessory) ||
      (item.fixtureId && !fixture) || (item.accessoryId && !accessory)) fail("selection_id", {}, true);
    if (selected.has(id)) fail("duplicate_selection", {}, true);
    const rawQty = item.qty === undefined ? 1 : item.qty;
    const qty = (typeof rawQty === "number" || (typeof rawQty === "string" && /^\d+$/.test(rawQty))) ? Number(rawQty) : NaN;
    if (!Number.isSafeInteger(qty) || qty < 1 || qty > 1000) fail("selection_quantity", {}, true);
    const record = fixture || accessory;
    selected.set(id, {id, name: label(record), qty, kind: fixture ? "fixture" : "accessory",
      ...(fixture ? {fixtureId:id} : {accessoryId:id})});
  }
  if (![...selected.values()].some(item => item.kind === "fixture")) fail("selection_required", {}, true);
  // Kits without ID-linked component quantities and legacy name-only items are
  // deliberately not expanded or matched by name. Select their physical items.
  return {selected, fixtureById, accessoryById, equipment: [...selected.values()]};
}

export function assertLightingPlanInventory(plan, inventory) {
  const lights = plan?.lighting_diagram?.lights;
  if (!Array.isArray(lights)) fail("lights_required");
  const usedFixtures = new Map(), chargedAccessories = new Map(), lightIds = new Set();
  const usedNames = new Map();
  for (const light of lights) {
    if (!light || typeof light !== "object" || Array.isArray(light) ||
      typeof light.id !== "string" || !light.id || lightIds.has(light.id)) fail("light_instance");
    lightIds.add(light.id);
    if (["qty", "quantity", "count"].some(key => light[key] !== undefined && light[key] !== 1)) fail("light_instance");
    const fixture = inventory.fixtureById.get(light.fixtureId);
    const selected = inventory.selected.get(light.fixtureId);
    if (!fixture || selected?.kind !== "fixture") fail("fixture_unavailable");
    if (!sameName(light.fixture, fixture)) fail("fixture_label");
    const proposed = (usedFixtures.get(fixture.id) || 0) + 1;
    usedFixtures.set(fixture.id, proposed);
    if (proposed > selected.qty) fail("fixture_quantity", {fixtureId: fixture.id, name: label(fixture), available: selected.qty, proposed});
    usedNames.set(label(fixture).toLowerCase(), fixture);
    usedNames.set(fixture.model.toLowerCase(), fixture);

    if (!Array.isArray(light.accessoryIds) || !Array.isArray(light.accessories) ||
      light.accessoryIds.length !== light.accessories.length) fail("accessory_ids");
    const mounted = new Map(), freeIncluded = new Set();
    for (let i = 0; i < light.accessoryIds.length; i++) {
      const id = light.accessoryIds[i];
      const accessory = inventory.accessoryById.get(id);
      if (!accessory || !sameName(light.accessories[i], accessory)) fail("accessory_unavailable");
      const status = accessory.compatibility?.[fixture.id]?.status || accessory.compatibilityStatus;
      if (isBlockedCompatibilityStatus(status)) fail("accessory_incompatible");
      // At most one documented included item per physical fixture. Included
      // items for a different fixture or a missing parent are not free stock.
      const included = accessory.includedWithFixture === true &&
        accessory.compatibleWith?.includes(fixture.id) && !freeIncluded.has(id);
      if (included) freeIncluded.add(id);
      else {
        const available = inventory.selected.get(id);
        if (available?.kind !== "accessory") fail("accessory_unavailable");
        const count = (chargedAccessories.get(id) || 0) + 1;
        chargedAccessories.set(id, count);
        if (count > available.qty) fail("accessory_quantity", {name: label(accessory), available: available.qty, proposed: count});
      }
      mounted.set(id, accessory);
      usedNames.set(label(accessory).toLowerCase(), accessory);
      usedNames.set(accessory.model.toLowerCase(), accessory);
    }
    // Every dependent accessory needs an actual path through parents mounted
    // on this same light, not merely a parent selected somewhere in inventory.
    const reachable = new Set([fixture.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const [id, accessory] of mounted) {
        if (!reachable.has(id) && accessory.compatibleWith?.some(parent => reachable.has(parent))) {
          reachable.add(id); changed = true;
        }
      }
    }
    if ([...mounted.keys()].some(id => !reachable.has(id))) fail("accessory_parent");
    if (light.modifier || (Array.isArray(light.modifiers) && light.modifiers.length)) fail("accessory_ids");
  }
  // Free-text prose is not machine-verifiable inventory. This displayed list
  // must contain exact catalog labels of the ID-verified items actually used.
  if (plan.equipment_list !== undefined) {
    if (!Array.isArray(plan.equipment_list)) fail("equipment_list");
    for (const name of plan.equipment_list) {
      if (typeof name !== "string" || !usedNames.has(name.trim().toLowerCase())) fail("equipment_list");
    }
  }
  return plan; // Never delete, replace or silently reduce proposed equipment.
}

export function lightingInventoryFailure(error, language = "sr") {
  if (!["LIGHTING_INVENTORY_INVALID", "LIGHTING_PLAN_INVENTORY"].includes(error?.code) || !error.inventory) return null;
  const en = language === "en", detail = error.inventory;
  let message;
  if (["fixture_quantity", "accessory_quantity"].includes(detail.reason)) {
    message = en ? `AI plan rejected: ${detail.name} requires ${detail.proposed}, but only ${detail.available} available. PDF export is blocked.`
      : `AI plan je odbijen: za ${detail.name} predloženo je ${detail.proposed}, a dostupno je ${detail.available}. PDF izvoz je blokiran.`;
  } else if (error.code === "LIGHTING_INVENTORY_INVALID") {
    message = en ? "Selected equipment has unknown/conflicting catalog IDs or invalid quantities. Select individual catalog fixtures/accessories with confirmed quantities; a kit name alone is insufficient."
      : "Izabrana oprema ima nepoznate/neusklađene kataloške ID-jeve ili neispravne količine. Izaberi pojedinačne lampe i dodatke iz kataloga sa potvrđenim količinama; sam naziv kompleta nije dovoljan.";
  } else {
    message = en ? "AI plan rejected: unknown, unavailable or inconsistent equipment/accessory IDs, quantities or mounting dependencies. PDF export is blocked."
      : "AI plan je odbijen: nepoznate, nedostupne ili neusaglašene lampe/dodaci, ID-jevi, količine ili potrebni adapteri. PDF izvoz je blokiran.";
  }
  return {status: error.status, body: {code: error.code, error: message, inventory: detail}};
}
