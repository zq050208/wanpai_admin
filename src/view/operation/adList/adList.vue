<template>
  <div>
    <Card style="margin-bottom: 20px">
      <Form inline :label-width="100" :mode="searchData" ref="form">
        <FormItem label="应用名称:" >
          <Select v-model="searchData.app_id">
            <Option v-for="opt in app" :key="opt.id" :value="opt.id" :label="opt.web_name"></Option>
          </Select>
        </FormItem>

        <FormItem label="广告名称:" >
          <Input v-model="searchData.title" placeholder="请输入广告名称" />
        </FormItem>

        <FormItem label="广告位置:" >
          <Select v-model="searchData.position_id">
            <Option :value="value" label="全部"></Option>
            <Option v-if="opt.app_id === searchData.app_id" v-for="opt in ad_position" :key="opt.id" :value="opt.id" :label="opt.position_name"></Option>
          </Select>
        </FormItem>

        <FormItem label="广告状态:" >
          <Select v-model="searchData.is_show">
            <Option :value="value" label="全部"></Option>
            <Option v-for="opt in ad_is_show" :key="opt.id" :value="opt.id" :label="opt.name"></Option>
          </Select>
        </FormItem>

        <FormItem>
          <Button @click="handleClick" >搜索</Button>
        </FormItem>
      </Form>
    </Card>

    <Form inline>
      <FormItem>
        <Checkbox v-model="ifSelectAll" @on-change="handleSelectAll">全选</Checkbox>
      </FormItem>
      <FormItem>
        <Button @click="handleDeleteAll" :disabled="selected.length === 0">批量删除</Button>
      </FormItem>
      <FormItem>
        <Button @click="$router.push({path: '/operation/add_banner/add'})">添加banner</Button>
      </FormItem>
      <!-- 这个版本暂时不需要这两个按钮 -->
      <FormItem>
        <Button @click="$router.push({path: '/operation/add_ad/add'})">添加弹窗广告</Button>
      </FormItem>
      <FormItem>
        <Button  @click="$router.push({path: '/operation/add_screen'})">添加开屏页</Button>
      </FormItem>
    </Form>
    <Table
      border
      ref="selection"
      :columns="columns"
      :data="data"
      @on-selection-change="handleSelectChange"
      @on-select-all="handleSelectAllChange"
      @on-select-all-cancel="handleSelectAllCancel"
    ></Table>
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="pageParams.total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
    <!-- 查看配图放大版 -->
    <modal v-model="viewImg" width="400" footer-hide :closable="false">
      <img :src="imgUrl" alt="" style="width: 100%;">
    </modal>
  </div>
</template>

<script>
import SearchForm from '@/components/searchForm'
import { adList, editSort, editIsShow, delAd, bulkDelAd } from '@/api/data'

export default {
  components: {
    SearchForm
  },
  data () {
    return {
      data: [],
      value: '',
      ifSelectAll: false,
      viewImg: false, // 放大缩略图
      imgUrl: '', // 放大banner图地址
      selected: [],
      app: [],
      ad_position: [],
      ad_is_show: [],
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      searchParams: {
        app_id: '',
        title: '',
        position_id: '',
        is_show: ''
      },
      searchData: {
        app_id: '',
        title: '',
        position_id: '',
        is_show: ''
      },
      columns: [
        {
          type: 'selection',
          width: 60
        },
        {
          title: '排序',
          width: '150',
          className: 'sort',
          render: (h, params) => {
            return h('div', [
              h('p', {
                class: 'pbq',
                props: { type: 'primary', size: 'small' },
                style: { textAlign: 'center' }
              }, params.row.sort),
              params.index !== 0 ? h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '15px' },
                on: {
                  click: () => {
                    this.editSort(params.row.id, 1)
                  }
                }
              }, '上移') : '',
              params.index !== this.data.length - 1 ? h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.editSort(params.row.id, 2)
                  }
                }
              }, '下移') : ''
            ])
          }
        },
        {
          title: '广告名称',
          key: 'title'
        },
        {
          title: '广告位置',
          key: 'position_name'
        },
        {
          title: '广告图片',
          width: '200px',
          render: (h, params) => {
            return h('img',
              {
                style: { width: '172.5px', height: '62.5px' },
                attrs: { src: params.row.image },
                on: {
                  click: () => {
                    this.viewImg = true
                    this.imgUrl = params.row.image
                  }
                }
              }
            )
          }
        },
        {
          title: '广告展示时间',
          width: '250',
          render: (h, params) => {
            return h('div', [
              h('p', {}, '开始时间：' + params.row.start_time),
              h('p', {}, '到期时间：' + params.row.end_time)
            ])
          }
        },
        {
          title: '显示/隐藏',
          width: '100',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: params.row.is_show,
                'true-value': 1, // 开启值
                'false-value': 0 // 关闭值
              },
              on: {
                input: function (event) {
                  if (event) { params.row.is_show = 1 } else { params.row.is_show = 0 }
                },
                'on-change': () => {
                  this.editIsShow(params.row.id, params.row.is_show)
                }
              }
            })
          }
        },
        {
          title: '点击人/次',
          render: (h, params) => {
            return h('div', [
              h('p', {}, params.row.uv + '/' + params.row.pv)
            ])
          }
        },
        {
          title: '人均点击',
          render: (h, params) => {
            let num = '-'
            if (params.row.pv) num = (params.row.pv / params.row.uv).toFixed(2)
            return h('div', [h('p', {}, num)])
          }
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '15px' },
                on: {
                  click: () => {
                    if (params.row.position === 3) {
                      this.$router.push({ path: '/operation/add_ad/add', query: { id: params.row.id } })
                    } else {
                      this.$router.push({ path: '/operation/add_banner/add', query: { id: params.row.id } })
                    }
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '确认删除？',
                      onOk: () => {
                        this.delAd(params.row.id)
                      }
                    })
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
    this.getAdList()
  },
  methods: {
    getAdList () {
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      }
      adList(data).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.pageParams.total = res.data.data.total
          if (this.app.length <= 1) {
            this.app = res.data.data.app
            this.ad_position = res.data.data.ad_position
            this.ad_is_show = res.data.data.ad_is_show
            this.searchData.app_id = this.app[0].id
          }
        }
      })
    },
    editSort (id, type) {
      editSort({ id: id, sort_type: type }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.getAdList()
        }
      })
    },
    editIsShow (id, type) {
      editIsShow({ id: id, is_show: type }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.getAdList()
        }
      })
    },
    delAd (id) {
      delAd({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          if (this.pageParams.page > 1 && this.data.length === 1) this.pageParams.page--
          this.getAdList()
        }
      })
    },
    bulkDelAd (ids) {
      bulkDelAd({ ids: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          if (this.pageParams.page > 1) this.pageParams.page--
          this.ifSelectAll = false
          this.getAdList()
        }
      })
    },
    handleClick () {
      this.pageParams.page = 1
      this.searchParams = { ...this.searchData }
      this.getAdList()
    },
    handlePageChange (page) {
      this.pageParams.page = page
      this.ifSelectAll = false
      this.getAdList()
    },
    handlePageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.ifSelectAll = false
      this.getAdList()
    },
    handleSelectAll () {
      this.$refs.selection.selectAll(this.ifSelectAll)
    },
    handleSelectAllCancel () {
      this.ifSelectAll = false
    },
    handleSelectAllChange () {
      this.ifSelectAll = true
    },
    handleSelectChange (selected) {
      this.selected = selected
      if (selected.length === this.data.length) this.ifSelectAll = true
      else this.ifSelectAll = false
    },
    handleDeleteAll () {
      let list = []
      this.selected.filter(item => { list.push(item.id) })
      this.$Modal.confirm({
        title: '确定要删除选中的全部内容吗？',
        onOk: () => {
          this.bulkDelAd(JSON.stringify(list))
        }
      })
    }
  }
}
</script>

<style>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>
