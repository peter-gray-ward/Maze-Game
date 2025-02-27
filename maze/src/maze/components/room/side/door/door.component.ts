import { Component, Input } from '@angular/core';
import { Door } from '../../../../models/door';
import { KeyOf } from '../../../../utils/object';
import { Direction } from '../../../../constants/direction';

@Component({
  selector: 'door',
  standalone: true,
  imports: [],
  templateUrl: './door.component.html',
  styleUrl: './door.component.scss'
})
export class DoorComponent {
  @Input() door!: Door;
  Direction: typeof Direction = Direction;
  KeyOf(obj: any, value: any): any {
    return KeyOf(obj, value);
  }
}
