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
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in bar.channel_type" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem>
        <FormItem label="所属加盟商：">
          <Select v-model="parent_channel_id" >
            <Option :value="0" :key="0" label="全部"></Option>
            <Option :value="item.id" v-for="item in bar.channel" :key="item.id" :label="item.channel_name"></Option>
          </Select>
        </FormItem>
        <FormItem label="门店名称：" >
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
    <Modal title="图片" v-model="visible" width="625">
      <h3>门店品牌图</h3>
      <div class="pictureic" style="margin-bottom: 10px">
        <img style="width: 171.5px;height: 63px" v-for="(item, index) in brand_logo" :key="index" :src="item">
        <div v-if="brand_logo.length === 0">暂无品牌图</div>
      </div>
      <h3>门店宣传图</h3>
      <div class="pictureic">
        <img :src="item" style="width: 187.5px;height: 106.5px" v-for="(item, index) in image" :key="index" >
        <div v-if="image.length === 0">暂无宣传图</div>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="cancel">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { storeList } from '@/api/data'
export default {
  name: 'stores-list',
  data () {
    return {
      current: 1, // 当前页
      per_page: 10, // 每页显示条数
      total: 0,
      last_page: 0,
      channel_status: null,
      channel_type: null,
      channel_name: null,
      parent_channel_id: null,
      visible: false,
      label_position: 'left',
      bar: {},
      image: [],
      brand_logo: [],
      data: [],
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
          title: '所属加盟商',
          key: 'parent_name'
        },
        {
          title: '门店名称',
          key: 'channel_name'
        },
        {
          title: '门店代码',
          key: 'channel_code'
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
          title: '门店负责人',
          key: 'channel_principal'
        },
        {
          title: '门店经营地址',
          key: 'contact_address',
          width: '300px'
        },
        {
          title: '用户数',
          key: 'total_users'
        },
        {
          title: '门店二维码',
          key: 'channel_qr_code',
          className: 'logo',
          width: 130,
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
          title: '经纬度',
          key: 'position'
        },
        {
          title: '创建时间',
          key: 'create_time'
        },
        {
          title: '操作',
          key: 'id',
          align: 'center',
          width: 130,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '10px' },
                on: {
                  click: () => {
                    this.$emit('update', params.row)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    if (params.row.image) this.image = JSON.parse(params.row.image)
                    else this.image = []
                    if (params.row.brand_logo) this.brand_logo = JSON.parse(params.row.brand_logo)
                    else this.brand_logo = []
                    this.visible = true
                  }
                }
              }, '图片')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getStoreList()
  },
  methods: {
    getStoreList () {
      var obj = {
        channel_status: this.channel_status,
        channel_type: this.channel_type,
        channel_name: this.channel_name,
        parent_channel_id: this.parent_channel_id,
        page: this.current,
        per_page: this.per_page
      }
      storeList(obj).then(res => {
        this.data = res.data.data.data
        this.total = res.data.data.total
        this.last_page = res.data.data.last_page
        this.bar = res.data.data.bar
      })
    },
    pageChange (e) {
      this.current = e
      this.getStoreList()
    },
    cancel () {
      this.visible = false
    },
    listQuery () {
      this.current = 1
      this.total = 0
      this.last_page = 0
      this.getStoreList()
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
  .pictureic{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }
  .pictureic img{
    margin: 0 10px 10px 0;
  }
</style>
