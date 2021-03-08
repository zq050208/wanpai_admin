<template>
  <Card>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
    <Table
      border
      ref="table"
      :data="tableData"
      :columns="columns"
    />
    <Page
      class="page"
      show-total
      show-sizer
      show-elevator
      :total="total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      :page-size-opts="[10, 20, 30, 50]"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
  </Card>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getRechargeOrderList, refundOrder, supplementOrder } from '@/api/data'

export default {
  components: { SearchForm },
  data () {
    return {
      tableData: [],
      total: 0,
      pageParams: {
        page: 1,
        per_page: 10
      },

      searchData: {
        keyword: '',
        date: '',
        order_type: -1,
        app_id: 0,
        pay_type: 0
      },
      searchParams: {
        keyword: '',
        date: '',
        order_type: -1,
        app_id: 0,
        pay_type: 0
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.pageParams.page = 1
              this.searchParams = {
                ...this.searchData,
                start_time: this.searchData.date[0] ? (this.searchData.date[0]) : '',
                end_time: this.searchData.date[1] ? (this.searchData.date[1]) : ''
              }
              delete this.searchParams.date
              this.getRechargeOrderList()
            }
          },
          {
            text: '导出数据',
            type: 'default',
            handle: () => {
              this.exportRechargeOrderList().then(res => {
                this.$refs.table.exportCsv({
                  columns: this.columns,
                  data: res.currency_list.map(item => {
                    return {
                      ...item,
                      pay_status: item.pay_status === 1 ? '成功' : '失败',
                      order_status: this.formatStatus(item.order_status)
                    }
                  })
                })
              })
              
            }
          }
        ],
        components: [
          {
            name: 'Select',
            prop: 'order_type',
            label: '订单状态：',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '充值成功',
                value: 1
              },
              {
                label: '充值失败',
                value: 0
              },
              {
                label: '已退款',
                value: 2
              },
              {
                label: '已补单',
                value: 3
              }
            ]
          },
          {
            name: 'Select',
            prop: 'app_id',
            label: '充值渠道：',
            options: [
              {
                label: '全部',
                value: 0
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
              }
            ]
          },
          {
            name: 'Select',
            prop: 'pay_type',
            label: '支付渠道：',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '微信支付',
                value: 1
              },
              {
                label: '支付宝支付',
                value: 2
              }
            ]
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '选择日期:'
          },
          {
            name: 'Input',
            prop: 'keyword',
            label: '查询内容：',
            placeholder: '输入ID/昵称/手机号查询'
          }
        ]
      },
      columns: [
        {
          title: '订单号',
          key: 'order_id',
          align: 'center'
        },
        {
          title: '用户ID',
          key: 'user_id',
          align: 'center',
          width: '80px'
        },
        {
          title: '用户昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'username',
          align: 'center',
          width: '130px'
        },
        {
          title: '充值金额',
          key: 'money',
          align: 'center',
          width: '100px'
        },
        {
          title: '货币数量',
          key: 'num',
          align: 'center'
        },
        {
          title: '充值渠道',
          key: 'web_name',
          align: 'center'
        },
        {
          title: '支付渠道',
          key: 'pay_type',
          align: 'center'
        },
        {
          title: '第三方状态',
          key: 'pay_status',
          align: 'center',
          width: '0px',
          render: (h, params) => {
            if (params.row.pay_status === 1) return h('div', {}, '成功')
            else return h('div', {}, '失败')
          }
        },
        {
          title: '系统状态',
          key: 'order_status',
          align: 'center',
          render: (h, params) => {
            if (params.row.order_status === 0) return h('div', {}, '充值失败')
            else if (params.row.order_status === 1) return h('div', {}, '充值成功')
            else if (params.row.order_status === 2) return h('div', {}, '已退款')
            else if (params.row.order_status === 3) return h('div', {}, '已补单')
          }
        },
        {
          title: '下单时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '订单状态',
          key: 'operation',
          align: 'center',
          width: 130,
          render: (h, params) => {
            // 第三方状态：pay_status   系统状态：order_status
            const { pay_status, order_status } = params.row
            let status
            if(pay_status === 0) {
              // 付款失败
              status = '充值失败'
            } else if(pay_status === 1) {
              if(order_status === 0) {
                // 显示退款、补单按钮
                return h('div', [
                  h('Button', {
                    props: { type: 'warning', size: 'small' },
                    style: { marginRight: '5px' },
                    on: {
                      click: () => {
                        this.$Modal.confirm({
                          title: '提示',
                          content: '退款后金额将会原路返回，确认退款吗？',
                          onOk: () => {
                            this.refundOrder({ id: Number(params.row.id) })
                          }
                        })
                      }
                    },
                  }, '退款'),
                  h('Button', {
                    props: { type: 'primary', size: 'small' },
                    on: {
                      click: () => {
                        this.$Modal.confirm({
                          title: '提示',
                          content: `补单后系统将发放${params.row.num}货币至用户账户中`,
                          onOk: () => {
                            this.supplementOrder({ trade_order: (params.row.trade_order) })
                          }
                        })
                      }
                    },
                  }, '补单')
                ])
              } else if(order_status === 1) {
                // 充值成功
                status = '充值成功'
              } else if(order_status === 2) {
                // 已退款
                status = '已退款'
              } else if(order_status === 3) {
                // 已补单
                status = '已补单'
              }
            }
            return h('div', {
              style: {
                color: status === '充值成功' ? 'blue' : status === '充值失败' ? 'red' : ''
              }
            }, status)
          }
        }
      ]
    }
  },
  mounted() {
    this.getRechargeOrderList()
  },
  methods: {
    // 获取列表
    getRechargeOrderList() {
      const data = {
        ...this.pageParams,
        ...this.searchParams
      }
      getRechargeOrderList(data).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data
          this.total = res.data.data.total
        }
      })
    },
    exportRechargeOrderList() {
      const data = {
        ...this.pageParams,
        ...this.searchParams,
        is_excel: 1
      }
      return new Promise((resolve, reject) => {
        getRechargeOrderList(data).then(res => {
          if (res.data.code === 200) {
            resolve(res.data.data)
          }
        })
      })
    },
    // 退款
    refundOrder(data) {
      refundOrder(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('退款成功')
          this.getRechargeOrderList()
        }
      })
    },
    // 补单
    supplementOrder(data) {
      supplementOrder(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('补单成功')
          this.getRechargeOrderList()
        }
      })
    },
    formatStatus(status) {
      let result
      switch (status) {
        case 0:
          result = '充值失败'
          break;

        case 1:
          result = '充值成功'
          break;

        case 2:
          result = '已退款'
          break;

        case 3:
          result = '已补单'
          break;

        default:
          break;
      }
      return result
    },
    handlePageChange(page) {
      this.pageParams.page = page
      this.getRechargeOrderList()
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.getRechargeOrderList()
    }
  }
}
</script>
<style scoped>
  .page {
  margin-top: 20px;
  text-align: center;
  }
</style>
