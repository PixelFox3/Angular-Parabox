import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { email, password } = this.form.getRawValue();

        this.auth.login(email, password).subscribe({
            next: () => {
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string ?? '/cliente';
                void this.router.navigateByUrl(returnUrl);
            },
            error: (err: unknown) => {
                const msg =
                    err instanceof Object && 'error' in err && err.error instanceof Object && 'message' in err.error
                        ? String(err.error.message)
                        : 'Error al iniciar sesión. Intenta de nuevo.';
                this.errorMessage.set(msg);
                this.isLoading.set(false);
            },
        });
    }
}
