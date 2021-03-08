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
import { getCurrecnyLog } from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    return {
      data: [],
      total: 1,
      current: 1,
      per_page: 10,
      searchParams: {
        key_word: '',
        date: ''
      },
      searchData: {
        key_word: '',
        date: ''
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
                start_time: this.searchData.date[0] ? this.searchData.date[0] : '',
                end_time: this.searchData.date[1] ? this.searchData.date[1] : ''
              }
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'key_word',
            label: '管理员名称:',
            placeholder: '请输入管理员姓名/ID搜索'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '操作日期:'
          }
        ]
      },
      columns: [
        {
          title: '记录ID',
          key: 'id',
          align: 'center'
        },
        {
          title: '管理员姓名',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '管理员ID',
          key: 'admin_id',
          align: 'center'
        },
        {
          title: '操作日期',
          key: 'create_time',
          align: 'center'
        },
        {
          title: 'IP地址',
          key: 'ip_address',
          align: 'center'
        },
        {
          title: '操作记录',
          key: 'info',
          align: 'center'
        }
      ]
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    //  获取数据
    getDataList () {
      var data = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      getCurrecnyLog(data).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
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
