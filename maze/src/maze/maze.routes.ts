import { Routes } from '@angular/router';
import { MazeComponent } from './maze.component';
import { RoomComponent } from './components/room/room.component';

export const routes: Routes = [
    { path: '', redirectTo: '/maze', pathMatch: 'full' },
    { path: 'maze', component: MazeComponent },
    { path: 'room/:id', component: RoomComponent }
];
