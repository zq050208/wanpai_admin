<template>
  <div>
    <getBannerList v-on:add="getNewBanner('bannerData')" ref='list' v-on:update="getChangeBanner"></getBannerList>
    <Modal v-model="isShowModal" :mask-closable="false" :title="title ? '上传新Banner' : 'Banner详情'">
      <Form :label-width="90" :label-position="label_position" ref='bannerData' :model="bannerData" :rules="ruleValidate">
        <!-- <FormItem label="广告类型：" prop="ad_type">
        <Select v-model="bannerData.ad_type" placeholder="请选择">
          <Option :value="item.id" v-for="item in banner_type" :key="item.id" :label="item.name"></Option>
        </Select>
      </FormItem> -->
        <FormItem label="选择图片：" prop="ad_images_url">
          <Upload ref="upload" :format="['jpg','jpeg','png']" :max-size="2048" :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize" :on-success="handleSuccess" :before-upload="handleBefore" action="//upload-z2.qiniu.com" :data="{ token: qiniuToken }" :show-upload-list="false" style="display:inline;margin-right:10px;">
            <i-button icon="ios-cloud-upload-outline">选择文件</i-button>
          </Upload>
          <a alt="" @click="imageView(bannerData.ad_images_url)">预览</a>
        </FormItem>
        <Form-item label="显示状态：" prop="status">
          <Radio-group v-model='bannerData.status'>
            <Radio :label='1'>显示</Radio>
            <Radio :label='0'>不显示</Radio>
          </Radio-group>
        </Form-item>
        <!--         <Form-item label="是否默认：" prop="is_default">
          <Radio-group v-model='bannerData.is_default'>
            <Radio :label='1'>是</Radio>
            <Radio :label='0'>否</Radio>
          </Radio-group>
        </Form-item> -->
        <Form-item label="跳转类型：" prop="ad_jump_type">
          <Radio-group v-model='bannerData.ad_jump_type'>
            <Radio :label='1'>跳转</Radio>
            <Radio :label='0'>不跳转</Radio>
          </Radio-group>
        </Form-item>
        <FormItem label="输入链接：" prop="ad_jump_url" v-if="bannerData.ad_jump_type">
          <Input v-model="bannerData.ad_jump_url" placeholder="请输入跳转链接" />
        </FormItem>

        <FormItem label="权重排序：" prop="sort">
          <Input type="number" v-model="bannerData.sort" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" @click="handleSubmit('bannerData')">提交</Button>
        <Button type="text" size="large" @click="cancel">取消</Button>
      </div>
    </Modal>
    <Modal title="预览图" v-model="isImage">
      <img :src="imgName" v-if="isImage" style="width: 100%">
    </Modal>
  </div>
</template>
<script type="text/javascript">
import { getCheckCode, getQiniuToken, updateOldBanner, saveNewBanner } from '@/api/data'
import getBannerList from '../banner-list'
export default {
  components: { getBannerList },
  data () {
    return {
      isShowModal: false,
      isImage: false,
      label_position: 'left',
      title: '',
      qiniuToken: '',
      imgName: '',
      sort: [],
      // banner_type: [],
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      bannerData: {
        checkcode: ''
      },
      ruleValidate: {
        // ad_type: [
        //   { required: true, message: '请选择', trigger: 'change', type: 'number' }
        // ],
        ad_images_url: [
          { required: true, message: '请上传图片' }
        ],
        sort: [
          { required: true, message: '请输入大于等于0的数值', pattern: /^[1-9]\d*$/ }
        ],
        status: [
          { required: true, message: '请选择', trigger: 'change', type: 'number' }
        ],
        is_default: [
          { required: true, message: '请选择', trigger: 'change', type: 'number' }
        ],
        ad_jump_type: [
          { required: true, message: '请选择', trigger: 'change', type: 'number' }
        ],
        ad_jump_url: [
          { required: true, message: '请输入', trigger: 'blur', type: 'string' }
        ]
      }
    }
  },
  mounted () {
    getQiniuToken().then(res => { // 获取七牛云token
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken
      }
    })
    // getBannerType().then(res => { // 获取广告类型列表
    //   if (res.data.code === 200) {
    //     this.banner_type = res.data.data
    //   }
    // })
  },
  methods: {
    getChangeBanner (data) { // 获取修改弹窗
      this.title = false
      this.bannerData = {
        status: data.status,
        sort: data.sort,
        ad_images_url: data.ad_images_url,
        // ad_type: data.ad_type,
        ad_jump_type: data.ad_jump_type,
        is_default: data.is_default,
        ad_jump_url: data.ad_jump_url,
        checkcode: this.bannerData.checkcode,
        params: data.ad_id
      }
      this.isShowModal = true
    },
    getNewBanner (name) { // 获取新建弹窗
      this.$refs[name].resetFields()
      this.$refs.upload.clearFiles()
      this.title = true
      this.bannerData = {
        // ad_type: 1,
        status: 1,
        sort: 1,
        ad_jump_type: 1,
        is_default: 1,
        ad_jump_url: '',
        ad_images_url: '',
        checkcode: this.bannerData.checkcode
      }
      this.isShowModal = true
    },
    updateOldBanner () { // 修改banner提交
      updateOldBanner(this.bannerData).then(res => {
        if (res.data.code === 200) {
          this.updateList()
        }
      })
    },
    addNewBanner () { // 新建banner提交
      saveNewBanner(this.bannerData).then(res => {
        if (res.data.code === 200) {
          this.updateList()
        }
      })
    },
    updateList () { // 提交成功更新列表
      this.$Message.success('成功')
      this.cancel()
      this.$refs.list.getBannerList()
    },
    cancel () { // 关闭窗口
      this.isShowModal = false
    },
    imageView (name) { // 预览图片
      this.imgName = name
      this.isImage = true
    },
    handleSubmit (name) { // 提交按钮
      getCheckCode().then(res => { // 获取banner校验码
        if (res.data.code === 200) {
          this.bannerData.checkcode = res.data.data.checkcode
          this.$refs[name].validate((valid) => {
            if (valid) {
              if (this.title) { // 新增
                this.addNewBanner()
              } else { // 编辑
                this.updateOldBanner()
              }
            } else {
              this.$Message.error('提交失败')
            }
          })
        }
      })
    },
    handleBefore () { // 上传文件之前清空已上传文件
      this.$refs.upload.clearFiles()
      // const check = this.uploadListAd.length < 1;
      //           if (!check) {
      //               this.$Notice.warning({
      //                   title: '最多只能上传 1 张图片。'
      //               });
      //           }
      // return check;
    },
    handleSuccess (res, file) { // 文件上传成功
      file.url = this.imageBaseUrl + res.key
      this.bannerData.ad_images_url = file.url
      file.name = file.url
    },
    handleFormatError (file) { // 文件格式不正确
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片'
      })
    },
    handleMaxSize (file) { // 文件超出大小限制
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M'
      })
    }
  }
}

</script>
<style scoped>

</style>
