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
      per_page: 10,
      sign: 1,
      searchData: {
        app_id: -1,
        currency_type: -1,
        date: '',
        keysword: ''
      },
      searchParams: {
        app_id: -1,
        currency_type: -1,
        date: '',
        keysword: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.current = 1
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
            label: '获取渠道：',
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
            name: 'Input',
            prop: 'keysword',
            label: '查询内容：',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '选择日期:'
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
          title: '获取渠道',
          key: 'web_name',
          align: 'center'
        },
        {
          title: '获取数额',
          key: 'money',
          align: 'center'
        },
        {
          title: '货币类型',
          key: 'currency_type',
          align: 'center'
        },
        {
          title: '获取路径',
          key: 'name',
          align: 'center'
        },
        {
          title: '获取时间',
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
    // 获取列表数据
    getDataList () {
      this.searchParams = {
        ...this.searchData,
        start_time: this.searchData.date[0] ? (this.searchData.date[0]) : '',
        end_time: this.searchData.date[1] ? (this.searchData.date[1]) : ''
      }
      delete this.searchParams.date
      var obj = {
        page: this.current,
        per_page: this.per_page,
        sign: this.sign,
        ...this.searchParams,
        app_id: this.searchParams.app_id === -1 ? '' : this.searchParams.app_id,
        currency_type: this.searchParams.currency_type === -1 ? '' : this.searchParams.currency_type
      }
      getCurrencyDetailed(obj).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    // 获取货币配置
    getCurrencyConfig (data) {
      getCurrencyConfig(data).then(res => {
        if (res.data.code === 200) {
          if (!data) {
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
      this.searchParams = {
        ...this.searchData,
        start_time: this.searchData.date[0] ? (this.searchData.date[0]) : '',
        end_time: this.searchData.date[1] ? (this.searchData.date[1]) : ''
      }
      delete this.searchParams.date
      var obj = {
        page: this.current,
        per_page: this.per_page,
        sign: this.sign,
        is_excel: 1,
        ...this.searchParams,
        app_id: this.searchParams.app_id === -1 ? '' : this.searchParams.app_id,
        currency_type: this.searchParams.currency_type === -1 ? '' : this.searchParams.currency_type
      }
      getCurrencyDetailed(obj).then(res => {
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            filename: '货币获取列表',
            data: res.data.data.currency_list,
            columns: this.columns
          })
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    handlePageSizeChange (size) {
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
