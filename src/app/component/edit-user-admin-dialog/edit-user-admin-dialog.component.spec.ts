import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserAdminDialogComponent } from './edit-user-admin-dialog.component';

describe('EditUserAdminDialogComponent', () => {
  let component: EditUserAdminDialogComponent;
  let fixture: ComponentFixture<EditUserAdminDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserAdminDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserAdminDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
