import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import Chart, { ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.html',
  styleUrls: ['./dashboard-chart.css'],
})
export class DashboardChart implements OnInit {
  chart!: Chart;

  @Input() chartType!: ChartType;
  @Input() labels: string[] = [];
  @Input() datasets: any[] = [];
  @Input() options: any = {};

  @ViewChild('chartCanvas', { static: true }) chartRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.chartData();

  }

  chartData() {
    

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: this.chartType,
      data: {
        labels: this.labels,
        datasets: this.datasets,
      },
      options: this.options,
    });

    console.log(this.datasets);
    
  }
}
