<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
      <div class="total_income">
        <!-- <span>总收入{{total_income.total_income}}元</span>
        <span style="margin: 0 30px">已提现{{total_income.total_already}}元</span>
        <span>待提现{{total_income.total_wait}}元</span> -->
        <Button type="primary" @click="exportData">导出数据</Button>
      </div>
      <Table border :columns="columns" :data="dataList" ref="table"></Table>
      <Page class="page" :page-size-opts="[10, 20, 30, 50]" placement="top" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
  </div>
</template>
<script>
import { getIncomeList, incomeExport } from '@/api/data'
import SearchForm from '@/components/searchForm'
export default {
  components: { SearchForm },
  data () {
    return {
      dataList: [],
      total: 1,
      total_income: {},
      current: 1,
      per_page: 10,
      searchForm: {
        actions: [
          {
            text: '搜索',
            type: 'primary',
            handle: () => {
              this.current = 1
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'SelectDate',
            prop: 'date',
            label: '查看区间：'
          },
          {
            name: 'Input',
            prop: 'key_word',
            label: '查询内容：',
            placeholder: '输入ID/昵称/手机号查询'
          }
        ]
      },
      searchData: {
        key_word: '',
        date: ''
      },
      columns: [
        {
          title: '用户角色',
          key: 'role',
          align: 'center',
          render: (h, params) => {
            if (params.row.ident === 2) return h('div', {}, '大管理')
            else if (params.row.ident === 1) return h('div', {}, '小管理')
            else if (params.row.ident === 0) return h('div', {}, '普通用户')
          }
        },
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
          title: '总收入金额',
          key: 'income',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', {}, params.row.income + '元')
            ])
          }
        },
        {
          title: '可提现金额',
          key: 'sure_withdraw_money',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', {}, params.row.sure_withdraw_money + '元')
            ])
          }
        },
        {
          title: '已提现金额',
          key: 'already_withdraw_money',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', {}, params.row.already_withdraw_money + '元')
            ])
          }
        },
        {
          title: '待提现金额',
          key: 'wait_withdraw_money',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', {}, params.row.wait_withdraw_money + '元')
            ])
          }
        }
      ],
      exportColumns: [
        {
          title: '用户角色',
          key: 'ident',
          align: 'center'
        },
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
          title: '总收入金额',
          key: 'income',
          align: 'center'
        },
        {
          title: '可提现金额',
          key: 'sure_withdraw_money',
          align: 'center'
        },
        {
          title: '已提现金额',
          key: 'already_withdraw_money',
          align: 'center'
        },
        {
          title: '待提现金额',
          key: 'wait_withdraw_money',
          align: 'center'
        }
      ]
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    getDataList () {
      const searchParams = { ...this.searchData }
      const { date } = this.searchData
      delete searchParams.date
      if (date) {
        searchParams.start_time = date[0]
        searchParams.end_time = date[1]
      }
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...searchParams
      }
      getIncomeList(obj).then(res => {
        if (res.data.code === 200) {
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
          this.dataList = res.data.data.data
          this.total_income = res.data.data.total_income
        }
      })
    },
    // 页码改变
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    // size 改变
    handlePageSizeChange (size) {
      this.per_page = size
      this.getDataList()
    },
    // 导出数据
    exportData () {
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
      incomeExport(data).then(res => {
        console.log(res)
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            filename: '收入管理表',
            columns: this.exportColumns,
            data: res.data.data.export_list
          })
        }
      })
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
.total_income{
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px
}
</style>
