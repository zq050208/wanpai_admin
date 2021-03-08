<style lang="less">
  @import "./forms.less";
</style>
<template>
  <div>
    <Card>
      <p slot="title">总共{{last_page}}页</p>
      <div class="title">
        <Form inline :label-width="50">
          <span>时间区间</span>
          <DatePicker
            type="datetimerange" placeholder="请选择起始时间与结束时间" style="width: 300px"
            @on-change="timeChange" @on-ok="lookForStatements"
          >
          </DatePicker>
          <Button @click="yesterdayData">昨日</Button>
          <Button @click="weekData">本周</Button>
          <FormItem label="所属加盟商：" :label-width="100">
            <Select v-model="grandpa_channel_id" @on-change="grandpaChange">
              <Option :value="0" :key="0" label="全部"></Option>
              <Option :value="item.id" v-for="item in channelList" :key="item.id" :label="item.channel_name"></Option>
            </Select>
          </FormItem>
          <FormItem label="所属门店：" :label-width="100">
            <Select v-model="parent_channel_id">
              <Option :value="0" :key="0" label="全部"></Option>
              <Option :value="item.id" v-for="item in storeList" :key="item.id" :label="item.channel_name"></Option>
            </Select>
          </FormItem>
          <FormItem><Input type="text" v-model="channel_name" placeholder="输入店员名称" /></FormItem>
          <Button type="primary" @click="listQuery">查询</Button>
        </Form>
      </div>
      <Table border :columns="columns" :data="data"></Table>
      <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
      <Modal v-model="modal" title="详细盈利查询" width="600px">
        <Table border :columns="columns1" :data="data1"></Table>
        <div slot="footer">
          <Button type="primary" size="large" @click="cancel">关闭</Button>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import { staffTotalDailyReport, getSonChannel } from '@/api/data'
export default {
  name: 'staff-daily-report',
  data () {
    return {
      modal: false,
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      start_time: '',
      end_time: '',
      channelList: [],
      storeList: [],
      channel_name: '',
      channel_type: 0,
      grandpa_channel_id: 0,
      parent_channel_id: 0,
      data1: [],
      columns1: [
        {
          title: '货币类型',
          key: 'type'
        },
        {
          title: '有效单数',
          key: 'order_num'
        },
        {
          title: '中奖率',
          key: 'win_probability'
        },
        {
          title: '投注总额',
          key: 'total_money'
        },
        {
          title: '派彩金额',
          key: 'win_money'
        },
        {
          title: '盈利金额',
          key: 'profit_money'
        }
      ],
      data: [],
      columns: [
        {
          title: '店员名称',
          key: 'channel_name'
        },
        {
          title: '所属加盟商',
          key: 'grandpa_name'
        },
        {
          title: '所属门店',
          key: 'parent_name'
        },
        {
          title: '有效单数',
          key: 'order_num'
        },
        {
          title: '中奖率',
          key: 'win_probability'
        },
        {
          title: '投注总额',
          key: 'total_money'
        },
        {
          title: '派彩金额',
          key: 'win_money'
        },
        {
          title: '盈利金额',
          key: 'profit_money'
        },
        {
          title: '流水分成',
          render: (h, params) => {
            return h('div', parseFloat(params.row.allowance).toFixed(2))
          }
        },
        {
          title: '详情查询',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.showModal(params)
                  }
                }
              }, '查看')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getIndexDayForm()
  },
  methods: {
    grandpaChange (id) {
      getSonChannel({ channel_id: id }).then(res => {
        this.storeList = res.data.data.data
      })
    },
    getIndexDayForm () {
      let data = {
        start_time: this.start_time,
        end_time: this.end_time,
        page: this.current,
        per_page: this.per_page,
        channel_name: this.channel_name,
        parent_channel_id: this.parent_channel_id,
        grandpa_channel_id: this.grandpa_channel_id
      }
      staffTotalDailyReport(data).then(res => {
        if (res.data.code !== 200) return
        if (res.data.data.data) {
          this.data = res.data.data.data
          this.total = res.data.data.total
          this.last_page = res.data.data.last_page
          this.channelList = res.data.data.channel
        }
      })
    },
    pageChange (e) {
      this.current = e
      this.getIndexDayForm()
    },
    timeChange (e) {
      if (e) {
        this.start_time = e[0]
        this.end_time = e[1]
      }
    },
    lookForStatements () {
      if (this.start_time && this.end_time) {
        this.getIndexDayForm(this.start_time, this.end_time)
      } else {
        this.$Message.error('请选择起始时间与结束时间')
      }
    },
    cancel () {
      this.modal = false
    },
    showModal (params) {
      let obj = []
      obj.push({
        type: '虎玉',
        order_num: params.row.huyu_order_num,
        win_probability: params.row.huyu_win_probability,
        total_money: params.row.huyu_total_money,
        win_money: params.row.huyu_win_money,
        profit_money: params.row.huyu_profit_money
      })
      obj.push({
        type: '网费本金',
        order_num: params.row.balance_order_num,
        win_probability: params.row.balance_win_probability,
        total_money: params.row.balance_total_money,
        win_money: params.row.balance_win_money,
        profit_money: params.row.balance_profit_money
      })
      obj.push({
        type: '网费赠金',
        order_num: params.row.present_order_num,
        win_probability: params.row.present_win_probability,
        total_money: params.row.present_total_money,
        win_money: params.row.present_win_money,
        profit_money: params.row.present_profit_money
      })
      this.data1 = obj
      this.modal = true
    },
    yesterdayData () {
      let day1 = new Date()
      day1.setTime(day1.getTime() - 24 * 60 * 60 * 1000)
      let s1 = day1.getFullYear() + '-' + (day1.getMonth() + 1) + '-' + day1.getDate()
      let start_time = s1 + ' 00:00:00'
      let end_time = s1 + ' 23:59:59'
      this.start_time = start_time
      this.end_time = end_time
      this.getIndexDayForm()
    },
    todayData () {
      let day2 = new Date()
      day2.setTime(day2.getTime())
      let s2 = day2.getFullYear() + '-' + (day2.getMonth() + 1) + '-' + day2.getDate()
      let start_time = s2 + ' 00:00:00'
      let end_time = s2 + ' 23:59:59'
      this.start_time = start_time
      this.end_time = end_time
      this.getIndexDayForm()
    },
    weekData () {
      let myDate = new Date()
      myDate = new Date(myDate - (myDate.getDay()) * 86400000)
      let this_week_first_day = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate()
      myDate = new Date((myDate / 1000 + 6 * 86400) * 1000)
      let this_week_last_day = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate()
      this.start_time = this_week_first_day + ' 00:00:00'
      this.end_time = this_week_last_day + ' 23:59:59'
      this.getIndexDayForm()
    },
    listQuery () {
      this.current = 1
      this.total = 0
      this.last_page = 0
      this.getIndexDayForm()
    }
  }
}
</script>

<style scoped>

</style>
