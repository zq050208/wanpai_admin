<style lang="less">
  @import "./forms.less";
</style>
<template>
  <div>
    <Card>
      <p slot="title">总共{{last_page}}页</p>
      <Form inline :label-width="60">
        <FormItem label="时间：">
          <DatePicker type="month" placeholder="请选择时间" style="width: 300px" :value="month" @on-change="lookForStatements"></DatePicker>
        </FormItem>
        <FormItem label="类型：">
          <Select v-model="channel_type">
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in typeList" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="状态：">
          <Select v-model="status">
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in statusList" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="所属加盟商：" :label-width="100">
          <Select v-model="parent_channel_id">
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in channelList" :key="item.id" :label="item.channel_name"></Option>
          </Select>
        </FormItem>
        <FormItem><Input type="text" v-model="channel_name" placeholder="输入门店名称" /></FormItem>
        <FormItem><Button type="primary" @click="listQuery">查询</Button></FormItem>
      </Form>
      <Table border :columns="columns" :data="data"></Table>
      <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
    </Card>
    <Modal v-model="modal1" title="详细盈利查询" width="600px">
      <Table border :columns="columns1" :data="data1"></Table>
      <div slot="footer">
        <Button type="primary" size="large" @click="cancel">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { storeMonthlyReport } from '@/api/data'
import { getNowFormatDate } from '@/view/forms/time'
export default {
  name: 'store-monthly-report',
  data () {
    return {
      modal1: false,
      exportLoading: false,
      proportion_count: null,
      typeList: [],
      statusList: [],
      channelList: [],
      status: 0,
      channel_type: 0,
      channel_name: '',
      parent_channel_id: 0,
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      month: '',
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
      data1: [],
      columns: [
        {
          title: '月份',
          render: (h, params) => {
            return h('div', {}, this.month)
          }
        },
        {
          title: '加盟商类型',
          render: (h, params) => {
            return h('div', {}, params.row.channel_type === 1 ? '自营' : '联营')
          }
        },
        {
          title: '状态',
          render: (h, params) => {
            return h('div', {}, params.row.status === 1 ? '激活' : '冻结')
          }
        },
        {
          title: '门店名称',
          key: 'channel_name'
        },
        {
          title: '所属加盟商',
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
                    this.showDetails(params)
                  }
                }
              }, '查看')
            ])
          }
        }
      ],
      data: []
    }
  },
  mounted () {
    this.month = getNowFormatDate('month')
    this.getIndexMonthForm()
  },
  methods: {
    getIndexMonthForm () {
      let data = {
        month: this.month,
        page: this.current,
        per_page: this.per_page,
        channel_name: this.channel_name,
        channel_type: this.channel_type,
        status: this.status,
        parent_channel_id: this.parent_channel_id
      }
      storeMonthlyReport(data).then(res => {
        if (res.data.code !== 200) return
        if (res.data.data.data.length) {
          this.data = res.data.data.data
          this.total = res.data.data.total
          this.last_page = res.data.data.last_page
          this.statusList = res.data.data.status
          this.typeList = res.data.data.channel_type
          this.channelList = res.data.data.channel
        } else {
          this.data = []
        }
      })
    },
    lookForStatements (e) {
      if (e) {
        this.month = e
        this.getIndexMonthForm()
      }
    },
    pageChange (e) {
      this.current = e
      this.getIndexMonthForm()
    },
    cancel () {
      this.modal1 = false
      this.modal2 = false
    },
    showDetails (params) {
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
      this.modal1 = true
    },
    listQuery () {
      this.current = 1
      this.total = 0
      this.last_page = 0
      this.getIndexMonthForm()
    }
  }
}
</script>

<style scoped>
  .counts{
    display: flex;
  }
  .counts div{
    flex: 1;
    display: flex;
    justify-content: left;
    align-items: center;
  }
  .counts span{
    padding: 0 18px;
  }
</style>
