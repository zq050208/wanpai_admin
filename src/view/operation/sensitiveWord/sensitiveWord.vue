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
      <FormItem><Button @click="createWord">创建敏感词</Button></FormItem>
      <FormItem><Button @click="downloadTemplate">下载模板</Button></FormItem>
      <FormItem><Excel ref="excel" @handleImport="handleImport" /></FormItem>
      <FormItem><Button @click="handleExport">导出数据</Button></FormItem>
    </Form>

    <Table
      border
      ref="table"
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
      :total="total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />

    <Modal
      v-model="editModalVisible"
      :title="modalData.id ? '编辑敏感词' : '创建敏感词'"
      footer-hide
    >
      <Form ref="form" :label-width="120" :model="modalData" :rules="modalFormRules">
        <FormItem label="敏感词内容：" prop="words">
          <Input v-model="modalData.words" />
        </FormItem>
        <FormItem label="作用范围：" prop="range">
          <CheckboxGroup v-model="modalData.range">
            <checkbox v-for="item in checkData" :key="item.value" :label="item.value">{{ item.label }}</checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem>
          <Button @click="editModalVisible = false">取消</Button>
          <Button style="margin-left: 16px" type="primary" @click="handleOk">发布</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
import Excel from './excel.vue'

import { getWordsList, editWords, addWords, delWords, getAddWordsData, getEditWordsData, importWords, exportWordsList } from '@/api/data'

export default {
  components: {
    SearchForm, Excel
  },
  mounted() {
    this.getWordsList()
  },
  methods: {
    handleImport(data) {
      const result = []
      data.forEach(item => {
        result.push({
          words: item.words,
          range_list: item.range.split('、')
        })
      })
      this.importWords({import_data: JSON.stringify(this.formatData(result))})
    },
    formatData(data) {
      const current = this.tableData.map(i => i.words)
      return data.filter(item => current.indexOf(item.words) < 0)
    },
    handleExport() {
      const data = {...this.searchParams}
      this.exportWordsList(data).then(res => {
        this.$refs.excel.downloadFile(res.words_list)
      })
    },
    importWords(data) {
      importWords(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('成功导入')
            this.getWordsList()
          }
        })
    },
    exportWordsList(data) {
      return new Promise((resolve, reject) => {
        exportWordsList(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('成功导出')
            resolve(res.data.data)
          }
        })
        .catch(err => {
          reject(err)
        })
      })
    },
    createWord() {
      this.getAddWordsData()
      this.modalData = {
        range: [0]
      }
      this.editModalVisible = true
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if(valid) {
          const data = {
            range_list: JSON.stringify(this.modalData.range),
            words_content: this.modalData.words,
          }
          if(this.modalData.id) {
            data.id = this.modalData.id
            this.editWords(data)
          } else {
            this.addWords(data)
          }
          this.editModalVisible = false
        }
      })
    },
    getValue(val) {
      if(!val.id) return

      if(typeof val.range !== 'string') return

      const data = val.range.split('、')
      const result = []
      data.forEach(item => {
        this.checkData.forEach(check => {
          if(check.label === item) {
            result.push(check.value)
          }
        })
      })
      return result
    },
    getAddWordsData() {
      getAddWordsData()
        .then(res => {
          if(res.data.code === 200) {
            const data = res.data.data.sensitive_words_range
            this.checkData = data.map(item => {
              return {
                label: item.name,
                value: item.id
              }
            })
          }
        })
    },
    getEditWordsData(data) {
      return new Promise((resolve, reject) => {
        getEditWordsData(data)
          .then(res => {
            if(res.data.code === 200) {
              resolve(res.data.data.sensitive_words_range)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getWordsList() {
      const data = {
        ...this.pageParams,
        ...this.searchParams
      }
      getWordsList(data)
        .then(res => {
          if(res.data.code === 200) {
            this.total = res.data.data.total
            this.tableData = res.data.data.data
          }
        })
    },
    addWords(data) {
      addWords(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('添加成功')
            this.getWordsList()
          }
        })
    },
    editWords(data) {
      editWords(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('编辑成功')
            this.getWordsList()
          }
        })
    },
    delWords(ids) {
      const data = {
        del_ids: JSON.stringify(ids)
      }
      delWords(data)
        .then(res => {
          if(res.data.code === 200) {
            this.$Message.success('删除成功')
            if(this.ifSelectAll) {
              this.ifSelectAll = false
            }
            if (this.tableData.length === 1 && this.pageParams.page > 1) {
              this.pageParams.page--
            }
            this.getWordsList()
          }
        })
    },
    downloadTemplate() {
      const eleLink = document.createElement('a')
      eleLink.download = '敏感词模板.xlsx'
      eleLink.style.display = 'none'
      eleLink.href = 'https://cdn.tinytiger.cn/FoexP_Tz_qW34fKrCHUZJfcDdyPv?attname=敏感词.xlsx'
      document.body.appendChild(eleLink)
      eleLink.click()
      document.body.removeChild(eleLink)
    },
    handleSelectAll () {
      this.$refs.table.selectAll(this.ifSelectAll)
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
          const ids = this.selected.map(item => item.id)
          this.delWords(ids)
        }
      })
    },
    handlePageChange (page) {
      this.ifSelectAll = false
      this.pageParams.page = page
      this.getWordsList()
    },
    handlePageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.getWordsList()
    }
  },
  data () {
    const validateKeyWords = (rule, value, callback) => {
      const { words } = this.searchData
      if(words) {
        if(words.length > 10) {
          callback(new Error('最多输入10个字符'))
        }
      }
      callback()
    }
    return {
      checkData: [],
      tableData: [],
      total: 0,
      pageParams: {
        page: 1,
        per_page: 10
      },
      ifSelectAll: false,
      selected: [],
      searchParams: {
        words: '',
        range: []
      },
      searchData: {
        words: '',
        range: []
      },
      editModalVisible: false,
      modalData: {},
      modalFormRules: {
        words: {required: true, message: '请输入内容'},
        range: {required: true, message: '请选择作用范围'}
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = {...this.searchData}
              this.pageParams.page = 1
              this.getWordsList()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            label: '作用范围：',
            prop: 'range',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '后台内容上传',
                value: 1
              },
              {
                label: '评论',
                value: 2
              },
              {
                label: '私信',
                value: 3
              },
              {
                label: '昵称',
                value: 4
              },
            ]
          },
          {
            name: 'Input',
            label: '敏感词：',
            prop: 'words',
            placeholder: '请输入敏感词内容'
          }
        ]
      },
      searchFormRules: {
        words: [
          { validator: validateKeyWords, trigger: 'blur' }
        ]
      },
      columns: [
        {
          type: 'selection',
          width: 60
        },
        {
          title: '编号',
          key: 'id'
        },
        {
          title: '敏感词',
          key: 'words'
        },
        {
          title: '作用范围',
          key: 'range'
        },
        {
          title: '创建时间',
          key: 'create_time'
        },
        {
          title: '创建人',
          key: 'create_admin'
        },
        {
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
                      this.getEditWordsData({ id: params.row.id }).then(res => {
                        this.checkData = res.map(item => {
                          return {
                            label: item.name,
                            value: item.id
                          }
                        })
                        this.modalData = {
                          ...params.row,
                          range: this.getValue(params.row)
                        }
                      })
                      this.editModalVisible = true
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
                        title: '确认删除？',
                        onOk: () => {
                          this.delWords([params.row.id])
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
