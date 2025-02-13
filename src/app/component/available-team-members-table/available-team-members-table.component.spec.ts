import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableTeamMembersTableComponent } from './available-team-members-table.component';

describe('AvailableTeamMembersTableComponent', () => {
  let component: AvailableTeamMembersTableComponent;
  let fixture: ComponentFixture<AvailableTeamMembersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableTeamMembersTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableTeamMembersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
