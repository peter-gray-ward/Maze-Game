import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

// Assuming the routes file is missing or incorrectly named, we'll comment out the import and the router provider for now.
import { routes } from './maze.routes';

export const mazeConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
