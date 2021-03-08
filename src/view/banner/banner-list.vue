<template>
  <div>
    <Card>
      <p slot="title">增加新账号</p>
      <Button type="primary" @click="add">增加新账号</Button>
      <Form inline :label-width="80" style="margin-top: 20px">
        <Form-item label="查询时间：">
          <DatePicker placement="bottom-start" type="datetimerange" placeholder="请选择起始时间与结束时间" style="width: 300px" @on-change="searchTime"></DatePicker>
        </Form-item>
        <!-- <FormItem label="广告类型：">
          <Select placeholder="请输入广告类型" v-model="ad_type">
            <Option value="">全部</Option>
            <Option :value="item.id" v-for="item in banner_type" :key="item.id" :label="item.name"></Option>
          </Select>
        </FormItem> -->
        <FormItem label="跳转类型：">
          <Select placeholder="请选择跳转类型" v-model="ad_jump_type">
            <Option value="">全部</Option>
            <Option :value="1">跳转</Option>
            <Option :value="0">不跳转</Option>
          </Select>
        </FormItem>
        <FormItem label="显示状态：">
          <Select placeholder="请选择显示状态" v-model="status">
            <Option value="">全部</Option>
            <Option :value="1">显示</Option>
            <Option :value="0">不显示</Option>
          </Select>
        </FormItem>
        <Button type="primary" @click="listQuery">查询</Button>
      </Form>
    </Card>
    <Card>
      <p slot="title">总共{{last_page}}页</p>
      <Table border :columns="columns" :data="data"></Table>
      <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
    </Card>
  </div>
</template>
<script>
import { getBanner, delBanner } from '@/api/data'
export default {
  name: 'gift',
  data () {
    return {
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      start_time: '',
      end_time: '',
      // banner_type: [],
      // ad_type: '',
      ad_jump_type: '',
      status: '',
      data: [],
      columns: [{
        title: '创建时间',
        key: 'create_time',
        align: 'center'
      },
        // {
        //   title: '广告类型',
        //   key: 'ad_type',
        //   align: 'center',
        //   render: (h, params) => {
        //     if (params.row.ad_type === 1) return h('div', {}, '娱乐赛')
        //     else if (params.row.ad_type === 2) return h('div', {}, '网咖赛')
        //     else if (params.row.ad_type === 3) return h('div', {}, '陪玩')
        //     else if (params.row.ad_type === 4) return h('div', {}, '小虎电竞')
        //     else if (params.row.ad_type === 5) return h('div', {}, 'PC直播 PUBG steam启动页')
        //     else if (params.row.ad_type === 6) return h('div', {}, 'PC直播 PUBG wegame启动页')
        //     else if (params.row.ad_type === 7) return h('div', {}, 'PC直播 英雄联盟启动页')
        //     else if (params.row.ad_type === 14) return h('div', {}, '玩派首页')
        //   }
        // },
      {
        title: '图片',
        key: 'ad_images_url',
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('img', {
              attrs: { src: params.row.ad_images_url },
              style: { width: '50px', height: '50px', margin: '0 auto', display: params.row.ad_images_url ? 'block' : 'none' }
            })
          ])
        }
      },
      {
        title: '排序',
        key: 'sort',
        align: 'center'
      },
      {
        title: '跳转链接',
        key: 'ad_jump_url',
        align: 'center',
        render: (h, params) => {
          return h('span', {}, params.row.ad_jump_type === 1 ? params.row.ad_jump_url : '不跳转')
        }
      },
      {
        title: '显示状态',
        key: 'status',
        align: 'center',
        render: (h, params) => {
          return h('span', {}, params.row.status === 1 ? '显示' : '不显示')
        }
      },
      {
        title: '操作',
        key: 'ad_id',
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h(
              'Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '10px'
                },
                on: {
                  click: () => {
                    this.$emit('update', params.row)
                  }
                }
              }, '查看'),
            h(
              'Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.removeBanner(params.row.ad_id)
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
    this.getBannerList() // 渲染banner列表
    // getBannerType().then(res => { // 获取banner类型
    //   if (res.data.code === 200) {
    //     this.banner_type = res.data.data
    //   }
    // })
  },
  methods: {
    pageChange (e) { // 获取当前页banner列表
      this.current = e
      this.getBannerList()
    },
    searchTime (e) { // 查询时间
      if (e) {
        this.start_time = e[0]
        this.end_time = e[1]
      }
    },
    getBannerList () { // 获取banner列表
      let data = {
        page: this.current,
        per_page: this.per_page,
        start_time: this.start_time,
        end_time: this.end_time,
        // ad_type: this.ad_type,
        ad_jump_type: this.ad_jump_type,
        status: this.status
      }
      getBanner(data).then(res => {
        this.total = res.data.data.total
        this.last_page = res.data.data.last_page
        this.per_page = res.data.data.per_page
        this.current = res.data.data.current_page
        this.data = res.data.data.data
      })
    },
    removeBanner (id) { // 删除banner
      this.$Modal.confirm({
        title: '提示',
        content: '<p>请再次确认删除?</p>',
        okText: '确认',
        cancelText: '取消',
        closable: true,
        zIndex: 1,
        onOk: () => {
          delBanner({ ad_id: id }).then(res => {
            if (res.data.code === 200) {
              this.current = this.current > 1 ? this.current : 1
              this.$Message.success('删除成功')
              this.getBannerList()
            } else {
              this.$Message.error(res.data.msg)
              this.getBannerList()
            }
          })
        }
      })
    },
    listQuery () { // 查询
      this.current = 1
      this.getBannerList()
    },
    add () { // 添加banner
      this.$emit('add')
    }
  }
}

</script>
<style lang="less">
@import "../total-forms/forms.less";

</style>
