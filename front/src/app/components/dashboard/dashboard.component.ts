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
    this.apiService.get('/dashboard/chart/data/1', { limit: 5000 }).subscribe(
      (response: any) => {
        const formattedData = response.data.map((item: any) => {
          const label = new Date(item.category).toLocaleDateString('pt-BR');
          return [label, item.value];
        });

        this.chartOneOptions = {
          chart: { type: 'column' },
          title: { text: 'Reservas por data' },
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
              data: formattedData
            }
          ]
        };
      },
      (error) => {
        console.error('Erro ao buscar dados:', error);
      }
    );
  }
   getChartTwo(): void {
    this.apiService.get('/dashboard/chart/data/2').subscribe(
      (res: any) => {
        const data = res.data.map((item: any) => [
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
              data
            }
          ]
        };
      }
    );
  }

  getChartThree(): void {
    this.apiService.get('/dashboard/chart/data/3').subscribe(
      (res: any) => {
        const data = res.data.map((item: any) => [item.category, item.value]);

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
      }
    );
  }

  getChartFour(): void {
    this.apiService.get('/dashboard/data').subscribe(
      (res: any) => {
        const dataMap = new Map<string, { departures: number; arrivals: number }>();

        res.data.forEach((item: any) => {
          const date = new Date(item.date).toLocaleDateString('pt-BR');
          if (!dataMap.has(date)) {
            dataMap.set(date, { departures: 0, arrivals: 0 });
          }
          const current = dataMap.get(date)!;
          current.departures += item.departures;
          current.arrivals += item.arrivals;
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
      }
    );
  }

}
