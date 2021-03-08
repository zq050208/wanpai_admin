<template>
  <Card class="card">
    <p slot="title">总共{{last_page}}页</p>
    <Table :loading="loading" border :columns="columns" :data="data"></Table>
    <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
  </Card>
</template>

<script>
import { getIndexLog } from '@/api/data'
export default {
  name: 'indexLog',
  data () {
    return {
      loading: false,
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      columns: [
        {
          title: '日志ID',
          key: 'id'
        },
        {
          title: '管理员ID',
          key: 'admin_id'
        },
        {
          title: '管理员名称',
          key: 'admin_name'
        },
        {
          title: '内容',
          key: 'info'
        },
        {
          title: '模块',
          key: 'operation'
        },
        {
          title: '添加时间',
          key: 'create_time'
        },
        {
          title: '请求参数',
          key: 'request'
        },
        {
          title: '操作结果',
          key: 'result',
          render: (h, params) => {
            if (params.row.result === 1) {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small'
                  }
                }, '成功')
              ])
            } else {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  }
                }, '失败')
              ])
            }
          }
        }
      ],
      data: []
    }
  },
  mounted () {
    this.getLog()
  },
  methods: {
    pageChange (e) {
      this.current = e
      this.loading = true
      this.getLog()
    },
    getLog () {
      let data = { page: this.current, per_page: this.per_page }
      getIndexLog(data).then(res => {
        this.loading = false
        this.total = res.data.data.total
        this.last_page = res.data.data.last_page
        this.data = res.data.data.data
      })
    }
  }
}
</script>

<style scoped>
  .card{
    margin-top: 20px;
  }
  .page{
    margin-top: 20px;
    text-align: center;
  }
</style>
