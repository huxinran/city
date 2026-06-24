import { Tile } from "./tile";
import { Resident } from "./types";

export class PopulationTier {
    constructor(
        public tier: Resident,
        public has: number = 0,
        public needed: number = 0,
        public houses: Tile[] = [],
        public productions: Tile[] = [],
    ) {}
}

export class Population {
    constructor(
        public tiers: PopulationTier[] = [],
    ) {
        let tier: keyof typeof Resident;
        for (tier in Resident) {
            this.tiers.push(new PopulationTier(Resident[tier]))
        }
    }
}

