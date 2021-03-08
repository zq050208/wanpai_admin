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
        <Button @click="handleSend">群发消息</Button>
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

    <Modal
      v-model="modalVisible"
      title="群发消息"
      footer-hide
    >
      <Form ref="form" :label-width="100" :model="modalData" :rules="rules">
        <FormItem label="推送类型：" prop="type">
          <span>链接</span>
        </FormItem>
        <FormItem label="链接：" prop="url">
          <Input :disabled="this.modalMode === 'view'" v-model="modalData.url" />
        </FormItem>
        <FormItem label="推送标题：" prop="title">
          <Input :disabled="this.modalMode === 'view'" v-model="modalData.title" />
        </FormItem>
        <FormItem label="推送内容：" prop="content">
          <Input :disabled="this.modalMode === 'view'" v-model="modalData.content" />
        </FormItem>
        <FormItem>
          <Button type="primary" :loading="submitLoading" @click="handleOK">确定</Button>
        </FormItem>
      </Form>
    </Modal>

    <Modal
      v-model="viewModalVisible"
      title="查看消息"
      footer-hide
    >
      <Form :label-width="100" :model="modalData">
        <FormItem label="推送类型：" prop="type">
          <span>链接</span>
        </FormItem>
        <FormItem label="链接：" prop="url">
          <span>{{modalData.url}}</span>
        </FormItem>
        <FormItem label="推送标题：" prop="title">
          <span>{{modalData.title}}</span>
        </FormItem>
        <FormItem label="推送内容：" prop="content">
          <span>{{modalData.content}}</span>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="viewModalVisible = false">确定</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'

import { appMessageList, addAppMessage, delAppMessage, appMessageCode } from '@/api/data'

export default {
  components: {
    SearchForm
  },
  mounted() {
    this.appMessageList()
  },
  methods: {
    handleOK() {
      this.$refs.form.validate(valid => {
        if(valid) {
          this.submitLoading = true
          this.appMessageCode().then(res => {
            this.addAppMessage(res.data.checkcode)
          })
        }
      })
    },
    appMessageList() {
      const data = {
        ...this.pageParams,
        ...this.searchParams
      }
      appMessageList(data)
        .then(res => {
          if(res.data.code === 200) {
            this.tableTotal = res.data.data.total
            this.tableData = res.data.data.data
          }
        })
    },
    addAppMessage(checkcode) {
      const data = {
        checkcode,
        ...this.modalData
      }
      addAppMessage(data)
        .then(res => {
          if(res.data.code === 200) {
            this.hideModal()
            this.$Message.success('添加成功')
            this.appMessageList()
          }
          this.submitLoading = false
        })
        .catch(err => {
          this.submitLoading = false
        })
    },
    delAppMessage(checkcode, singleDelete) {
      let ids
      if(singleDelete) {
        ids = singleDelete
      } else {
        ids = this.selected.map(item => (item.id))
      }
      const data = {
        checkcode,
        ids: JSON.stringify(ids)
      }
      delAppMessage(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('删除成功')
            if(this.ifSelectAll) {
              this.ifSelectAll = false
            }
            this.pageParams.page = 1
            this.appMessageList()
          }
        })
    },
    appMessageCode() {
      return new Promise((resolve, reject) => {
        appMessageCode()
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
    handleSend() {
      this.modalData = {
        type: 1,
        url: '',
        title: '',
        content: ''
      }
      this.showModal()
      this.modalMode = 'send'
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
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要删除选中的全部内容吗？',
        onOk: () => {
          this.appMessageCode().then(res => {
            this.delAppMessage(res.data.checkcode)
          })
        }
      })
    },
    handlePageChange (page) {
      this.ifSelectAll = false
      this.pageParams.page = page
      this.appMessageList()
    },
    handlePageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.appMessageList()
    },
    showModal() {
      this.modalVisible = true
    },
    hideModal() {
      this.modalVisible = false
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
    const validateUser = (rule, value, callback) => {
      const user = this.searchData.publish_user
      if(user) {
        if(user.length > 20) {
          callback(new Error('最多输入20个字符'))
        }
      }
      callback()
    }
    return {
      submitLoading: false,
      
      rules: {
        url: [
          { required: true, message: '请输入链接' },
          { type: 'url', message: '请输入正确的URL' }
        ],
        content: [{ required: true, message: '请输入推送内容' }],
        title: [
          { required: true, message: '请输入标题' }
        ],
      },
      tableTotal: 0,
      tableData: [],
      pageParams: {
        page: 1,
        per_page: 10
      },
      ifSelectAll: false,
      selected: [],
      modalVisible: false,
      viewModalVisible: false,
      modalData: {
        type: 1,
        url: '',
        title: '',
        content: ''
      },
      modalMode: 'view',
      searchParams: {
        title: '',
        publish_user: ''
      },
      searchData: {
        title: '',
        publish_user: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = {...this.searchData}
              this.pageParams.page = 1
              this.appMessageList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            label: '推送标题：',
            prop: 'title',
            placeholder: '请输入推送标题'
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
        ],
        publish_user: [
          { validator: validateUser, trigger: 'blur' }
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
          title: '推送标题',
          key: 'title'
        },
        {
          align: 'center',
          title: '类型',
          key: 'type',
          render: (h, params) => {
            return h('span', {}, params.row.type === 1 ? '链接' : '未知')
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
          key: 'receive_num'
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
                      this.modalData = params.row
                      this.modalMode === 'view'
                      this.viewModalVisible = true
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
                        title: '确认删除？',
                        onOk: () => {
                          this.appMessageCode().then(res => {
                            this.delAppMessage(res.data.checkcode, [params.row.id])
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
  },
}
</script>

<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>
