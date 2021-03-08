<template>
  <Card>
    <Row style="margin-bottom: 20px" >
      <SearchForm :searchForm="formData" :searchData="searchData" />
    </Row>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
      :summary-method="handleSummary"
      show-summary
    />
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="pageParams.total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
  </Card>
</template>

<script>
import {
  indexUserAdmin
} from '@/api/data'
import SearchForm from '../../../components/searchForm'
export default {
  components: {
    SearchForm
  },
  data () {
    return {
      searchData: {
        keywords: '',
        start_time: '', // 开始时间
        end_time: '', // 结束时间
        date: ''
      },
      formData: {
        actions: [
          {
            text: '查询',
            type: 'default',
            handle: () => {
              this.pageParams.page = 1
              this.searchParams = {
                ...this.searchData
              }
              // this.indexUserAdmin()
            }
          }
        ],
        components: [
          {
            name: 'SelectDate',
            prop: 'date',
            label: '选择时间：'
          }
        ]
      },
      tableData: [],
      columns: [
        {
          align: 'center',
          title: '分组名称',
          key: 'game',
          // renderHeader:(h, params)=>{
          //   return h('div', [
          //     h(
          //       'img',
               
          //       {
          //         attrs:{src:'www.baidu.com/img/bd_logo1.png'},
          //         style: {
          //           'width':'100px',
          //           'hieght':'20px',
          //           'background':'pink'
          //         },
          //         on: {
          //           click: () => {
          //           }
          //         }
          //       },
          //       '编辑'
          //     ),
          //   ])

          // }
        },
        {
          align: 'center',
          title: '包含游戏数',
          key: 'id'
        },
        {
          align: 'center',
          title: 'GDAU'
        }
      ],
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      ruleInline: {
        keywords: [{ required: true, message: '请输入游戏名称' }],
        phone: [{ required: true, message: '请输入游戏名称' }]
      }
    }
  },
  mounted () {
    // this.indexUserAdmin()
  },
  methods: {
    handleSummary ({ columns, data }) {
      const sums = {}
      columns.forEach((column, index) => {
        const key = column.key
        if (index === 0) {
          sums[key] = {
            key,
            value: '总值'
          }
          return
        }
        const values = data.map(item => Number(item[key]))
        if (!values.every(value => isNaN(value))) {
          const v = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[key] = {
            key,
            value: v
          }
        } else {
          sums[key] = {
            key,
            value: 'N/A'
          }
        }
      })
      return sums
    },
    // 获取管理人员列表
    indexUserAdmin () {
      const params = { ...this.searchData }
      const { date } = this.searchData
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...params
      }
      indexUserAdmin(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.pageParams.total = res.data.data.total
          }
        })
    },
    // 删除
    delUserAdmin (id) {
      this.submitLoading = true
      console.log('删除了的')
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.indexUserAdmin()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.indexUserAdmin()
    }
  }
}
</script>

<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
  /* : ; */
}
.add {
  margin-bottom: 10px;
}
</style>