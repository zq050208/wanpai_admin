<template>
  <div>
    <Card>
      <RadioGroup v-model="type" type="button"  @on-change="handleTypeChange">
      <Radio :label="2">官方内容</Radio>
      <Radio :label="1">用户内容</Radio>
    </RadioGroup>
      <p style="margin:20px 0" v-if="type === 2">
         <Button type="primary" @click="addContent" >添加内容</Button>
      </p>

      <Form inline v-if="type === 1" style="margin-top: 20px">
        <FormItem>
          <Select v-model="searchParams.select" style="width: 160px">
            <Option value="party_keyword">按派对昵称或ID搜索</Option>
            <Option value="user_keyword">按用户昵称或ID搜索</Option>
            <Option value="detail_keyword">输入内容关键词搜索</Option>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model="searchParams.keyword" placeholder="输入ID或昵称或关键词搜索" />
        </FormItem>
        <FormItem>
          <Button @click="handleSearch">搜索</Button>
        </FormItem>
      </Form>
      <!-- <SearchForm title="筛选数据" :searchForm="searchForm" :searchData="searchData" v-if="type === 1" /> -->
    </Card>
    <Card>
      <Table border :columns="type === 1 ? columns1 : columns2" :data="data" ref="table" @on-selection-change="handleSelectChange"></Table>
       <Button @click="handleDeleteAll" :disabled="selected.length === 0" style="margin-top:20px">批量删除</Button>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- 查看详情 -->
    <Modal v-model="detailModal" :mask-closable="false" title="查看详情">
      <div class="title">{{title}}</div>
      <div class="detailContent"><div v-html="detailContent"></div></div>
      <div slot="footer">
        <Button type="primary" size="default" @click="closeModal" >关闭</Button>
      </div>
    </Modal>
    <!-- 添加内容 -->
    <Modal title="添加新内容" v-model="addModal" :mask-closable="false"  @on-cancel="cancelClick" width="1000">
      <Form :rules="ruleInline" :model="formInline" ref="formInline" :label-width="100">
        <FormItem label="内容标题：" prop="title">
           <Input  v-model="formInline.title" :maxlength="30" />
        </FormItem>
        <FormItem label="内容：" prop="detail">
          <Editor
            :value="formInline.detail"
            :cache="false"
            @on-change="handleEditorChange"
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="cancelClick">取消</Button>
        <Button type="primary" size="default" @click="confirmClick('formInline')">确认添加</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getPartyContent, getEditStatus, getDeleteConetnt, getPartyContentCode, getAddPartyContent, getBatchtDeleteConetnt } from '@/api/data.js'
import Editor from '@/components/editor/editor.vue'
export default {
  components: { SearchForm, Editor },
  data () {
    return {
      searchParams: {
        select: 'party_keyword',
        keyword: ''
      },

      type: 2,
      detailModal: false,
      addModal: false,
      per_page: 10,
      current: 1,
      total: 1,
      selected: [],
      title: '',
      detailContent: '',
      formInline: {
        detail: '',
        title: ''
      },
      data: [],
      searchForm: {
        actions: [
          {
            text: '搜索',
            type: 'primary',
            handle: () => {
              this.current = 1
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'party_keyword',
            placeholder: '搜索派对ID或名称'
          },
          {
            name: 'Input',
            prop: 'user_keyword',
            placeholder: '搜索用户ID或名称'
          },
          {
            name: 'Input',
            prop: 'detail_keyword',
            placeholder: '搜索关键词'
          }
        ]
      },
      searchData: {
        party_keyword: '',
        user_keyword: '',
        detail_keyword: ''
      },
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '派对名称',
          key: 'party_name',
          align: 'center'
        },
        {
          title: '派对ID',
          key: 'party_no',
          align: 'center',
          width: '100px'
        },
        {
          title: '发布时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '发布人',
          key: 'publish_people',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', {}, params.row.nickname),
              h('p', {}, params.row.user_id)
            ])
          }
        },
        {
          title: '发布内容',
          key: 'content',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              class: 'contentAbout',
              domProps: {
                innerHTML: this.isOverLength(params.row.detail)
              }
            })
          }
        },
        {
          title: '内容标题',
          key: 'title',
          align: 'center'
        },
        {
          title: '内容详情',
          key: 'detail',
          align: 'center',
          width: '120px',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'success', size: 'small' },
                on: {
                  click: () => {
                    this.title = params.row.title
                    this.lookDetail(params.row.detail)
                  }
                }
              }, '查看详情')
            ])
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'error', size: 'small' },
                style: { margin: '0px 15px 0px 0px' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确认删除吗？',
                      onOk: () => {
                        this.deleteConetnt(params.row.id)
                      }
                    })
                  }
                }
              }, '删除'),
              h('Button', {
                props: { type: params.row.status === 1 ? 'success' : 'default', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: params.row.status === 1 ? '确定屏蔽吗？' : '确定解除屏蔽吗？',
                      onOk: () => {
                        this.shieldContent(params.row.id, params.row.status)
                      }
                    })
                  }
                }
              }, params.row.status === 1 ? '屏蔽' : '解除屏蔽')
            ])
          }
        }
      ],
      columns2: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '发布时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '内容标题',
          key: 'title',
          align: 'center'
        },
        {
          title: '发布内容',
          key: 'content',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              class: 'contentAbout',
              domProps: {
                innerHTML: this.isOverLength(params.row.detail)
              }
            })
          }
        },
        {
          title: '内容详情',
          key: 'detail',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'success', size: 'small' },
                on: {
                  click: () => {
                    this.title = params.row.title
                    this.lookDetail(params.row.detail)
                  }
                }
              }, '查看详情')
            ])
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'error', size: 'small' },
                style: { margin: '0px 20px 0px 0px' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确认删除吗？',
                      onOk: () => {
                        this.deleteConetnt(params.row.id)
                      }
                    })
                  }
                }
              }, '删除'),
              h('Button', {
                props: { type: params.row.status === 1 ? 'success' : 'default', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: params.row.status === 1 ? '确定屏蔽吗？' : '确定解除屏蔽吗？',
                      onOk: () => {
                        this.shieldContent(params.row.id, params.row.status)
                      }
                    })
                  }
                }
              }, params.row.status === 1 ? '屏蔽' : '解除屏蔽')
            ])
          }
        }
      ],
      ruleInline: {
        detail: [{ required: true, message: '请输入内容', trigger: 'change' }],
        title: [{ required: true, message: '请输入内容标题', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    handleSearch () {
      const data = {
        [this.searchParams.select]: this.searchParams.keyword
      }
      this.searchData = { ...data }
      this.current = 1
      this.getDataList(data)
    },
    getDataList () {
      var data = {
        page: this.current,
        per_page: this.per_page,
        content_type: this.type
      }
      var obj = {
        page: this.current,
        per_page: this.per_page,
        content_type: this.type,
        ...this.searchData
        // ...params
      }
      getPartyContent(this.type === 1 ? obj : data).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
          this.per_page = res.data.data.per_page
        }
      })
    },
    // 屏蔽内容
    shieldContent (ids, state) {
      var data = {
        id: ids,
        status: state === 1 ? 2 : 1
      }
      getEditStatus(data).then(res => {
        if (res.data.code === 200) {
          this.getDataList()
        }
      })
    },
    // 删除内容
    deleteConetnt (ids) {
      getDeleteConetnt({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.getDataList()
        }
      })
    },
    // 批量删除
    handleSelectChange (selected) {
      this.selected = selected
    },
    batchDelete () {
      var detelId = this.selected.map(item => (item.id))
      var obj = {
        ids: JSON.stringify(detelId)
      }
      getBatchtDeleteConetnt(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('批量删除成功')
          this.current = 1
          this.total = 1
          this.getDataList()
          this.selected = []
        }
      })
    },
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要批量删除选中的全部内容吗?',
        onOk: () => {
          this.batchDelete()
        }
      })
    },
    // 获取新增内容校验码
    getPartyCode () {
      return new Promise((resolve, reject) => {
        getPartyContentCode().then(res => {
          if (res.data.code === 200) {
            resolve(res.data)
          }
        })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 获取富文本
    handleEditorChange (html) {
      this.formInline.detail = html
    },
    // tab改变
    handleTypeChange () {
      this.current = 1
      this.total = 1
      this.searchData.party_keyword = ''
      this.searchData.user_keyword = ''
      this.searchData.detail_keyword = ''
      this.searchParams.keyword = ''
      this.getDataList()
    },
    // 确认添加官方内容
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          console.log(this.formInline)
          this.getPartyCode().then(res => {
            if (res.code === 200) {
              this.formInline.checkcode = res.data.checkcode
              getAddPartyContent(this.formInline).then(res => {
                if (res.data.code === 200) {
                  this.$Message.success('添加成功')
                  this.cancelClick()
                  this.type = 2
                  this.current = 1
                  this.getDataList()
                }
              })
            }
          })
        }
      })
    },
    // 添加内容
    addContent () {
      this.addModal = true
    },
    // 取消添加内容
    cancelClick () {
      this.addModal = false
      this.$refs.formInline.resetFields()
    },
    // 查看详情
    lookDetail (detail) {
      this.detailModal = true
      this.detailContent = detail
    },
    // 关闭modal
    closeModal () { this.detailModal = false },
    // 页码改变
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    // 页码改变
    handlePageSizeChange (size) {
      this.per_page = size
      this.getDataList()
    },
    // 截取字符串
    isOverLength (richText) {
      let content = richText.replace(/<.+?>/g, '')
      return content
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
.title{
  display: flex;
  justify-content: center;
  align-items: center
}
.ivu-upload{
    width: 100px;
    height: 80px;
}
.demo-upload-list{
  display: inline-block;
  width: 100px;
  height: 80px;
  text-align: center;
  line-height: 80px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0,0,0,.2);
  margin-right: 4px;
}
.demo-upload-list img{
  width: 100%;
  height: 100%;
}
.demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.6);
}
.demo-upload-list:hover .demo-upload-list-cover{
    display: block;
}
.demo-upload-list-cover i{
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
}
.ivu-table-cell{
  border: 1px solid red !important
}
</style>
<style>
  .contentAbout img {
  width: 80px;
  height: 80px;
  display: none
}
.contentAbout{
  /* display: inline; */
  overflow:hidden;
 text-overflow:ellipsis;
 display:-webkit-box;
 -webkit-line-clamp:2;
 -webkit-box-orient:vertical;
}
.detailContent img {
  max-width: 100%;
}
.detailContent table,
.detailContent th,
.detailContent td,
.detailContent tr{
  border: 1px solid black;
  border-collapse: collapse;
  text-align: center
}
.contentAbout td,
.contentAbout tr,
.contentAbout th,
.contentAbout tbody,
.contentAbout thead,
.contentAbout table,
.contentAbout iframe {
  display: none
}
</style>
