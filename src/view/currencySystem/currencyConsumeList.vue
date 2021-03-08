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
import { getCurrencyDetailed, getCurrencyConfig } from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    return {
      data: [],
      total: 1,
      current: 1,
      sign: -1,
      per_page: 10,
      searchData: {
        app_id: -1,
        currency_type: -1,
        date: '',
        range: '',
        keysword: ''
      },
      searchParams: {
        app_id: -1,
        currency_type: -1,
        date: '',
        range: '',
        keysword: ''
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
                start_money: this.searchData.range[0] ? Number(this.searchData.range[0]) : '',
                end_money: this.searchData.range[1] ? Number(this.searchData.range[1]) : '',
                start_time: this.searchData.date[0] ? (this.searchData.date[0]) : '',
                end_time: this.searchData.date[1] ? (this.searchData.date[1]) : '',
              }
              delete this.searchParams.range
              delete this.searchParams.date
              this.getDataList()
            }
          },
          {
            text: '导出数据',
            type: 'default',
            handle: () => {
              this.exportData()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            prop: 'app_id',
            label: '消耗渠道：',
            options: [],
            onChange: value => {
              this.getCurrencyConfig({ app_id: value === -1 ? '' : value })
            }
          },
          {
            name: 'Select',
            prop: 'currency_type',
            label: '货币类型：',
            options: []
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '注册时间:'
          },
          {
            name: 'Input',
            prop: 'keysword',
            label: '查询内容：',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'RangeInput',
            prop: 'range',
            label: '金额区间：'
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
          title: '消耗渠道',
          key: 'web_name',
          align: 'center'
        },
        {
          title: '消耗数额',
          key: 'money',
          align: 'center'
        },
        {
          title: '货币类型',
          key: 'currency_type',
          align: 'center'
        },
        {
          title: '消费内容',
          key: 'name',
          align: 'center'
        },
        {
          title: '消耗时间',
          key: 'create_time',
          align: 'center'
        }
      ]
    }
  },
  mounted () {
    this.getDataList()
    this.getCurrencyConfig()
  },
  methods: {
    getDataList () {
      var obj = {
        ...this.searchParams,
        page: this.current,
        per_page: this.per_page,
        sign: this.sign,
        app_id: this.searchParams.app_id === -1 ? '' : this.searchParams.app_id,
        currency_type: this.searchParams.currency_type === -1 ? '' : this.searchParams.currency_type,
      }
      getCurrencyDetailed(obj).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    getCurrencyConfig(data) {
      getCurrencyConfig(data).then(res => {
        if(res.data.code === 200) {
          if(!data) {
            const appList = res.data.data.app_list.map(item => {
              return {
                label: item.web_name,
                value: item.id
              }
            })
            appList.unshift({
              label: '全部',
              value: -1
            })
            this.searchForm.components[0].options = appList
          }
          const currencyList = res.data.data.currency_list.map(item => {
            return {
              label: item.name,
              value: item.id
            }
          })
          currencyList.unshift({
            label: '全部',
            value: -1
          })
          this.searchForm.components[1].options = currencyList
        }
      })
    },
    // 导出数据
    exportData () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        sign: this.sign,
        is_excel: 1,
        ...this.searchParams
      }
      getCurrencyDetailed(obj).then(res => {
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            filename: '货币消耗列表',
            data: res.data.data.currency_list,
            columns: this.columns
          })
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.per_page = 10
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
