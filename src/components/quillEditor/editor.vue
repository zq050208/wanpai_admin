<template>
  <div>
    <Upload
      ref="upload"
      style="display: none"
      action="//upload-z2.qiniu.com"
      :data="{ token: qiniuToken }"
      :format="['jpg','jpeg','png']"
      :show-upload-list="false"
      :on-success="handleImgSuccess"
      :on-format-error="handleImgFormatError"
    >
      <Button icon="ios-cloud-upload-outline"></Button>
    </Upload>
    <quill-editor
      v-model="content"
      ref="quillEditor"
      :options="editorOption"
      @focus="onEditorFocus($event)"
      @blur="onEditorBlur($event)"
      @change="onEditorChange($event)">
    </quill-editor>
  </div>
</template>

<script>
import { getQiniuToken } from '@/api/data'
import Video from './video.js'
import Quill from "quill";

// 工具栏配置
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],

  [{'header': 1}, {'header': 2}],               // custom button values
  [{'list': 'ordered'}, {'list': 'bullet'}],
  [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
  [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
  [{'direction': 'rtl'}],                         // text direction

  [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
  [{'header': [1, 2, 3, 4, 5, 6, false]}],

  [{'color': []}, {'background': []}],          // dropdown with defaults from theme
  [{'font': []}],
  [{'align': []}],
  ['link', 'image', 'video'],
  ['clean']                                         // remove formatting button
]

const baseUrl = 'https://cdn.tinytiger.cn/'

export default {
  props: {
    value: {
      default: ''
    }
  },
  watch: {
    value (val) {
      this.content = val
    }
  },
  data () {
    return {
      qiniuToken: '',

      editor: null, // 富文本编辑器对象
      content: '', // 富文本编辑器默认内容
      editorOption: { //  富文本编辑器配置
        modules: {
          toolbar: {
            container: toolbarOptions,  // 工具栏
            handlers: {
              'image': function (value) {
                if (value) {
                  document.querySelector('.ivu-upload .ivu-btn').click()
                } else {
                  this.quill.format('image', false);
                }
              }
            }
          }
        },
        theme: 'snow',
        placeholder: '请输入正文'
      }
    }
  },
  mounted () {
    this.editor = this.$refs.quillEditor.quill
    Quill.register(Video, true)
    getQiniuToken().then(res => {
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken
      }
    })
  },
  beforeDestroy () {
    this.editor = null
    delete this.editor
  },
  methods: {
    handleImgSuccess(res) {
      let quill = this.$refs.quillEditor.quill
      // 获取光标所在位置
      let length = quill.getSelection().index;
      // 插入图片，res为服务器返回的图片链接地址
      quill.insertEmbed(length, 'image', baseUrl + res.key)
      // 调整光标到最后
      quill.setSelection(length + 1)
    },
    handleImgFormatError(file) {
      this.$Modal.error({
        title: '文件格式不正确',
        content: '文件 ' + file.name + ' 格式不正确,请按要求上传'
      })
    },
    // 准备富文本编辑器
    onEditorReady (editor) {},
    // 富文本编辑器 失去焦点事件
    onEditorBlur (editor) {},
    // 富文本编辑器 获得焦点事件
    onEditorFocus (editor) {},
    // 富文本编辑器 内容改变事件
    onEditorChange (editor) {
      this.$emit('on-change', editor.html)
    }
  }
}
</script>
