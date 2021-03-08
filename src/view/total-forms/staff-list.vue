<!-- eslint-disable -->
<template>
  <div>
    <Card>
      <Form inline>
        <FormItem label="所属加盟商：">
          <Select v-model="grandpa_channel_id" @on-change="grandpaChange">
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in bar.channel" :key="item.id" :label="item.channel_name"></Option>
          </Select>
        </FormItem>
        <FormItem label="所属门店：" >
          <Select v-model="parent_channel_id" >
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in storeList" :key="item.id" :label="item.channel_name"></Option>
          </Select>
        </FormItem>
        <FormItem label="店员名称：" >
          <Input v-model="channel_name" />
        </FormItem>
        <FormItem label="　" >
          <Button type="primary" @click="listQuery">查询</Button>
        </FormItem>
        <FormItem label="　" >
          <Button type="primary" @click="add">新增</Button>
        </FormItem>
      </Form>
    </Card>
    <Card style="margin-top: 20px">
      <p slot="title">总共{{last_page}}页</p>
      <Table border :columns="columns" :data="data"></Table>
      <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
    </Card>
  </div>
</template>

<script>
import { staffList, getSonChannel } from '@/api/data'
export default {
  name: 'staff-list',
  data () {
    return {
      current: 1, // 当前页
      per_page: 10, // 每页显示条数
      total: 0,
      last_page: 0,
      channel_name: null,
      parent_channel_id: null,
      grandpa_channel_id: null,
      storeList: [],
      visible: false,
      label_position: 'left',
      bar: {},
      data: [],
      columns: [
        {
          title: '店员名称',
          key: 'channel_name'
        },
        {
          title: '所属加盟商',
          key: 'grandpa_name'
        },
        {
          title: '所属门店',
          key: 'parent_name'
        },
        {
          title: '关联帐号',
          key: 'username'
        },
        {
          title: '状态',
          key: 'status',
          render: (h, params) => {
            return h('div', {}, params.row.status === 1 ? '激活' : '冻结')
          }
        },
        {
          title: '店员分成',
          key: 'proportions',
          render: (h, params) => {
            return h('div', {}, params.row.proportions + '%')
          }
        },
        {
          title: '扫码用户数',
          key: 'total_users'
        },
        {
          title: '手机号码',
          key: 'mobile'
        },
        {
          title: '店员二维码',
          key: 'channel_qr_code',
          className: 'logo',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.channel_qr_code },
                style: { width: '50px', height: '50px' }
              }),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginLeft: '10px' },
                on: {
                  click: () => {
                    this.downloadIamge(params.row.channel_qr_code, params.row.channel_name)
                  }
                }
              }, '下载')
            ])
          }
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
    this.getStaffList()
  },
  methods: {
    grandpaChange (id) {
      getSonChannel({ channel_id: id }).then(res => {
        this.storeList = res.data.data.data
      })
    },
    getStaffList () {
      var obj = {
        channel_name: this.channel_name,
        grandpa_channel_id: this.grandpa_channel_id,
        parent_channel_id: this.parent_channel_id,
        page: this.current,
        per_page: this.per_page
      }
      staffList(obj).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.total = res.data.data.total
          this.last_page = res.data.data.last_page
          this.bar = res.data.data.bar
        }
      })
    },
    pageChange (e) {
      this.current = e
      this.getStaffList()
    },
    cancel () {
      this.visible = false
    },
    listQuery () {
      this.current = 1
      this.total = 0
      this.last_page = 0
      this.getStaffList()
    },
    add () {
      this.$emit('add')
    },
    downloadIamge (imgsrc, name) { // 下载图片地址和图片名
      var image = new Image()
      // 解决跨域 Canvas 污染问题
      image.setAttribute('crossOrigin', 'anonymous')
      image.onload = function () {
        var canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        var context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, image.width, image.height)
        var url = canvas.toDataURL('image/png')
        var a = document.createElement('a')
        var event = new MouseEvent('click')
        a.download = name
        a.href = url
        a.dispatchEvent(event)
      }
      image.src = imgsrc
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
</style>
