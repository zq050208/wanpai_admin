<!-- eslint-disable -->
<style lang="less">
  @import "./forms.less";
</style>
<template>
  <div>
    <div>
      <StaffList ref="list" v-on:add="showModal('channelData')" v-on:update="isShowModal"></StaffList>
    </div>
    <div>
      <Modal
        v-model="modal"
        :title="status ? '编辑店员' : '新增店员'"
        width="600px"
        :mask-closable="false">
        <Form
          :label-width="120"
          :label-position="label_position"
          ref="channelData" :model="channelData" :rules="ruleInline"
        >
          <FormItem label="店员名称：" prop="channel_name"><Input type="text" :disabled="status" v-model="channelData.channel_name" /></FormItem>
          <FormItem label="所属加盟商：" prop="grandpa_channel_id">
            <Select v-model="channelData.grandpa_channel_id" @on-change="grandpaChange">
              <Option :value="item.id" v-for="item in bar.channel" :key="item.id" :label="item.channel_name"></Option>
            </Select>
          </FormItem>
          <FormItem label="所属门店：" prop="parent_channel_id">
            <Select v-model="channelData.parent_channel_id" >
              <Option :value="item.id" v-for="item in storeList" :key="item.id" :label="item.channel_name"></Option>
            </Select>
          </FormItem>
          <FormItem label="手机号码：" prop="mobile"><Input type="text" v-model="channelData.mobile" /></FormItem>
          <FormItem label="分成比例：" prop="proportions"><Input type="number" v-model="channelData.proportions" placeholder="0.01~100" /></FormItem>
          <FormItem label="店员代码：" prop="channel_code"><Input type="text" v-model="channelData.channel_code"/></FormItem>
          <Form-item label="状态" prop="status" v-if="status">
            <Radio-group v-model="channelData.status" @on-change="radioChange">
              <Radio :value="item.id" :label="item.id" v-for="item in bar.channel_status" :key="item.id">{{item.name}}</Radio>
            </Radio-group>
          </Form-item>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="cancel">取消</Button>
          <Button type="primary" size="large" @click="handleSubmit('channelData')">确定</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import { getAddSstaffCode, addStaff, getSonChannel, getSaveStaffCode, saveStaff } from '@/api/data'
import StaffList from './staff-list'
export default {
  name: 'staff',
  components: { StaffList },
  inject: ['reload'],
  data () {
    return {
      modal: false, // 模态框显示状态
      label_position: 'left', // 模态框label位置
      channel_typeList: {}, // 加盟商类型
      bar: {},
      status: false,
      storeList: [],
      channelData: {
        channel_name: null,
        channel_code: null,
        parent_channel_id: null,
        grandpa_channel_id: null,
        mobile: null,
        proportions: null,
        status: null,
        token: null
      },
      ruleInline: {
        channel_name: [{ required: true, message: '请填写门店名称', trigger: 'blur' }],
        parent_channel_id: [{ required: true,
          type: 'number',
          validator: (rule, value, callback, source, options) => {
            /* eslint-disable */
            if (this.storeList.length) {
              if (!value) callback('请选择所属门店')
              else callback()
            } else {
              if (!value) callback('请先选择所属加盟商')
              else callback()
            }
          }
        }],
        grandpa_channel_id: [{ required: true, message: '请选择所属加盟商', trigger: 'blur', type: 'number' }],
        mobile: [{ required: true, message: '请填写手机号码', trigger: 'blur' }],
        proportions: [{ required: true, message: '请填写分成比例', trigger: 'blur' }]
      }
    }
  },
  mounted () {

  },
  methods: {
    radioChange (res) {
      this.channelData.status = res
    },
    grandpaChange (id) {
      getSonChannel({ channel_id: id }).then(res => {
        this.storeList = res.data.data.data
      })
    },
    showModal (name) { // 显示新增modal
      getAddSstaffCode().then(res => {
        this.$refs[name].resetFields()
        this.storeList = []
        if (res.data.code === 200) {
          this.channelData.token = res.data.data.token
          this.bar = res.data.data.bar
          this.status = false
          this.modal = true
        }
      })
    },
    cancel () { // 隐藏新增modal
      this.modal = false
    },
    isShowModal (id) {
      getSaveStaffCode({ channel_id: id }).then(res => {
        this.$refs['channelData'].resetFields()
        var obj = res.data.data
        var arr = {
          channel_id: obj.info.id,
          channel_name: obj.info.channel_name,
          channel_code: obj.info.channel_code,
          parent_channel_id: obj.info.parent_channel_id,
          grandpa_channel_id: obj.info.grandpa_channel_id,
          mobile: obj.info.mobile,
          proportions: obj.info.proportions + '',
          status: obj.info.status,
          token: obj.token
        }
        this.bar = obj.bar
        this.channelData = arr
        this.status = true
        this.modal = true
        this.grandpaChange(this.channelData.grandpa_channel_id)
      })
    },
    add () { // 新增加盟商
      addStaff(this.channelData).then(res => {
        if (res.data.code === 200) this.updateList()
      })
    },
    update () { // 编辑加盟商
      saveStaff(this.channelData).then(res => {
        if (res.data.code === 200) this.updateList()
      })
    },
    updateList () { // 新增、编辑成功更新列表
      this.$Message.success('成功')
      this.cancel()
      this.$refs.list.getStaffList()
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
