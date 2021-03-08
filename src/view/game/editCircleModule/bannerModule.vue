<template>
  <div>
    <div class="head_btn">
      <Button type="error" @click="deleteCircleBanner('')" style="margin-bottom: 8px;">删除</Button>
      <Button type="primary" @click="addBanner" style="margin-bottom: 8px;">添加banner</Button>
    </div>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
      @on-selection-change="handleSelectChange"
    />
  </div>
</template>

<script>
import { 
  getCircleBannerList, 
  deleteCircleBanner, 
  CircleBannerSort,
  setCircleBannerStatus
} from '@/api/data'

export default {
  components: {
    
  },
  data () {
    return {
      selected: [],
      circleId: this.$route.query.id,
      // circleId: 1,
      tableData: [],
      moduleId: '',
      columns: [
        { type: 'selection', width: 60, align: 'center' },
        {
          align: 'center',
          title: '排序',
          render: (h, params) => {
            return h('div', [
              +params.row.is_show === 1 ? h('div', [
                h('span', {}, params.row.sort),
                params.index > 0 ? h(
                  'Button',
                  {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    style: {
                      'margin-right': '8px'
                    },
                    on: {
                      click: () => {
                        this.circleBannerSort(params.row.id, 1)
                      }
                    }
                  },
                  '上移'
                ) : '',
                params.index !== this.tableData.length - 1 ? h(
                  'Button',
                  {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.circleBannerSort(params.row.id, -1)
                      }
                    }
                  },
                  '下移'
                ) : ''
              ]) : h('div', {}, '无')
            ])
          }
        },
        {
          align: 'center',
          title: '广告名称',
          key: 'name'
        },
        {
          title: '广告图片',
          align: 'center',
          render: (h, params) => {
           return h('viewer',
              {
                props: { images: [{ img: params.row.img_url ? params.row.img_url : 'http://cdn.tinytiger.cn/user/user2.jpg' }] },
                style: { width: '89px',  margin: '0 auto' }
              },
              [
                h('img', {
                  attrs: { src: params.row.img_url ? params.row.img_url : 'http://cdn.tinytiger.cn/user/user2.jpg' },
                  style: { width: '89px',  margin: '0 auto' }
                })
              ])
          }
        },
        {
          align: 'center',
          title: '广告展示时间',
          render: (h, params) => {
            return h('div', [
              h('div', {}, '开始时间：' + params.row.start_time),
              h('div', {}, '结束时间：' + params.row.end_time),
            ])
          }
        },
        {
          align: 'center',
          title: '跳转目标',
          render: (h, params) => {
            let type = "";
            switch (params.row.jump_type) {
              case 0:
                type = "无跳转";
                break;
              case 1:
                type = "外部链接";
                break;
              case 2:
                type = "功能页面";
                break;
              case 3:
                type = "游戏详情";
                break;
              case 4:
                type = "百科详情";
                break;
              case 5:
                type = "词条";
                break;
              case 6:
                type = "文章";
                break;
              case 7:
                type = "视频";
                break;
              case 8:
                type = "帖子详情";
                break;
            }
            let jumpCont = ''
            if (params.row.jump_type <= 2) {
              jumpCont = params.row.jump_url
            } else {
              jumpCont = params.row.jump_name
            }
            return h('div', [
              h('div', {}, type),
              h('div', {}, jumpCont),
            ])
          }
        },
        {
          align: 'center',
          title: '显示/隐藏',
          key: 'is_show',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                'true-color': 'rgb(26,188,156)',
                value: params.row.is_show === 1,
                'before-change': () => this.handleSwitchChange(params.row)
              }
            })
          }
        },
        {
          align: 'center',
          title: '点击人/次',
          render: (h, params) => {
            return h('div', [
              h('span', {}, params.row.uv + '/'),
              h('span', {}, params.row.pv),
            ])
          }
        },
        {
          align: 'center',
          title: '人均点击',
          key: 'av'
        },
        {
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin-right': '8px'
                  },
                  on: {
                    click: () => {
                      this.$router.push({path: 'addBanner', query: {bannerId: params.row.id, id: this.circleId, moduleId: this.moduleId}})
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.deleteCircleBanner(params.row.id)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
    }
  },
  // computed: {
  //   circleModuleLists () {
  //     return localStorage.getItem('circleModuleLists')
  //   }
  // },
  mounted () {
    // this.getInitList()
  },
  methods: {
    handleSwitchChange (row) {
      row.is_show = !row.is_show
      row.is_show = row.is_show ? 1 : 0
      let params = {
        circle_id: this.circleId,
        circle_modular_id: this.moduleId,
        id: row.id,
        is_show: row.is_show
      }
      setCircleBannerStatus(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getInitList()
        }
      })
    },
    handleSelectChange (selected) {
      this.selected = selected
    },
    getInitList () {
      let circleModuleLists = JSON.parse(localStorage.getItem('circleModuleLists'))
      let newArr = circleModuleLists.filter(item => {
        return +item.is_type === 1
      })
      this.moduleId = newArr[0].id
      let params = {
        page: 1,
        per_page: 100,
        circle_modular_id: this.moduleId,
        circle_id: this.circleId
      }
      getCircleBannerList(params).then(res => {
        if(res.data.code === 200){
          this.tableData = res.data.data.data
        }
      })
    },
    deleteCircleBanner (id) {
      let conment = []
      let commentId
      if (id) {
        conment.push(id)
      } else {
        conment = this.selected.map(item => (item.id))
      }
      if( conment.length === 0 ){
        return this.$Message.error("请选择要删除的选项");
      }
      let params = {
        ids: conment,
        circle_modular_id: this.moduleId,
        circle_id: this.circleId
      }
      this.$Modal.confirm({
        title: '确认要删除此分类吗？',
        content: '（删除后不可恢复，请谨慎操作）',
        onOk: () => {
          deleteCircleBanner(params).then(res => {
            if (res.data.code === 200) {
              this.$Message.success("删除成功");
              this.getInitList()
            }
          })
        }
      })
    },
    // 添加banner
    addBanner () {
      this.$router.push({path: 'addBanner', query: { id: this.circleId, moduleId: this.moduleId }})
    },
    // 排序
    circleBannerSort (id, type) {
      let params = {
        id: id,
        circle_modular_id: this.moduleId,
        circle_id: this.circleId,
        direction: type
      }
      CircleBannerSort(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("移动成功");
          this.getInitList()
        }
      })
    }
  }
}
</script>

<style scoped>
.page{
  margin-top: 20px;
  text-align: center;
}
.head_btn{
  display: flex;
  justify-content: space-between;
}
</style>
