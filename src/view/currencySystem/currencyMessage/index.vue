<template>
  <div>
    <SearchForm
      :searchData="searchData"
      :searchForm="searchForm"
    />

    <MyTable :data="tableData" />

    <Row type="flex" justify="space-between">
      <Col>
        <RadioGroup v-model="tabValue" type="button" @on-change="handleTabChange">
          <template v-if="chartMode === 'money'">
            <Radio v-for="item in moneyTabData" :label="item.value" :key="item.value">{{ item.name }}</Radio>
          </template>
          <template v-if="chartMode === 'user'">
            <Radio v-for="item in userNumTabData" :label="item.value" :key="item.value">{{ item.name }}</Radio>
          </template>
        </RadioGroup>
      </Col>
      <Col>
        <Select v-model="chartMode" @on-change="handleModeChange">
          <Option value="money">金额</Option>
          <Option value="user">人数</Option>
        </Select>
      </Col>
    </Row>

    <Chart
      :mode="chartMode"
      :data="chartData[tabValue] || []"
      :title="chartTitle"
    />

    <Card :dis-hover="true">
      <p>货币兑换比例规则：</p>
      <p>1、货币兑换比例规则，<span style="color: #2d8cf0">充值货币：人民币=100：1 ；提现货币：人民币=1：1 ；积分货币：人民币=20000：1</span></p>
      <p>2、货币之间互不相通，不能相互兑换</p>
      <p>3、积分货币为无价值货币，与人民币之间的比例仅存在虚拟价值</p>
    </Card>

  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
import Chart from './chart'
import MyTable from './table'

import { getCurrencyCharts, getCurrencyInfo } from '@/api/data'
import excel from '@/libs/excel'
import XLSX from 'xlsx'

export default {
  components: {
    SearchForm,
    Chart,
    MyTable
  },
  mounted() {
    this.getCurrencyCharts()
    this.getCurrencyInfo()
  },
  methods: {
    downloadExcel() {
      const { rechargeIncomeMoney, rechargeIncomeUsers, rechargeConsumeMoney, rechargeConsumeUsers, withdrawMoney, withdrawUsers, shouldWithdrawMoney, 
      shouldWithdrawUsers, pointIncomeMoney, pointIncomeUsers, pointConsumeMoney, pointConsumeUsers, historyRechargeIncomeMoney, historyRechargeConsumeMoney, 
      historyWithdrawIncomeMoney, historyWithdrawConsumeMoney, historyPointIncomeMoney, historyPointConsumeMoney} = this.tableData

      var data = [{
        "充值总额": rechargeIncomeMoney,             
        "充值用户数": rechargeIncomeUsers,         
        "充值货币消耗总额": rechargeConsumeMoney,            
        "充值货币消耗用户数": rechargeConsumeUsers,         
        "已提现总额": withdrawMoney,               
        "已提现用户数": withdrawUsers,                    
        "可提现总额": shouldWithdrawMoney,    
        "可提现用户数": shouldWithdrawUsers,               
        "积分发放": pointIncomeMoney,                  
        "获取积分用户数": pointIncomeUsers,                 
        "积分消耗": pointConsumeMoney,                 
        "积分消耗用户数": pointConsumeUsers,                 
        "历史充值总额": historyRechargeIncomeMoney,      
        "历史消耗总额": historyRechargeConsumeMoney,       
        "历史提现获取总额": historyWithdrawIncomeMoney, 
        "历史提现总额": historyWithdrawConsumeMoney,        
        "历史积分发放总额": historyPointIncomeMoney,             
        "历史积分消耗总额": historyPointConsumeMoney,
      }]

      var ws = XLSX.utils.json_to_sheet(data);/* 新建空workbook，然后加入worksheet */
      var wb = XLSX.utils.book_new();/*新建book*/
      XLSX.utils.book_append_sheet(wb, ws, "People");/* 生成xlsx文件(book,sheet数据,sheet命名) */
      XLSX.writeFile(wb, "tableData.xlsx");/*写文件(book,xlsx文件名称)*/
    },
    handleModeChange(mode) {
      if(mode === 'money') {
        this.tabValue = this.tabValue.split('Users')[0] + 'Money'
      } else {
        this.tabValue = this.tabValue.split('Money')[0] + 'Users'
      }
    },
    handleTabChange(value) {
      if(this.chartMode === 'money') {
        this.moneyTabData.forEach(i => {
          if(i.value === value) {
            this.chartTitle = `${i.name}折线图`
          }
        })
      } else {
        this.userNumTabData.forEach(i => {
          if(i.value === value) {
            this.chartTitle = `${i.name}折线图`
          }
        })
      }
    },
    getCurrencyCharts() {
      getCurrencyCharts({...this.searchParams}).then(res => {
        if(res.data.code === 200) {
          this.chartData = res.data.data
        }
      })
    },
    getCurrencyInfo() {
      getCurrencyInfo({...this.searchParams}).then(res => {
        if(res.data.code === 200) {
          this.tableData = res.data.data
        }
      })
    }
  },
  data () {
    return {
      tabValue: 'rechargeIncomeMoney',
      chartMode: 'money',
      chartTitle: '充值折线图',
      moneyTabData: [
        {
          name: '充值',
          value: 'rechargeIncomeMoney'
        },
        {
          name: '货币消耗',
          value: 'rechargeConsumeMoney'
        },
        {
          name: '积分消耗',
          value: 'pointConsumeMoney'
        },
        {
          name: '积分获取',
          value: 'pointIncomeMoney'
        },
        {
          name: '提现',
          value: 'withdrawConsumeMoney'
        },
        {
          name: '提现获取',
          value: 'withdrawIncomeMoney'
        },
      ],
      userNumTabData: [
        {
          name: '充值',
          value: 'rechargeIncomeUsers'
        },
        {
          name: '货币消耗',
          value: 'rechargeConsumeUsers'
        },
        {
          name: '积分消耗',
          value: 'pointConsumeUsers'
        },
        {
          name: '积分获取',
          value: 'pointIncomeUsers'
        },
        {
          name: '提现',
          value: 'withdrawConsumeUsers'
        },
        {
          name: '提现获取',
          value: 'withdrawIncomeUsers'
        },
      ],
      chartData: {},
      tableData: {},

      searchParams: {},
      searchData: {
        app_id: -1,
        date: ''
      },
      searchForm: {
        components: [
          {
            name: 'Select',
            label: '应用渠道：',
            prop: 'app_id',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '小虎Hoo',
                value: 1
              },
              {
                label: '分子派对',
                value: 2
              },
              {
                label: '门店小程序',
                value: 3
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
              this.searchParams = {
                app_id: this.searchData.app_id === -1 ? '' : this.searchData.app_id,
                start_time: this.searchData.date ? this.searchData.date[0] : '',
                end_time: this.searchData.date ? this.searchData.date[1] : '',
              }
              this.getCurrencyCharts()
              this.getCurrencyInfo()
            }
          },
          {
            text: '导出数据',
            handle: () => {
              this.downloadExcel()
            }
          }
        ]
      }
    }
  }
}
</script>
