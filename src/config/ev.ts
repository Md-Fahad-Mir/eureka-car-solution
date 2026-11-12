/**
 * EV Education Centre: charging-time explainer settings.
 *
 * ILLUSTRATIVE VALUES. Real charging speed depends on the vehicle, battery
 * temperature, state of health, the charger and the grid. The UI says so.
 */
export const evConfig = {
  chargers: [
    /** Portable charger in a 16 A household socket (230 V). */
    { id: "socket", kind: "ac", kw: 3.3 },
    /** Single-phase wall box. */
    { id: "wallbox", kind: "ac", kw: 7.4 },
    /** Three-phase AC (public or commercial premises). */
    { id: "ac11", kind: "ac", kw: 11 },
    { id: "dc50", kind: "dc", kw: 50 },
    { id: "dc120", kind: "dc", kw: 120 },
  ],
  /** The car's on-board charger caps AC charging (kW). */
  onboardChargerKw: [6.6, 7.4, 11],
  defaultOnboardKw: 7.4,
  battery: { minKwh: 20, maxKwh: 120, stepKwh: 1, defaultKwh: 60 },
  soc: { defaultFrom: 20, defaultTo: 80 },
  /** Share of grid energy that ends up in the battery. */
  efficiency: { ac: 0.9, dc: 0.93 },
  /** DC charging slows down above this state of charge… */
  dcTaperFromSoc: 80,
  /** …to roughly this share of the charger's power (simplified taper). */
  dcTaperFactor: 0.35,
  /** Average consumption used to turn kWh into "about X km" (kWh/100 km). */
  consumptionKwhPer100Km: 15,
  /** Typical diesel economy for the cost-per-km comparison (petrol and hybrid come from costConfig). */
  dieselKmPerLitre: 14,
  /** Diagram: charger comparison for this battery, 20→80%, with an 11 kW on-board charger. */
  levelsDiagram: { batteryKwh: 60, fromPct: 20, toPct: 80, onboardAcKw: 11 },
} as const;

export type ChargerId = (typeof evConfig.chargers)[number]["id"];
