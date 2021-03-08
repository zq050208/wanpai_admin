<template>
  <div>
    <Button type="primary" @click="goAddRole" style="margin-bottom: 20px">新增角色</Button>
    <searchForm title="筛选查询" :searchForm="searchForm" :searchData="searchData" ></searchForm>
    <Card class="card">
      <Table border :columns="columns" :data="data"></Table>
      <Page class="page"
        show-elevator
        show-sizer
        show-total
        :total="pageParams.total"
        :page-size="pageParams.per_page"
        :page-size-opts="sizer_page"
        @on-change="pageChange"
        @on-page-size-change="pageSizeChange"
      />
    </Card>
    <Modal v-model="isShowModal" :mask-closable="false" :title="title ? '新增权限列表' : '修改权限列表'">
      <Form :label-width="120"  ref="formInline" :model="formInline" :rules="ruleInline">
        <FormItem label="角色名称：" prop="role_name">
          <Input type="text" v-model="formInline.role_name" />
        </FormItem>
        <FormItem label="职能描述：" prop="desc">
          <Input type="textarea" :show-word-limit="true" :maxlength="200" :rows="4" :autosize="{minRows: 5,maxRows: 10}" v-model="formInline.desc" />
        </FormItem>
        <FormItem label="选择开放权限：">
          <Tree class="permission-tree-box"
            show-checkbox
            multiple
            :data="privilege"
            @on-check-change="checkChange"
            style="max-height: 400px; overflow: auto"
          ></Tree>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit('formInline')">提交</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getRoleList, startToStopRole, getPrivilegeList, getRoleCode, getUpdateRoleCode, getRoleAdd, delRole, getRoleSave } from '@/api/data'
import searchForm from '@/components/searchForm'
export default {
  name: 'add-roles',
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
              this.getRoleRecord()
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
      isShowModal: false,
      title: false,
      privilege: [],
      data: [],
      formInline: {
        role_name: '',
        desc: '',
        privilege_list: []
      },
      ruleInline: {
        role_name: [{ required: true, message: '请填写角色名称', trigger: 'blur' }],
        desc: [{ required: true, message: '请填写职能描述', trigger: 'blur' }]
      },
      columns: [
        {
          title: '角色名称',
          key: 'role_name'
        },
        {
          title: '职能描述',
          key: 'desc'
        },
        {
          title: '成员数量',
          key: 'num'
        },
        {
          title: '添加时间',
          key: 'create_time'
        },
        {
          title: '是否启用',
          key: 'is_on',
          render: (h, params) => {
            var str = params.row.is_on === 1 ? '启用' : '禁用'
            return h('div', [
              h('Button', {
                props: { type: params.row.is_on === 1 ? 'primary' : 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '是否' + str + '该角色',
                      onOk: () => {
                        this.startToStop(params.row.id, params.row.is_on === 1 ? 0 : 1)
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
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginRight: '15px' },
                on: {
                  click: () => {
                    this.goUpdateRole(params.row.id)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '提示',
                      content: '删除角色后将无法恢复，是否确认删除',
                      onOk: () => {
                        this.delRole(params.row.id)
                      }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getRoleRecord()
  },
  methods: {
    pageChange (e) {
      this.pageParams.page = e
      this.getRoleRecord()
    },
    pageSizeChange (e) {
      this.pageParams.per_page = e
      this.pageParams.page = 1
      this.getRoleRecord()
    },
    checkChange (data) { // 选择权限
      var list = []
      for (var i = 0; i < data.length; i++) {
        if (typeof data[i].children == 'undefined') {
          list.push(data[i].id)
        }
      }
      this.formInline.privilege_list = JSON.stringify(list)
    },
    getRoleRecord () { // 获取角色列表
      const { date } = this.searchData
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        keyword: this.searchData.keyword,
        start_time: date ? date[0] : '',
        end_time: date ? date[1] : ''
      }
      getRoleList(data).then(res => {
        this.pageParams.total = res.data.data.total
        this.data = res.data.data.data
      })
    },
    goAddRole (name) { // 新增角色弹窗
      this.title = true
      this.formInline = { role_name: '', desc: '', privilege_list: [] }
      getRoleCode().then(res => {
        if (res.data.code === 200) {
          this.formInline.checkcode = res.data.data.checkcode
          this.privilege = this.filterArray(res.data.data.privilege_list, 0, '')
          this.isShowModal = true
        }
      })
    },
    goUpdateRole (id) { // 修改角色弹窗
      this.title = false
      this.formInline= { role_name: '', desc: '', privilege_list: [] }
      getUpdateRoleCode({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.formInline.checkcode = res.data.data.checkcode
          this.formInline.id = res.data.data.info.id
          this.formInline.desc = res.data.data.info.desc
          this.formInline.role_name = res.data.data.info.role_name
          if (res.data.data.info.privilege_list === '*') {
            this.$Message.error('超级管理员拥有最高权限，不可修改!')
            return
          } else {
            let jsonList = res.data.data.info.privilege_list || '[]'
            this.privilege = this.filterArray(res.data.data.privilege_list, 0, jsonList)
            if (this.formInline.privilege_list.length) {
              this.formInline.privilege_list = JSON.stringify(this.formInline.privilege_list)
            } else {
              this.formInline.privilege_list = ''
            }
          }
          this.isShowModal = true
        }
      })
    },
    startToStop (id, type) { // 停用|启用
      startToStopRole({ id: id, is_on: type }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.getRoleRecord()
        }
      })
    },
    delRole (id) {
      delRole({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          if (this.pageParams.page > 1 && this.data.length === 1) this.pageParams.page--
          this.getRoleRecord()
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.title) { // 新增
            getRoleAdd(this.formInline).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('成功!')
                this.cancel()
                this.getRoleRecord()
              }
            })
          } else { // 编辑
            getRoleSave(this.formInline).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('成功!')
                this.cancel()
                this.getRoleRecord()
              }
            })
          }
        }
      })
    },
    cancel () {
      this.isShowModal = false
    },
    filterArray (data, parent, str) {
      var tree = []
      var temp
      var array = str.split(',')
      for (var i = 0; i < data.length; i++) {
        data[i].title = data[i].name
        data[i].expand = true
        if (data[i].parent_id === parent) {
          var obj = data[i]
          temp = this.filterArray(data, data[i].id, str)
          if (temp.length > 0) {
            obj.children = temp
          } else {
            if (array.indexOf(data[i].id.toString()) == -1) {
              data[i].checked = false
            } else {
              data[i].checked = true
              this.formInline.privilege_list.push(data[i].id)
            }
          }
          tree.push(obj)
        }
      }
      return tree
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
