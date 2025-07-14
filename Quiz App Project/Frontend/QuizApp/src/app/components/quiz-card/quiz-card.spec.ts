import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCard } from './quiz-card';
import { Quiz } from '../../models/QuizModel';

describe('QuizCard', () => {
  let component: QuizCard;
  let fixture: ComponentFixture<QuizCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCard],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
it('timespanToMinutes should return 0 for empty or malformed string', () => {
  expect(component.timespanToMinutes('')).toBeNaN();
  expect(component.timespanToMinutes('abc')).toBeNaN();
  expect(component.timespanToMinutes('00:00:00')).toBe(0);
});
it('should have showFullDescription false by default', () => {
  expect(component.showFullDescription).toBeFalse();
});
it('should toggle showFullDescription flag', () => {
  component.showFullDescription = false;
  component.showFullDescription = !component.showFullDescription;
  expect(component.showFullDescription).toBeTrue();
});
it('should not crash if quiz is undefined', () => {
  component.quiz = undefined as any;
  expect(() => fixture.detectChanges()).not.toThrow();
});


  it('timespanToMinutes should correctly convert HH:MM:SS to minutes', () => {
    expect(component.timespanToMinutes('02:15:30')).toBe(135); // 2h * 60 + 15 + 0.5
    expect(component.timespanToMinutes('00:45:00')).toBe(45);
    expect(component.timespanToMinutes('00:00:59')).toBe(0); // < 1 min rounds down
  });
});
