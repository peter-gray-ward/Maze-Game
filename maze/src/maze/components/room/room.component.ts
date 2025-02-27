import { Component, Input } from '@angular/core';
import { Room } from '../../models/room';
import { Side } from '../../models/side';
import { MapSite } from '../../models/map-site';
import { Direction } from '../../constants/direction';
import { KeyOf } from '../../utils/object';
import { SideComponent } from './side/side.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'room',
  standalone: true,
  imports: [SideComponent, CommonModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent {
  @Input() room!: Room;
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
}
