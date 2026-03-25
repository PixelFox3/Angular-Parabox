import { Injectable, signal } from '@angular/core';

export type ThemeType = 'light' | 'dark';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private currentTheme = signal<ThemeType>('light');
    currentTheme$ = this.currentTheme;

    themes: ThemeType[] = ['light', 'dark'];
    themeLabels: Record<ThemeType, string> = {
        light: 'Light',
        dark: 'Dark',
    };

    constructor() {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme') as ThemeType | null;
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.currentTheme.set(savedTheme);
            this.applyTheme(savedTheme);
        } else {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme: ThemeType = prefersDark ? 'dark' : 'light';
            this.currentTheme.set(theme);
            this.applyTheme(theme);
        }
    }

    setTheme(theme: ThemeType): void {
        this.currentTheme.set(theme);
        this.applyTheme(theme);
    }

    private applyTheme(theme: ThemeType): void {
        const htmlElement = document.documentElement;
        if (theme === 'light') {
            htmlElement.removeAttribute('data-theme');
        } else {
            htmlElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('theme', theme);
    }
}
