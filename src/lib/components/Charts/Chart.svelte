<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import * as echarts from 'echarts';
    import { type PriceHistory } from '../../../routes/api/getPrices/+server';
    import { filter } from '@skeletonlabs/skeleton';
  
    let chart: any;

    
    let { mode, metadata } = $$props
    console.log('LOADING CHART')
    console.log($$props)

    let walletHistory = metadata.walletHistory

    console.log(metadata)

    let chartModes = [
        {
            title: 'Wallet growth', 
            id: 'wallet', 
            xLabels: walletHistory.map((h: PriceHistory) => h.date.toLocaleDateString()),
            values: walletHistory.map((h: PriceHistory) => h.walletValue.usd)
        }
    ]

    const config = chartModes.find(m => m.id == mode)


    
    
    // The options you provided for the chart
    const option = {
      color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: config?.xLabels
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'Line 5',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 3
          },
          showSymbol: false,
          label: {
            show: true,
            position: 'top'
          },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(15, 186, 129, 1)'
              },
              {
                offset: 1,
                color: 'rgba(15, 186, 129, 0.1)'
              }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: config?.values
        }
      ]
    };
  
    onMount(() => {
      const chartDom = document.getElementById('chart');
      chart = echarts.init(chartDom);
      chart.setOption(option);
  
      // Ensure chart resizes with window
      window.addEventListener('resize', () => {
        chart.resize();
      });
    });
  
    // Cleanup when component is unmounted
    onDestroy(() => {
      chart.dispose();
    });
  </script>
  
  <!-- HTML structure -->
<div class="chart">
    <span class="badge variant-soft translate-y-1">{config?.title}</span>
    <div id="chart" class="w-full h-[80%]"></div>
    
</div>
<hr class="!my-6 opacity-50" />
<div class="filters">
<p>This is filters</p>
</div>
  
  <style>
    #chart {
      height: 400px;
      width: 100%;
    }
  </style>
  