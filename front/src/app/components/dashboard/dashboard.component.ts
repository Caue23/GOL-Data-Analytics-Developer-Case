import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts from 'highcharts';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HighchartsChartModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  chartOne:any[] = [];
  chartTwo:any[] = [];
  chartThree:any[] = [];
  chartFour:any[] = [];
  originalChartOneData: any[] = [];
  selectedChart: string = 'chartOne';
  Highcharts = Highcharts;
  chartOneOptions: Highcharts.Options = {};
  chartTwoOptions: Highcharts.Options = {};
  chartThreeOptions: Highcharts.Options = {};
  chartFourOptions: Highcharts.Options = {};
  selectedMonth: string = new Date().getMonth().toString(); // mês atual
selectedYear: string | number = new Date().getFullYear();

months = [
  { value: '0', name: 'Janeiro' },
  { value: '1', name: 'Fevereiro' },
  { value: '2', name: 'Março' },
  { value: '3', name: 'Abril' },
  { value: '4', name: 'Maio' },
  { value: '5', name: 'Junho' },
  { value: '6', name: 'Julho' },
  { value: '7', name: 'Agosto' },
  { value: '8', name: 'Setembro' },
  { value: '9', name: 'Outubro' },
  { value: '10', name: 'Novembro' },
  { value: '11', name: 'Dezembro' }
];

years: number[] = [];


  constructor(private apiService: ApiService) {
    for (let year = 2022; year <= new Date().getFullYear(); year++) {
      this.years.push(year);
    }
    this.getChartOne();

  }

  ngOnInit(): void {
    this.getChartOne();
    this.getChartTwo();
    this.getChartThree();
    this.getChartFour();

  }

  getChartOne(): void {
    this.apiService.get('/dashboard/chart/data/1').subscribe((response: any) => {
      this.originalChartOneData = response.data;
      this.updateChartOneOptions();
    });
  }
  filterCharts(): void {
    if (this.selectedChart === 'chartOne') {
      this.updateChartOneOptions();
    }
    this.getChartTwo();
    this.getChartThree();
    this.getChartFour();
  }

  filterByMonthYear(dateStr: string): boolean {
    const date = new Date(dateStr);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString();

    return (!this.selectedMonth || this.selectedMonth === month) &&
           (!this.selectedYear || this.selectedYear === year);
  }


  updateChartOneOptions(): void {
    const month = parseInt(this.selectedMonth, 10);
    const year = this.selectedYear;

    const filteredData = this.originalChartOneData.filter((item: any) => {
      const date = new Date(item.category);
      return date.getMonth() === month && date.getFullYear() === year;
    }).map((item: any) => {
      const label = new Date(item.category).toLocaleDateString('pt-BR');
      return [label, item.value];
    });

    this.chartOneOptions = {
      chart: { type: 'column' },
      title: { text: 'Partidas de passageiros' },
      xAxis: {
        type: 'category',
        title: { text: 'Data' }
      },
      yAxis: {
        title: { text: 'Quantidade' }
      },
      series: [
        {
          name: 'Reservas',
          type: 'column',
          data: filteredData,
          color: '#fb5c04'
        }
      ]
    };


  }
  getChartTwo(): void {
    this.apiService.get('/dashboard/chart/data/2').subscribe((res: any) => {
      const month = parseInt(this.selectedMonth, 10);
      const year = +this.selectedYear;

      const filteredData = res.data.filter((item: any) => {
        const date = new Date(item.category);
        return date.getMonth() === month && date.getFullYear() === year;
      }).map((item: any) => [
        new Date(item.category).toLocaleDateString('pt-BR'),
        item.value
      ]);

      this.chartTwoOptions = {
        chart: { type: 'column' },
        title: { text: 'Chegadas de passageiros' },
        xAxis: { type: 'category' },
        yAxis: { title: { text: 'Valor' } },
        series: [
          {
            name: 'Passageiro',
            type: 'column',
            data: filteredData
          }
        ]
      };
    });
  }


  getChartThree(): void {
    this.apiService.get('/dashboard/chart/data/3').subscribe((res: any) => {
      const data = res.data.map((item: any) => {
        const formattedCategory = item.category.slice(0, 3) + ' / ' + item.category.slice(3);
        return [formattedCategory, item.value];
      });

      this.chartThreeOptions = {
        chart: { type: 'column' },
        title: { text: 'Número de passageiros' },
        xAxis: { type: 'category' },
        yAxis: { title: { text: 'Valor' } },
        series: [
          {
            name: 'Total',
            type: 'column',
            data
          }
        ]
      };
    });
  }


  getChartFour(): void {
    this.apiService.get('/dashboard/data').subscribe((res: any) => {
      const month = parseInt(this.selectedMonth, 10);
      const year = +this.selectedYear;

      const dataMap = new Map<string, { departures: number; arrivals: number }>();

      res.data.forEach((item: any) => {
        const dateObj = new Date(item.date);
        if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
          const date = dateObj.toLocaleDateString('pt-BR');
          if (!dataMap.has(date)) {
            dataMap.set(date, { departures: 0, arrivals: 0 });
          }
          const current = dataMap.get(date)!;
          current.departures += item.departures;
          current.arrivals += item.arrivals;
        }
      });

      const categories = Array.from(dataMap.keys());
      const departures = Array.from(dataMap.values()).map((v) => v.departures);
      const arrivals = Array.from(dataMap.values()).map((v) => v.arrivals);

      this.chartFourOptions = {
        chart: { type: 'column' },
        title: { text: 'Partidas e chegadas de passageiros' },
        xAxis: { categories },
        yAxis: { min: 0, title: { text: 'Movimentos' } },
        plotOptions: {
          column: { stacking: 'normal' }
        },
        series: [
          {
            name: 'Partidas',
            type: 'column',
            data: departures,
            color: '#7cb5ec'
          },
          {
            name: 'Chegadas',
            type: 'column',
            data: arrivals,
            color: '#90ed7d'
          }
        ]
      };
    });
  }
  hasData(options: Highcharts.Options): boolean {
    const series = options.series || [];
    return series.some(s => {
      if ('data' in s && Array.isArray((s as any).data)) {
        return (s as any).data.length > 0;
      }
      return false;
    });
  }


}
