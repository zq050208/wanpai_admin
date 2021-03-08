<style lang="less">
  @import "./forms.less";
</style>
<template>
  <div>
    <div>
      <StoresList ref="list" v-on:add="showModal('channelData')" v-on:update="isShowModal"></StoresList>
    </div>
    <div>
      <Modal
        v-model="modal"
        :title="status ? '编辑门店' : '新增门店'"
        width="600px"
        :mask-closable="false">
        <Form
          :label-width="120"
          :label-position="label_position"
          ref="channelData" :model="channelData" :rules="ruleInline"
        >
          <FormItem label="门店名称：" prop="channel_name"><Input type="text" v-model="channelData.channel_name" /></FormItem>
          <FormItem label="所属加盟商：" prop="parent_channel_id">
            <Select v-model="channelData.parent_channel_id" >
              <Option :value="item.id" v-for="item in bar.channel" :key="item.id" :label="item.channel_name"></Option>
            </Select>
          </FormItem>
          <FormItem label="门店负责人：" prop="channel_principal"><Input type="text" v-model="channelData.channel_principal"/></FormItem>
          <Form-item label="是否默认门店" prop="is_default" >
            <Radio-group v-model="channelData.is_default" @on-change="radioChange">
              <Radio :value="0" :label="0">否</Radio>
              <Radio :value="1" :label="1">是</Radio>
            </Radio-group>
          </Form-item>
          <FormItem label="门店代码：" prop="channel_code"><Input type="text" v-model="channelData.channel_code"/></FormItem>
          <FormItem label="门店经营地址：" prop="contact_address"><Input type="text" v-model="channelData.contact_address"/></FormItem>
          <FormItem label="Mobile：" prop="mobile"><Input type="text" v-model="channelData.mobile" /></FormItem>
          <FormItem label="经纬度：" prop="position"><Input type="text" v-model="channelData.position" placeholder="填入经纬度用，隔开" /></FormItem>

          <FormItem label="门店品牌图：" prop="brand_logo">
            <div>(请上传343*126品牌图，不超过5张，支持扩展名：jpg，png，大小不超过2M)</div>
            <div class="demo-upload-list" v-for="(item, index) in uploadList_logo" :key="index">
              <template v-if="item.status === 'finished'">
                <img :src="item.url" >
                <div class="demo-upload-list-cover">
                  <Icon type="ios-trash-outline" @click="handleRemove_logo(item)"></Icon>
                </div>
              </template>
              <template v-else>
                <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
              </template>
            </div>
            <Upload
              ref="upload_logo"
              :show-upload-list="false"
              :on-success="handleSuccess_logo"
              :format="['jpg','jpeg','png']"
              :max-size="2048"
              :on-format-error="handleFormatError"
              :on-exceeded-size="handleMaxSize"
              :before-upload="handleBeforeUpload_logo"
              multiple
              type="drag"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
              style="display: inline-block;width:58px;">
              <div style="width: 58px;height:58px;line-height: 58px;">
                <Icon type="camera" size="20"></Icon>
              </div>
            </Upload>
          </FormItem>

          <FormItem label="门店宣传图：" prop="image">
          <div>(请上传375*213宣传图，不超过5张，支持扩展名：jpg，png，大小不超过2M)</div>
          <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" >
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="upload"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            multiple
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="camera" size="20"></Icon>
            </div>
          </Upload>
          </FormItem>

          <FormItem label="门店公告：" prop="notice">
            <textarea type="text" v-model="channelData.notice" placeholder="请输入门店公告" style="width: 100%;height: 100px;padding: 0 10px"></textarea>
          </FormItem>
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
import { getAddStoreCode, addStore, getSaveStoreCode, saveStore, getQiniuToken } from '@/api/data'
import StoresList from './stores-list'
export default {
  name: 'stores',
  components: { StoresList },
  inject: ['reload'],
  data () {
    return {
      modal: false, // 模态框显示状态
      label_position: 'left', // 模态框label位置
      channel_typeList: {}, // 加盟商类型
      bar: {},
      status: false,
      uploadList: [],
      uploadList_logo: [],
      qiniuToken: '',
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      channelData: {
        channel_name: '',
        channel_code: '',
        parent_channel_id: '',
        is_default: 0,
        channel_principal: '',
        contact_address: '',
        position: null,
        token: '',
        mobile: '',
        notice: '',
        image: '',
        brand_logo: '',
        status: null
      },
      ruleInline: {
        channel_name: [{ required: true, message: '请填写门店名称', trigger: 'blur' }],
        parent_channel_id: [{ required: true, message: '请选择所属加盟商', trigger: 'blur', type: 'number' }],
        channel_principal: [{ required: true, message: '请填写门店负责人', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.getQiniu()
  },
  methods: {
    radioChange (res) {
      this.channelData.status = res
    },
    showModal (name) { // 显示新增modal
      this.uploadList = []
      this.uploadList_logo = []
      getAddStoreCode().then(res => {
        this.$refs[name].resetFields()
        if (res.data.code === 200) {
          this.channelData.token = res.data.data.token
          this.bar = res.data.data.bar
          this.status = false
          this.modal = true
        }
      })
    },
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) this.qiniuToken = res.data.data.qiniu_upload_token
      })
    },
    cancel () { // 隐藏新增modal
      this.modal = false
      this.$refs.upload.fileList = []
      this.uploadList = []
      this.$refs.upload_logo.fileList = []
      this.uploadList_logo = []
    },
    isShowModal (row) {
      if (row.image) {
        var list = JSON.parse(row.image)
        var img = []
        list.forEach((item, i) => {
          img[i] = {
            url: item,
            name: '',
            status: 'finished',
            showProgress: false,
            percentage: 100
          }
        })
        this.uploadList = img
        this.$refs.upload.fileList = img
      }
      if (row.brand_logo) {
        var list1 = JSON.parse(row.brand_logo)
        var img1 = []
        list1.forEach((item, i) => {
          img1[i] = {
            url: item,
            name: '',
            status: 'finished',
            showProgress: false,
            percentage: 100
          }
        })
        this.uploadList_logo = img1
        this.$refs.upload_logo.fileList = img1
      }
      getSaveStoreCode({ channel_id: row.id }).then(res => {
        this.$refs['channelData'].resetFields()
        var obj = res.data.data
        var arr = {
          channel_id: obj.info.id,
          parent_channel_id: obj.info.parent_channel_id,
          channel_name: obj.info.channel_name,
          channel_code: obj.info.channel_code,
          mobile: obj.info.mobile,
          is_default: obj.info.is_default || 0,
          channel_principal: obj.info.channel_principal,
          contact_address: obj.info.contact_address,
          position: obj.info.position,
          notice: obj.info.notice,
          image: obj.info.image,
          brand_logo: obj.info.brand_logo,
          status: obj.info.status,
          token: obj.token
        }
        this.bar = obj.bar
        this.channelData = arr
        this.status = true
        this.modal = true
      })
    },
    add () { // 新增加盟商
      addStore(this.channelData).then(res => {
        if (res.data.code === 200) this.updateList()
      })
    },
    update () { // 编辑加盟商
      saveStore(this.channelData).then(res => {
        if (res.data.code === 200) this.updateList()
      })
    },
    updateList () { // 新增、编辑成功更新列表
      this.$Message.success('成功')
      this.cancel()
      this.$refs.list.getStoreList()
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          var uploadList = []
          var uploadList_logo = []
          if (this.uploadList.length) {
            this.uploadList.forEach(item => {
              uploadList.push(item.url)
            })
            this.channelData.image = JSON.stringify(uploadList)
          } else {
            this.channelData.image = JSON.stringify([])
          }
          if (this.uploadList_logo.length) {
            this.uploadList_logo.forEach(item => {
              uploadList_logo.push(item.url)
            })
            this.channelData.brand_logo = JSON.stringify(uploadList_logo)
          } else {
            this.channelData.brand_logo = JSON.stringify([])
          }
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
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
    },
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
      })
    },
    handleBeforeUpload () {
      const check = this.uploadList.length < 5
      if (!check) this.$Notice.warning({ title: '最多只能上传 5 张图片。' })
      return check
    },
    handleRemove_logo (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload_logo.fileList
      this.$refs.upload_logo.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList_logo = this.$refs.upload_logo.fileList
    },
    handleSuccess_logo (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList_logo = this.$refs.upload_logo.fileList
    },
    handleBeforeUpload_logo () {
      const check = this.uploadList_logo.length < 5
      if (!check) this.$Notice.warning({ title: '最多只能上传 5 张图片。' })
      return check
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
  .demo-upload-list{
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin-right: 4px;
  }
  .demo-upload-list img{
    width: 100%;
    height: 100%;
  }
  .demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.6);
  }
  .demo-upload-list:hover .demo-upload-list-cover{
    display: block;
  }
  .demo-upload-list-cover i{
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
