<template>
  <div>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
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
  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
import { getTagList, deleteTag } from '@/api/data'

export default {
  components: {
    SearchForm
  },
  mounted () {
    this.getTagList()
  },
  methods: {
    getTagList () {
      const data = {
        level: 1,
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      }
      getTagList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.pageParams.total = res.data.data.total
          }
        })
        .catch(err => {
          this.tableData = []
        })
    },
    deleteTag (id) {
      deleteTag({ id })
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除标签成功')
            this.tableData = this.tableData.filter(item => item.id !== id)
          }
        })
        .catch(err => {
          this.$Message.error()
        })
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.getTagList()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.getTagList()
    }
  },
  data () {
    return {
      tableData: [],
      columns: [
        {
          align: 'center',
          title: '编号',
          key: 'id'
        },
        {
          align: 'center',
          title: '标签名称',
          key: 'name'
        },
        {
          align: 'center',
          title: '二级标签数量',
          key: 'two_num'
        },
        {
          align: 'center',
          title: '三级标签数量',
          key: 'three_num'
        },
        {
          align: 'center',
          title: '添加时间',
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
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin-right': '8px'
                  },
                  on: {
                    click: () => {
                      this.$router.push({ path: `/content/tag/edit/${params.row.id}` })
                    }
                  }
                },
                '编辑'
              ),
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
                        title: '确认要删除此标签吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.deleteTag(params.row.id)
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
      searchParams: {
        name: ''
      },
      searchData: {
        name: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.pageParams.page = 1
              this.searchParams = {...this.searchData}
              this.getTagList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'name',
            label: '标签：',
            placeholder: '请输入关键词'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
  .page{
    margin-top: 20px;
    text-align: center;
  }
</style>
