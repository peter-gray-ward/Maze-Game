import { bootstrapApplication } from '@angular/platform-browser';
import { mazeConfig } from './maze/maze.config';
import { MazeComponent } from './maze/maze.component';

bootstrapApplication(MazeComponent, mazeConfig)
  .catch((err) => console.error(err));
