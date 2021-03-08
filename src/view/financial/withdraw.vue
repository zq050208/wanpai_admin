<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
      <Table border :columns="columns1" :data="data" ref="table" ></Table>
      <Page class="page" :page-size-opts="[10, 20, 30, 50]" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- 详情 -->
    <Modal v-model="detail1Modal" :width="700" @on-cancel="closeClick">
      <div>
      <p style="margin-bottom:10px">交易详情</p>
      <div id="detailContent" :style="'height:'+'400px'" ref="detailContent">
        <div style="display: flex; flex-direction: column">
          <div class="listItem" v-for="item in detailList" :key="item.index"> <div>{{item.create_time}}<span style="margin-left: 20px">{{item.desc_name}}</span></div> <div>{{item.money}}元</div> </div>
        </div>
      </div>
      </div>
      <div slot="footer">
        <Button type="primary" size="default" @click="closeClick">关闭</Button>
      </div>
    </Modal>
    <!-- 已审核详情 -->
    <Modal v-model="detail2Model" :width="400">
      <p style="text-align: center; margin-bottom:20px">查看详情</p>
      <div style="padding-bottom:10px">审核状态：<span>{{datailData.status === -1 ? '拒绝' : '已通过'}}</span></div>
      <div style="padding-bottom:10px">申请时间: <span>{{datailData.create_time}}</span></div>
      <div style="padding-bottom:10px">审核时间: <span>{{datailData.check_time}}</span></div>
      <div style="padding-bottom:10px">审核人: <span>{{datailData.check_user}}</span></div>
      <div v-if="datailData.status === -1" style="display: flex">拒绝原因：<div class="detailbox">{{datailData.refuse_reason}}</div></div>
    </Modal>
    <!-- 拒绝弹窗 -->
    <Modal v-model="refuseModel" :width="400" @on-cancel="cancelClick">
      <p style="text-align: center; margin-bottom:20px">填写拒绝原因</p>
      <Form ref='refusedData' :model="refusedData" :rules="rules">
        <FormItem  prop="refuse_reason">
          <Input v-model="refusedData.refuse_reason"  type="textarea" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入相关描述！" style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer">
          <Button type="primary" size="default" @click="submitData('refusedData')">提交</Button>
      </div>
    </Modal>

  </div>
</template>
<script>
import { getWithdrawApply, getWithdrawRecord, withdrawApplyExport, refuseFinance, agreeFinance } from '@/api/data'
import SearchForm from '@/components/searchForm'

export default {
  components: { SearchForm },
  data () {
    return {
      ifSelectAll: false,
      selected: [],
      detail1Modal: false,
      detail2Model: false,
      refuseModel: false,
      scrollTop: 0,
      searchParams: {
        deal_status: 1,
        key_word: '',
        date: '',
        range: ''
      },
      searchData: {
        deal_status: 1,
        app_id: 0,
        key_word: '',
        date: '',
        range: ''
      },
      refusedData: { refuse_reason: '' },
      data: [],
      detailList: [],
      datailData: {},
      total: 1,
      current: 1,
      per_page: 10,
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'default',
            handle: () => {
              this.current = 1
              this.searchParams = {
                ...this.searchData,
                min: this.searchData.range[0] ? Number(this.searchData.range[0]) : '',
                max: this.searchData.range[1] ? Number(this.searchData.range[1]) : '',
                start_time: this.searchData.date[0] ? (this.searchData.date[0]) : '',
                end_time: this.searchData.date[1] ? (this.searchData.date[1]) : ''
              }
              delete this.searchParams.range
              delete this.searchParams.date
              this.getdataList()
            }
          },
          {
            text: '导出数据',
            type: 'default',
            handle: () => {
              this.withdrawApplyExport().then(res => {
                this.$refs.table.exportCsv({
                  filename: '提现审核表',
                  data: res.data.export_list,
                  columns: this.exportcolumns
                })
              })
            }
          }
        ],
        components: [
          {
            name: 'Select',
            prop: 'deal_status',
            options: [
              {
                label: '已处理',
                value: 2
              },
              {
                label: '待处理',
                value: 1
              }
            ]
          },
          {
            name: 'Select',
            prop: 'app_id',
            label: '提现渠道:',
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
            name: 'SelectDate',
            prop: 'date',
            label: '提现时间:'
          },
          {
            name: 'Input',
            prop: 'key_word',
            label: '查询内容:',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'RangeInput',
            prop: 'range',
            label: '金额区间：'
          }
        ]
      },
      columns1: [
        {
          title: '用户ID',
          key: 'user_id',
          align: 'center'
        },
        {
          title: '用户昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'username',
          align: 'center'
        },
        {
          title: '提现渠道',
          key: 'app_id',
          align: 'center',
          render: (h, params) => {
            if (params.row.app_id === 1) return h('div', {}, '小虎Hoo')
            else if (params.row.app_id === 2) return h('div', {}, '分子派对')
            else if (params.row.app_id === 3) return h('div', {}, '门店小程序')
          }
        },
        {
          title: '用户角色',
          key: 'ident',
          align: 'center',
          render: (h, params) => {
            if (params.row.ident === 2) return h('div', {}, '大管理')
            else if (params.row.ident === 1) return h('div', {}, '小管理')
            else if (params.row.ident === 0) return h('div', {}, '普通用户')
            else return h('div', {}, params.row.ident)
          }
        },
        {
          title: '提现金额',
          key: 'amount',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', {}, params.row.amount),
              h('Button', {
                props: { type: 'success', size: 'small' },
                style: { margin: '5px 0px 5px 0px' },
                on: {
                  click: () => {
                    this.lookDetail(params.row.user_id)
                  }
                }
              }, '查看详情')
            ])
          }
        },
        {
          title: '提现路径',
          key: 'pay_path',
          align: 'center',
          render: (h, params) => {
            if (params.row.pay_path === 1) {
              return h('div', {}, '微信')
            } else {
              return h('div', {}, '支付宝')
            }
          }
        },
        {
          title: '提现时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            if (params.row.status === 1) {
              return h('div', [
                h('Button', {
                  props: { type: 'default', size: 'small' },
                  style: { margin: '0px 20px 0px 0px' },
                  on: {
                    click: () => {
                      this.refuseModel = true
                      this.refusedData.id = params.row.id
                      // this.refusedData.status = -1
                    }
                  }
                }, '拒绝'),
                h('Button', {
                  props: { type: 'success', size: 'small' },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '该用户提现金额' + params.row.amount + '元,' + ' 确认通过吗？',
                        onOk: () => {
                          this.getPass(params.row.id)
                        }
                      })
                    }
                  }
                }, '通过')
              ])
            } else if (params.row.status === -1) {
              return h('Button', {
                props: { type: 'default', size: 'small' },
                on: {
                  click: () => {
                    this.lookprocessed(params.row)
                  }
                }
              }, '已拒绝')
            } else if (params.row.status === 2) {
              return h('Button', {
                props: { type: 'success', size: 'small' },
                on: {
                  click: () => {
                    this.lookprocessed(params.row)
                  }
                }
              }, '已通过')
            }
          }
        }
      ],
      exportcolumns: [
        {
          title: '用户ID',
          key: 'user_id',
          align: 'center'
        },
        {
          title: '用户昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '手机号',
          key: 'username',
          align: 'center'
        },
        {
          title: '提现渠道',
          key: 'app_id',
          align: 'center'
        },
        {
          title: '用户角色',
          key: 'ident',
          align: 'center'
        },
        {
          title: '提现金额',
          key: 'amount',
          align: 'center'
        },
        {
          title: '提现路径',
          key: 'pay_path',
          align: 'center'
        },
        {
          title: '提现时间',
          key: 'create_time',
          align: 'center'
        }
      ],
      rules: {
        refuse_reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.getdataList()
  },

  methods: {
    // 获取列表数据
    getdataList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      getWithdrawApply(obj).then(res => {
        if (res.data.code === 200) {
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
          this.data = res.data.data.data
        }
      })
    },
    // 导出数据列表
    withdrawApplyExport () {
      return new Promise((resolve, reject) => {
        const searchParams = { ...this.searchData }
        const { date } = this.searchData
        delete searchParams.date
        if (date) {
          searchParams.start_time = date[0]
          searchParams.end_time = date[1]
        }
        var data = {
          ...searchParams
        }
        withdrawApplyExport(data)
          .then(res => {
            if (res.data.code === 200) {
              resolve(res.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 通过事件
    getPass (ids) {
      agreeFinance({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('通过成功')
          this.current = 1
          this.getdataList()
        }
      })
    },
    // 拒绝事件
    submitData (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          refuseFinance(this.refusedData).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('拒绝成功')
              this.refuseModel = false
              this.$refs.refusedData.resetFields()
              this.current = 1
              this.getdataList()
            }
          })
        }
      })
    },
    cancelClick () { this.$refs.refusedData.resetFields() },
    // 查看详情
    lookDetail (ids) {
      getWithdrawRecord({ user_id: ids }).then(res => {
        if (res.data.code === 200) {
          this.detailList = res.data.data
          this.detail1Modal = true
          this.$refs.detailContent.scrollTop = 0
        }
      })
    },
    lookprocessed (obj) {
      this.datailData.status = obj.status
      this.datailData.create_time = obj.create_time
      this.datailData.check_time = obj.check_time
      this.datailData.check_user = obj.check_user
      this.datailData.refuse_reason = obj.refuse_reason
      this.detail2Model = true
    },
    closeClick () {
      this.detail1Modal = false
      this.$refs.detailContent.scrollTop = 0
    },
    // 页码改变
    handlePageChange (page) {
      this.current = page
      this.per_page = 10
      this.ifSelectAll = false
      this.getdataList()
    },
    // size 改变
    handlePageSizeChange (size) {
      this.per_page = size
      this.current = 1
      this.getdataList()
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
.listItem{
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px
}
.detailbox{
  border: 1px solid #ccc;
  min-height: 100px;
  width: 250px;
  padding: 10px 20px;
  word-break: break-all;
  word-wrap: break-word;
}
#detailContent {
  overflow-y: scroll
}
</style>
