import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingMenuComponent } from './building-menu.component';

describe('BuildingComponent', () => {
  let component: BuildingMenuComponent;
  let fixture: ComponentFixture<BuildingMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
