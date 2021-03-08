<template>
  <div>
    <SearchForm
      :searchData="searchData"
      :searchForm="searchForm"
    />

    <RadioGroup v-model="tabValue" type="button" @on-change="handleTabChange">
      <Radio label="充值"></Radio>
      <Radio label="货币消耗"></Radio>
      <Radio label="积分消耗"></Radio>
      <Radio label="积分获取"></Radio>
      <Radio label="提现"></Radio>
      <Radio label="提现获取"></Radio>
    </RadioGroup>

    <Row>
      <Col :span="20">
        <div id="charts" style="width: 100%; height: 400px"></div>
      </Col>
    </Row>

  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
let echarts = require('echarts/lib/echarts')

require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/dataZoom')

export default {
  components: {
    SearchForm
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    handleTabChange(value) {
      console.log(value)
    },
    initCharts() {
      let myChart = echarts.init(document.getElementById('charts'))
      const options = {
        // title: {
        //   text: '充值折线图',
        //   left: '50%'
        // },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['金额', '人数'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 1,
            end: 35
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '金额',
            type: 'line',
            stack: '总量',
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: '人数',
            type: 'line',
            stack: '总量',
            data: [220, 182, 191, 234, 290, 330, 310]
          }
        ]
      }
      myChart.setOption(options)
    }
  },
  data () {
    return {
      tabValue: '充值',

      searchData: {
        date: ''
      },
      searchForm: {
        components: [
          {
            name: 'Select',
            label: '应用渠道：',
            prop: 'qudao',
            options: [
              {
                label: '全部',
                value: '1'
              },
              {
                label: '小虎Hoo',
                value: '2'
              },
              {
                label: '分子派对',
                value: '3'
              },
              {
                label: '门店小程序',
                value: '4'
              },
            ]
          },
          {
            name: 'SelectDate',
            label: '选择日期：',
            prop: 'date'
          }
        ],
        actions: [
          {
            text: '查询',
            handle: () => {

            }
          },
          {
            text: '导出数据',
            handle: () => {
              
            }
          }
        ]
      }
    }
  }
}
</script>
