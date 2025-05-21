import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrainMenuComponent } from './terrain-menu.component';

describe('TerrainMenuComponent', () => {
  let component: TerrainMenuComponent;
  let fixture: ComponentFixture<TerrainMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerrainMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerrainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
