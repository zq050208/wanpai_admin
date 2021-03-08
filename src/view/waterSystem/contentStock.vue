<template>
    <div>
         <SearchForm :searchForm="searchForm" :searchData="searchData" />
         <Table border :columns="columns" :data="data" ref="table"></Table>
         <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { contentLibraryList } from '@/api/data'

export default {
  components: { SearchForm },
  data () {
    return {
      total: 1,
      current: 1,
      per_page: 10,
      searchData: {
        contentType: 2,
        keywords: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.current = 1
              this.getData()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            prop: 'contentType',
            label: '内容类型:',
            options: [
              {
                label: '安利文',
                value: 2
              },
              {
                label: '资讯内容',
                value: 1
              }
            ],
            onChange: (res) => {
              this.searchData.contentType = res
              this.current = 1
              this.getData()
            }
          },
          {
            name: 'Input',
            prop: 'keywords',
            label: '关键词查询:',
            placeholder: '请输入标题'
          }
        ]
      },
      data: [],
      columns: [
        {
          title: '内容id',
          key: 'id',
          align: 'center'
        },
        {
          title: '内类类型',
          key: 'content_type',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.content_type)
          }
        },
        {
          title: '标题',
          key: 'title',
          align: 'center'
        },
        {
          title: '操作',
          key: 'option',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: { type: 'primary' },
              on: {
                'click': () => {
                  console.log(params)
                  console.log(this.searchData.contentType)
                  if (this.searchData.contentType === 1) { // 资讯内容
                    this.$router.push({ path: '/waterSystem/edit_content/edit', query: { id: params.row.id, type: params.row.type } })
                  } else if (this.searchData.contentType === 2) {
                    this.$router.push({ path: '/waterSystem/edit_amway/edit', query: { id: params.row.id } })
                  }
                }
              }
            }, '配置')
          }
        }
      ]
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    handlePageChange (page) {
      this.current = page
      this.getData()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.current = 1
      this.getData()
    },
    getData () {
      let params = { page: this.current, per_page: this.per_page, content_type: this.searchData.contentType }
      if (this.searchData.keywords !== '') {
        params.keysword = this.searchData.keywords
      }
      contentLibraryList(params).then(res => {
        let code = res.data.code
        if (code === 200) {
          let data = res.data.data
          this.total = data.total
          this.current = data.current_page
          this.data = data.data
        }
      })
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
