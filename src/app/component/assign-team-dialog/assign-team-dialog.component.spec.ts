import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTeamDialogComponent } from './assign-team-dialog.component';

describe('AssignTeamDialogComponent', () => {
  let component: AssignTeamDialogComponent;
  let fixture: ComponentFixture<AssignTeamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignTeamDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTeamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
