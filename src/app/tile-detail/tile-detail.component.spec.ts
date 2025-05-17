import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TileDetailComponent } from './tile-detail.component';
import { MatCardModule } from '@angular/material/card';
describe('TileDetailComponent', () => {
  let component: TileDetailComponent;
  let fixture: ComponentFixture<TileDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TileDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
