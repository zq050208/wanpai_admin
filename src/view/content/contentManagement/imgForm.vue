<template>
  <Form
    ref="editForm"
    :model="formData"
    :rules="rules"
    :label-width="100"
    label-position="right"
  >
    <FormItem label="发布账号：" prop="user_id">
      <Select v-model="formData.user_id" :disabled="mode === 'edit'">
        <Option
          v-for="item in accounts"
          :key="item.user_id"
          :value="item.user_id"
        >{{ item.nickname }}</Option>
      </Select>
    </FormItem>

    <FormItem label="标题：" prop="title" required>
      <Input v-model="formData.title" placeholder="请输入视频标题（6-30字）" />
    </FormItem>

    <!-- <FormItem label="分类：" prop="parent_id">
      <Row type="flex" justify="space-between" :gutter="16">
        <Col span="12">
          <Select placeholder="一级分类" v-model="formData.parent_id" @on-change="handleSelectChange">
            <Option v-for="item in category1" :key="item.id" :value="item.id">{{ item.cate_name }}</Option>
          </Select>
        </Col>
        <Col span="12">
          <Select placeholder="二级分类" :disabled="!formData.parent_id" v-model="formData.category_id">
            <Option v-for="item in category2" :key="item.id" :value="item.id">{{ item.cate_name }}</Option>
          </Select>
        </Col>
      </Row>
    </FormItem> -->
    <FormItem label="所属游戏" >
      <Select v-model="formData.game_id">
        <Option
          v-for="item in gameId"
          :key="item.id"
          :value="item.id"
        >{{ item.name }}</Option>
      </Select>
    </FormItem>

    <FormItem label="封面：" prop="cover">
      <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
        <template v-if="item.status === 'finished'">
          <img :src="item.url" >
          <div class="demo-upload-list-cover">
            <Icon type="ios-trash-outline" @click="handleRemoveImg(item)"></Icon>
          </div>
        </template>
        <template v-else>
          <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
        </template>
      </div>
      <Upload
        ref="upload"
        :show-upload-list="false"
        :format="['jpg','jpeg','png']"
        type="drag"
        action="//upload-z2.qiniu.com"
        :data="{ token: qiniuToken }"
        :on-format-error="handleFormatError"
        :before-upload="handleBeforeUpload"
        :on-success="handleImgSuccess"
        style="display: inline-block; width: 58px;"
      >
        <div style="width: 58px;height:58px;line-height: 58px;">
          <Icon type="ios-cloud-upload-outline" size="20"></Icon>
        </div>
      </Upload>
      <p>只能上传jpg/png/jpeg格式文件，宽高比1.77</p>
    </FormItem>

    <FormItem label="内容：" prop="introduce">
      <!-- <Editor
        :value="formData.introduce"
        :cache="false"
        @setValid="setValid"
        @on-change="handleEditorChange"
      /> -->
      <Editor
        :value="formData.introduce"
        @on-change="handleEditorChange"
      />
    </FormItem>

    <!-- <FormItem label="栏目收录：" prop="is_well">
      <Checkbox v-model="formData.is_well" :true-value="1" :false-value="0">游戏头条</Checkbox>
    </FormItem> -->

    <FormItem label="标签：" required>
      <div class="tag">
        <Tag
          closable
          type="border"
          size="large"
          v-for="tag in selectTags"
          :key="tag.id"
          :name="tag.id"
          @on-close="handleCloseTag"
        >{{ tag.name }}</Tag>
        <a
          v-if="selectTags.length < 10"
          @click="$emit('showModal')"
        >+添加标签（{{ selectTags.length }}/10）
        </a>
      </div>
    </FormItem>

    <FormItem>
      <Button type="primary" size="large" :loading="loading" @click="handleSubmit">提交</Button>
      <Button v-if="mode === 'add'" style="margin-left: 8px" size="large" @click="handleReset">重置</Button>
    </FormItem>
  </Form>
</template>

<script>
import { getQiniuToken, getCategoryData } from '@/api/data'
// import Editor from '@/components/editor'
import Editor from '@/components/quillEditor'

const baseImgUrl = 'https://cdn.tinytiger.cn/'

export default {
  components: {
    Editor
  },
  props: {
    accounts: {
      type: Array,
      required: true
    },
    gameId: {
      type: Array,
      required: true
    },
    formData: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      required: true
    },
    selectTags: {
      type: Array,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      qiniuToken: '',
      uploadList: [],
      category1: [],
      category2: [],
      introduceValid: false
    }
  },
  watch: {
    formData (val) {
      if (val.cover) {
        this.uploadList = [{
          status: 'finished',
          url: val.cover
        }]
      } else {
        this.uploadList = []
      }
      if (val.parent_id) {
        this.getCategoryData({
          level: 2,
          pid: this.formData.parent_id
        }, 2)
      }
    }
  },
  mounted () {
    this.getQiniuToken()
    this.getCategoryData({ level: 1 }, 1)
  },
  methods: {
    setValid (valid) {
      this.introduceValid = valid
    },
    formatFile (file) {
      return new Promise((resolve, reject) => {
        const name = file.name // 文件名
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          const src = e.target.result
          const img = new Image()
          img.src = src
          img.onload = (e) => {
            const w = img.width
            const h = img.height
            const quality = 0.7 // 默认图片质量为0.92
            // 生成canvas
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            // 创建属性节点
            const anw = document.createAttribute('width')
            anw.nodeValue = w
            const anh = document.createAttribute('height')
            anh.nodeValue = h
            canvas.setAttributeNode(anw)
            canvas.setAttributeNode(anh)

            // 铺底色 PNG转JPEG时透明区域会变黑色
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, w, h)

            ctx.drawImage(img, 0, 0, w, h)
            // quality值越小，所绘制出的图像越模糊
            const base64 = canvas.toDataURL('image/jpeg', quality) // 图片格式jpeg或webp可以选0-1质量区间

            // 返回base64转blob的值
            // console.log(`原图${(src.length/1024).toFixed(2)}kb`, `新图${(base64.length/1024).toFixed(2)}kb`);
            // 去掉url的头，并转换为byte
            const bytes = window.atob(base64.split(',')[1])
            // 处理异常,将ascii码小于0的转换为大于0
            const ab = new ArrayBuffer(bytes.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < bytes.length; i++) {
              ia[i] = bytes.charCodeAt(i)
            }
            file = new Blob([ab], { type: 'image/jpeg' })
            file.name = name
            // this.$refs.upload.post(file)
            resolve(file)
          }
          img.onerror = (e) => {
            reject(e)
          }
        }
        reader.onerror = (e) => {
          reject(e)
        }
      })
    },
    handleBeforeUpload (file) {
      this.uploadList = []
      if (file.size < 1024 * 1024) return true

      if (file.size > 1024 * 1024 * 10) {
        this.$Modal.error({ title: '文件 ' + file.name + ' 太大，不能超过 10M。' })
        return false
      }

      this.formatFile(file).then(res => {
        if (res.size <= 1024 * 1024) {
          this.$refs.upload.post(res)
        } else {
          this.handleBeforeUpload(res)
        }
      })
      return false
    },
    handleRemoveImg (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.$emit('imgChange', '')
    },
    handleImgSuccess (response) {
      const imgUrl = baseImgUrl + response.key
      this.uploadList.push({
        status: 'finished',
        url: imgUrl
      })
      this.$emit('imgChange', imgUrl)
    },
    handleFormatError (file) {
      this.$Modal.error({
        title: '文件格式不正确',
        content: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    getQiniuToken () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    getCategoryData (data, level) {
      getCategoryData(data)
        .then(res => {
          if (res.data.code === 200) {
            if (level === 1) {
              this.category1 = res.data.data
            }
            if (level === 2) {
              this.category2 = res.data.data
              if (res.data.data.length === 0) {
                this.formData.category_id = null
              }
            }
          }
        })
    },
    handleEditorChange (html) {
      this.$emit('editorChange', html)
    },
    handleSelectChange (pid) {
      this.getCategoryData({ level: 2, pid }, 2)
    },
    handleCloseTag (e, id) {
      this.$emit('closeTag', e, id)
    },
    handleSubmit () {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          if (this.selectTags.length === 0) {
            this.$Modal.error({
              title: '请选择标签'
            })
            return
          }
          // if(!this.introduceValid) {
          //   this.$Modal.error({
          //     title: '请输入有效内容'
          //   })
          //   return
          // }
          this.$emit('handleSubmit')
        }
      })
    },
    handleReset () {
      this.$refs.editForm.resetFields()
      this.$emit('editorChange', '')
      this.$emit('handleReset')
    }
  }
}
</script>

<style scoped>
.tag {
  width: 100%;
  height: 160px;
  border: 1px solid #dcdee2;
  padding: 8px;
  overflow: scroll;
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
