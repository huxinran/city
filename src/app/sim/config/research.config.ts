// University research config — the technologies the player can unlock and what
// they cost. Pure data; safe to edit without touching simulation logic.
// Re-exported from building.ts so existing importers keep their import paths.

// Technologies researched at the University that unlock or improve buildings.
export enum Technology {
    FERTILIZER_APPLICATION = "Fertilizer Application",
    CROP_ROTATION = "Crop Rotation",
    ADVANCED_MINING = "Advanced Mining",
}

export class ResearchProject {
    constructor(
        public tech: Technology,
        public name: string,
        public description: string,
        public research_time: number,  // ticks at full staffing to complete
        public gold_cost: number,
    ) {}
}

export const ALL_RESEARCH: ResearchProject[] = [
    new ResearchProject(
        Technology.FERTILIZER_APPLICATION,
        "Fertilizer Application",
        "Farms can use fertilizer for a 1.5× speed boost when stockpiled.",
        400, 300,
    ),
    new ResearchProject(
        Technology.CROP_ROTATION,
        "Crop Rotation",
        "All farms produce 30% faster permanently.",
        600, 500,
    ),
    new ResearchProject(
        Technology.ADVANCED_MINING,
        "Advanced Mining",
        "All extraction buildings operate 30% faster.",
        500, 400,
    ),
]
