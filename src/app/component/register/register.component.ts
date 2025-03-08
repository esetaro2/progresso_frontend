import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { UserRegistrationDto } from '../../dto/user-registration.dto';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    MaterialModule,
    MatAutocompleteModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  errorStates = {
    register: null as string | null,
  };

  registrationForm: FormGroup;
  roles = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Project Manager', value: 'PROJECTMANAGER' },
    { label: 'Team Member', value: 'TEAMMEMBER' },
  ];
  selectedRoleLabel = 'Select role';

  selectedBirthMonthLabel = 'MM';
  selectedBirthDayLabel = 'DD';
  selectedBirthYearLabel = 'YYYY';
  birthMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  daysInMonth: number[] = [];
  yearsList: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.registrationForm = this.formBuilder.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      birthMonth: ['', [Validators.required]],
      birthDay: ['', [Validators.required]],
      birthYear: ['', [Validators.required]],
      phonePrefix: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(6),
          Validators.pattern(/^\+\d*$/),
        ],
      ],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3} \d{3} \d{4,}$/),
          Validators.maxLength(15),
        ],
      ],
      streetAddress: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9\\s,.-]+$'),
        ],
      ],
      city: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      stateProvinceRegion: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      country: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      zipCode: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\\.(com|org|net|edu|gov))$'
          ),
        ],
      ],
      role: ['', Validators.required],
    });

    this.daysInMonth = this.getDaysInMonth();
    this.yearsList = this.getYearsList();
  }

  preventInitialSpace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      inputElement.value.length === 0
    ) {
      event.preventDefault();
    }
  }

  setErrorState(
    key: keyof typeof this.errorStates,
    error: string | null
  ): void {
    this.errorStates[key] = error;
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValues = this.registrationForm.value;
    const monthIndex = this.birthMonths.indexOf(formValues.birthMonth) + 1;
    const birthDate = `${formValues.birthYear}-${String(monthIndex).padStart(
      2,
      '0'
    )}-${String(formValues.birthDay).padStart(2, '0')}`;

    const registrationDto: UserRegistrationDto = {
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      birthDate: birthDate.trim(),
      phoneNumber: `${formValues.phonePrefix} ${formValues.phoneNumber}`.trim(),
      streetAddress: formValues.streetAddress.trim(),
      city: formValues.city.trim(),
      stateProvinceRegion: formValues.stateProvinceRegion.trim(),
      country: formValues.country.trim(),
      zipCode: formValues.zipCode.trim(),
      email: formValues.email.trim(),
      role: formValues.role.trim(),
    };

    this.authService.register(registrationDto).subscribe({
      next: () => {
        this.setErrorState('register', null);
        this.registrationForm.reset();
        this.selectedBirthYearLabel = 'YYYY';
        this.selectedBirthMonthLabel = 'MM';
        this.selectedBirthDayLabel = 'DD';
        this.selectedRoleLabel = 'Select role';
        this.registrationForm.updateValueAndValidity();

        this.toastService.show('Registration successful!', {
          classname: 'bg-success text-light',
          delay: 5000,
        });

        this.setErrorState('register', null);
      },
      error: (error) => {
        this.setErrorState('register', error.message);
        this.toastService.show(this.errorStates.register!, {
          classname: 'bg-danger text-light',
          delay: 5000,
        });
      },
    });
  }

  onInput(controlName: string) {
    const control = this.registrationForm.get(controlName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  onDropdownSelect(value: string, controlName: string) {
    const control = this.registrationForm.get(controlName);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  onBirthYearSelected(year: number) {
    this.selectedBirthYearLabel = year.toString();
    this.onDropdownSelect(year.toString(), 'birthYear');
    this.getDaysInMonth();
  }

  onBirthMonthSelected(month: string) {
    this.selectedBirthMonthLabel = month;
    this.onDropdownSelect(month, 'birthMonth');
    this.updateDaysInMonth();
  }

  onBirthDaySelected(day: number) {
    this.selectedBirthDayLabel = day.toString();
    this.onDropdownSelect(day.toString(), 'birthDay');
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
    const phoneNumberControl = this.registrationForm.get('phoneNumber');
    phoneNumberControl?.setValue(value, { emitEvent: false });
    phoneNumberControl?.markAsTouched();
    phoneNumberControl?.markAsDirty();
  }

  updateDaysInMonth() {
    this.daysInMonth = this.getDaysInMonth();
    if (
      !this.daysInMonth.includes(parseInt(this.selectedBirthDayLabel)) &&
      this.selectedBirthDayLabel !== 'DD'
    ) {
      this.onBirthDaySelected(this.daysInMonth[0]);
    }
  }

  getDaysInMonth(): number[] {
    const monthIndex =
      this.birthMonths.indexOf(this.selectedBirthMonthLabel) + 1 || 1;
    const year =
      parseInt(this.selectedBirthYearLabel) || new Date().getFullYear();
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  getYearsList(): number[] {
    const currentYear = new Date().getFullYear();
    const minimumYear = currentYear - 18;
    const startYear = 1900;
    return Array.from(
      { length: minimumYear - startYear + 1 },
      (_, i) => startYear + i
    ).filter((year) => year <= minimumYear);
  }
}
