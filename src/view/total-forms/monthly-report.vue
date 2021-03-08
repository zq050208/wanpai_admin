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
        <FormItem label="加盟商："><Input type="text" v-model="channel_name" placeholder="输入加盟商名称" /></FormItem>
        <FormItem><Button type="primary" @click="listQuery">查询</Button></FormItem>
        <FormItem><Button icon="md-download" :loading="exportLoading" @click="exportExcel">导出文件</Button></FormItem>
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
    <Modal v-model="modal2" title="查看分成（单位：元）" width="600px">
      <Table border :columns="columns2" :data="data2"></Table>
      <div class="counts" style="padding-top:16px;text-align: right;">
        <div></div><div></div>
        <div><span>小计：</span></div>
        <div><span>{{proportion_count}}</span></div>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="cancel">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { getMonthlyReport, createBill, exportExcel } from '@/api/data'
import { getNowFormatDate } from '@/view/forms/time'
import excel from '@/libs/excel'
export default {
  name: 'monthly-report',
  inject: ['reload'],
  data () {
    return {
      modal1: false,
      modal2: false,
      exportLoading: false,
      proportion_count: null,
      typeList: [],
      statusList: [],
      status: 0,
      channel_type: 0,
      channel_name: '',
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      month: '',
      columns2: [
        {
          title: '阶梯',
          render: (h, params) => {
            return h('div', {}, params.row._index + 1)
          }
        },
        {
          title: '区间',
          render: (h, params) => {
            return h('div', {}, params.row.low_range + ' - ' + params.row.high_range)
          }
        },
        {
          title: '分成比例',
          // key: 'proportion'
          render: (h, params) => {
            return h('div', {}, params.row.proportion + '%')
          }
        },
        {
          title: '分成金额',
          key: 'commission'
        }
      ],
      data2: [],
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
          title: '加盟商名称',
          key: 'channel_name'
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
          title: '详情查询',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: { click: () => {
                  this.showDetails(params)
                } }
              }, '查看')
            ])
          }
        },
        {
          title: '流水分成',
          // key: 'allowance'
          render: (h, params) => {
            return h('div', parseFloat(params.row.allowance).toFixed(2))
          }
        },
        {
          title: '账单状态',
          key: 'is_bill',
          render: (h, params) => {
            return h('div', {}, params.row.is_bill === 1 ? '已生成账单' : '未生成')
          }
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small', disabled: params.row.is_bill === 1 },
                on: { click: () => {
                  this.$Modal.confirm({
                    title: '提示',
                    content: '是否生成' + params.row.channel_name + this.month + '的账单',
                    onOk: () => {
                      createBill({ channel_id: params.row.id, month: this.month }).then(res => {
                        if (res.data.code === 200) {
                          this.$Message.success('成功')
                          this.reload()
                        }
                      })
                    }
                  })
                } }
              }, '生成账单')
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
      let data = { month: this.month, page: this.current, per_page: this.per_page, channel_name: this.channel_name, channel_type: this.channel_type, status: this.status }
      getMonthlyReport(data).then(res => {
        if (res.data.code !== 200) return
        if (res.data.data.data.length) {
          this.data = res.data.data.data
          this.total = res.data.data.total
          this.last_page = res.data.data.last_page
          this.statusList = res.data.data.status
          this.typeList = res.data.data.channel_type
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
    },
    exportExcel () {
      let data = { month: this.month, page: this.current, per_page: this.per_page, channel_name: this.channel_name, channel_type: this.channel_type, status: this.status }
      exportExcel(data).then(res => {
        let obj = res.data.data
        if (obj.data.length) {
          this.exportLoading = true
          const params = {
            title: obj.title,
            key: obj.key,
            data: obj.data,
            autoWidth: true,
            filename: this.month + '加盟商月报表'
          }
          excel.export_array_to_excel(params)
          this.exportLoading = false
        } else {
          this.$Message.info('表格数据不能为空！')
        }
      })
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
