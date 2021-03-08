<template>
  <div>
    <SearchForm
      @handleSearch="handleSearch"
    />
    <Card>
      <p slot="title">数据列表</p>
      <div slot="extra">
        <Button style="margin-right: 20px" icon="md-cloud-upload" @click="exportTable">导出</Button>
        <Button type="primary" to="/content/content/add?type=1">新增内容</Button>
      </div> 
      <Table
        border
        ref="table"
        :columns="columns"
        :data="tableData" 
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
        :total="tableTotal"
        :current="pageParams.page"
        :page-size="pageParams.per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>
    <Modal v-model="tagModalVisible" title="以下为该内容标签">
      <Tag v-for="tag in tagData">{{ tag.name }}</Tag>
    </Modal>
  </div>
</template>

<script>
import { getContentLists, delContent, setContentStatus, getContentTagById, exportContentList } from '@/api/data'
import SearchForm from './search/searchForm.vue'

export default {
  name: 'Content',
  components: {
    SearchForm
  },
  mounted () {
    this.getContentLists()
  },
  methods: {
    getContentLists(searchParams) {
      let data = {}
      if(searchParams) {
        data = {
          ...this.pageParams,
          ...searchParams
        }
      } else {
        data = {
          ...this.pageParams,
          ...this.searchData
        }
      }
      getContentLists(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.tableTotal = res.data.data.total
          } else {
            this.tableData = []
            this.tableTotal = 0
          }
        })
        .catch(() => {
          this.tableData = []
          this.tableTotal = 0
        })
    },
    handleSearch(searchParams) {
      this.pageParams.page = 1
      this.searchData = {...searchParams}
      this.getContentLists(searchParams)
    },
    delContent(ids) {
      delContent({ ids })
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('删除成功')
            if(this.ifSelectAll) {
              this.ifSelectAll = false
            }
            this.pageParams.page = 1
            this.getContentLists()
          }
        })
    },
    getContentTagById(data) {
      getContentTagById(data)
        .then(res => {
          if(res.data.code === 200) {
            this.tagData = res.data.data
          }
        })
    },
    exportContentList() {
      return new Promise((resolve, reject) => {
        exportContentList({...this.searchData})
          .then(res => {
            if(res.data.code === 200) {
              const data = res.data
              resolve(data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    setContentStatus(content) {
      const data = {
        id: content.id,
        status: 1 - content.status
      }
      setContentStatus(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('修改成功')
            this.getContentLists()
          }
        })
    },
    formatExportData(data) {
      let result = data.map(item => {
        return {
          ...item,
          is_well: item.is_well === 0 ? '未收录' : '游戏头条',
          oneCateName: item.oneCateName ? item.twoCateName ? `${item.oneCateName}-${item.twoCateName}` : `${item.oneCateName}` : `无`,
          type: item.type === 1 ? '图文' : '视频',
          status: item.status === 1 ? '启用' : '禁用',
        }
      })
      return result
    },
    exportTable() {
      this.exportContentList().then(res => {
        this.$refs.table.exportCsv({
          filename: '内容列表',
          columns: this.columns,
          data: this.formatExportData(res.data)
          // data: res.data
        })
      })
    },
    handleSelectChange (selected) {
      this.selected = selected
      if(selected.length === this.tableData.length) {
        this.ifSelectAll = true
      } else {
        this.ifSelectAll = false
      }
    },
    handleSelectAll () {
      this.$refs.table.selectAll(this.ifSelectAll)
    },
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要删除选中的全部内容吗？',
        onOk: () => {
          let ids = this.selected.map(item => item.id).join(',')
          this.delContent(ids)
        }
      })
    },
    handlePageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.getContentLists()
    },
    handlePageChange (page) {
      this.ifSelectAll = false
      this.pageParams.page = page
      this.getContentLists()
    },
    handleSwitchChange(data) {
      return new Promise((resolve, reject) => {
        this.setContentStatus(data)
        reject()
      })
    }
  },
  data () {
    return {
      tableTotal: 0,
      pageParams: {
        page: 1,
        per_page: 10
      },

      searchData: {
        status: '',
        keywords: '',
        content_id: '',
        nickname: '',
        type: null,
        is_well: null,
        parentCateId: null,
        cateId: null,
        date: '',
        tagId: null
      },
      currentSwitchData: {},
      selected: [],
      ifSelectAll: false,
      tagModalVisible: false,
      tagData: [],
      tableData: [],
      columns: [
        {
          type: 'selection',
          width: 60
        },
        {
          align: 'center',
          title: '内容ID',
          key: 'id',
          width: '80px'
        },
        {
          align: 'center',
          title: '标题',
          key: 'title',
        },
        {
          align: 'center',
          title: '类型',
          key: 'type',
          width: '80px',
          render: (h, params) => {
            return h('span', {}, params.row.type === 1 ? '图文' : '视频')
          }
        },
        // {
        //   align: 'center',
        //   title: '游戏分类',
        //   key: 'oneCateName',
        //   render: (h, params) => {
        //     const { row } = params
        //     let word = row.oneCateName ? row.twoCateName ? `${row.oneCateName}-${row.twoCateName}` : `${row.oneCateName}` : `无`
        //     return h('span', {}, word)
        //   }
        // },
        {
          align: 'center',
          title: '所属游戏',
          key: 'gameName'
        },
        {
          align: 'center',
          title: '主题专栏',
          key: 'is_well',
          width: '80px',
          render: (h, params) => {
            return h('span', {}, params.row.is_well === 0 ? '未收录' : '游戏头条')
          }
        },
        {
          align: 'center',
          title: '发布者',
          key: 'nickname',
        },
        {
          align: 'center',
          title: '发布时间',
          key: 'create_time',
          sortable: true
        },
        {
          align: 'center',
          title: '浏览量',
          key: 'view_num',
          width: '80px',
          sortable: true
        },
        {
          align: 'center',
          title: '浏览人数',
          key: 'view_people',
          width: '80px',
          sortable: true
        },
        {
          align: 'center',
          title: '点赞量',
          key: 'like_num',
          width: '80px',
          sortable: true
        },
        {
          align: 'center',
          title: '评论量',
          key: 'comment_num',
          width: '80px',
          sortable: true
        },
        {
          align: 'center',
          title: '人均观看时长',
          key: 'avg_time',
          sortable: true
        },
        {
          align: 'center',
          title: '启用',
          key: 'status',
          width: '90px',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: params.row.status === 1,
                'before-change': () => this.handleSwitchChange(params.row)
              }
            })
          }
        },
        {
          align: 'center',
          title: '操作',
          fixed: 'right',
          width: '260px',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: { type: 'primary', size: 'small' },
                  on: {
                    click: () => {
                      this.getContentTagById({id: params.row.id})
                      this.tagModalVisible = true
                    }
                  }
                },
                '标签'
              ),
              h(
                'Button',
                {
                  props: { type: 'primary', size: 'small' },
                  style: { marginLeft: '10px' },
                  on: {
                    click: () => {
                      this.$router.push({path: `/content/content/detail?id=${params.row.id}&type=${params.row.type}`})
                    }
                  }
                },
                '查看'
              ),
              h(
                'Button',
                {
                  props: { type: 'primary', size: 'small' },
                  style: { marginLeft: '10px' },
                  on: {
                    click: () => {
                      this.$router.push({path: `/content/content/edit/${params.row.id}?type=${params.row.type}`})
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: { type: 'error', size: 'small' },
                  style: { marginLeft: '10px' },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认删除',
                        onOk: () => {
                          this.delContent(params.row.id)
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
      ]
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
