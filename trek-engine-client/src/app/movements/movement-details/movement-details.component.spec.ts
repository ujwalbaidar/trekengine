import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementDetailsComponent } from './movement-details.component';

describe('MovementDetailsComponent', () => {
  let component: MovementDetailsComponent;
  let fixture: ComponentFixture<MovementDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
