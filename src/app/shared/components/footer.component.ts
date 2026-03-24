import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
    readonly year = new Date().getFullYear();
    readonly githubUrl = 'https://github.com/PixelFox3/Angular-Parabox';
    readonly githubUserUrl = 'https://github.com/PixelFox3';
}
