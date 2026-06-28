import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';
import { GetBuildingSize, SEA_PRODUCTION_BUILDINGS } from './sim/building';
import { BuildingType, Terrain } from './sim/types';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('does not focus a newly placed building', () => {
    const city = service.state.current_city!;
    const tile = service.GetTile(city, 10, 10);
    tile.terrain = Terrain.GRASS;
    tile.feature = undefined;

    service.SetBuildType(BuildingType.HOUSE);
    service.ApplyBuild(tile);

    expect(tile.building?.type).toBe(BuildingType.HOUSE);
    expect(city.focus_tile).toBeUndefined();
  });

  it('does not focus newly placed roads', () => {
    const city = service.state.current_city!;
    const start = service.GetTile(city, 12, 12);
    const end = service.GetTile(city, 12, 13);
    start.terrain = Terrain.GRASS;
    end.terrain = Terrain.GRASS;
    start.feature = undefined;
    end.feature = undefined;

    service.SetBuildType(BuildingType.ROAD);
    service.ApplyBuild(start);
    service.ApplyBuild(end);

    expect(start.building?.type).toBe(BuildingType.ROAD);
    expect(end.building?.type).toBe(BuildingType.ROAD);
    expect(city.focus_tile).toBeUndefined();
  });

  it('still focuses an occupied tile clicked while a build tool is selected', () => {
    const city = service.state.current_city!;
    const tile = service.GetTile(city, 14, 14);
    tile.terrain = Terrain.GRASS;
    tile.feature = undefined;

    service.SetBuildType(BuildingType.HOUSE);
    service.ApplyBuild(tile);
    service.SetBuildType(BuildingType.WAREHOUSE);
    service.HandleTileClick(tile);

    expect(city.focus_tile).toBe(tile);
    expect(service.state.build_type).toBeUndefined();
  });

  it('uses a 2x2 footprint for sea production buildings', () => {
    expect(SEA_PRODUCTION_BUILDINGS.has(BuildingType.FISHERY)).toBeTrue();
    expect(GetBuildingSize(BuildingType.FISHERY)).toBe(2);
    expect(GetBuildingSize(BuildingType.SALTERN)).toBe(2);
    expect(GetBuildingSize(BuildingType.WHALING_POST)).toBe(2);
  });
});
