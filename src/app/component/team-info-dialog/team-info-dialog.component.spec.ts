import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamInfoDialogComponent } from './team-info-dialog.component';

describe('TeamInfoDialogComponent', () => {
  let component: TeamInfoDialogComponent;
  let fixture: ComponentFixture<TeamInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamInfoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
