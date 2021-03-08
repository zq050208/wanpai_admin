<template>
  <div>
    <Tabs type="line" v-model="tabs_value" @on-click="tabsChange">
      <TabPane label="系统话题" :name="official">
        <Row :gutter="32">
          <Col span="16" class="demo-tabs-style1" style="padding:16px;">
            <Button type="primary" @click="isShow">添加话题</Button>
          </Col>
        </Row>
        <Table border :columns="columns" :data="data"></Table>
        <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
      </TabPane>
      <TabPane label="用户话题" :name="user">
        <Table border :columns="columns1" :data="data1"></Table>
        <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
      </TabPane>
    </Tabs>
    <Modal title="添加话题" v-model="visible" width="625">
      <Input v-model="value" type="textarea" :autosize="{minRows: 5,maxRows: 8}" />
      <div slot="footer">
        <Button size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" @click="addTopic">确认</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { addTopicCode, addTopic, getTopicList, deleteTopic } from '@/api/data'
export default {
  name: 'topic',
  data () {
    return {
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      tabs_value: '0',
      official: '0',
      user: '1',
      value: null,
      visible: false,
      checkcode: null,
      data: [],
      columns: [
        {
          title: '时间',
          key: 'create_time'
        },
        {
          title: '话题内容',
          key: 'content'
        },
        {
          title: '发布人',
          key: 'username'
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.tipsSonfirm({ id: params.row.id })
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      data1: [],
      columns1: [
        {
          title: '时间',
          key: 'create_time'
        },
        {
          title: '话题内容',
          key: 'content'
        },
        {
          title: '发布人',
          key: 'username'
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.tipsSonfirm({ id: params.row.id })
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getTopicList(this.tabs_value)
  },
  methods: {
    tabsChange (name) {
      this.current = 1
      this.getTopicList(this.tabs_value)
    },
    pageChange (e) {
      this.current = e
      this.getTopicList(this.tabs_value)
    },
    cancel () {
      this.visible = false
    },
    isShow () {
      addTopicCode().then(res => {
        this.visible = true
        this.checkcode = res.data.data.checkcode
      })
    },
    tipsSonfirm (obj) {
      this.$Modal.confirm({
        title: '确认删除此话题？',
        onOk: () => { this.deleteTopic(obj) }
      })
    },
    getTopicList (type) {
      getTopicList({ type: parseInt(type), page: this.current, per_page: this.per_page }).then(res => {
        if (res.data.code === 200) {
          if (this.tabs_value === '0') this.data = res.data.data.data
          else this.data1 = res.data.data.data
          this.total = res.data.data.total
          this.last_page = res.data.data.last_page
        }
      })
    },
    addTopic () {
      if (this.value) {
        addTopic({ content: this.value, checkcode: this.checkcode }).then(res => {
          if (res.data.code === 200) {
            this.$Message.success('添加成功')
            this.getTopicList(this.tabs_value)
            this.cancel()
          }
        })
      } else {
        this.$Message.error('请填写话题')
      }
    },
    deleteTopic (obj) {
      deleteTopic(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          if (this.tabs_value === '0' && this.data.length === 1) {
            this.current--
          } else if (this.tabs_value === '1' && this.data1.length === 1) {
            this.current--
          }
          this.getTopicList(this.tabs_value)
        }
      })
    }
  }
}
</script>

<style>
  .page{
    margin-top: 20px;
    text-align: center;
  }
</style>
