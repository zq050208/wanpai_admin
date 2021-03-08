<template>
    <div>
      <Card>
        <SearchForm :searchForm="searchForm" :searchData="searchData" />
        <Table border :loading="loading" :columns="columns" :data="dataList" ref="table"></Table>
        <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
      </Card>
      <!-- 视频弹框 -->
      <Modal v-model="videoMask" :mask-closable="false" title="视频详情">
        <video :src="videoUrl" controls="controls" style="width: 100%"></video>
      </Modal>
      <!-- 游戏图片弹框 -->
      <Modal v-model="imgMask" :mask-closable="false" title="游戏图片">
        <Carousel v-model="value1" :loop="true" :height="250" v-if="imgMask" >
        <CarouselItem ><div class="demo-carousel" v-for="item in imgsList" :key="item.index"><img :src="item" alt="" ></div></CarouselItem>
      </Carousel>
      </Modal>
    </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import expandRow from './table-expand.vue';
import { getGameReviewList, reviewGame, delGameReview, synchReviewGame } from '@/api/data'
import { getTagNavListFromLocalstorage } from '@/libs/util'
export default {
  components: { SearchForm, expandRow },
  data () {
    return {
      loading: true,
      videoMask: false,
      imgMask: false,
      videoUrl: '',
      value1: 0,
      imgsList: [],
      dataList: [],
      current: this.$store.state.user.gameCheckPage || 1,
      per_page: 10,
      total: 1,
      idx: 0,
      keywords: '',
      tag_name:'',
      searchData: {
        keywords: '',
        tag_name:''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.current = 1
              this.keywords = this.searchData.keywords
              this.tag_name =  this.searchData.tag_name
              this.getdataList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            label: '游戏查询：',
            prop: 'keywords',
            placeholder: '请输入游戏名称',
            style: 'width:250px'
          },
           {
            name: 'Input',
            label: '分类查询：',
            prop: 'tag_name',
            placeholder: '请输入游戏分类',
            style: 'width:250px'
          }
        ]
      },
      columns: [
        {
          title: '序号',
          key: 'id',
          align: 'center'
        },
        {
          title: '游戏名称',
          key: 'name',
          align: 'center',
        },
        {
          title: '游戏图标',
          key: 'logo',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.logo },
                style: { width: '50px', height: '50px', margin: 'auto' }
              })
            ])
          }
        },
        {
          title: '游戏简介',
          key: 'one_introduce',
          align: 'center'
        },
        {
          title: '游戏介绍',
          // key: 'detail_introduce',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.detail_introduce.length > 30 ? params.row.detail_introduce.substr(0,30) + '...' : params.row.detail_introduce)
          }
        },
        {
          title: '评分',
          key: 'score',
          align: 'center'
        },
        {
          title: '游戏分类',
          key: 'game_cate',
          align: 'center'
        },
        {
          title: '游戏视频',
          key: 'video',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                on: {
                  click: () => {
                    if (params.row.video_introduce) {
                      this.videoMask = true
                      this.videoUrl = params.row.video_introduce
                    }
                  }
                }
              }, params.row.video_introduce ? '查看视频' : '')
            ])
          }
        },
        {
          title: '游戏图片',
          key: 'img',
          align: 'center',
          render: (h, params) => {
            if (params.row.images_introduce) {
              return h('viewer',
                {
                  style: { width: '52px', height: '52px', margin: '3px auto', }
                },
                JSON.parse(params.row.images_introduce).map(i => h('img', {
                  attrs: { src: i},
                  style: { width: '52px', height: '52px', margin: '0 auto' }
                }))
              )
            }
          }
        },
        {
          title: '背景图',
          key: 'back',
          align: 'center',
          render: (h, params) => {
            if (params.row.background) {
              return h('div', [
                h('img', {
                  attrs: { src: params.row.background },
                  style: { width: '100px', height: '50px', margin: 'auto', display: 'block' }
                })
              ])
            }
          }
        },
        {
          title: '观点',
          key: 'game_viewpoint',
          align: 'center'
        },
        {
          title: '数据对比',
          align: 'center',
          type: 'expand',
          render: (h, params) => {
            this.idx = params.index
            return h(expandRow, {
              props: {
                id: params.row.id,
                name: params.row.name
              }
            })
          }
        },
        {
          title: '开发者',
          key: 'developer',
          align: 'center'
        },
        {
          title: '运营商',
          key: 'operator',
          align: 'center'
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.operate_status === 1 ? '运营中' : '停止')
          }
        },
        {
          title: '操作',
          key: 'picture',
          align: 'center',
          render: (h, params) => {
            if (params.row.status === 1) {
              return h('div', [
                h('Button', {
                  props: { type: 'info', size: 'small' },
                  style: { marginRight: '10px' },
                  on: {
                    click: () => {
                      let tagList = getTagNavListFromLocalstorage() || []
                      let flag = true
                      if (tagList.length) {
                        tagList.forEach(item => {
                          if (item.name === 'gameCheckDetail') {
                            flag = false
                          }
                        })
                      }
                          console.log('触发了编辑',)

                      if (flag) {
                        this.$router.push({ path: `checkDetail?id=${params.row.id}&&page=${this.current}` })
                      } else {
                        this.$Modal.error({ content: '已有游戏正在编辑，请关闭后在编辑当前游戏', title: '提示' })
                      }
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: { type: 'success', size: 'small' },
                  style: { marginRight: '10px' },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确定通过审核吗？',
                        onOk: () => {
                          this.getPass(params.row.id)
                        }
                      })
                    }
                  }
                }, '过审 '),
                h('Button', {
                  props: { type: 'error', size: 'small' },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确定删除吗？',
                        onOk: () => {
                          this.getDelet(params.row.id)
                        }
                      })
                    }
                  }
                }, ' 删除 ')
              ])
            } else if (params.row.status === 2) {
              return h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确定同步更新吗？',
                      onOk: () => {
                        this.getUpdate(params.row.game_id)
                      }
                    })
                  }
                }
              }, '同步更新')
            } else {
              return h('Button', {
                props: { type: 'text' }
              }, '已审核')
            }
          }
        }
      ]
    }
  },
  mounted () {
    this.getdataList()
    console.log('state:', this.$store.state.user.gameCheckPage)
  },
  methods: {
    // 获取数据
    getdataList () {
      let args = arguments[0]
      var obj = {
        page: this.current,
        per_page: this.per_page,
        keywords: this.keywords,
        tag_name: this.searchData.tag_name
      }
      this.loading = true
      getGameReviewList(obj).then(res => {
        this.loading = false
        if (res.data.code === 200) {
          this.dataList = res.data.data.data
          this.total = res.data.data.total
          this.current = res.data.data.current_page
          // 获取需要展开的第args项数据对比，undefined则不展开
          if (this.dataList.length && args) {
            this.dataList[this.idx]._expanded = true
          }
        }
      })
    },
    // 审核
    getPass (ids) {
      reviewGame({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('审核成功')
          this.getdataList()
        }
      })
    },
    // 删除
    getDelet (ids) {
      delGameReview({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          if (this.dataList.length === 1 && this.current > 1) {
            this.current--
          }
          this.getdataList()
        }
      })
    },
    getUpdate (ids) {
      synchReviewGame({ id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('同步更新成功')
          this.getdataList()
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.getdataList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.getdataList()
    }
  },
  beforeDestroy () {
    this.$store.state.user.gameCheckPage = 1
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center
}
.demo-carousel{
  width: 100%;
  height: 250px;
}
.demo-carousel img{
  width: 100%;
  height: 100%;
  margin-top: 20px
}
</style>
