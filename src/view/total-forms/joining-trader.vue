<style lang="less">
  @import "./forms.less";
</style>
<template>
  <div>
    <div>
      <JoiningTraderList ref="list" v-on:add="showModal('channelData')" v-on:update="isShowModal"></JoiningTraderList>
    </div>
    <div>
      <Modal
        v-model="modal"
        :title="status ? '编辑加盟商' : '新增加盟商'"
        width="600px"
        :mask-closable="false">
        <Form
          :label-width="120"
          :label-position="label_position"
          ref="channelData" :model="channelData" :rules="ruleInline"
        >
          <FormItem label="加盟商名称：" prop="channel_name"><Input type="text" v-model="channelData.channel_name" /></FormItem>
          <FormItem label="加盟商类型：" prop="channel_type">
            <Select v-model="channelData.channel_type" >
              <Option :value="item.id" v-for="item in channel_typeList" :key="item.id" :label="item.name"></Option>
            </Select>
          </FormItem>
          <FormItem label="加盟商负责人：" prop="channel_principal"><Input type="text" v-model="channelData.channel_principal"/></FormItem>
          <FormItem label="品牌logo：" prop="logo">
            <Upload
              ref="upload"
              :format="['jpg','jpeg','png']"
              :max-size="2048"
              :on-format-error="handleFormatError"
              :on-exceeded-size="handleMaxSize"
              :on-success="handleSuccess"
              :before-upload="handleBefore"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
            >
              <i-button icon="ios-cloud-upload-outline">选择文件</i-button>
            </Upload>
          </FormItem>

          <FormItem label="加盟商代码：" prop="channel_code"><Input type="text" v-model="channelData.channel_code"/></FormItem>
          <FormItem label="加盟商联系地址：" prop="contact_address"><Input type="text" v-model="channelData.contact_address"/></FormItem>

          <FormItem label="分成设置：" prop="into">
            <CheckboxGroup v-model="channelData.into" @on-change="checkAllGroupChange">
              <Checkbox label="1" >利润</Checkbox>
              <Checkbox label="2" >流水</Checkbox>
            </CheckboxGroup>
          </FormItem>

          <FormItem label="利润分成设置：" class="mb0">阶梯分成比例：(单位：元)</FormItem>
          <FormItem class="ratio" v-for="(item, index) in proportionList" :key="index" style="margin-bottom: 5px">
            <Input class="w100" type="number" v-model="item.low_range"/> ~
            <Input class="w100" type="number" v-model="item.high_range"/>&nbsp;&nbsp;&nbsp;&nbsp;
            <Input class="w100" type="number" v-model="item.proportion"/>%
          </FormItem>

          <FormItem label="流水分成设置：" class="mb0">(单位：元)</FormItem>
          <FormItem label="最低流水金额：" prop="min_amount"><Input class="w100" type="number" v-model="channelData.min_amount"/>（月度总额）</FormItem>
          <FormItem label="流水分成比例：" prop="runoff_proportions"><Input class="w100" type="number" v-model="channelData.runoff_proportions"/>%</FormItem>
          <FormItem label="流水开始时间：" prop="flow_start_time">
            <Time-picker confirm v-model="channelData.flow_start_time" placeholder="选择时间" style="width: 168px"></Time-picker>
          </FormItem>
          <FormItem label="流水结束时间：" prop="flow_end_time">
            <Time-picker confirm v-model="channelData.flow_end_time" placeholder="选择时间" style="width: 168px"></Time-picker>
          </FormItem>
          <FormItem label="补贴幅度设置：" prop="subsidy_range">
            <Select class="w100" @on-change="rangeMin" v-model="subsidy_rangeMin">
              <Option :value="item" v-for="item in rangeList.minList" :key="item" :label="item"></Option>
            </Select>~
            <Select class="w100" @on-change="rangeMax" v-model="subsidy_rangeMax">
              <Option :value="item" v-for="item in rangeList.maxList" :key="item" :label="item"></Option>
            </Select>
          </FormItem>

          <Form-item label="状态" prop="status" v-if="status">
            <Radio-group v-model="channelData.status" @on-change="radioChange">
              <Radio :value="item.id" :label="item.id" v-for="item in statusList" :key="item.id">{{item.name}}</Radio>
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
import { getQiniuToken, getAddChannelCode, addChannel, getSaveChannelCode, saveChannel } from '@/api/data'
import JoiningTraderList from './joining-trader-list'
export default {
  name: 'form-day',
  components: { JoiningTraderList },
  inject: ['reload'],
  data () {
    return {
      modal: false, // 模态框显示状态
      label_position: 'left', // 模态框label位置
      qiniuToken: '', // 七牛云上传token
      channel_typeList: {}, // 加盟商类型
      statusList: [],
      proportionList: [],
      status: false,
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      rangeList: {},
      subsidy_rangeMin: '',
      subsidy_rangeMax: '',
      channelData: {
        channel_name: '',
        channel_code: '',
        logo: '',
        channel_type: '',
        channel_principal: '',
        contact_address: '',
        token: '',
        proportion: [],
        into: [],
        min_amount: '',
        runoff_proportions: '',
        flow_start_time: '',
        flow_end_time: '',
        subsidy_range: '',
        is_profit: 0,
        is_flow: 0,
        status: null
      },
      ruleInline: {
        channel_name: [{ required: true, message: '请填写加盟商名称', trigger: 'blur' }],
        channel_type: [{ required: true, message: '请选择加盟商类型', trigger: 'blur', type: 'number' }],
        channel_principal: [{ required: true, message: '请填写加盟商负责人', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    getQiniuToken().then(res => { // 获取七牛云token
      if (res.data.code === 200) this.qiniuToken = res.data.data.qiniu_upload_token
    })
    var minList = []
    var maxList = ['1.0']
    var s = 0.1
    for (var i = 0; i < 2.1; i += s) {
      if (i > 1) {
        maxList.push((i).toFixed(1))
      } else {
        if (i > 0) minList.push((i).toFixed(1))
      }
    }
    this.rangeList = { minList, maxList }
  },
  methods: {
    radioChange (res) {
      this.channelData.status = res
    },
    showModal (name) { // 显示新增modal
      this.rangeRes()
      getAddChannelCode().then(res => {
        this.$refs[name].resetFields()
        if (res.data.code === 200) {
          var arr = []
          for (var i = 0; i < 6; i++) arr.push({ low_range: '', high_range: '', proportion: '' })
          this.proportionList = arr
          this.channel_typeList = res.data.data.bar.channel_type
          this.channelData.token = res.data.data.token
          this.status = false
          this.modal = true
        }
      })
    },
    cancel () { // 隐藏新增modal
      this.modal = false
    },
    rangeRes () {
      this.subsidy_rangeMin = ''
      this.subsidy_rangeMax = ''
    },
    isShowModal (id, current) {
      this.rangeRes()
      getSaveChannelCode({ channel_id: id }).then(res => {
        this.$refs['channelData'].resetFields()
        var obj = res.data.data
        var arr = {
          channel_id: obj.info.id,
          channel_name: obj.info.channel_name,
          channel_code: obj.info.channel_code,
          logo: obj.info.logo,
          channel_type: obj.info.channel_type,
          channel_principal: obj.info.channel_principal,
          contact_address: obj.info.contact_address,
          min_amount: obj.info.min_amount,
          pro_setting: obj.info.pro_setting,
          subsidy_range: obj.info.subsidy_range,
          flow_start_time: obj.info.flow_start_time,
          flow_end_time: obj.info.flow_end_time,
          runoff_proportions: obj.info.runoff_proportions,
          is_profit: obj.info.is_profit,
          is_flow: obj.info.is_flow,
          status: obj.info.status,
          token: obj.token,
          proportion: []
        }
        var len = 6 - obj.info.proportion.length
        var into = []
        if (len) for (var i = 0; i < len; i++) obj.info.proportion.push({ low_range: '', high_range: '', proportion: '' })
        if (arr.is_profit) into.push('1')
        if (arr.is_flow) into.push('2')
        arr.into = into
        if (arr.subsidy_range) {
          var subsidy = arr.subsidy_range.split(',')
          this.subsidy_rangeMin = subsidy[0]
          this.subsidy_rangeMax = subsidy[1]
        }
        this.channel_typeList = obj.bar.channel_type
        this.statusList = obj.bar.channel_status
        this.proportionList = obj.info.proportion
        this.channelData = arr
        this.status = true
        this.modal = true
        this.current = current
      })
    },
    add () { // 新增加盟商
      addChannel(this.channelData).then(res => {
        if (res.data.code === 200) this.updateList()
      })
    },
    update () { // 编辑加盟商
      saveChannel(this.channelData).then(res => {
        if (res.data.code === 200) this.updateList()
      })
    },
    updateList () { // 新增、编辑成功更新列表
      this.$Message.success('成功')
      this.cancel()
      this.$refs.list.getChannelList()
    },
    getProportion () { // 获取比例分成数据
      var val = this.proportionList
      var array = []
      var hasinfo = true
      if (val.length) {
        for (var i = 0; i < val.length; i++) {
          if (val[i].high_range || val[i].low_range || val[i].proportion) {
            if ((val[i].high_range || val[i].high_range === 0) && (val[i].low_range || val[i].low_range === 0) && (val[i].proportion || val[i].proportion === 0)) {
              array.push(val[i])
              hasinfo = true
            } else {
              hasinfo = false
              break
            }
          }
        }
      }
      if (hasinfo) {
        this.channelData.proportion = JSON.stringify(array)
        return true
      } else {
        this.$Message.error('分成比例填写不完整!')
        return false
      }
    },
    checkAllGroupChange (data) {
      var a = data.indexOf('1') > -1
      var b = data.indexOf('2') > -1
      if (a) this.channelData.is_profit = 1
      else this.channelData.is_profit = 0
      if (b) this.channelData.is_flow = 1
      else this.channelData.is_flow = 0
    },
    rangeMin (e) {
      this.channelData.subsidy_range = e + ',' + this.subsidy_rangeMax
    },
    rangeMax (e) {
      this.channelData.subsidy_range = this.subsidy_rangeMin + ',' + e
    },
    handleSubmit (name) {
      if (this.subsidy_rangeMin || this.subsidy_rangeMax) {
        if (!this.subsidy_rangeMin || !this.subsidy_rangeMax) {
          this.$Message.error('Fail!')
          return
        }
      }
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.getProportion()) {
            // 发送请求
            if (!this.status) { // 新增
              this.add()
            } else { // 编辑
              this.update()
            }
          }
        } else {
          this.$Message.error('Fail!')
        }
      })
    },
    handleBefore () { // 上传文件之前清空已上传文件
      this.$refs.upload.clearFiles()
    },
    handleSuccess (res, file) { // 文件上传成功
      file.url = this.imageBaseUrl + res.key
      this.channelData.logo = file.url
    },
    handleFormatError (file) { // 文件格式不正确
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize (file) { // 文件超出大小限制
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
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
