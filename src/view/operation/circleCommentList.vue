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
  circleCommentGetDeepList,
  circleCommentDel
} from '@/api/data'
import SearchForm from '../../components/searchForm'
export default {
  components: {
    SearchForm
  },
  data () {
    return {
      searchData: {
        keywords: '', // 搜索关键字
        start_time: '', // 开始时间
        end_time: '', // 结束时间
        date: '',
        is_real: 0 // 0全部 1仅显示真实用户评论
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
              this.circleCommentGetDeepList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            label: '关键词查询：',
            prop: 'keywords',
            placeholder: '输入关键词搜索',
            style: 'width:250px'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '申请时间：'
          }
        ]
      },
      tableData: [],
      columns: [
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
          title: '帖子id',
          key: 'post_id'
        },
        {
          align: 'center',
          title: '发布时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认要删除吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.circleCommentDel(params.row.id)
                        }
                      })
                    }
                  }
                },
                '删除'
              )
            ])
          }
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
    this.circleCommentGetDeepList()
  },
  methods: {
    // 获取评论列表
    circleCommentGetDeepList () {
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
      circleCommentGetDeepList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.pageParams.total = res.data.data.total
            if(res.data.data.data.length === 0){
              if(this.pageParams.page!== 1){
                this.pageParams.page = this.pageParams.page-1
                this.circleCommentGetDeepList()
              }
            }else{
              return
            }
          }
        })
    },
    // 删除
    circleCommentDel (id) {
      const data = {
        id
      }
      this.submitLoading = true
      circleCommentDel(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            this.circleCommentGetDeepList()
          }
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.circleCommentGetDeepList()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.circleCommentGetDeepList()
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
