import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { UserUpdateDtoAdmin } from '../../dto/user-update-dto-admin';
import { UserChangePasswordDto } from '../../dto/user-change-password.dto';

@Component({
  selector: 'app-edit-user-admin-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    MaterialModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './edit-user-admin-dialog.component.html',
  styleUrl: './edit-user-admin-dialog.component.css',
})
export class EditUserAdminDialogComponent {
  @Output() userUpdated = new EventEmitter<void>();

  loadingStates = {
    updateUser: false,
    updateUserPassword: false,
  };

  errorStates = {
    updateUser: null as string | null,
    updateUserPassword: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  currentUser?: UserUpdateDtoAdmin;
  updateForm: FormGroup;
  updatePasswordForm: FormGroup;
  roles = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Project Manager', value: 'PROJECTMANAGER' },
    { label: 'Team Member', value: 'TEAMMEMBER' },
  ];
  selectedRoleLabel = 'Select role';

  currentPasswordFieldType = 'password';
  newPasswordFieldType = 'password';
  confirmPasswordFieldType = 'password';
  showPasswordForm = false;

  preventInitialSpace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      inputElement.value.length === 0
    ) {
      event.preventDefault();
    }
  }

  setLoadingState(key: keyof typeof this.loadingStates, state: boolean): void {
    this.loadingStates[key] = state;
  }

  setErrorState(
    key: keyof typeof this.errorStates,
    error: string | null
  ): void {
    this.errorStates[key] = error;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentUserId: number;
      user: UserUpdateDtoAdmin;
    },
    private authService: AuthService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.currentUser = data.user;

    const phoneNumberParts = this.currentUser.phoneNumber.split(' ');
    const phonePrefix = phoneNumberParts[0];
    const phoneNumber = phoneNumberParts.slice(1).join(' ');

    this.selectedRoleLabel = this.getRoleLabel(this.currentUser.role);

    this.updateForm = this.fb.group({
      firstName: [
        this.currentUser.firstName,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      lastName: [
        this.currentUser.lastName,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      phonePrefix: [
        phonePrefix,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(6),
          Validators.pattern(/^\+\d*$/),
        ],
      ],
      phoneNumber: [
        phoneNumber,
        [
          Validators.required,
          Validators.pattern(/^\d{3} \d{3} \d{4,}$/),
          Validators.minLength(10),
          Validators.maxLength(15),
        ],
      ],
      streetAddress: [
        this.currentUser.streetAddress,
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9\\s,.-]+$'),
        ],
      ],
      city: [
        this.currentUser.city,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      stateProvinceRegion: [
        this.currentUser.stateProvinceRegion,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      country: [
        this.currentUser.country,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      zipCode: [
        this.currentUser.zipCode,
        [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')],
      ],
      email: [
        this.currentUser.email,
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\\.(com|org|net|edu|gov))$'
          ),
        ],
      ],
      role: [this.currentUser.role, Validators.required],
    });

    this.updatePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.securePasswordValidator(),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.passwordMatchValidator()],
      ],
    });

    this.updateForm.markAllAsTouched();
  }

  securePasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const regex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$^&*()\-_+=<>?[\]{}|]).{8,}$/;
      const valid = regex.test(value);
      return valid
        ? null
        : {
            securePassword:
              'New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
          };
    };
  }

  private getRoleLabel(role: string): string {
    const roleObj = this.roles.find((r) => r.value === role);
    return roleObj ? roleObj.label : 'Select role';
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.updatePasswordForm) {
        return null;
      }
      const newPassword = this.updatePasswordForm.get('newPassword');
      const confirmPassword = control;
      return newPassword &&
        confirmPassword &&
        newPassword.value !== confirmPassword.value
        ? { mismatch: true }
        : null;
    };
  }

  onChangePassword(): void {
    if (this.updatePasswordForm.invalid) {
      this.updatePasswordForm.markAllAsTouched();
      return;
    }

    const formValues = this.updatePasswordForm.value;

    const changePasswordDto: UserChangePasswordDto = {
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
      confirmPassword: formValues.confirmPassword,
    };

    this.setLoadingState('updateUserPassword', true);

    this.authService
      .changePassword(this.data.currentUserId, changePasswordDto)
      .subscribe({
        next: () => {
          this.setLoadingState('updateUserPassword', false);
          this.setErrorState('updateUserPassword', null);

          this.toastService.show('Password updated successfully!', {
            classname: 'bg-success text-light',
            delay: 5000,
          });

          this.showPasswordForm = false;
          this.updatePasswordForm.reset();
        },
        error: (error) => {
          this.setLoadingState('updateUserPassword', false);
          this.setErrorState('updateUserPassword', error.message);
          this.toastService.show(this.errorStates.updateUserPassword!, {
            classname: 'bg-danger text-light',
            delay: 5000,
          });
        },
      });
  }

  onSubmit() {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const formValues = this.updateForm.value;

    const updateDto: UserUpdateDtoAdmin = {
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      phoneNumber: `${formValues.phonePrefix} ${formValues.phoneNumber}`.trim(),
      streetAddress: formValues.streetAddress.trim(),
      city: formValues.city.trim(),
      stateProvinceRegion: formValues.stateProvinceRegion.trim(),
      country: formValues.country.trim(),
      zipCode: formValues.zipCode.trim(),
      email: formValues.email.trim(),
      role: formValues.role.trim(),
    };

    this.setLoadingState('updateUser', true);

    this.authService
      .updateUserAdmin(this.data.currentUserId, updateDto)
      .subscribe({
        next: () => {
          this.setLoadingState('updateUser', false);
          this.setErrorState('updateUser', null);

          this.toastService.show('User updated successfully!', {
            classname: 'bg-success text-light',
            delay: 5000,
          });

          this.userUpdated.emit();
        },
        error: (error) => {
          this.setLoadingState('updateUser', false);
          this.setErrorState(
            'updateUser',
            error.message.replace(/\n/g, '<br>')
          );
          this.toastService.show(this.errorStates.updateUser!, {
            classname: 'bg-danger text-light',
            delay: 5000,
          });
        },
      });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') {
      this.currentPasswordFieldType =
        this.currentPasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'new') {
      this.newPasswordFieldType =
        this.newPasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirm') {
      this.confirmPasswordFieldType =
        this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
  }

  onInput(controlName: string) {
    const control = this.updateForm.get(controlName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  onDropdownSelect(value: string, controlName: string) {
    const control = this.updateForm.get(controlName);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  onRoleSelected(role: { value: string; label: string }) {
    this.selectedRoleLabel = role.label;
    this.onDropdownSelect(role.value, 'role');
  }

  formatPhoneNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 3 && value.length <= 6) {
      value = `${value.slice(0, 3)} ${value.slice(3)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
    }
    input.value = value;
    const phoneNumberControl = this.updateForm.get('phoneNumber');
    phoneNumberControl?.setValue(value, { emitEvent: false });
    phoneNumberControl?.markAsTouched();
    phoneNumberControl?.markAsDirty();
  }
}
