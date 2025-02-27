import { TestBed } from '@angular/core/testing';
import { MazeComponent } from './maze.component';

describe('MazeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MazeComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(MazeComponent);
    const maze = fixture.componentInstance;
    expect(maze).toBeTruthy();
  });

  it(`should have the 'maze' title`, () => {
    const fixture = TestBed.createComponent(MazeComponent);
    const maze = fixture.componentInstance;
    expect(maze.title).toEqual('maze');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(MazeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, maze');
  });
});
