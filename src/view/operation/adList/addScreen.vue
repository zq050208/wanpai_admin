<template>
  <Card>
    <template slot="title">{{this.id ? '编辑' : '添加'}}开屏页</template>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="12" :sm="18" :xs="24">
        <Form
          ref="addBannerForm"
          :model="formData"
          :rules="formRules"
          :label-width="150"
          label-position="right"
        >
          <FormItem label="广告名称：" prop="title">
            <Input v-model="formData.title" />
            <p>广告名称只是作为辨别多个广告条目之用，并不显示在广告中</p>
          </FormItem>
          <FormItem label="开始时间：" prop="start_time">
            <DatePicker :value="formData.start_time" type="datetime" @on-change="handleStartDateChange" placeholder="请选择开始时间" />
          </FormItem>
          <FormItem label="到期时间：" prop="end_time">
            <DatePicker :value="formData.end_time" type="datetime" @on-change="handleEndDateChange" placeholder="请选择到期时间" />
          </FormItem>
          <FormItem label="广告图片：" prop="image">
            <uploadImg :optionData="optionData" @getUploadImgUrl="getUploadImgUrl"></uploadImg>
          </FormItem>
          <jumpTarget :formData="jumpData" @getJumpUrl="getJumpUrl" style="position:relative;left: -47px;"></jumpTarget>
          <FormItem label="停留时长（秒）：" prop="stayTime">
            <input type="text" v-model="formData.stayTime" name="tel" oninput="value=value.replace(/[^\d]/g,'')" maxlength="1" style="width: 300px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"/>
          </FormItem>
          <FormItem>
            <Button type="primary" size="large" @click="handleSubmit">提交</Button>
          </FormItem>
        </Form>
        </Col>
    </Row>
  </Card>
</template>

<script>
import { getAdCode, getQiniuToken, popAdd, bannerEditCode, popEdit, getContentList } from '@/api/data'
import { mapMutations } from 'vuex'
import jumpTarget from '@/components/jumpTarget'
import uploadImg from '@/components/uploadImg'
export default {
  components: {
    jumpTarget,
    uploadImg
  },
  data () {
    return {
      id: null,
      ad_jump_type: [],
      qiniuToken: '',
      uploadList: [],
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      formData: {
        title: '',
        start_time: '',
        end_time: '',
        image: '',
        jump_type: '',
        jump_url: '',
        jump_view: 0,
        stayTime: ''
      },
      formRules: {
        title: [
          { required: true, message: '请输入广告名称' },
          { type: 'string', max: 30, message: '最多只能输入30个字符' }
        ],
        start_time: [{ required: true, message: '请选择开始时间' }],
        end_time: [{ required: true, message: '请选择到期时间' }],
        image: [{ required: true, message: '请上传广告图片' }],
        jump_type: [{ required: true, message: '请选择跳转类型' }],
        jump_url: [{ required: true, message: '请输入广告链接' }],
        jump_view: [{ required: true, message: '请选择关联作品' }]
      },
      jumpData: {
        jump_type: 0,
        jump_url: '',
        jump_out_url: '',
        currentid: ''
      },
      optionData: {
        fixedNumber: [375, 669], // 截图框的宽高比例
        autoCropWidth: 375, // 默认生成截图框宽度
        autoCropHeight: 669, // 默认生成截图框高度
        imgUrl: ''
      },
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    getJumpUrl(data){
      console.log("从子组件接收到的data",data)
    },
    getUploadImgUrl(data){
      console.log("getUploadImgUrl:",data)
    },
    init () {
      this.getQiniuToken()
      this.id = this.$route.query.id
      if (this.id) this.bannerEditCode(this.id)
      else this.getAdCode()
    },
    async getQiniuToken () {
      await getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    async getAdCode () {
      await getAdCode().then(res => {
        if (res.data.code === 200) {
          
        }
      })
    },
    bannerEditCode (id) {
      bannerEditCode({ id: id }).then(res => {
        if (res.data.code === 200) {
          if (res.data.code === 200) {
            this.ad_jump_type = res.data.data.jump_type
            this.data = res.data.data.content_list.data
            this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: res.data.data.info.image }]
            this.uploadList = this.$refs.upload.fileList
            this.formData = {
              checkcode: res.data.data.checkcode,
              ...res.data.data.info
            }
          }
        }
      })
    },
    selectContent () {
      this.visible = true
    },
    popAdd () {
      popAdd(this.formData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.closeTag(this.$route)
          this.$router.push({ path: '/operation/ad_list' })
        }
      })
    },
    popEdit () {
      popEdit(this.formData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.closeTag(this.$route)
          this.$router.push({ path: '/operation/ad_list' })
        }
      })
    },
    handleStartDateChange (date, type) {
      this.formData.start_time = date
    },
    handleEndDateChange (date, type) {
      this.formData.end_time = date
    },
    handleSubmit () {
      // console.log("handleSubmit:",this.jumpData.jump_type,this.jumpData.jump_url,this.jumpData.jump_out_url)
      this.$refs.addBannerForm.validate(valid => {
        if (valid) {
          let id = this.$route.query.id
          if (id) this.popEdit()
          else this.popAdd()
        }
      })
    },
  }
}
</script>
<style>
  .page {
    margin-top: 20px;
    text-align: center;
  }
</style>
