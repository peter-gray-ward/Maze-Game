import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorComponent } from './door.component';

describe('DoorComponent', () => {
  let component: DoorComponent;
  let fixture: ComponentFixture<DoorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
