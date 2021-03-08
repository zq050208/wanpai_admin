<template>
  <div>
    <Form :label-width="100" inline>
      <FormItem label="标签：" prop="name">
        <Input v-model="searchData.name" placeholder="请输入关键词" />
      </FormItem>
      <FormItem label="标签分类：" prop="top_pid"> 
        <Select style="width: 150px" v-model="searchData.top_pid" placeholder="请选择一级标签">
          <Option :value="-1">全部一级标签</Option>
          <Option v-for="item in selectData" :key="item.id" :value="item.id">{{ item.name }}</Option>
        </Select>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSearch">搜索</Button>
      </FormItem>
    </Form>
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
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
  </div>
</template>

<script>
import { getTagList, deleteTag } from '@/api/data'

export default {
  mounted () {
    this.getTagList(1)
    this.getTagList(2)
  },
  methods: {
    handleSearch() {
      this.searchParams = {...this.searchData}
      this.pageParams.page = 1
      this.getTagList(2)
    },
    getSelectData(size) {
      const data = {
        ...this.pageParams,
        ...this.searchParams,
        top_pid: this.searchParams.top_pid === -1 ? '' : this.searchParams.top_pid,
        level: 1,
        per_page: size
      }
      getTagList(data)
        .then(res => {
          if (res.data.code === 200) {
            this.selectData = res.data.data.data
          }
        })
    },
    getTagList (level) {
      const data = {
        ...this.pageParams,
        ...this.searchParams,
        top_pid: this.searchParams.top_pid === -1 ? '' : this.searchParams.top_pid,
        level
      }
      getTagList(data)
        .then(res => {
          if (res.data.code === 200) {
            if(level === 1) {
              this.getSelectData(res.data.data.total)
            }
            if(level === 2) {
              this.total = res.data.data.total
              this.tableData = res.data.data.data
            }
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
      this.getTagList(2)
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.getTagList(2)
    }
  },
  data () {
    return {
      tableData: [],
      selectData: [],
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
          title: '三级标签数量',
          key: 'three_num'
        },
        {
          align: 'center',
          title: '所属一级标签',
          key: 'top_name'
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
      total: 0,
      pageParams: {
        page: 1,
        per_page: 10
      },
      searchParams: {
        name: '',
        top_pid: null
      },
      searchData: {
        name: '',
        top_pid: null
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
