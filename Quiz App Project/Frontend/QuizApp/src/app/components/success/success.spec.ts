import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Success } from './success';

describe('Success', () => {
  let component: Success;
  let fixture: ComponentFixture<Success>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Success],
    }).compileComponents();

    fixture = TestBed.createComponent(Success);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


it('should use default message if input message is null', fakeAsync(() => {
  component.message = null;
  fixture.detectChanges();

  tick(2000);
  fixture.detectChanges();

  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.textContent).toContain('Operation completed successfully!');
}));


  it('should use the provided input message', () => {
    component.message = 'Test passed!';
    fixture.detectChanges();
    expect(component.message).toBe('Test passed!');
  });

  it('should set showMessage to true after 2 seconds', fakeAsync(() => {
    component.message = 'Testing delay';
    fixture.detectChanges();
    expect(component.showMessage).toBeFalse();

    tick(2000); 
    expect(component.showMessage).toBeTrue();
  }));
});
