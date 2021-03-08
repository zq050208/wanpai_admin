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
import { getOrderList, getShopCate } from '@/api/data'
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
        shop_privilege: 0

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
            options: [ ]
          },
          {
            name: 'Input',
            prop: 'keywords',
            label: '关键词查询：',
            placeholder: '请输入商品名称或订单编号'
          },
          {
            name: 'Select',
            prop: 'shop_privilege',
            label: '用户类型:',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '普通用户',
                value: 1
              },
              {
                label: '核心用户',
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
          title: '商品类型',
          key: 'cate_name',
          align: 'center'
        },
        {
          title: '商品名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '商品单价',
          key: 'price',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.price + ' H币')
          }
        },
        {
          title: '商品数量',
          key: 'number',
          align: 'center'
        },
        {
          title: '购买用户',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '订单金额',
          key: 'order_money',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.order_money + ' H币')
          }
        },
        {
          title: '订单生成时间',
          key: 'create_time',
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
        shop_privilege: this.searchData.shop_privilege,
        page: this.currentPage,
        per_page: this.per_page
      }
      getOrderList(data).then(res => {
        console.log(res)
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
