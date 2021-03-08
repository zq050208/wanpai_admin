<!-- eslint-disable -->
<template>
  <div>
    <Card>
      <Form inline>
        <FormItem label="状态：" >
          <Select v-model="channel_status" >
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in bar.channel_status" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="加盟商类型：" >
          <Select v-model="channel_type" >
            <Option value="0" key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in bar.channel_type" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="加盟商名称：" >
          <Input v-model="channel_name" />
        </FormItem>
        <FormItem label="　">
          <Button type="primary" @click="listQuery">查询</Button>
        </FormItem>
        <FormItem label="　">
          <Button type="primary" @click="add">新增</Button>
        </FormItem>
      </Form>
    </Card>
    <Card style="margin-top: 20px">
      <p slot="title">总共{{last_page}}页</p>
      <Table border :columns="columns" :data="data"></Table>
      <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
    </Card>
    <Modal title="查看分成（单位：元）" v-model="visible">
      <h6 class="margin-bottom-10">流水分成比例：　<span v-if="current_flow">{{runoff_proportions}}</span></h6>
      <h6 class="margin-bottom-10">利润分成比例：</h6>
      <Table border :columns="columns1" :data="data1" v-if="current_profit"></Table>
      <div slot="footer">
        <Button type="primary" size="large" @click="cancel">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { channelList } from '@/api/data'
export default {
  name: 'joining-trader-list',
  data () {
    return {
      current: 1, // 当前页
      per_page: 10, // 每页显示条数
      total: 0,
      last_page: 0,
      channel_status: null,
      channel_type: null,
      channel_name: null,
      visible: false,
      label_position: 'left',
      bar: {},
      data: [],
      data1: [],
      runoff_proportions: null,
      current_flow: false,
      current_profit: false,
      columns1: [
        {
          title: '阶梯',
          render: (h, params) => {
            return h('div', {}, params.index + 1)
          }
        },
        {
          title: '区间',
          render: (h, params) => {
            return h('div', {}, params.row.low_range + '-' + params.row.high_range)
          }
        },
        {
          title: '分成比例',
          key: 'proportion',
          render: (h, params) => {
            return h('div', {}, params.row.proportion + '%')
          }
        }
      ],
      columns: [
        {
          title: 'id',
          key: 'id'
        },
        {
          title: '加盟商类型',
          key: 'channel_type',
          render: (h, params) => {
            return h('div', {}, params.row.channel_type === 1 ? '自营' : '联营')
          }
        },
        {
          title: '加盟商状态',
          key: 'status',
          render: (h, params) => {
            return h('div', {}, params.row.status === 1 ? '激活' : '冻结')
          }
        },
        {
          title: '加盟商名称',
          key: 'channel_name'
        },
        {
          title: '加盟商代码',
          key: 'channel_code'
        },
        {
          title: '品牌LOGO',
          key: 'logo',
          className: 'logo',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.logo },
                style: { width: '50px', height: '50px', display: params.row.logo ? 'block' : 'none' }
              })
            ])
          }
        },
        {
          title: '关联帐号',
          key: 'username'
        },
        {
          title: '加盟商负责人',
          key: 'channel_principal'
        },
        {
          title: '加盟商联系地址',
          key: 'contact_address'
        },
        {
          title: '佣金分成',
          key: 'proportion',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.data1 = params.row.proportion
                    this.runoff_proportions = params.row.runoff_proportions ? params.row.runoff_proportions + '%' : ''
                    this.current_flow = params.row.is_flow === 1
                    this.current_profit = params.row.is_profit === 1
                    this.visible = true
                  }
                }
              }, '查看分成')
            ])
          }
        },
        {
          title: '门店数量',
          key: 'total_son'
        },
        {
          title: '用户数',
          key: 'total_users'
        },
        {
          title: '创建时间',
          key: 'create_time'
        },
        {
          title: '操作',
          key: 'id',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.$emit('update', params.row.id)
                  }
                }
              }, '编辑')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getChannelList()
  },
  methods: {
    getChannelList () {
      var obj = {
        channel_status: this.channel_status,
        channel_type: this.channel_type,
        channel_name: this.channel_name,
        page: this.current,
        per_page: this.per_page
      }
      channelList(obj).then(res => {
        this.data = res.data.data.data
        this.total = res.data.data.total
        this.last_page = res.data.data.last_page
        this.bar = res.data.data.bar
      })
    },
    pageChange (e) {
      this.current = e
      this.getChannelList()
    },
    cancel () {
      this.visible = false
    },
    listQuery () {
      this.current = 1
      this.total = 0
      this.last_page = 0
      this.getChannelList()
    },
    add () {
      this.$emit('add')
    }
  }
}
</script>

<style>
  .logo div{
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 3px;
  }
  .margin-bottom-10 {
    margin-bottom: 10px;
  }
</style>
