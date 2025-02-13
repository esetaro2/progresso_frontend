import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { UserRegistrationDto } from '../../dto/user-registration.dto';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
export class RegisterComponent implements OnInit {
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

  phonePrefixes: { code: string; label: string }[] = [];
  selectedPhonePrefix = '+1';
  filteredPrefixes!: Observable<{ code: string; label: string }[]>;

  phonePrefixControl = new FormControl();

  countries: { name: string; isoCode: string }[] = [];
  states: { name: string; isoCode: string }[] = [];
  provinces: { name: string; isoCode: string }[] = [];
  regions: { name: string; isoCode: string }[] = [];
  cities: { name: string; isoCode: string }[] = [];
  selectedCountry = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
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
      phonePrefix: [this.phonePrefixControl, Validators.required],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3} \d{3} \d{4,}$/),
          Validators.minLength(10),
          Validators.maxLength(15),
        ],
      ],
      streetAddress: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9\\s,.-]+$'),
        ],
      ],
      city: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      stateProvinceRegion: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'),
        ],
      ],
      country: [
        '',
        [
          Validators.required,
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

  ngOnInit(): void {
    this.loadPhonePrefixes();
    this.filteredPrefixes = this.phonePrefixControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterPrefixes(value))
    );
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
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      birthDate: birthDate,
      phoneNumber: `${formValues.phonePrefix} ${formValues.phoneNumber}`,
      streetAddress: formValues.streetAddress,
      city: formValues.city,
      stateProvinceRegion: formValues.stateProvinceRegion,
      country: formValues.country,
      zipCode: formValues.zipCode,
      email: formValues.email,
      role: formValues.role,
    };

    this.authService.register(registrationDto).subscribe({
      next: () => {
        this.setErrorState('register', null);
        this.registrationForm.reset();
        this.selectedBirthDayLabel = 'DD';
        this.selectedBirthMonthLabel = 'MM';
        this.selectedBirthYearLabel = 'YYYY';
        this.selectedRoleLabel = 'Select role';
        formValues.phonePrefix = this.phonePrefixControl.setValue('');
        this.toastService.show('Registration successful', {
          classname: 'bg-success text-light',
          delay: 5000,
        });

        this.setErrorState('register', null);
      },
      error: (error) => {
        this.setErrorState('register', error.message.replace(/^"|"$/g, ''));
        this.toastService.show(this.errorStates.register!, {
          classname: 'bg-danger text-light',
          delay: 5000
        })
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

  onBirthMonthSelected(month: string) {
    this.selectedBirthMonthLabel = month;
    this.onDropdownSelect(month, 'birthMonth');
    this.updateDaysInMonth();
  }

  onBirthDaySelected(day: number) {
    this.selectedBirthDayLabel = day.toString();
    this.onDropdownSelect(day.toString(), 'birthDay');
  }

  onBirthYearSelected(year: number) {
    this.selectedBirthYearLabel = year.toString();
    this.onDropdownSelect(year.toString(), 'birthYear');
  }

  onRoleSelected(role: { value: string; label: string }) {
    this.selectedRoleLabel = role.label;
    this.onDropdownSelect(role.value, 'role');
  }

  onPhonePrefixSelected(prefix: { code: string; label: string }) {
    this.selectedPhonePrefix = prefix.code;
    this.registrationForm.get('phoneNumber')?.setValue('');
    this.registrationForm.get('phoneNumber')?.markAsTouched();
    this.registrationForm.get('phoneNumber')?.updateValueAndValidity();
  }

  loadPhonePrefixes(): void {
    const countries = getCountries();
    this.phonePrefixes = countries.map((country) => ({
      code: `+${getCountryCallingCode(country)}`,
      label: country,
    }));
  }

  private _filterPrefixes(value: string): { code: string; label: string }[] {
    const filterValue = value.toLowerCase();
    return this.phonePrefixes.filter(
      (prefix) =>
        prefix.label.toLowerCase().includes(filterValue) ||
        prefix.code.includes(filterValue)
    );
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
    if (!this.daysInMonth.includes(parseInt(this.selectedBirthDayLabel))) {
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
