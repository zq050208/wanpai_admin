<template>
<div>
     <Card>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
    <Table
      border
      ref="table"
      :data="tableData"
      :columns="columns"
    />
    <Page
      class="page"
      show-total
      show-sizer
      show-elevator
      :total="total"
      :current="currentPage"
      :page-size="per_page"
      :page-size-opts="[10, 20, 30, 50]"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
  </Card>
</div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getToolExchangeList, getShopCate } from '@/api/data'
export default {
  components: { SearchForm },
  data () {
    return {
      tableData: [],
      total: 1,
      currentPage: 1,
      per_page: 10,
      isClick: false,
      searchData: {
        keywords: '',
        cate_id: 0,
        is_used: 0

      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.currentPage = 1
              this.isClick = true
              this.getDataList()
            }
          }
        ],
        components: [
          {
            name: 'Select',
            prop: 'cate_id',
            label: '商品类型：',
            options: []
          },
          {
            name: 'Input',
            prop: 'keywords',
            label: '关键词查询：',
            placeholder: '请输入商品名称或订单编号'
          },
          {
            name: 'Select',
            prop: 'is_used',
            label: '兑换码状态:',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '待核销',
                value: 1
              },
              {
                label: '已核销',
                value: 2
              }
            ]
          }
        ]
      },
      columns: [
        {
          title: '订单编号',
          key: 'id',
          align: 'center'
        },
        {
          title: '道具类型',
          key: 'cate_name',
          align: 'center'
        },
        {
          title: '道具名',
          key: 'name',
          align: 'center'
        },
        {
          title: '取出数量',
          key: 'exchange_number',
          align: 'center'
        },
        {
          title: '取出用户',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '兑换码生成时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '兑换码状态',
          key: 'is_used',
          align: 'center',
          render: (h, params) => {
            if (params.row.is_used === 1) return h('div', {}, '已核销')
            else return h('div', {}, '待核销')
          }
        },
        {
          title: '核销产品',
          key: 'product_name',
          align: 'center'
        }
      ]
    }
  },
  mounted () {
    this.getShop()
    this.getDataList()
  },
  methods: {
    // 获取商品类型
    getShop () {
      getShopCate().then(res => {
        if (res.data.code === 200) {
          const shopCate = res.data.data.map(item => {
            return {
              label: item.name,
              value: item.id
            }
          })
          shopCate.unshift({
            label: '全部',
            value: 0
          })
          this.searchForm.components[0].options = shopCate
        }
      })
    },
    // 获取数据
    getDataList () {
      var data = {
        keywords: this.isClick ? this.searchData.keywords : '',
        cate_id: this.searchData.cate_id,
        is_used: this.searchData.is_used,
        page: this.currentPage,
        per_page: this.per_page
      }
      getToolExchangeList(data).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data
          this.currentPage = res.data.data.current_page
          this.total = res.data.data.total
        }
      })
    },
    handlePageChange (page) {
      this.currentPage = page
      this.getDataList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.currentPage = 1
      this.searchData.keywords = ''
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
</style>
