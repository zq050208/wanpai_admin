<template>
  <div>
    <Card><SearchForm  :searchForm="searchForm" :searchData="searchData" /></Card>
    <Card>
       <Table border :columns="columns" :data="dataList" ref="table"  @on-selection-change="handleSelectChange"></Table>
        <Button @click="handleDeleteAll" :disabled="selected.length === 0" style="margin-top:20px">删除全部选中</Button>
     <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getDailyindexComment, getDailyindexdelComment } from '@/api/data.js'
export default {
  components: { SearchForm },
  data () {
    return {
      total: 1,
      current: 1,
      per_page: 10,
      dataList: [],
      ifSelectAll: false,
      selected: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '评论用户',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '评论内容',
          key: 'content',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, pramas) => {
            return h('Button', {
              props: { type: 'error', size: 'default' },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: '提示',
                    content: '确定删除吗？',
                    onOk: () => {
                      this.deleteClick(pramas.row.id)
                    }
                  })
                }
              }
            }, '删除')
          }
        }
      ],
      searchData: {
        keywords: ''
      },
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
            name: 'Input',
            prop: 'keywords',
            placeholder: '输入用户昵称或关键词搜索'
          }
        ]
      }
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
        ...this.searchData
      }
      getDailyindexComment(obj).then(res => {
        if (res.data.code === 200) {
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
          this.dataList = res.data.data.data
        }
      })
    },
    // 删除事件
    deleteClick (ids) {
      let commentId
      if (ids) {
        commentId = JSON.stringify(ids)
      } else {
        commentId = this.selected.map(item => (item.id))
      }
      var obj = {
        comment_id: JSON.stringify(commentId)
      }
      getDailyindexdelComment(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.total = 1
          this.per_page = 10
          this.getDataList()
          this.selected = []
        } else {
          this.current = 1
          this.total = 1
          this.per_page = 10
          this.getDataList()
          this.selected = []
        }
      })
    },
    // 页码改变
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.getDataList()
    },
    // 批量删除
    handleSelectChange (selected) {
      this.selected = selected
    },
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要批量删除选中的全部内容吗?',
        onOk: () => {
          this.deleteClick()
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
</style>
