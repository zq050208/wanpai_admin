<template>
  <div>
    <Card>
      <p slot="title">音乐管理</p>
       <SearchForm :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <Card>
      <Table border :columns="columns" :data="dataList" ref="table"></Table>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getMusicList, getDelMusic } from '@/api/data'
import axios from 'axios'
export default {
  components: { SearchForm },
  data () {
    return {
      per_page: 10,
      current: 1,
      total: 1,
      dataList: [],
      lengthData: [],
      searchData: { keywords: '' },
      searchForm: {
        actions: [
          {
            text: '搜索',
            type: 'primary',
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
            placeholder: '输入音乐名称搜索'
          }
        ]
      },
      columns: [
        {
          title: '上传时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '音乐名',
          key: 'music_name',
          align: 'center'
        },
        {
          title: '歌手',
          key: 'singer',
          align: 'center'
        },
        {
          title: '时长',
          key: 'music_length',
          align: 'center',
          width: '200px',
          render: (h, params) => {
            return h('div', {}, this.changeLength(params.row.music_length)
            )
          }
        },
        {
          title: '音乐',
          key: 'music',
          align: 'center',
          render: (h, params) => {
            return h('audio', {
              style: { width: '300px', margin: '0 auto', height: '60px' },
              attrs: { src: params.row.music_url, controls: 'controls' }
            })
          }
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: { type: 'error' },
              on: {
                click: () => {
                  this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除吗？',
                    onOk: () => {
                      this.delMusic(params.row.id)
                    }
                  })
                }
              }
            }, '删除')
          }
        }
      ]
    }
  },
  mounted () { this.getDataList() },
  methods: {
    // 获取列表
    getDataList () {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchData
      }
      this.lengthData = []
      getMusicList(obj).then(res => {
        if (res.data.code === 200) {
          this.current = res.data.data.current_page
          this.per_page = res.data.data.per_page
          this.total = res.data.data.total
          this.dataList = res.data.data.data
          this.dataList.forEach(item => {
            var url = item.music_url
            axios.get(url + '?avinfo').then(res => {
              item.music_length = res.data.streams[0].duration
            })
          })
        }
      })
    },
    // 删除音乐
    delMusic (id) {
      getDelMusic({ ids: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功')
          this.current = 1
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
    },
    // 音乐时间处理
    returnNum (num, n) {
      return (Array(n).join(0) + num).slice(-n)
    },
    changeLength (length) {
      var hour = parseInt((length / 3600))
      var minute = parseInt((length % 3600) / 60) + hour * 60
      var second = parseInt(length % 60)
      var s = this.returnNum(second, 2)
      var time = minute + ':' + s
      return time
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>
