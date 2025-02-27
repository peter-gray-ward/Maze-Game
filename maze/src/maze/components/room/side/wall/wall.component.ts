import { Component, Input } from '@angular/core';
import { Wall } from '../../../../models/wall';
import { KeyOf } from '../../../../utils/object';
import { Direction } from '../../../../constants/direction';

@Component({
  selector: 'wall',
  standalone: true,
  imports: [],
  templateUrl: './wall.component.html',
  styleUrl: './wall.component.scss'
})
export class WallComponent {
    @Input() wall!: Wall;
    Direction: typeof Direction = Direction;
    KeyOf(obj: any, value: any): any {
        return KeyOf(obj, value);
    }
}
