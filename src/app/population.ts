export enum ResidentTier {
    FARMER = "Farmer",
    WORKER = "Worker",
    CLERK = "Clerk",
    SCHOLAR = "Scholar",
    NOBEL = "Nobel",
}

export class PopulationTier {
    constructor(
        public tier: ResidentTier,
        public has: number = 0,
        public needed: number = 0,
    ) {}
}

export class Population {
    constructor(
        public has: number = 0,
        public needed: number = 0,
        public tiers: PopulationTier[] = [],
    ) {
        let tier: keyof typeof ResidentTier;
        for (tier in ResidentTier) {
            this.tiers.push(new PopulationTier(ResidentTier[tier]))
        }

    }
}

export function ResetPopulation(population: Population) {
    population.has = 0
    population.needed = 0
    for (let t of population.tiers) {
        t.has = 0
        t.needed = 0
    }
}

export function AddPopulation(population: Population, tier: ResidentTier, num: number) {
    for (let t of population.tiers) {
        if (t.tier == tier) {
            t.has += num
            population.has += num
        }
    }
}

export function AddWorkerNeeded(population: Population, tier: ResidentTier, num: number) {
    for (let t of population.tiers) {
        if (t.tier == tier) {
            t.needed += num
            population.needed += num
        }
    }
}

export function GetPopulation(population: Population, tier: ResidentTier) {
    for (let t of population.tiers) {
        if (t.tier == tier) {
            return t.has
        }
    }
    return 0
}

export function GetWorkerNeeded(population: Population, tier: ResidentTier, num: number) {
    for (let t of population.tiers) {
        if (t.tier == tier) {
           return t.needed
        }
    }
    return 0
}