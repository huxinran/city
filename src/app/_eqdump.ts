// THROWAWAY equivalence-dump harness. Deleted after the refactor.
import {
  MakeBuilding, GetBuildingSize, GetBuildingGoldCost, GetBuildingTier,
  GetRequiredTerrains, GetRequiredNearbyFeature, GetRequiredNearbyTerrain,
  RequiresRoad, IsFarmBuilding, IsAnimalFarm, IsWorkshopBuilding, IsMineCampBuilding,
  GetBuildingIcon, GetWorkshopProductIcon, FeatureMatches,
  GetResourceNeed, GetServiceNeed, GetUpgradeItems, GetUpgradeCost, GetCityMaxTier,
  GetResidentType, GetHouseType, GetCurrentMaxOccupant, GetResidentIcon, GetResidentIconAsset,
  GetTaxPerResident, RefreshWarehouse, RefreshHouse,
} from './building'
import { BuildingType, CityName, Resident, Feature } from './types'

const out: any = {}

const cities: (CityName | undefined)[] = [
  undefined, CityName.ANRELIA, CityName.JINLIN, CityName.COLUMBIA, CityName.SOLARA, CityName.MINTAKA,
]

const features: (Feature | undefined)[] = [undefined, Feature.TREE, Feature.ROCK, Feature.BUSH]

for (const t of Object.values(BuildingType)) {
  out['B:' + t] = {
    make: MakeBuilding(t),
    size: GetBuildingSize(t),
    gold: GetBuildingGoldCost(t),
    tier: GetBuildingTier(t),
    terrains: GetRequiredTerrains(t),
    nearbyFeature: GetRequiredNearbyFeature(t),
    nearbyTerrain: GetRequiredNearbyTerrain(t),
    road: RequiresRoad(t),
    farm: IsFarmBuilding(t),
    animal: IsAnimalFarm(t),
    workshop: IsWorkshopBuilding(t),
    minecamp: IsMineCampBuilding(t),
    icon: GetBuildingIcon(t),
    productIcon: GetWorkshopProductIcon(t),
    featureMatches: features.map(f => FeatureMatches(t, f)),
  }
}

for (const c of cities) {
  const key = c ?? 'DEFAULT'
  for (let tier = 1; tier <= 6; tier++) {
    out[`need:${key}:${tier}`] = GetResourceNeed(tier, c)
    out[`svc:${key}:${tier}`] = GetServiceNeed(tier, c)
    out[`upItems:${key}:${tier}`] = GetUpgradeItems(tier, c)
    out[`upCost:${key}:${tier}`] = GetUpgradeCost(tier, c)
  }
  out[`maxTier:${key}`] = GetCityMaxTier(c)
}

for (let tier = 1; tier <= 6; tier++) {
  out[`resType:${tier}`] = GetResidentType(tier)
  out[`houseType:${tier}`] = GetHouseType(tier)
  out[`maxOcc:${tier}:0`] = GetCurrentMaxOccupant(tier, 0)
  out[`maxOcc:${tier}:0.5`] = GetCurrentMaxOccupant(tier, 0.5)
  out[`maxOcc:${tier}:1`] = GetCurrentMaxOccupant(tier, 1)
}
for (const r of Object.values(Resident)) {
  out[`resIcon:${r}`] = GetResidentIcon(r)
  out[`resAsset:${r}`] = GetResidentIconAsset(r)
  out[`tax:${r}`] = GetTaxPerResident(r)
}

console.log(JSON.stringify(out, null, 1))
