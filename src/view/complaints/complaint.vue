<template>
  <div>
    <Tabs type="line" v-model="tabs_value" @on-click="tabsChange">
      <TabPane label="用户投诉" name="user">
      </TabPane>
      <TabPane label="派对投诉" name="room">
      </TabPane>
      <TabPane label="已处理" name="handled">
      </TabPane>
    </Tabs>
    <Table border :columns="columns" :data="data"></Table>
    <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
    <Modal v-model="visible" >
      <Form ref='bannedData' :model="bannedData">
        <FormItem label="操作类型：" prop="method_id">
          <Select placeholder="请选择" v-model='bannedData.method_id'>
            <Option :value="1">封禁</Option>
            <Option :value="3">解禁</Option>
          </Select>
        </FormItem>
        <FormItem label="封禁原因：" prop="forbid_reason">
          <Select placeholder="请选择" v-model='bannedData.forbid_reason'>
            <Option :value="item.id" v-for="item in report_type" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁类型：" prop="forbid_type">
          <Select placeholder="请选择" v-model='bannedData.forbid_type'>
            <Option :value="item.id" v-for="item in forbid_type" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁时长：" prop="time_id">
          <Select placeholder="请选择" v-model='bannedData.time_id'>
            <Option :value="item.time_id" v-for="item in forbid_time" :key="item.time_id" :label="item.value"></Option>
          </Select>
        </FormItem>
        <FormItem label="操作描述：" prop="handle_desc" :rules="[{max: 20, message: '不能超过 20 个字符', trigger: 'blur' }]">
          <Input v-model="bannedData.handle_desc" placeholder="必填,20个字符以内"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" @click="handleSubmit('bannedData')">提交</Button>
        <Button type="text" size="large" @click="cancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getComPending, getComHandled, saveComPending, saveIgnoreCom, getComConfig } from '@/api/data'
export default {
  name: 'complaint',
  data () {
    return {
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      tabs_value: 'user',
      report_type: [],
      forbid_time: [],
      forbid_type: [],
      bannedData: {},
      checkcode: null,
      visible: false,
      data: [],
      columns: [{
        title: '时间',
        key: 'create_time',
        align: 'center'
      },
      {
        title: '投诉分类',
        key: 'report_type',
        align: 'center',
        render: (h, params) => {
          if (params.row.report_type === '1') return h('div', {}, '垃圾广告')
          else if (params.row.report_type === '2') return h('div', {}, '违法返动')
          else if (params.row.report_type === '3') return h('div', {}, '侮辱谩骂')
          else if (params.row.report_type === '4') return h('div', {}, '淫秽色情')
          else if (params.row.report_type === '5') return h('div', {}, '嘲讽不友善')
          else if (params.row.report_type === '7') return h('div', {}, '其它')
        }
      },
      {
        title: '投诉人',
        key: 'nickname',
        align: 'center'
      },

      {
        title: '被投诉人',
        key: 'forbid_name',
        align: 'center'
      },

      {
        title: '具体内容',
        key: 'report_desc',
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: { type: 'primary', size: 'small' },
              on: {
                click: () => {
                  this.$Modal.warning({
                    title: '投诉内容',
                    content: params.row.report_desc
                  })
                }
              }
            }, '查看')
          ])
        }
      },
      {
        title: '操作',
        align: 'center',
        render: (h, params) => {
          if (params.row.handle_id === 0) {
            return [h('Button', {
              props: { type: 'primary', size: 'small' },
              style: { marginRight: '5px' },
              on: {
                click: () => {
                  this.bannedCom(params.row.id)
                }
              }
            }, '封禁'), h('Button', {
              props: { type: 'error', size: 'small' },
              on: {
                click: () => {
                  this.ignoreCom(params.row.id)
                }
              }
            }, '忽略')]
          } else if (params.row.handle_id === -2) return h('p', {}, '已忽略')
          else {
            if (params.row.time_id === -1) return [h('p', {}, '封禁时长：永久'), h('p', {}, '封禁原因：' + params.row.handle_desc)]
            else if (params.row.time_id === 1) return [h('p', {}, '封禁时长：1小时'), h('p', {}, '封禁原因：' + params.row.handle_desc)]
            else if (params.row.time_id === 24) return [h('p', {}, '封禁时长：1天'), h('p', {}, '封禁原因：' + params.row.handle_desc)]
            else if (params.row.time_id === 72) return [h('p', {}, '封禁时长：3天'), h('p', {}, '封禁原因：' + params.row.handle_desc)]
            else if (params.row.time_id === 168) return [h('p', {}, '封禁时长：7天'), h('p', {}, '封禁原因：' + params.row.handle_desc)]
            else if (params.row.time_id === 720) return [h('p', {}, '封禁时长：30天'), h('p', {}, '封禁原因：' + params.row.handle_desc)]
          }
        }
      }
      ]
    }
  },
  mounted () {
    this.getComList(this.tabs_value) // 渲染列表
  },
  methods: {
    tabsChange (name) { // 获取标签
      this.current = 1
      this.getComList(this.tabs_value)
    },
    pageChange (e) { // 分页
      this.current = e
      this.getComList(this.tabs_value)
    },
    getComList (tabs_value) { // 根据标签加载内容
      if (tabs_value === 'handled') {
        getComHandled({ page: this.current, per_page: this.per_page }).then(res => {
          if (res.data.code === 200) {
            this.data = res.data.data.data
            this.total = res.data.data.total
            this.last_page = res.data.data.last_page
          }
        })
      } else {
        if (tabs_value === 'user') {
          var type = 1
        } else if (tabs_value === 'room') {
          type = 2
        }
        getComPending({ user_type: type, page: this.current, per_page: this.per_page }).then(res => {
          if (res.data.code === 200) {
            this.data = res.data.data.data
            this.total = res.data.data.total
            this.last_page = res.data.data.last_page
          }
        })
      }
    },
    ignoreCom (id) { // 忽略投诉
      this.$Modal.confirm({
        title: '提示',
        content: '<p>确认忽略此投诉?</p>',
        okText: '确认',
        cancelText: '取消',
        closable: true,
        zIndex: 1,
        onOk: () => {
          saveIgnoreCom({ id: id }).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('忽略成功')
              this.current = this.current > 1 ? this.current : 1
              this.getComList(this.tabs_value)
            }
          })
        }
      })
    },
    bannedCom (id) { // 获取封禁弹窗
      this.bannedData.report_id = id
      getComConfig().then(res => {
        if (res.data.code === 200) {
          this.report_type = res.data.data.report_type
          this.bannedData.checkcode = res.data.data.checkcode
          this.forbid_time = res.data.data.forbid_time
          this.forbid_type = res.data.data.forbid_type
        }
      })
      this.visible = true
    },
    handleSubmit (name) { // 提交封禁用户
      this.$refs[name].validate((valid) => {
        if (valid) {
          saveComPending(this.bannedData).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('成功')
              this.cancel()
              this.current = this.current > 1 ? this.current : 1
              this.getComList(this.tabs_value)
            }
          })
        } else {
          this.$Message.error('提交失败')
        }
      })
    },
    cancel () { // 关闭窗口清空表单
      this.visible = false
      this.$refs.bannedData.resetFields()
    }
  }
}

</script>
<style lang="less">
  @import "../total-forms/forms.less";
</style>
