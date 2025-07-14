import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardChart } from './dashboard-chart';
import { ChartType } from 'chart.js';

describe('DashboardChart', () => {
  let component: DashboardChart;
  let fixture: ComponentFixture<DashboardChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChart]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardChart);
    component = fixture.componentInstance;

    component.chartType = 'bar' as ChartType;
    component.labels = ['Math', 'Science', 'English'];
    component.datasets = [
      {
        label: 'Scores',
        data: [75, 90, 85],
        backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
        borderColor: ['#4f46e5', '#d97706', '#059669'],
        borderWidth: 1
      }
    ];
    component.options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    };

    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create chart instance', () => {
    expect(component.chart).toBeDefined();
    expect(component.chartType).toBe('bar');
  });
});
