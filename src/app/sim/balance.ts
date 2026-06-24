// Central balance config — the frequently-tuned gameplay knobs in ONE place.
// Pure data with no imports from other sim modules, so it is safe to tweak and
// safe to import from anywhere (sim logic or Angular adapters). To rebalance the
// game, edit BALANCE below; no logic changes are needed.

export interface UpgradeRule {
    minServiceRatio: number   // fraction (0..1) of service needs that must be met
    minGoodsRatio: number     // fraction (0..1) of goods (resource) needs that must be met
    minHappiness: number      // minimum happiness (0..1); 0 = no happiness gate
}

export const BALANCE = {
    // --- Happiness -----------------------------------------------------------
    // Relative weight of satisfied services vs. goods toward a household's
    // happiness. Raise goodsWeight to make food/daily goods matter more.
    happiness: {
        serviceWeight: 1.0,
        goodsWeight: 1.0,
    },

    // --- House upgrade gate --------------------------------------------------
    // What a house must satisfy to upgrade to the next tier.
    //   minServiceRatio: 0.8 → "80% of services covered is enough"
    //   minHappiness:    0.7 → "require happiness ≥ 70%"
    houseUpgrade: {
        minServiceRatio: 1.0,   // all services covered
        minGoodsRatio: 1.0,     // all goods supplied
        minHappiness: 0.0,      // happiness not gated (yet)
    } as UpgradeRule,

    // --- Production ----------------------------------------------------------
    // Global multiplier on every building's production progress per tick.
    // Lower = slower economy; higher = faster.
    productionSpeed: 0.5,
}
