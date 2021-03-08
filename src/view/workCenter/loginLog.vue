<template>
  <Card>
    <p slot="title">数据列表</p>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
    />
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageCHange"
      @on-page-size-change="handlePageSizeChange"
    />
  </Card>
</template>

<script>
import { getLoginLog } from '@/api/data'

export default {
  data () {
    return {
      total: 0,
      tableData: [],
      level: '1',
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      columns: [
        {
          align: 'center',
          title: '管理员账号',
          key: 'admin_name'
        },
        {
          align: 'center',
          title: '时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: 'IP',
          key: 'ip_address'
        }
      ]
    }
  },
  mounted () {
    this.getLoginLog()
  },
  methods: {
    getLoginLog () {
      const data = {
        ...this.pageParams
      }
      getLoginLog(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.total = res.data.data.total
          }
        })
    },
    handlePageCHange (page) {
      this.pageParams.page = page
      this.getLoginLog()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.getLoginLog()
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
