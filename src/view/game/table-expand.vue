<template>
  <div>
    <div class="title">各大平台数据对比</div>
    <Table border :loading="loading" :columns="columns" :data="list" ></Table>
  </div>
</template>

<script>
import { getSameGameList, replaceGameData } from '@/api/data'
export default {
  name: "table-expand",
  props: {
    id: {
      type: Number,
      value: '',
    },
    name: {
      type: String,
      value: '',
    }
  },
  data () {
    return {
      loading: true,
      list: [],
      columns: [
        {
          title: '来源平台',
          key: 'source_channel',
          align: 'center'
        },
        {
          title: '游戏名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '游戏图标',
          key: 'logo',
          align: 'center',
          className: 'box',
          render: (h, params) => {
            return h('div',
              this.replaceArr(params.row.id, 'logo'),
              [
                h('img', {
                  attrs: { src: params.row.logo },
                  style: { width: '50px', height: '50px', margin: 'auto', display: 'block' }
                })
              ]
            )
          }
        },
        {
          title: '游戏简介',
          key: 'one_introduce',
          align: 'center',
          render: (h, params) => {
            return h('div',
              this.replaceArr(params.row.id, 'one_introduce'),
              [
                h('div', { style: { minHeight: '50px' } }, params.row.one_introduce)
              ]
            )
          }
        },
        {
          title: '游戏介绍',
          key: 'detail_introduce',
          align: 'center',
          render: (h, params) => {
            return h('div',
              this.replaceArr(params.row.id, 'detail_introduce'),
              [
                h('div', { style: { minHeight: '50px' } }, params.row.detail_introduce.substr(0,20))
              ]
            )
          }
        },
        {
          title: '评分',
          key: 'score',
          align: 'center',
          render: (h, params) => {
            return h('div',
              [
                h('div', { style: { minHeight: '50px', } }, params.row.score)
              ]
            )
          }
        },
        {
          title: '游戏分类',
          key: 'game_cate',
          align: 'center',
          render: (h, params) => {
            return h('div',
              this.replaceArr(params.row.id, 'game_cate', params.index),
              [
                h('div', { style: { minHeight: '50px', } }, params.row.game_cate)
              ]
            )
          }
        },
        {
          title: '游戏视频',
          key: 'video',
          align: 'center',
          render: (h, params) => {
            if (params.row.images_introduce) {
              return h('div',
                this.replaceArr(params.row.id, 'video_introduce'),
                [
                  h('img', {
                    attrs: { src: params.row.images_introduce ? JSON.parse(params.row.images_introduce)[0] : null },
                    style: { width: '100px', height: '50px', margin: 'auto', display: 'block' }
                  })
                ]
              )
            }
          }
        },
        {
          title: '游戏图片',
          key: 'img',
          align: 'center',
          render: (h, params) => {
            if (params.row.images_introduce) {
              return h('div',
                this.replaceArr(params.row.id, 'images_introduce'),
                [
                  h('img', {
                    attrs: { src: params.row.images_introduce ? JSON.parse(params.row.images_introduce)[0] : null },
                    style: { width: '100px', height: '50px', margin: 'auto', display: 'block' }
                  })
                ]
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
              return h('div',
                this.replaceArr(params.row.id, 'background'),
                [
                  h('img', {
                    attrs: { src: params.row.background },
                    style: { width: '100px', height: '50px', margin: 'auto', display: 'block' }
                  })
                ]
              )
            }
          }
        },
        {
          title: '观点',
          key: 'game_viewpoint',
          align: 'center',
          render: (h, params) => {
            return h('div',
              this.replaceArr(params.row.id, 'game_viewpoint'),
              [
                h('div', { style: { minHeight: '50px', } }, params.row.game_viewpoint)
              ]
            )
          }
        }
      ]
    }
  },
  methods: {
    getList (id, name) {
      let data = {
        id: id,
        name: name
      }
      this.loading = true
      getSameGameList(data).then(res => {
        this.loading = false
        if (res.data.code === 200) {
          this.list = res.data.data
        }
      })
    },
    replaceGameData (id, args) {
      let data = {
        id: this.id,
        field_name: args,
        game_id: id
      }
      replaceGameData(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          // 组件层级被包裹。需要找到4级
          this.$parent.$parent.$parent.$parent.getdataList(true)
          this.getList(this.id, this.name)
        }
      })
    },
    replaceArr (id, args) {
      return {
        style: { position: 'relative', cursor: 'pointer' },
        on: {
          click: () => {
            this.$Modal.confirm({
              title: '提示',
              content: '确定替换吗？',
              onOk: () => {
                this.replaceGameData(id, args)
              }
            })
          }
        }
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler: function(){
        if (this.id) {
          this.getList(this.id, this.name)
        }
      }
    }
  }
}
</script>

<style scoped>
  .box .ivu-table-cell {
    padding: 0 !important;
  }
  .title {
    padding: 10px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
</style>