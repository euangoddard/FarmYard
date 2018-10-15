import { ANIMALS } from './animals';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'men-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly animals = ANIMALS;
}
