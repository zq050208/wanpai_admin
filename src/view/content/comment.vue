<template>
  <div>
    <SearchForm title="筛选查询" :searchForm="searchForm" :searchData="searchData" />

    <Card>
      <p slot="title">数据列表</p>
      <Table
        ref="table"
        border
        stripe
        :data="tableData"
        :columns="columns"
        @on-selection-change="handleSelectChange"
      />

      <div style="margin-top: 20px">
        <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll">全选</Checkbox>
        <Button @click="handleDeleteAll" :disabled="selected.length === 0">批量删除</Button>
      </div>
    
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
  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
import { getCommentList, delComment } from '@/api/data'

export default {
  components: {
    SearchForm
  },
  mounted () {
    this.getCommentList()
  },
  methods: {
    getCommentList () {
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
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...params
      }
      getCommentList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.pageParams.total = res.data.data.total
            this.tableData = res.data.data.data
          }
        })
    },
    delComment(ids) {
      delComment({ids})
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('删除成功')
            if(this.ifSelectAll) {
              this.ifSelectAll = false
            }
            this.pageParams.page = 1
            this.getCommentList()
          }
        })
    },
    handleDeleteAll() {
      this.$Modal.confirm({
        title: '确定要删除选中的全部内容吗？',
        onOk: () => {
          let ids = this.selected.map(item => item.id).join(',')
          this.delComment(ids)
        }
      })
    },
    handleSelectChange(selected) {
      this.selected = selected
      if(selected.length === this.tableData.length) {
        this.ifSelectAll = true
      } else {
        this.ifSelectAll = false
      }
    },
    handleSelectAll() {
      this.$refs.table.selectAll(this.ifSelectAll)
    },
    handlePageChange (page) {
      this.ifSelectAll = false
      this.pageParams.page = page
      this.getCommentList()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.getCommentList()
    }
  },
  data () {
    return {
      tableData: [],
      selected: [],
      ifSelectAll: false,
      columns: [
        {
          type: 'selection',
          width: 60
        },
        {
          align: 'center',
          title: '评论内容',
          key: 'content'
        },
        {
          align: 'center',
          title: '发布者',
          key: 'nickname'
        },
        {
          align: 'center',
          title: '内容ID',
          key: 'content_id'
        },
        {
          align: 'center',
          title: '内容标题',
          key: 'title'
        },
        {
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'error',
                size: 'small'
              },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: '确认删除吗？',
                    onOk: () => {
                      this.delComment(params.row.id)
                    }
                  })
                }
              }
            }, '删除')
          }
        },
      ],
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      searchParams: {
        id: '',
        nickname: '',
        keywords: '',
        title: '',
        date: ''
      },
      searchData: {
        id: '',
        nickname: '',
        keywords: '',
        title: '',
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
              this.getCommentList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'content_id',
            label: '内容ID：',
            placeholder: '请输入ID'
          },
          {
            name: 'Input',
            prop: 'nickname',
            label: '发布者：',
            placeholder: '请输入用户昵称'
          },
          {
            name: 'Input',
            prop: 'keywords',
            label: '关键词：',
            placeholder: '请输入评论关键词搜索'
          },
          {
            name: 'Input',
            prop: 'title',
            label: '内容标题：',
            placeholder: '请输入内容标题'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '发布时间：'
          }
        ]
      }
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
