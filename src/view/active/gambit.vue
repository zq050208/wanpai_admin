<template>
    <div>
      <p style="font-size:16px; font-weight: bold; padding-bottom: 10px">瞎聊什么</p>
      <RadioGroup type="button"  v-model="type" @on-change="handleTypeChange">
        <Radio :label="1" name="话题列表">话题列表</Radio>
        <Radio :label="2" name="话题评论">话题评论</Radio>
      </RadioGroup>
      <Card class="card" style="margin-top: 20px" v-if="type === 1">
        <Button  style="margin-bottom: 20px"  type="primary" @click="addToptic">添加话题</Button>
        <Table border :columns="columns1" :data="data1" ref="table"></Table>
        <Page class="page" style="margin-top: 20px" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
      </Card>
      <!-- 话题评论 -->
      <Card class="card" style="margin-top: 20px" v-if="type === 2">
        <Table border :columns="columns2" :data="data2" ref="selection" @on-selection-change="handleSelectChange"></Table>
        <Form inline style="padding: 20px 0">
          <FormItem>
            <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll">全选</Checkbox>
          </FormItem>
          <FormItem>
            <Button :disabled="selected.length === 0" @click="handleDeleteAll">批量删除</Button>
          </FormItem>
        </Form>
        <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
      </Card>
      <!-- 添加话题 -->
      <Modal :mask-closable="false" v-model="addModel" title='新增话题' @on-cancel="cancleClick">
        <Form ref='addData' :model="addData" :rules="rules">
          <p style="padding-bottom: 10px">输入话题</p>
          <FormItem  prop="content">
            <Input v-model="addData.content" :maxlength="140" type="textarea" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入话题！" style="width: 100%" />
          </FormItem>
          <p style="padding-bottom: 10px">选择展示时间</p>
          <FormItem  prop="show_time">
            <DatePicker :value="addData.show_time" @on-change="timeChange"  type="daterange" format="yyyy/MM/dd HH:mm:ss" placement="bottom-end" placeholder="请选择时间" style="width: 70%"></DatePicker>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="default" @click="cancleClick">取消</Button>
          <Button type="primary" size="default" @click="confirmClick('addData')">确定</Button>
        </div>
      </Modal>
      <!-- 查看详情 -->
      <Modal :mask-closable="false"  v-model="detailModel" title='查看详情'>
        <div>{{detailContent}}</div>
        <div class="imgdetail"><img v-for="item in detailIMage" :key="item.id" :src="item"  style="width:30%; height:30%; margin: 0 10px 10px 0"></div>
      </Modal>

    </div>
</template>
<script>
import { topicList, topicCommentList, topicAddView, ActivedeleteTopic, topicdelComment, getAddTopic } from '@/api/data'
export default {
  data () {
    return {
      type: 1,
      current: 1,
      per_page: 10,
      total: 1,
      ifSelectAll: false,
      addModel: false,
      detailModel: false,
      selected: [],
      detailIMage: [],
      detailContent: '',
      addData: {
        content: '',
        show_time: ''
      },
      columns1: [
        {
          title: '话题展示时间',
          key: 'start_time',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, this.ruturnTime(params.row.start_time) + ' - ' + this.ruturnTime(params.row.end_time))
          }
        },
        {
          title: '话题内容',
          key: 'content',
          align: 'center'
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
                        this.deletTopic(params.row.id)
                      }
                    })
                  }
                }
              }, '删除话题')
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
          title: '评论时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '评论内容',
          key: 'content',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {}, params.row.content),
              h('Button', {
                props: { type: 'success', size: 'small' },
                style: { margin: '10px 0px' },
                on: {
                  click: () => {
                    this.detailShow(params.row)
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
                        console.log('删除')
                        this.delComent(params.row.id)
                      }
                    })
                  }
                }
              }, '删除评论')
            ])
          }
        }
      ],
      rules: {
        content: [{ required: true, message: '请输入回复内容', trigger: 'blur' }],
        show_time: [{ required: true, message: '请选择展示时间' }]
      },
      data1: [],
      data2: []
    }
  },
  mounted () {
    this.gettopicList()
  },
  methods: {
    // 获取列表话题列表数据
    gettopicList () {
      var data = {
        page: this.current,
        per_page: this.per_page
      }
      topicList(data).then(res => {
        if (res.data.code === 200) {
          this.data1 = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    // 获取话题评论列表
    getCommentList () {
      var obj = {
        page: this.current,
        per_page: this.per_page
      }
      topicCommentList(obj).then(res => {
        if (res.data.code === 200) {
          this.data2 = res.data.data.data
          this.current = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    // 获取验证码
    getCode () {
      return new Promise((resolve, reject) => {
        topicAddView({}).then(res => {
          if (res.data.code === 200) {
            resolve(res.data.data)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 查看详情
    detailShow (detail) {
      this.detailModel = true
      this.detailContent = detail.content
      this.detailIMage = JSON.parse(detail.images)
    },
    handleTypeChange (value) {
      console.log(value)
      this.type = value
      this.current = 1
      this.per_page = 10
      this.total = 1
      if (this.type === 1) {
        this.gettopicList()
      } else {
        this.getCommentList()
      }
    },
    addToptic () {
      this.addModel = true
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      if (month < 10) {
        month = '0' + month
      }
      if (day < 10) {
        day = '0' + day
      }
      var datetimes = []
      var time1 = String(year + '/' + month + '/' + day + ' 00:00:00')
      var time2 = String(year + '/' + month + '/' + day + ' 23:59:59')
      datetimes.push(time1)
      datetimes.push(time2)
      this.addData.show_time = datetimes
    },
    handlePageChange (page) {
      this.ifSelectAll = false
      this.current = page
      if (this.type === 1) {
        this.gettopicList()
      } else {
        this.getCommentList()
      }
    },
    handlePageSizeChange (size) {
      this.per_page = size
      if (this.type === 1) {
        this.gettopicList()
      } else {
        this.getCommentList()
      }
    },
    // 全选
    handleSelectAll () {
      this.$refs.selection.selectAll(this.ifSelectAll)
    },
    handleSelectChange (selected) {
      this.selected = selected
      if (selected.length === this.data2.length) {
        this.ifSelectAll = true
      } else {
        this.ifSelectAll = false
      }
    },
    cancleClick () {
      this.addModel = false
      this.$refs.addData.resetFields()
    },
    timeChange (date) {
      this.addData.show_time = date
      console.log(date)
    },
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.getCode().then(res => {
            this.addData.checkcode = res.checkcode
            var data = {
              content: this.addData.content,
              show_time: String(this.addData.show_time[0] + '--' + this.addData.show_time[1]),
              checkcode: this.addData.checkcode
            }
            getAddTopic(data).then(res => {
              if (res.data.code === 200) {
                this.addModel = false
                this.$Message.success('添加话题成功')
                this.current = 1
                this.per_page = 10
                this.total = 1
                this.gettopicList()
                this.$refs.addData.resetFields()
              }
            })
          })
        }
      })
    },
    // 话题删除
    deletTopic (id) {
      var idsData = []
      idsData.push(id)
      ActivedeleteTopic({ ids: JSON.stringify(idsData) }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.total = 1
          this.per_page = 10
          this.gettopicList()
        }
      })
    },
    // 删除评论
    delComent (id) {
      let conment = []
      let commentId
      if (id) {
        conment.push(id)
        commentId = conment
      } else {
        commentId = this.selected.map(item => (item.id))
      }
      var obj = {
        ids: JSON.stringify(commentId)
      }
      topicdelComment(obj).then(res => {
        console.log(res)
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.total = 1
          this.per_page = 10
          this.getCommentList()
          this.selected = []
          this.ifSelectAll = false
        }
      })
    },

    // 批量删除
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要批量删除选中的全部内容吗?',
        onOk: () => {
          this.delComent()
        }
      })
    },
    ruturnTime (time) {
      return time.replace(/-/g, '/')
    }
  }
}
</script>
<style scoped>
  .page {
    text-align: center
  }
  .imgdetail {
    display: flex;
    flex-wrap: wrap
  }
</style>
