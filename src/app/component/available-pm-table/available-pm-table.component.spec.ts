import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailablePmTableComponent } from './available-pm-table.component';

describe('AvailablePmTableComponent', () => {
  let component: AvailablePmTableComponent;
  let fixture: ComponentFixture<AvailablePmTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailablePmTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailablePmTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
