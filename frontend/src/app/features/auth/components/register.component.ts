import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value as string;
    const confirm = control.get('confirmPassword')?.value as string;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    readonly form = this.fb.nonNullable.group(
        {
            name: ['', [Validators.maxLength(60)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: passwordMatchValidator },
    );

    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { email, password, name } = this.form.getRawValue();

        this.auth.register(email, password, name || undefined).subscribe({
            next: () => { void this.router.navigate(['/cliente']); },
            error: (err: unknown) => {
                const msg =
                    err instanceof Object && 'error' in err && err.error instanceof Object && 'message' in err.error
                        ? String(err.error.message)
                        : 'Error al crear la cuenta. Intenta de nuevo.';
                this.errorMessage.set(msg);
                this.isLoading.set(false);
            },
        });
    }
}
