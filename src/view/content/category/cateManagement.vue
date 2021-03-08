<template>
  <Card>
    <Tabs :value="level" @on-click="handleTabChange">
      <Button type="primary" slot="extra" to="/content/category/add">+ 新增分类</Button>
      <TabPane label="一级分类" name="1">
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
          @on-change="handlePageCHange"
          @on-page-size-change="handlePageSizeChange"
        />
      </TabPane>
      <TabPane label="二级分类" name="2">
        <Table
          border
          stripe
          :data="tableData"
          :columns="columns2"
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
          @on-change="handlePageCHange"
          @on-page-size-change="handlePageSizeChange"
        />
      </TabPane>
    </Tabs>
    

  </Card>
</template>

<script>
import { getCategoryList, deleteCategory, editCategory, getCateCheckCode } from '@/api/data'

export default {
  data () {
    return {
      tableData: [],
      level: '1',
      columns: [
        {
          align: 'center',
          title: '编号',
          key: 'id'
        },
        {
          align: 'center',
          title: '分类名称',
          key: 'cate_name'
        },
        {
          align: 'center',
          title: '级别',
          key: 'level'
        },
        {
          align: 'center',
          title: '排序',
          key: 'order'
        },
        {
          align: 'center',
          title: '启用',
          key: 'status',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: params.row.status === 1
              },
              on: {
                'on-change': () => {
                  this.getCateCheckCode().then(res => {
                    const data = {...params.row, checkcode: res.data.checkcode}
                    data.status = 1 - params.row.status
                    this.editCategory(data)
                  })
                }
              }
            })
          }
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
                      this.$router.push({ path: `/content/category/edit/${params.row.id}` })
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
                        title: '确认要删除此分类吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.deleteCategory(params.row.id)
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
      columns2: [
        {
          align: 'center',
          title: '编号',
          key: 'id'
        },
        {
          align: 'center',
          title: '分类名称',
          key: 'cate_name'
        },
        {
          align: 'center',
          title: '级别',
          key: 'level'
        },
        {
          align: 'center',
          title: '上级分类',
          key: 'parent_name'
        },
        {
          align: 'center',
          title: '排序',
          key: 'order'
        },
        {
          align: 'center',
          title: '启用',
          key: 'status',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: params.row.status === 1
              },
              on: {
                'on-change': () => {
                  this.getCateCheckCode().then(res => {
                    const data = {...params.row, checkcode: res.data.checkcode}
                    data.status = 1 - params.row.status
                    this.editCategory(data)
                  })
                }
              }
            })
          }
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
                      this.$router.push({ path: `/content/category/edit/${params.row.id}` })
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
                        title: '确认要删除此分类吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.deleteCategory(params.row.id)
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
      }
    }
  },
  mounted () {
    const { query } = this.$route
    if(query.level) this.level = query.level
    this.getCategoryList()
  },
  methods: {
    getCateCheckCode() {
      return new Promise((resolve, reject) => {
        getCateCheckCode()
          .then(res => {
            if(res.data.code === 200) {
              resolve(res.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getCategoryList () {
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        level: this.level
      }
      getCategoryList(data)
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
    deleteCategory (id) {
      deleteCategory({ id })
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除分类成功')
            this.tableData = this.tableData.filter(item => item.id !== id)
          }
        })
    },
    editCategory(data) {
      editCategory(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('修改成功')
            this.getCategoryList()
          }
        })
    },
    handleTabChange (tab) {
      if (tab !== this.level) {
        this.level = tab
        this.getCategoryList()
      }
    },
    handlePageCHange (page) {
      this.pageParams.page = page
      this.getCategoryList()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.getCategoryList()
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
