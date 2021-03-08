<template>
  <div>
    <Card>
    <template slot="title">游戏收录列表</template>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
    <Table border :columns="columns" :data="data" ref="table"></Table>
    <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
  </Card>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getGameIncludedList, gameIncludedListDel, delGameCollection } from '@/api/data'
export default {
  components: {
    SearchForm
  },
  data () {
    return {
      total: 1,
      current: 1,
      per_page: 10,
      data: [],
      searchParams: {
        keywords: ''
      },
      searchData: {
        keywords: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = { ...this.searchData }
              this.current = 1
              this.getGameIncludedList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            label: '关键词查询：',
            prop: 'keywords',
            placeholder: '请输入游戏名称',
            style: {
              'width': '230px'
            }
          }
        ]
      },
      columns: [
        {
          title: '序号',
          key: 'id',
          align: 'center',
          width: '80px'
        },
        {
          title: '游戏名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '收录次数',
          key: 'collect_num',
          align: 'center',
          width: '280px'
        },
        {
          title: '收录时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'default'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确认删除该条内容吗？',
                      onOk: () => {
                        this.gameIncludedListDel(params.row.id)
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getGameIncludedList()
  },
  methods: {
    // 删除列表显示
    gameIncludedListDel (id) {
      let data = {
        id: id
      }
      delGameCollection(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功!')
          if (this.data.length === 1 && this.current > 1) {
            this.current--
          }
          this.getGameIncludedList()
        }
      })
    },
    // 获取列表数据
    getGameIncludedList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      getGameIncludedList(obj).then(res => {
        this.data = res.data.data.data
        this.current = res.data.data.current_page
        this.per_page = res.data.data.per_page
        this.total = res.data.data.total
      })
    },
    // 页码改变
    handlePageChange (page) {
      this.current = page
      this.getGameIncludedList()
    },
    // size 改变
    handlePageSizeChange (size) {
      this.per_page = size
      this.getGameIncludedList()
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
table,
tr,
td{
  border: 1px solid #d7d7d7;
  border-collapse:collapse;
  text-align: center;
  padding: 10px
}
td{

  word-break: break-all
}
</style>
