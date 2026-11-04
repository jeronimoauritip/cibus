import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableEditModalComponent } from './table-edit-modal';

describe('TableEditModalComponent', () => {
  let component: TableEditModalComponent;
  let fixture: ComponentFixture<TableEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableEditModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should increment and decrement capacity within bounds', () => {
    component.incrementCapacity();
    expect(component.capacity()).toBe(5);

    component.decrementCapacity();
    expect(component.capacity()).toBe(4);
  });

  it('should switch shapes reactively', () => {
    component.setShape('square');
    expect(component.selectedShape()).toBe('square');

    component.setShape('rectangular');
    expect(component.selectedShape()).toBe('rectangular');
  });

  it('should emit confirmConfig on submit', () => {
    let emitted: { shape: string; capacity: number } | undefined;
    component.confirmConfig.subscribe((val) => (emitted = val));

    component.setShape('square');
    component.incrementCapacity();
    component.onSubmit();

    expect(emitted).toEqual({ shape: 'square', capacity: 5 });
  });
});

