<template>
    <div>
      <Card>
        <P class="title">意见收发室</P>
        <div style="display: flex">
            <Select v-model="selectvalue" style="width:100px; padding-bottom:40px; margin-right:50px" @on-change="selectChange">
                <Option v-for="item in selectList" :key="item.index" :value="item.value">{{item.name}}</Option>
            </Select>
            <Select v-model="appSelectValue" style="width:100px; padding-bottom:40px" @on-change="appChange">
                <Option v-for="item in appSelecct" :key="item.index" :value="item.value">{{item.name}}</Option>
            </Select>
        </div>
      </Card>
      <Card>
        <Table border ref="selection" :columns="selectvalue === 0 ? columns1 : columns2 " :data="tableData" @on-selection-change="handleSelectChange"></Table>
        <Form inline style="padding: 20px 0">
          <FormItem>
            <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll">全选</Checkbox>
          </FormItem>
          <FormItem>
            <Button @click="handleDeleteAll" :disabled="selected.length === 0">批量删除</Button>
          </FormItem>
        </Form>
        <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
      </Card>
      <!-- 回复 -->
      <Modal :mask-closable="false" v-model="replyModel" title='请输入回复内容' @on-cancel="cancleClick">
      <!-- <p style="text-align: center; margin-bottom:20px">请输入回复内容</p> -->
      <Form ref='replydData' :model="replydData" :rules="rules">
        <FormItem  prop="replay_content">
          <Input v-model="replydData.replay_content" :maxlength="800" type="textarea" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入回复内容！" style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="cancleClick">取消</Button>
        <Button type="primary" size="default" @click="confirmClick('replydData')">确定</Button>
      </div>
      </Modal>
    </div>
</template>
<script>
import { getpartyOpinion, replaypartyOpinion, partyOpiniondel } from '@/api/data'
export default {
  data () {
    return {
      selectvalue: 0,
      appSelectValue: 2,
      current: 1,
      per_page: 10,
      total: 1,
      replyModel: false,
      selectList: [
        {
          value: 0,
          name: '未回复'
        },
        {
          value: 1,
          name: '已回复'
        }
      ],
      appSelecct: [
        {
          value: 1,
          name: '小虎Hoo'
        },
        {
          value: 2,
          name: '分子派对'
        }
      ],
      ifSelectAll: false,
      selected: [],
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '发表时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '意见内容',
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
                        this.getdeldata(params.row.id)
                      }
                    })
                  }
                }
              }, '删除'),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.modelShow(params.row.id)
                  }
                }
              }, '回复')
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
          title: '发表时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '意见内容',
          key: 'content',
          align: 'center'
        },
        {
          title: '回复内容',
          key: 'replay_content',
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
                        this.getdeldata(params.row.id)
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      tableData: [],
      replydData: {
        replay_content: ''
      },
      rules: {
        replay_content: [{ required: true, message: '请输入回复内容', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.getdataList()
  },
  methods: {
    // 获取列表
    getdataList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        status: this.selectvalue,
        app_id: this.appSelectValue
      }
      getpartyOpinion(obj).then(res => {
        if (res.data.code === 200) {
          this.current = res.data.data.current_page
          this.total = res.data.data.total
          this.tableData = res.data.data.data
        }
      })
    },
    selectChange (value) {
      this.selectvalue = value
      this.current = 1
      this.total = 1
      this.getdataList()
    },
    appChange (value) {
      this.appSelectValue = value
      this.current = 1
      this.total = 1
      this.getdataList()
    },
    modelShow (ids) {
      this.replyModel = true
      this.replydData.id = ids
    },
    // 回复事件
    confirmClick (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          replaypartyOpinion(this.replydData).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('回复成功')
              this.current = 1
              this.total = 1
              this.replyModel = false
              this.getdataList()
              this.$refs.replydData.resetFields()
            }
          })
        }
      })
    },
    // 删除
    getdeldata (id) {
      let commentId
      let commentIds
      var del = []
      if (id) {
        del.push(id)
        commentId = JSON.stringify(del)
      } else {
        commentIds = this.selected.map(item => (item.id))
      }
      var obj = {
        ids: id ? commentId : JSON.stringify(commentIds)
      }
      partyOpiniondel(obj).then(res => {
        console.log(res)
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
          this.total = 1
          this.getdataList()
          this.selected = []
          this.ifSelectAll = false
        }
      })
    },
    cancleClick () {
      this.replyModel = false
      this.$refs.replydData.resetFields()
    },
    // 选择
    handleSelectAll () {
      this.$refs.selection.selectAll(this.ifSelectAll)
    },
    handleDeleteAll () {
      this.$Modal.confirm({
        title: '确定要批量删除选中的全部内容吗?',
        onOk: () => {
          this.getdeldata()
        }
      })
    },
    handleSelectChange (selected) {
      this.selected = selected
      if (selected.length === this.tableData.length) {
        this.ifSelectAll = true
      } else {
        this.ifSelectAll = false
      }
    },
    // 页码
    handlePageChange (page) {
      this.ifSelectAll = false
      this.current = page
      this.getdataList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.getdataList()
    }
  }
}
</script>
<style scoped>
  .title{
    padding-bottom: 10px;
    font-size: 18px;
    font-weight: bold
  }
  .page{
    text-align: center
  }
</style>
