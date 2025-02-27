import { Component, Input } from '@angular/core';
import { Door } from '../../../models/door';
import { Wall } from '../../../models/wall';
import { MapSite } from '../../../models/map-site';
import { Direction } from '../../../constants/direction';
import { KeyOf } from '../../../utils/object';
import { CommonModule } from '@angular/common';
import { Side } from '../../../models/side';
import { WallComponent } from './wall/wall.component';
import { DoorComponent } from './door/door.component';

@Component({
  selector: 'side',
  standalone: true,
  imports: [CommonModule, WallComponent, DoorComponent],
  templateUrl: './side.component.html',
  styleUrl: './side.component.scss'
})
export class SideComponent {
  @Input() side!: Side;

  Direction: typeof Direction = Direction;

  Keys: any = {
    Direction: Object.keys(Direction) as string[]
  }

  trackById(index: number, site: MapSite): string {
    return site.id.join(',');
  }
  KeyOf(obj: any, value: any): any {
    return KeyOf(obj, value);
  }
  isWall(side: any): side is Wall {
    return side instanceof Wall;
  }
  isDoor(side: any): side is Door {
    return side instanceof Door;
  }
}
