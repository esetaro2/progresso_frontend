import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableTeamTableComponent } from './available-team-table.component';

describe('AvailableTeamTableComponent', () => {
  let component: AvailableTeamTableComponent;
  let fixture: ComponentFixture<AvailableTeamTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableTeamTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableTeamTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
