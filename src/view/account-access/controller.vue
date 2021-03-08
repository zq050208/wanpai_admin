<template>
  <div>
    <div>
      <ControllerList ref='list' v-on:add="showModal('privilegeData')" v-on:update="isShowModal"></ControllerList>
    </div>
    <div>
      <Modal
        v-model="modal"
        :title=" status ? '编辑权限' : '新增权限'"
        width="600px"
        :mask-closable="false">
        <Form :label-width="150" ref="privilegeData" :model="privilegeData" :rules="ruleInline">
          <!--<p>注：<span style="color: red">{{status ? '编辑' : '新增'}}后需要退出登录才生效</span></p>-->
          <FormItem label="菜单名称：" prop="name" ><Input type="text" v-model="privilegeData.name" /></FormItem>
          <FormItem label="权限控制器名：" prop="controller_name" ><Input type="text" v-model="privilegeData.controller_name" /></FormItem>
          <FormItem label="权限方法名：" prop="action_name" ><Input type="text" v-model="privilegeData.action_name" /></FormItem>
          <FormItem label="父级权限：" prop="parent_id" >
            <Select v-model="privilegeData.parent_id" @on-change="grandpaChange">
              <Option :value="0" :key="0" label="无"></Option>
              <Option :value="item.id" v-for="item in parent_pri" :key="item.id" :label="item.name"></Option>
            </Select>
          </FormItem>
          <FormItem label="子级权限：" v-if="privilegeData.parent_id > 0 ? true : false">
            <Select v-model="pri_id">
              <Option :value="0" :key="0" label="无"></Option>
              <Option :value="item.id" v-for="item in priList" :key="item.id" :label="item.name"></Option>
            </Select>
          </FormItem>
          <FormItem label="权限排序：" prop="sort"><Input type="text" v-model="privilegeData.sort" /></FormItem>
          <FormItem label="权限模块名：" prop="module_name"><Input type="text" v-model="privilegeData.module_name" /></FormItem>
          <Form-item label="是否为菜单" prop="is_menu">
            <Radio-group v-model="privilegeData.is_menu">
              <Radio :value="0" :label="0" >否</Radio>
              <Radio :value="1" :label="1" >是</Radio>
            </Radio-group>
          </Form-item>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="cancel">取消</Button>
          <Button type="primary" size="large" @click="handleSubmit('privilegeData')">确定</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import { getPrivilegeAddCode, addPrivilege, getSonPri, getSavePriCode, savePrivilege } from '@/api/data'
import ControllerList from './controller-list'
export default {
  name: 'controller',
  components: { ControllerList },
  inject: ['reload'],
  data () {
    return {
      modal: false, // 模态框显示状态
      label_position: 'left', // 模态框label位置
      channel_typeList: {}, // 加盟商类型
      bar: {},
      status: false,
      storeList: [],
      parent_pri: [],
      priList: [],
      pri_id: 0,
      privilegeData: {
        name: null,
        controller_name: null,
        action_name: null,
        is_menu: 0,
        module_name: null,
        parent_id: 0,
        sort: null,
        icon: null,
        checkcode: null
      },
      ruleInline: {
        name: [{ required: true, message: '请填写权限名', trigger: 'blur' }],
        controller_name: [{ required: true, message: '请填写权限控制器名', trigger: 'blur' }],
        action_name: [{ required: true, message: '请填写权限方法名', trigger: 'blur' }]
      }
    }
  },
  mounted () {

  },
  methods: {
    copyDeep (templateData) {
      // templateData 是要复制的数组或对象，这样的数组或者对象就是指向新的地址的
      return JSON.parse(JSON.stringify(templateData))
    },
    grandpaChange (id) {
      getSonPri({ pri_id: id }).then(res => {
        this.priList = res.data.data.data
      })
    },
    showModal (name) { // 显示新增modal
      getPrivilegeAddCode().then(res => {
        this.$refs[name].resetFields()
        this.pri_id = 0
        if (res.data.code === 200) {
          this.privilegeData.checkcode = res.data.data.token
          this.parent_pri = res.data.data.parent_pri
          this.status = false
          this.modal = true
        }
      })
    },
    cancel () { // 隐藏新增modal
      this.modal = false
    },
    isShowModal (id) {
      getSavePriCode({ pri_id: id }).then(res => {
        this.$refs['privilegeData'].resetFields()
        var obj = res.data.data
        var arr = {
          name: obj.current_info.name,
          controller_name: obj.current_info.controller_name,
          action_name: obj.current_info.action_name,
          is_menu: obj.current_info.is_menu,
          module_name: obj.current_info.module_name,
          pri_id: obj.current_info.id,
          sort: obj.current_info.sort,
          icon: obj.current_info.icon,
          checkcode: obj.token
        }
        this.parent_pri = obj.parent_pri
        if (obj.current_info.p_id > 0) {
          arr.parent_id = obj.current_info.p_id
          if (obj.current_info.parent_id > 0) {
            this.grandpaChange(obj.current_info.parent_id)
            this.pri_id = 0
          } else {
            this.pri_id = 0
          }
        } else {
          arr.parent_id = obj.current_info.parent_id
          if (obj.current_info.parent_id > 0) {
            arr.parent_id = obj.current_info.parent_id
            this.pri_id = 0
          } else {
            arr.pri_id = 0
            arr.parent_id = 0
          }
        }
        this.status = true
        this.privilegeData = arr
        this.modal = true
      })
    },
    add () {
      let obj = this.copyDeep(this.privilegeData)
      if (this.pri_id > 0) obj.parent_id = this.pri_id
      addPrivilege(obj).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.$refs.list.getAccountRecord()
        }
      })
    },
    update () {
      savePrivilege(this.privilegeData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功')
          this.cancel()
          this.$refs.list.getAccountRecord()
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          // 发送请求
          if (!this.status) { // 新增
            this.add()
          } else { // 编辑
            this.update()
          }
        } else {
          this.$Message.error('Fail!')
        }
      })
    }
  }
}
</script>

<style>
  .w100{
    width: 100px;
  }
  .mb0{
    margin-bottom: 0;
  }
</style>
