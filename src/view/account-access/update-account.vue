<template>
    <div>
      <Card class="card">
        <Form>
          <Tree :data="data"  class="permission-tree-box" show-checkbox multiple
                @on-check-change="checkChange"
          ></Tree>
          <FormItem>
            <Button type="primary" @click="handleSubmit">修改</Button>
          </FormItem>
        </Form>
      </Card>
    </div>
</template>

<script>
import { getUpdateRoleCode, getRoleSave } from '@/api/data'
import { mapMutations } from 'vuex'
export default {
  name: 'update-account',
  data () {
    return {
      myList: null,
      token: '',
      current_info: [],
      privilege_list: [],
      data: []
    }
  },
  mounted () {
    this.getCode()
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    getCode () {
      getUpdateRoleCode({ role_id: this.$route.query.id }).then(res => {
        this.current_info = res.data.data.current_info
        this.token = res.data.data.token
        this.data = this.filterArray(res.data.data.privilege, 0, this.current_info.pri_list)
      })
    },
    checkChange (data) {
      var list = []
      for (var i = 0; i < data.length; i++) {
        if (typeof data[i].children === 'undefined') {
          list.push(data[i].id)
        }
      }
      this.privilege_list = list
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
            if (array.indexOf(data[i].id.toString()) === -1) {
              data[i].checked = false
            } else {
              data[i].checked = true
              this.privilege_list.push(data[i].id)
            }
          }
          tree.push(obj)
        }
      }
      return tree
    },
    handleSubmit () {
      let obj = {
        role_id: this.current_info.id,
        privilege_list: JSON.stringify(this.privilege_list),
        token: this.token
      }
      getRoleSave(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.msg)
          var route = {
            meta: {
              hideInBread: true,
              hideInMenu: true,
              icon: ' iconfont icon-zhangdan',
              keepAlive: false,
              title: '角色管理'
            },
            params: {},
            name: 'update-account',
            query: { id: this.$route.query.id }
          }
          this.closeTag(route)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
