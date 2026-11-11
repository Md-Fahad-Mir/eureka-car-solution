/**
 * Chart colours, derived from the brand hue families and validated with the
 * dataviz palette checker (light mode, on the ivory chart surface #f6f4ef):
 * lightness band, chroma ≥ 0.10, adjacent CVD ΔE ≥ 11.6, normal-vision ΔE ≥ 19,
 * contrast ≥ 3:1. Assign categorical slots in this fixed order, never cycled,
 * and keep colour following the entity (e.g. savings-calculator column), not rank.
 */
export const CHART_CATEGORICAL = ["#008c7e", "#b47a14", "#2d66c4", "#c9502a", "#7650d8"] as const;

/** Two-series pair (validated ΔE 27 CVD / 30 normal): e.g. energy vs maintenance, principal vs interest. */
export const CHART_PAIR = { primary: "#2d66c4", secondary: "#b47a14" } as const;

export const CHART_SURFACE = "#f6f4ef";
export const CHART_GRID = "rgba(22,26,22,0.10)";
export const CHART_AXIS_TEXT = "#5a6057";
