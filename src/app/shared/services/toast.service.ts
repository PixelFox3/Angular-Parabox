import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
    id: number;
    type: ToastType;
    message: string;
    duration: number;
}

export interface ConfirmConfig {
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private nextId = 0;

    readonly toasts = signal<ToastMessage[]>([]);
    readonly confirmDialog = signal<ConfirmConfig | null>(null);

    show(message: string, type: ToastType = 'info', duration = 4000): void {
        const id = ++this.nextId;
        this.toasts.update(t => [...t, { id, type, message, duration }]);
        if (duration > 0) {
            window.setTimeout(() => this.dismiss(id), duration);
        }
    }

    dismiss(id: number): void {
        this.toasts.update(t => t.filter(toast => toast.id !== id));
    }

    confirm(
        message: string,
        confirmLabel = 'Confirmar',
        cancelLabel = 'Cancelar',
    ): Promise<boolean> {
        return new Promise(resolve => {
            this.confirmDialog.set({ message, confirmLabel, cancelLabel, resolve });
        });
    }

    resolveConfirm(confirmed: boolean): void {
        const current = this.confirmDialog();
        if (current) {
            this.confirmDialog.set(null);
            current.resolve(confirmed);
        }
    }
}
