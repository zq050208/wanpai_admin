<template>
  <div style="margin-top: 20px">
    <Form :model="formData" ref="form" :rules="formRules">
      <Row>
        <Col :span="10">
          <FormItem prop="image" :label-width="10">
            <template v-if="formData.image">
              <div class="demo-upload-list">
                <div class="img-container">
                  <img class="image" v-if="formData.color" :src="nameplate_color[formData.color]" style="z-index: 9">
                  <img class="image" v-if="formData.border" :src="nameplate_border[formData.border]" style="z-index: 9">
                  <img class="image" :src="formData.image" :style="{padding: formData.color ? '5px' : '8px'}" />
                </div>
                  <!-- <img :src="formData.image" /> -->
                  <div class="demo-upload-list-cover">
                    <Icon type="ios-trash-outline" @click="handleRemove"></Icon>
                  </div>
              </div>
            </template>
            <Upload
              ref="upload"
              type="drag"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
              :show-upload-list="false"
              :format="['jpg','jpeg']"
              :before-upload="handleBeforeUpload"
              style="display: inline-block;width:58px;"
            >
              <div style="width: 58px;height:58px;line-height: 58px;">
                <Icon type="ios-cloud-upload-outline" size="20"></Icon>
              </div>
            </Upload>
          </FormItem>
        </Col>
        <Col :span="14">
          <FormItem label="铭牌名称：" prop="name" :label-width="100" style="margin-bottom: 20px" required>
            <Input v-model="formData.name" />
          </FormItem>
          <FormItem label="铭牌价格：" prop="price" :label-width="100" style="margin-bottom: 20px" required>
            <Input number type="number" v-model="formData.price" style="width: 120px" /> <span style="color: rgba(245, 154, 35, 1)"> P币</span>
            <div class="red">价格不能超过{{ editTabValue === '1' ? '100' : editTabValue === '2' ? '500' : '1000' }}P币</div>
          </FormItem>
        </Col>
      </Row>

      <FormItem v-if="editTabValue === '2'" label="选择铭牌色调：" prop="color" :label-width="140" style="margin-bottom: 20px">
        <template v-for="(value, name, index) in nameplate_color">
          <div @click="handleColorChange(name)" :class="Number(name) === formData.color ? 'circle checked' : 'circle'">
            <img :src="value" alt="" style="width: 40px; height: 40px">
          </div>
        </template>
      </FormItem>

      <FormItem  v-if="editTabValue === '3'" label="铭牌数量：" prop="nameplate_total" :label-width="100" style="margin-bottom: 20px" required>
        <Input number type="number" v-model="formData.nameplate_total" style="width: 120px" /> <span class="red"> 铭牌数量不能超过1000个</span>
      </FormItem>

      <FormItem v-if="editTabValue === '3'" label="铭牌边框：" prop="border" :label-width="100" style="margin-bottom: 20px" required>
        <template v-for="(value, name, index) in nameplate_border">
          <div @click="handleBorderChange(name)" :class="Number(name) === formData.border ? 'circle checked' : 'circle'">
            <img :src="value" alt="" style="width: 40px; height: 40px">
            <div style="text-align: center">{{shengxiao[index]}}</div>
          </div>
        </template>
      </FormItem>
    </Form>

    <Divider style="margin: 0 0 24px 0" />

    <modal v-model="cropperVisible" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
      <div class="cropper" >
        <vueCropper
          ref="cropper"
          :img="option.img"
          :outputSize="option.outputSize"
          :outputType="option.outputType"
          :info="option.info"
          :canScale="option.canScale"
          :autoCrop="option.autoCrop"
          :autoCropWidth="option.autoCropWidth"
          :autoCropHeight="option.autoCropHeight"
          :fixedBox="option.fixedBox"
          :full="option.full"
          :fixed="option.fixed"
          :fixedNumber="option.fixedNumber"
          :centerBox="option.centerBox"
        />
      </div>
    </modal>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'
import axios from 'axios'
import { getQiniuToken } from '@/api/data'

export default {
  components: {
    VueCropper
  },
  props: {
    editTabValue: {
      type: String,
      required: true
    },
    nameplate_border: {
      type: Object,
      default: {}
    },
    nameplate_color: {
      type: Object,
      default: {}
    }
  },
  mounted() {
    getQiniuToken().then(res => {
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken
      }
    })
  },
  methods: {
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if(valid) {
            resolve({...this.formData})
          } else {
            reject()
          }
        })
      })
    },
    handleColorChange(color) {
      this.formData.color = Number(color)
    },
    handleBorderChange(border) {
      this.formData.border = Number(border)
    },
    handleBeforeUpload (file) {
      this.getPic(file)
      return false
    },
    handleRemove() {
      this.formData.image = ''
    },
    getPic (file) {
      if(file.type !== 'image/jpg' && file.type !== 'image/jpeg') {
        this.$Modal.error({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 格式的图片。'
        })
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        let data
        if (typeof e.target.result === 'object') {
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
      }
      reader.readAsDataURL(file)
      if(this.editTabValue === '1') {
        this.option.fixedNumber = [92, 58]
        this.option.autoCropWidth = 92
        this.option.autoCropHeight = 58
      } else if(this.editTabValue === '2') {
        this.option.fixedNumber = [120, 75]
        this.option.autoCropWidth = 120
        this.option.autoCropHeight = 75
      } else {
        this.option.fixedNumber = [96, 64]
        this.option.autoCropWidth = 96
        this.option.autoCropHeight = 64
      }
      this.$refs.cropper.refresh()
      this.cropperVisible = true
    },
    onCubeImg () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              this.formData.image = this.imageBaseUrl + res.data.key
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
    // 获取字符长度 1汉字=2字符 1字母/数字=1字符
    getByteLen(val) {
      let len = 0
      for (let i = 0; i < val.length; i++) {
        let a = val.charAt(i)
        if (a.match(/[^\x00-\xff]/ig) != null) len += 2
        else len += 1
      }
      return len
    },
  },
  data() {
    const checkName = (rule, value, callback) => {
      if(!value) callback(new Error('请输入名称'))

      if(this.getByteLen(value) > 12) callback(new Error('名字最多输入12个字符'))
      callback()
    }
    const checkPrice = (rule, value, callback) => {
      if(value === '' || value === undefined || value === null) callback(new Error('请输入价格'))

      if(this.editTabValue === '1') {
        if(Number(value) < 0) callback(new Error('价格必须大于等于0'))
        if(Number(value) > 100) callback(new Error('价格必须小于等于100'))
        callback()
      } else if(this.editTabValue === '2') {
        if(Number(value) < 0) callback(new Error('价格必须大于等于0'))
        if(Number(value) > 500) callback(new Error('价格必须小于等于500'))
        callback()
      } else {
        if(Number(value) < 0) callback(new Error('价格必须大于等于0'))
        if(Number(value) > 1000) callback(new Error('价格必须小于等于1000'))
        callback()
      }
    }
    const checkTotal = (rule, value, callback) => {
      if(!value) callback(new Error('请输入数量'))

      if(Number(value) <= 0) callback(new Error('数量必须大于0'))
      if(Number(value) > 1000) callback(new Error('数量必须小于等于1000'))
      callback()
    }
    return {
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      qiniuToken: '',
      cropperVisible: false,

      formData: {
        image: '',
        name: '',
        price: '',
        color: '',
        nameplate_total: '',
        border: ''
      },
      formRules: {
        image: { required: true, message: '请上传图片' },
        name: { validator: checkName },
        price: { validator: checkPrice },
        nameplate_total: { validator: checkTotal },
        color: { required: true, message: '请选择铭牌色调' },
        border: { required: true, message: '请选择铭牌边框' }
      },
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 92, // 默认生成截图框宽度
        autoCropHeight: 58, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        full: true,      //是否输出原图比例的截图
        fixed: true,     //是否开启截图框宽高固定比例	
        fixedNumber: [92, 58],  //截图框的宽高比例	
        centerBox: true,  // 截图框是否被限制在图片里面
      },
      shengxiao: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗' ,'猪']
    }
  }
}
</script>

<style scoped>
.circle {
  cursor: pointer;
  display: inline-block;
  width: 40px;
  height: 40px;
  box-sizing: content-box;
  padding: 4px;
}
.checked {
  border: 1px red solid
}
.red {
  color: red;
}
.image {
  position: absolute;
  top: 0;
  left: 0;
}
.demo-upload-list{
    display: inline-block;
    width: 105px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin: 0px 4px;
  }
  .demo-upload-list img{
    width: 105px;
    height: 60px;
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