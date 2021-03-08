<template>
    <div>
      <Card>
        <SearchForm :searchForm="searchForm" :searchData="searchData" />
        <Table border :columns="columns" :data="data" ref="table"></Table>
        <Page class="page" :page-size-opts="[10, 20, 30, 50]" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
      </Card>
    </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getUserCurrencyList, getExportUserCurrencyList, prohibitUserLogin, relieveUserLoginProhibit } from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    return {
      data: [],
      total: 1,
      current: 1,
      per_page: 10,
      searchData: {
        content: '',
        date: '',
        range: '',
        gender: 0
      },
      searchParams: {
        content: '',
        date: '',
        range: '',
        gender: 0
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.current = 1
              this.searchParams = {
                ...this.searchData,
                start_age: this.searchData.range[0] ? Number(this.searchData.range[0]) : '',
                end_age: this.searchData.range[1] ? Number(this.searchData.range[1]) : '',
                start_time: this.searchData.date[0] ? (this.searchData.date[0]) : '',
                end_time: this.searchData.date[1] ? (this.searchData.date[1]) : ''
              }
              this.getDataList()
            }
          },
          {
            text: '导出数据',
            type: 'default',
            handle: () => {
              this.exportUserCurrencyList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'content',
            label: '查询内容：',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '选择日期:'
          },
          {
            name: 'RangeInput',
            prop: 'range',
            label: '年龄区间：'
          },
          {
            name: 'Select',
            prop: 'gender',
            label: '性别选择：',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '男',
                value: 1
              },
              {
                label: '女',
                value: 2
              }
            ]
          }
        ]
      },
      columns: [
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
          title: '性别',
          key: 'gender',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.gender === 1 ? '男' : params.row.gender === 2 ? '女' : '')
          }
        },
        {
          title: '年龄',
          key: 'age',
          align: 'center'
        },
        {
          title: '充值货币余额',
          key: 'p_coin',
          align: 'center'
        },
        {
          title: '已消耗充值货币数',
          key: 'p_coin_consume_money',
          align: 'center'
        },
        {
          title: '可提现余额',
          key: 'sure_withdraw_money',
          align: 'center'
        },
        {
          title: '已提现金额',
          key: 'already_withdraw_money',
          align: 'center'
        },
        {
          title: '积分余额',
          key: 'integral',
          align: 'center'
        },
        {
          title: '已消耗积分',
          key: 'consume_integral_num',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: { type: 'primary', disabled: true },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: '提示',
                    content: params.row.prohibit_status === 1 ? '确定封禁吗？' : '确定解除封禁吗？',
                    onOk: () => {
                      if (params.row.prohibit_status === 1) {
                        this.prohibitUser(params.row.user_id)
                      } else {
                        this.relieveUser(params.row.user_id)
                      }
                    }
                  })
                }
              }
            }, params.row.prohibit_status === 1 ? '封禁' : '解除封禁')
          }
        }
      ]
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    // 获取列表数据
    getDataList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      getUserCurrencyList(obj).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    // 导出数据
    exportUserCurrencyList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      getExportUserCurrencyList(obj).then(res => {
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            filename: '用户货币列表',
            data: res.data.data.user_list,
            columns: this.columns
          })
        }
      })
    },
    // 封禁用户
    prohibitUser (ids) {
      prohibitUserLogin({ user_id: ids }).then(res => {
        if (res.data.code === 200) {
          this.getDataList()
        }
      })
    },
    // 解禁用户
    relieveUser (ids) {
      relieveUserLoginProhibit({ user_id: ids }).then(res => {
        if (res.data.code === 200) {
          this.getDataList()
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    handlePageSizeChange (size) {
      this.current = 1
      this.per_page = size
      this.getDataList()
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
