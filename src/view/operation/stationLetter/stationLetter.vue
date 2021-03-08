<template>
  <div>
    <SearchForm
      title="筛选查询"
      :searchForm="searchForm"
      :searchData="searchData"
      :rules="searchFormRules"
    />

    <Form inline>
      <FormItem>
        <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll">全选</Checkbox>
      </FormItem>
      <FormItem>
        <Button @click="handleDeleteAll" :disabled="selected.length === 0">批量删除</Button>
      </FormItem>
      <FormItem>
        <Button to="/operation/station_letter/type">发送站内信</Button>
      </FormItem>
    </Form>

    <Table
      border
      ref="selection"
      :columns="columns"
      :data="tableData"
      @on-selection-change="handleSelectChange"
    ></Table>

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

    <LetterDetail
      :itemData="letterDetail"
      :visible="detailModalVisible"
      :relationContentData="relationContentData"
      @showModal="showDetailModal"
      @hideModal="hideDetailModal"
    />
    <Modal v-model="imgModalVisible" footer-hide>
      <img :src="imgModalUrl" style="width: 100%" />
    </Modal>
  </div>
</template>

<script>
import { getStationLetter, delStationLetter, getStationLetterCode, getRelationContent } from '@/api/data'
import SearchForm from '@/components/searchForm'
import LetterDetail from './stationLetterDetail'

export default {
  components: {
    SearchForm,
    LetterDetail
  },
  mounted () {
    this.getStationLetter()
  },
  methods: {
    getStationLetter () {
      const data = {
        ...this.pageParams,
        ...this.searchParams
      }
      getStationLetter(data)
        .then(res => {
          if (res.data.code === 200) {
            this.tableData = res.data.data.data
            this.tableTotal = res.data.data.total
          }
        })
    },
    delStationLetter (checkcode, singleDelete) {
      let ids
      if (singleDelete) {
        ids = singleDelete
      } else {
        ids = this.selected.map(item => (item.id))
      }
      const data = {
        checkcode,
        ids: JSON.stringify(ids)
      }
      delStationLetter(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$Message.success('删除成功')
            if (this.ifSelectAll) {
              this.ifSelectAll = false
            }
            this.pageParams.page = 1
            this.getStationLetter()
          }
        })
    },
    getStationLetterCode () {
      return new Promise((resolve, reject) => {
        getStationLetterCode()
          .then(res => {
            if (res.data.code === 200) {
              resolve(res.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getRelationContent () {
      getRelationContent()
        .then(res => {
          if (res.data.code === 200) {
            this.relationContentData = res.data.data
          }
        })
    },
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要删除选中的全部内容吗？',
        onOk: () => {
          this.getStationLetterCode()
            .then(res => {
              this.delStationLetter(res.data.checkcode)
            })
        }
      })
    },
    handleSelectAll () {
      this.$refs.selection.selectAll(this.ifSelectAll)
    },
    handleSelectChange (selected) {
      this.selected = selected
      if(selected.length === this.tableData.length) {
        this.ifSelectAll = true
      } else {
        this.ifSelectAll = false
      }
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.pageParams.page = 1
      this.getStationLetter()
    },
    handlePageChange (page) {
      this.ifSelectAll = false
      this.pageParams.page = page
      this.getStationLetter()
    },
    showDetailModal () {
      this.detailModalVisible = true
    },
    hideDetailModal () {
      this.detailModalVisible = false
    }
  },
  data () {
    const validateTitle = (rule, value, callback) => {
      const { title } = this.searchData
      if(title) {
        if(title.length > 15) {
          callback(new Error('最多输入15个字符'))
        }
      }
      callback()
    }
    return {
      tableData: [],
      ifSelectAll: false,
      selected: [],
      searchData: {
        type: 0,
        title: '',
        publish_user: '',
        app_id: 0
      },
      searchParams: {
        type: 0,
        title: '',
        publish_user: '',
        app_id: 0
      },
      tableTotal: 0,
      pageParams: {
        page: 1,
        per_page: 10
      },
      letterDetail: {},
      relationContentData: [],
      detailModalVisible: false,
      imgModalVisible: false,
      imgModalUrl: '',
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = {...this.searchData}
              this.pageParams.page = 1
              this.getStationLetter()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            label: '应用名称：',
            prop: 'app_id',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: 'APP-小虎Hoo',
                value: 1
              },
              {
                label: '小程序-分子派对',
                value: 2
              }
            ]
          },
          {
            name: 'Select',
            label: '消息类型：',
            placeholder: '全部',
            prop: 'type',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '文字消息',
                value: 1
              },
              {
                label: '活动消息',
                value: 2
              },
              {
                label: '内容推荐',
                value: 3
              }
            ]
          },
          {
            name: 'Input',
            label: '消息标题：',
            prop: 'title',
            placeholder: '请输入消息标题'
          },
          {
            name: 'Input',
            label: '发布人员：',
            prop: 'publish_user',
            placeholder: '请输入发布人员'
          }
        ]
      },
      searchFormRules: {
        title: [
          { validator: validateTitle, trigger: 'blur' }
        ]
      },
      columns: [
        {
          type: 'selection',
          width: 60
        },
        {
          align: 'center',
          title: '编号',
          key: 'id'
        },
        {
          align: 'center',
          title: '产品',
          key: 'app_id',
          render: (h, params) => {
            return h('span', {}, params.row.app_id === 1 ? '小虎Hoo' : '分子派对')
          }
        },
        {
          align: 'center',
          title: '消息类型',
          key: 'type',
          render: (h, params) => {
            return h('span', {}, params.row.type === 1 ? '文字消息' : params.row.type === 2 ? '活动消息' : '内容推荐')
          }
        },
        {
          align: 'center',
          title: '消息标题',
          key: 'title'
        },
        {
          align: 'center',
          title: '相关图片',
          key: 'img_url',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.img_url },
                style: { width: '50px', height: '50px', margin: '0 auto', display: params.row.img_url ? 'block' : 'none' },
                on: {
                  click: () => {
                    this.imgModalVisible = true
                    this.imgModalUrl = params.row.img_url
                  }
                }
              })
            ])
          }
        },
        {
          align: 'center',
          title: '发布时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '发布人员',
          key: 'publish_user'
        },
        {
          align: 'center',
          title: '接收对象',
          key: 'receive_num',
          render: (h, params) => {
            return h('span', {}, `${params.row.receive_num}人`)
          }
        },
        {
          align: 'center',
          title: '是否同步APP',
          key: 'is_syn',
          render: (h, params) => {
            return h('span', {}, params.row.is_syn === 1 ? '是' : '否')
          }
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
                      this.letterDetail = params.row
                      this.showDetailModal()
                      this.getRelationContent()
                    }
                  }
                },
                '查看'
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
                        title: '确认要删除此站内信吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.getStationLetterCode()
                            .then(res => {
                              this.delStationLetter(res.data.checkcode, [params.row.id])
                            })
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
