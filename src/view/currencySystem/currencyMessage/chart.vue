<template>
  <Card style="margin: 20px 0">
    <div id="charts" style="width: 100%; height: 400px; margin: 20px 0"></div>
  </Card>
</template>

<script>
let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/dataZoom')

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    mode: {
      type: String,
      default: 'money'
    },
    title: {
      type: String,
      required: true
    }
  },
  watch: {
    data: {
      deep: true,
      handler(val) {
        this.initCharts()
      }
    }
  },
  data() {
    return {
      myChart: null
    }
  },
  mounted() {
    this.myChart = echarts.init(document.getElementById('charts'))
    this.initCharts()
  },
  beforeDestroy() {
    if(this.myChart) this.myChart = null
  },
  methods: {
    initCharts() {
      const series = []
      const moneyData = []
      const userData = []
      const xData = []
      const options = {
        title: {
          text: this.title,
          x:'center',
          y:'top',
          textAlign:'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        // legend: {
        //   data: ['金额', '人数'],
        //   bottom: 0
        // },
        // grid: {
        //   bottom: '18%',
        //   containLabel: true
        // },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          }
        }
      }
      if(this.data.length && this.data.length > 20) {
        options.dataZoom = [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 1,
            end: 35,
            bottom: '6%'
          }
        ]
      } else {
        options.dataZoom = []
      }
      this.data.forEach(item => {
        if(this.mode === 'money') {
          moneyData.push(item.sum_money)
          xData.push(item.day)
        } else {
          userData.push(item.user_nums)
          xData.push(item.day)
        }
      })
      this.myChart.setOption({
        ...options,
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xData
        },
        series: [
          {
            name: this.mode === 'money' ? '金额' : '人数',
            type: 'line',
            data: this.mode === 'money' ? moneyData : userData
          }
        ]
      }, true)
      this.myChart.resize()
    }
  },
}
</script>