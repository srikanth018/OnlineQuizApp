import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Loading } from './loading';
import { provideLottieOptions } from 'ngx-lottie';
import { LottieComponent } from 'ngx-lottie';
import { By } from '@angular/platform-browser';

describe('Loading Component', () => {
  let component: Loading;
  let fixture: ComponentFixture<Loading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loading],
      providers: [
        provideLottieOptions({
          player: () => import('lottie-web'),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Loading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have valid Lottie options', () => {
    expect(component.options).toBeTruthy();
    expect(component.options.animationData).toBeDefined();
    expect(component.options.loop).toBeTrue();
    expect(component.options.autoplay).toBeTrue();
  });

  it('should render the LottieComponent', () => {
    const lottieDebugElement = fixture.debugElement.query(By.directive(LottieComponent));
    expect(lottieDebugElement).toBeTruthy();
  });
});
