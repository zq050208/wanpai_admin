<template>
  <div>
    <SearchForm
      title="筛选查询"
      :searchForm="searchForm"
      :searchData="searchData"
    />
    <Table
      border
      ref="selection"
      :columns="columns"
      :data="tableData"
    ></Table>

    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="tableTotal"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
import { getMsgRecord } from '@/api/data'

export default {
  components: {
    SearchForm
  },
  mounted() {
    this.getMsgRecord()
  },
  data () {
    return {
      tableTotal: 0,
      tableData: [],
      pageParams: {
        page: 1,
        per_page: 10
      },
      ifSelectAll: false,
      selected: [],
      searchParams: {
        mobile: '',
        date: ''
      },
      searchData: {
        mobile: '',
        date: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = {...this.searchData}
              this.pageParams.page = 1
              this.getMsgRecord()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            label: '手机号：',
            prop: 'mobile',
            placeholder: '请输入手机号'
          },
          {
            name: 'SelectDate',
            showLeft: false,
            label: '时间选择：',
            prop: 'date',
            placeholder: '请选择时间'
          }
        ]
      },
      columns: [
        {
          align: 'center',
          title: '编号',
          key: 'id'
        },
        {
          align: 'center',
          title: '手机号',
          key: 'mobile'
        },
        {
          align: 'center',
          title: '短信内容',
          key: 'content'
        },
        {
          align: 'center',
          title: '发送结果',
          key: 'send_result'
        },
        {
          align: 'center',
          title: '发送时间',
          key: 'create_time'
        }
      ]
    }
  },
  methods: {
    getMsgRecord() {
      const params = { ...this.searchParams }
      const { date } = this.searchParams
      delete params.date
      if (typeof date === 'string') {
       params.days = date
      } else {
        params.start_time = date[0]
        params.end_time = date[1]
      }

      const data = {
        ...this.pageParams,
        ...params
      }
      getMsgRecord(data)
        .then(res => {
          if(res.data.code === 200) {
            this.tableTotal = res.data.data.total
            this.tableData = res.data.data.data
          }
        })
    },
    handlePageChange(page) {
      this.pageParams.page = page
      this.getMsgRecord()
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.getMsgRecord()
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