<template>
  <div>
    <Card>
      <p slot="title">菜单权限管理</p>
      <Form inline>
        <FormItem>
          <Button type="primary" @click="add">新增</Button>
        </FormItem>
      </Form>
    </Card>
    <Card style="margin-top: 20px">
      <Table border :max-height="600" :columns="columns" :data="data"></Table>
    </Card>
  </div>
</template>

<script>
import { getPrivilegeList, getSonChannel, delPrivilege } from '@/api/data'
export default {
  name: 'controller-list',
  data () {
    return {
      channel_name: null,
      parent_channel_id: null,
      grandpa_channel_id: null,
      storeList: [],
      visible: false,
      label_position: 'left',
      bar: {},
      data: [],
      columns: [
        {
          title: '权限id',
          key: 'id'
        },
        {
          title: '父级id',
          key: 'parent_id'
        },
        {
          title: '菜单名称',
          key: 'name'
        },
        {
          title: '权限排序',
          key: 'sort'
        },
        {
          title: '权限模块名',
          key: 'module_name'
        },
        {
          title: '权限控制器名',
          key: 'controller_name'
        },
        {
          title: '权限方法名',
          key: 'action_name'
        },
        {
          title: '是否菜单栏',
          key: 'is_menu',
          render: (h, params) => {
            return h('div', {}, params.row.is_menu === 1 ? '是' : '否')
          }
        },
        {
          title: '状态',
          render: (h, params) => {
            var str = params.row.is_on === 0 ? '禁用' : '启用'
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.is_on === 0 ? 'error' : 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '确定' + str + '此项',
                      onOk: () => {
                        this.delPrivilege(params.row.id)
                      }
                    })
                  }
                }
              }, str)
            ])
          }
        },
        {
          title: '操作',
          key: 'id',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.$emit('update', params.row.id)
                  }
                }
              }, '编辑')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getPrivilegeList()
  },
  methods: {
    grandpaChange (id) {
      getSonChannel({ channel_id: id }).then(res => {
        this.storeList = res.data.data.data
      })
    },
    getPrivilegeList () {
      getPrivilegeList().then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
        }
      })
    },
    add () {
      this.$emit('add')
    },
    delPrivilege (id) {
      delPrivilege({ pri_id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.getPrivilegeList()
        }
      })
    }
  }
}
</script>

<style>
  .logo div{
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 3px;
  }
</style>
