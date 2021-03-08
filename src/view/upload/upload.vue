<template>
  <div>
    <div style="width: 50%">
      <Upload
        ref="upload"
        type="drag"
        action="//upload-z2.qiniu.com"
        :data="{ token: qiniuToken }"
        :before-upload="handleBeforeUpload"
        :on-success="handleImgSuccess"
      >
        <div style="padding: 20px 0">
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
          <p>点击或拖拽文件到此上传</p>
        </div>
      </Upload>
    </div>
    <div style="width: 50%">
      <Tooltip content="点击复制地址" style="width: 100%; margin-top: 20px">
        <Input v-if="url" :value="url" @on-focus="handleClick" />
      </Tooltip>
    </div>
  </div>
</template>

<script>
import { getQiniuToken } from '@/api/data'
const baseImgUrl = 'https://cdn.tinytiger.cn/'

export default {
  name: 'upload',
  data() {
    return {
      qiniuToken: '',
      url: ''
    }
  },
  mounted() {
    getQiniuToken().then(res =>{
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken
      }
    })
  },
  methods: {
    handleClick() {
      this.copyToClip(this.url)
    },
    handleBeforeUpload() {
      this.$refs.upload.clearFiles()
      this.url = ''
      return true
    },
    handleImgSuccess(response) {
      const fileUrl = baseImgUrl + response.key
      this.url = fileUrl
    },
    copyToClip(content, message = '复制成功') {
      var aux = document.createElement("input")
      aux.setAttribute("value", content)
      document.body.appendChild(aux)
      aux.select()
      document.execCommand("copy")
      document.body.removeChild(aux)
      this.$Message.success(message)
    }
  }
}
</script>
