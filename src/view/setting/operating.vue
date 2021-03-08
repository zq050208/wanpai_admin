<template>
  <div>
    <Card>
      <SearchForm title="筛选数据" :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <!--操作记录 -->
      <Card class="card">
      <Table  id="mygrid" border :columns="columns" :data="data"></Table>
       <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :total="total"
      :current="current"
      :page-size="per_page"
      @on-change="handlePageCHange"
      @on-page-size-change="handlePageSizeChange"
    />
    </Card>
  </div>
</template>
<script>
import { getOperationLog } from '@/api/data.js'
import SearchForm from '@/components/searchForm'
export default {
  components: { SearchForm },
  data () {
    return {
      current: 1,
      total: 1,
      per_page: 10,
      columns: [
        {
          title: '记录ID',
          key: 'id',
          width: '120px',
          align: 'center'
        },
        {
          title: '管理员姓名',
          key: 'admin_name',
          align: 'center'
        },
        {
          title: '管理员ID',
          key: 'admin_id',
          align: 'center'
        },
        {
          title: '操作时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: 'ip地址',
          key: 'ip_address',
          align: 'center'
        },
        {
          title: '操作记录',
          key: 'info',
          width: '300px',
          align: 'center'
        }
      ],
      data: [],
      searchData: {
        date: ''
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
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'admin_name',
            label: '查询内容',
            placeholder: '请输入管理员姓名/ID搜索'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '发布时间：'
          }
        ]
      }
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
      searchParams.start_time = date[0]
      searchParams.end_time = date[1]
      var data = {
        page: this.current,
        per_page: this.per_page,
        ...searchParams
      }
      getOperationLog(data).then(res => {
        console.log(res)
        this.data = res.data.data.data
        this.current = res.data.data.current_page
        this.total = res.data.data.total
      })
    },
    pageChange (e) { // 页码改变
      this.current = e
    },
    handlePageCHange (page) {
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
