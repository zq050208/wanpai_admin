<template>
  <div>
    <Button type="primary" @click="add" style="margin-bottom: 20px">添加</Button>
    <searchForm title="筛选查询" :searchForm="searchForm" :searchData="searchData" ></searchForm>
    <Card class="card">
      <Table border :columns="columns" :data="data"></Table>
      <Page class="page"
        show-elevator
        show-sizer
        show-total
        border="true"
        :total="pageParams.total"
        :page-size="pageParams.per_page"
        :page-size-opts="sizer_page"
        @on-change="pageChange"
        @on-page-size-change="pageSizeChange"
      />
    </Card>
  </div>
</template>

<script>
import { getAccountList, startToStopUser, delUser, editNotic } from '@/api/data'
import searchForm from '@/components/searchForm'
export default {
  name: 'role-list',
  components: { searchForm },
  data () {
    return {
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      sizer_page: [10, 20, 30, 50],
      searchData: {
        keyword: '',
        date: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.pageParams.page = 1
              this.getAccountRecord()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'keyword',
            label: '搜索：',
            placeholder: '账号/姓名/联系方式'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '添加日期：'
          }
        ]
      },
      columns: [
        {
          title: '账号',
          resizable: true,
          width: '200px',
          key: 'username'
        },
        {
          title: '姓名',
          key: 'nickname',
          width: '120px'
        },
        {
          title: '手机号',
          key: 'mobile',
          width: '130px'
        },
        {
          title: '企业邮箱',
          key: 'email'
        },
        {
          title: '所属角色',
          key: 'role_name'
        },
        {
          title: '添加时间',
          key: 'create_time'
        },
        {
          title: '最后登陆',
          key: 'last_login_time'
        },
        {
          title: '是否启用',
          key: 'status',
          width: '100px',
          render: (h, params) => {
            var str = params.row.status === 1 ? '禁用' : '启用'
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.status === 1 ? 'error' : 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '是否' + str + '该用户',
                      onOk: () => {
                        this.startToStop(params.row.id, params.row.status === 1 ? 2 : 1)
                      }
                    })
                  }
                }
              }, str)
            ])
          }
        },
        {
          title: '消息通知',
          key: 'is_notice',
          width: '100px',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                value: params.row.is_notice === 1,
                'before-change': () => this.handleSwitchChange(params.row)
              }
            })
          }
        },
        {
          title: '操作',
          width: '150px',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: () => {
                    this.$emit('update', params.row.id)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '账号“删除”将无法恢复，确定删除该账号',
                      onOk: () => {
                        this.delUser(params.row.id)
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      data: []
    }
  },
  mounted () {
    this.getAccountRecord()
  },
  methods: {
    pageChange (e) {
      this.pageParams.page = e
      this.getAccountRecord()
    },
    pageSizeChange (e) {
      this.pageParams.per_page = e
      this.pageParams.page = 1
      this.getAccountRecord()
    },
    getAccountRecord () {
      const { date } = this.searchData
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        keyword: this.searchData.keyword,
        start_time: date ? date[0] : '',
        end_time: date ? date[1] : ''
      }
      getAccountList(data).then(res => {
        this.pageParams.total = res.data.data.total
        this.data = res.data.data.data
      })
    },
    add () { // 添加账户
      this.$emit('add')
    },
    delUser (id) {
      delUser({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          if (this.pageParams.page > 1 && this.data.length === 1) this.pageParams.page--
          this.getAccountRecord()
        }
      })
    },
    startToStop (id, status) {
      startToStopUser({ id: id, status: status }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.getAccountRecord()
        }
      })
    },
    handleSwitchChange (item) {
      var obj = {
        id: item.id,
        is_notice: item.is_notice === 0 ? 1 : 0
      }
      editNotic(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('修改成功!')
          this.getAccountRecord()
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
</style>
