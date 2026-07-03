import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceSummaryComponent } from './resource-summary.component';

describe('ResourceSummaryComponent', () => {
  let component: ResourceSummaryComponent;
  let fixture: ComponentFixture<ResourceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
