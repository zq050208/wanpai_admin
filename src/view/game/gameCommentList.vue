<template>
  <div>
    <Card>
      <SearchForm  :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <Card>
      <Table border :columns="columns" :data="dataList" ref="table" :loading="isLoding === 1? false:true"></Table>
       <div class="new-all">
          <Checkbox :value='single1' @on-change='changePage'>
            <span>隐藏/显示当前页内容</span>
            <i-switch :disabled = isdisabled :value='switch1 === 0 ?true:false' @on-change='changePageSwitch' />
          </Checkbox>
          <Checkbox style="marginLeft:30px" :value='single2'  @on-change='changePage2'>
            <span>是/否安利当前页内容</span>
            <i-switch :disabled = isdisabled1 :value='switch2 === 0 ?false:true' @on-change='changePageSwitch2' />
          </Checkbox>
      </div>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :total="total"
        :current="current"
        :page-size="per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import {
  getindexGameAssess,
  getdelGameAssess,
  editGameAssess,
  oneKeySet,
  oneKeyAmway
} from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    const gameId = this.$route.query.id
    if (!gameId) return
    return {
      isLoding:0,
      isdisabled: true,
      isdisabled1: true,
      showArry: [],
      switch1: 1,
      switch2: 0,
      single1: false,
      single2: false,
      total: 1,
      current: 1,
      per_page: 10,
      dataList: [],
      searchData: {
        keywords: '',
        nickname: '',
        is_amway: -1,
        status: -1,
        view_num: '', // 浏览量
        like_num: '', // 点赞量
        game_id: gameId
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'default',
            handle: () => {
              this.current = 1
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'keywords',
            label: '标题关键词',
            placeholder: '标题',
            style: 'width: 250px'
          },
          {
            name: 'Input',
            prop: 'nickname',
            label: '发布者昵称',
            placeholder: '发布者昵称',
            style: 'width: 250px'
          },
          {
            name: 'Select',
            prop: 'is_amway',
            label: '是否安利:',
            style: 'width: 100px',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '是',
                value: 1
              },
              {
                label: '否',
                value: 0
              }
            ]
          },
          {
            name: 'Select',
            prop: 'status',
            label: '是否隐藏:',
            style: 'width: 100px',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '是',
                value: 1
              },
              {
                label: '否',
                value: 0
              }
            ]
          },
          {
            name: 'RangeInput',
            prop: 'view_num',
            label: '浏览量',
            style: 'width: 30px'
          },
          {
            name: 'RangeInput',
            prop: 'like_num',
            label: '点赞量',
            style: 'width: 30px'
          }
        ]
      },
      columns: [
        {
          title: '内容id',
          key: 'id',
          align: 'center',
          width: '80px'
        },
        {
          title: '标题',
          key: 'title',
          align: 'center'
        },
        {
          title: '评分',
          key: 'score',
          align: 'center',
          width: '80px'
        },
        {
          title: '游戏名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '发布者',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '发布时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '浏览量',
          key: 'view_num',
          align: 'center'
        },
        {
          title: '浏览人数',
          key: 'view_user_num',
          align: 'center'
        },
        {
          title: '点赞量',
          key: 'like_num',
          align: 'center'
        },
        {
          title: '评论量',
          key: 'comment_num',
          align: 'center'
        },
        {
          title: '是否安利',
          key: 'is_amway',
          align: 'center',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                'true-color': 'rgb(26,188,156)',
                value: params.row.is_amway === 1 ? true: false,
                'before-change': () => this.geteIsamway(params.row)
              }
            })
          }
        },
        {
          title: '隐藏/显示',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                'true-color': 'rgb(26,188,156)',
                value: params.row.status === 1 ? false : true,
                'before-change': () => this.getStatus(params.row)
              }
            })
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  style: { margin: '0 5px 0 0', color: '#70B603' },
                  props: { type: 'text', size: 'small' },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: `game/gameCommentDetail?id=${params.row.id}`
                      })
                    }
                  }
                },
                '查看'
              ),
              h(
                'Button',
                {
                  style: { color: '#70B603' },
                  props: { type: 'text', size: 'small' },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确认删除吗？',
                        onOk: () => {
                          this.delGameAssess(params.row.id)
                        }
                      })
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ]
    }
  },
  mounted () {
    // this.game_id = this.$route.query.id
    this.getDataList()
  },
  methods: {
    changePage (value) {
      const assess_ids = JSON.stringify(this.showArry)
      if (value) {
        this.isdisabled = false
        if (this.switch1 === 1) {
          this.switch1 = 1
          this.single1 = true
          const data = {
            assess_ids: assess_ids,
            status: this.switch1
          }
          this.oneKeySet(data)
        }
      } else {
        this.isdisabled = true
        return false
      }
    },
    changePageSwitch (value) {
      if (value) {
        const assess_ids = JSON.stringify(this.showArry)
        this.switch1 = 0
        this.single1 = true
        const data = {
          assess_ids: assess_ids,
          status: this.switch1
        }
        this.oneKeySet(data)
      } else {
        const assess_ids = JSON.stringify(this.showArry)
        this.switch1 = 1
        this.single1 = true
        const data = {
          assess_ids: assess_ids,
          status: this.switch1
        }
        this.oneKeySet(data)
      }
    },
    // 是否一键隐藏
    async oneKeySet (data) {
      await oneKeySet(data).then(res => {
        // this.single1 = false
        // this.switch1 = 1
      })
      this.getDataList()
    },
    changePage2 (value) {
      const assess_ids = JSON.stringify(this.showArry)
      if (value) {
        this.isdisabled1 = false
        if (this.switch2 === 0) {
          this.switch2 = 0
          this.single2 = true
          const data = {
            assess_ids: assess_ids,
            is_amway: this.switch2
          }
          this.oneKeyAmway(data)
        }
      } else {
        this.isdisabled1 = true
        return false
      }
    },
    changePageSwitch2 (value) {
      if (value) {
        const assess_ids = JSON.stringify(this.showArry)
        this.switch2 = 1
        this.single2 = true
        const data = {
          assess_ids: assess_ids,
          is_amway: this.switch2
        }
        this.oneKeyAmway(data)
      } else {
        const assess_ids = JSON.stringify(this.showArry)
        this.switch2 = 0
        this.single2 = true
        const data = {
          assess_ids: assess_ids,
          is_amway: this.switch2
        }
        this.oneKeyAmway(data)
      }
    },
    // 是否一键安利
    async oneKeyAmway (data) {
      await oneKeyAmway(data).then(res => {
        // this.switch2 = 0
        // this.single2 = false
      })
      this.getDataList()
    },
    // 初始化
    getDataList () {
      this.showArry = []
      this.dataList = []
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchData
      }
      getindexGameAssess(obj).then(res => {
        if (res.data.code === 200) {
          this.isLoding = 1
          this.page = res.data.data.current_page
          this.dataList = res.data.data.data
          res.data.data.data.forEach(item => {
            this.showArry.push(item.id)
          })
          this.total = res.data.data.total
        }
        this.searchData.like_num = ''
        this.searchData.view_num = ''
      })
    },
    // 删除
    delGameAssess (ids) {
      getdelGameAssess({ assess_id: ids }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.getDataList()
        }
      })
    },
    // 安利
    geteIsamway (data) {
      var obj = {
        assess_id: data.id,
        is_amway: data.is_amway === 1 ? 1 : 2
      }
      editGameAssess(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('修改成功')
          this.getDataList()
        }
      })
    },
    // 显示隐藏
    getStatus (data) {
      var obj = {
        assess_id: data.id,
        status: data.status === 1 ? 1 : 2
      }
      editGameAssess(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('修改成功')
          this.getDataList()
        }
      })
    },
    handlePageChange (page) {
      this.current = page
      this.getDataList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.getDataList()
    }
  }
}
</script>
<style scoped>
  .page {
    margin-top: 20px;
    text-align: center;
  }
  .new-all {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }
</style>