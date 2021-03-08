<template>
  <div>
    <!-- <div> -->
      <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
        <template v-if="item.status === 'finished'">
          <img :src="item.url" style="width: 327px;height:153px;line-height: 153px;margin-right:10px" >
          <div class="demo-upload-list-cover">
            <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
          </div>
        </template>
        <template v-else>
          <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
        </template>
      </div>
      <Upload
        v-show="uploadList.length < 1"
        ref="upload"
        :show-upload-list="false"
        :format="['jpg','jpeg','png']"
        :before-upload="handleBeforeUpload"
        type="drag"
        action="//upload-z2.qiniu.com"
        :data="{ token: qiniuToken }"
        style="display: inline-block;width:327px;">
        <div style="width:327px; height:153px; display:flex; flex-direction: column;justify-content: center; align-items: center">
          <Icon type="ios-cloud-upload-outline" size="20"></Icon>
          <p>只能上传jpg/png格式文件
          尺寸：{{optionData.autoCropWidth}}*{{optionData.autoCropHeight}}</p>
        </div>
      </Upload>
    <!-- </div> -->
    <!-- 图片裁剪弹窗 -->
    <modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
      <div class="cropper">
        <vueCropper
          ref="cropper"
          :img="option.img"
          :outputSize="option.outputSize"
          :outputType="option.outputType"
          :info="option.info"
          :canScale="option.canScale"
          :autoCrop="option.autoCrop"
          :autoCropWidth="optionData.autoCropWidth"
          :autoCropHeight="optionData.autoCropHeight"
          :fixedBox="option.fixedBox"
          :fixed="option.fixed"
          :fixedNumber="optionData.fixedNumber"
          :full="option.full"
          :centerBox="option.centerBox"
        />
      </div>
    </modal>
  </div>
</template>

<script>
import axios from 'axios'
import { VueCropper } from 'vue-cropper'
import { formatDate } from "@/libs/util";
import { 
  getQiniuToken, 
} from '@/api/data'
import { mapMutations } from 'vuex'
export default {
  components: {
    VueCropper
  },
  props: {
    optionData: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      qiniuToken: '', // Token
      uploadList: [],
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      cropperFlag: false,
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg || png', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, // 是否输出原图比例的截图
        fixed: true, // 是否开启截图框宽高固定比例
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
    }
  },
  computed: {
  
  },
  mounted () {
    console.log("sdfsdf:",this.optionData.imgUrl)
    if(this.optionData.imgUrl){
      this.uploadList = [
        {
          percentage: 100,
          showProgress: false,
          status: "finished",
          url: this.optionData.imgUrl
        }
      ]
    }
    this.getqinniuToken()
  },
  methods: {
    // 图片上传
    getqinniuToken () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    onCubeImg () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        this.getqinniuToken()
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              // if (this.option.type === 'hdfile') {
                // this.formData.img_url = this.imageBaseUrl + res.data.key
                this.uploadList.push({
                  status: 'finished',
                  url: this.imageBaseUrl + res.data.key
                })
                this.$emit('getUploadImgUrl', this.imageBaseUrl + res.data.key)
                // this.$refs.bannerForm.validateField('img_url') ;
              // }
            } else {
              that.$Message.error('上传失败')
            }
          })
      })
      this.option.img = ''
      this.cropperFlag = false
    },
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob (urlData) {
      let bytes = window.atob(urlData.split(',')[1])// 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length)
      let ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    },
    // 拿到需要截图图片
    getPic (file) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.$Modal.error({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg或者png 格式的图片。'
        })
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
      }
      reader.readAsDataURL(file)
      this.$refs.cropper.refresh()
      this.cropperFlag = true
    },
    handleBeforeUpload (file) {
      this.uploadList = []
      // this.option.type = 'hdfile'
      this.getPic(file)
      return false
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      let list = this.$refs.upload.fileList
      this.uploadList = this.$refs.upload.fileList
      // this.formData.img_url = ''
    },
  }
}
</script>

<style scoped>
/* .content{
  width: 600px;
  margin: 30px auto;
} */
.demo-upload-list{
  position: relative;
}
.demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 327px;
    height: 153px;
    background: rgba(0,0,0,.6);
}
.demo-upload-list:hover .demo-upload-list-cover{
    display: block;
}
.demo-upload-list-cover i{
    display: block;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 70px auto;
}
.cropper{
  width: 400px;
  height: 400px;
}
.searchInput {
  margin-bottom: 20px;
}
</style>
