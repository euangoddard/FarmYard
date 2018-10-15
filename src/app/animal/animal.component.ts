import { Animal } from './../animals';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'men-animal',
  templateUrl: './animal.component.html',
  styleUrls: ['./animal.component.scss'],
})
export class AnimalComponent {
  @Input()
  animal!: Animal;
}
