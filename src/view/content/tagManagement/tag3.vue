<template>
  <div>
    <Form :label-width="100" inline>
      <FormItem label="标签：" prop="name">
        <Input v-model="searchData.name" placeholder="请输入关键词" />
      </FormItem>
      <FormItem label="标签分类：" prop="top_pid">
        <Row style="width: 300px">
          <Col span="11">
            <Select v-model="searchData.top_pid" placeholder="请选择一级标签" @on-change="selectChange">
              <Option :value="-1">全部一级标签</Option>
              <Option v-for="item in selectTopData" :key="item.id" :value="item.id">{{ item.name }}</Option>
            </Select>
          </Col>
          <Col span="11">
            <Select v-model="searchData.pid" placeholder="请选择二级标签" :disabled="!searchData.top_pid">
              <Option :value="-1">全部二级标签</Option>
              <Option v-for="item in selectData" :key="item.id" :value="item.id">{{ item.name }}</Option>
            </Select>
          </Col>
        </Row>
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
import { getTagList, getAppTagDataById, deleteTag } from '@/api/data'

export default {
  mounted () {
    this.getTagList(1)
    this.getTagList(3)
  },
  methods: {
    selectChange (value) {
      if (value === -1) {
        this.selectData = []
      } else {
        this.getTagList(2, {
          top_pid: value,
          page: 1
        })
      }
    },
    handleSearch () {
      this.pageParams.page = 1
      this.searchParams = { ...this.searchData }
      this.getTagList(3)
    },
    getSelectData (level, params) {
      const data = {
        ...this.pageParams,
        ...this.searchParams,
        level,
        top_pid: this.searchParams.top_pid === -1 ? '' : this.searchParams.top_pid,
        pid: this.searchParams.pid === -1 ? '' : this.searchParams.pid,
        ...params
      }
      getTagList(data)
        .then(res => {
          if (res.data.code === 200) {
            if (level === 1) {
              this.selectTopData = res.data.data.data
            } else {
              this.selectData = res.data.data.data
            }
          }
        })
    },
    getTagList (level, params) {
      const data = {
        ...this.pageParams,
        ...this.searchParams,
        level,
        top_pid: this.searchParams.top_pid === -1 ? '' : this.searchParams.top_pid,
        pid: this.searchParams.pid === -1 ? '' : this.searchParams.pid,
        ...params
      }
      getTagList(data)
        .then(res => {
          if (res.data.code === 200) {
            if (level === 1) {
              this.getSelectData(1, { per_page: res.data.data.total === 0 ? 10 : res.data.data.total, ...params })
            }
            if (level === 2) {
              this.getSelectData(2, { per_page: res.data.data.total === 0 ? 10 : res.data.data.total, ...params })
            }
            if (level === 3) {
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
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.getTagList(3)
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.getTagList(3)
    }
  },
  data () {
    return {
      tableData: [],
      selectTopData: [],
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
          title: '所属一级标签',
          key: 'top_name'
        },
        {
          align: 'center',
          title: '所属二级标签',
          key: 'parent_name'
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
        top_pid: null,
        pid: null
      },
      searchData: {
        name: '',
        top_pid: null,
        pid: null
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
