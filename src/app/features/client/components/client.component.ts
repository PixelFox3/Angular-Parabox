import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientComponent {
  readonly name = input.required<string>();
  readonly email = input.required<string>();
  readonly notificationsEnabled = input.required<boolean>();
}
