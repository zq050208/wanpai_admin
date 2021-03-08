<template>
  <Card>
    <TagModal
      :modalVisible="modalVisible"
      :hideModal="hideModal"
      :selectTags="selectTags"
      :defaultSelectTags="defaultSelectTags"
      @selectTagChange="selectTagChange"
      @closeTag="handleCloseTag"
    />
    <Tabs v-model="type">
      <TabPane v-if="mode !== 'add' && type === '2'" :label="mode === 'add' ? '发布视频' : '编辑视频'" name="2"></TabPane>
      <TabPane v-if="type === '1'" :label="mode === 'add' ? '发布图文' : '编辑图文'" name="1"></TabPane>
    </Tabs>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="12" :sm="18" :xs="24">
        <VideoForm
          v-if="type === '2'"
          :mode="mode"
          :accounts="accounts"
          :gameId="gameId"
          :formData="videoFormData"
          :rules="videoFormRules"
          :selectTags="selectTags"
          :loading="loading"
          @closeTag="handleCloseTag"
          @showModal="showModal"
          @hideModal="hideModal"
          @imgChange="url => videoFormData.cover = url"
          @videoChange="url => videoFormData.video_url = url"
          @handleReset="handleReset"
          @handleSubmit="handleFormSubmit"
        />
        <ImgForm
          v-if="type === '1'"
          :mode="mode"
          :accounts="accounts"
          :gameId="gameId"
          :formData="imgFormData"
          :rules="imgFormRules"
          :selectTags="selectTags"
          :loading="loading"
          @showModal="showModal"
          @closeTag="handleCloseTag"
          @handleReset="handleReset"
          @handleSubmit="handleFormSubmit"
          @imgChange="url => imgFormData.cover = url"
          @editorChange="html => imgFormData.introduce = html"
        />
        </Col>
    </Row>
  </Card>
</template>

<script>
import { getContentUserData, getContentCheckCode, addContentData, getContentInfo, editContentInfo, getGameData } from '@/api/data'
import { mapMutations } from 'vuex'

import TagModal from './addTagModal.vue'
import VideoForm from './videoForm.vue'
import ImgForm from './imgForm.vue'

export default {
  components: {
    TagModal,
    VideoForm,
    ImgForm
  },
  watch: {
    '$route' (to, from) {
      if(to.meta.title === from.meta.title && to.params.mode === 'edit' && to.params.id !== from.params.id) {
        this.getContentInfo({id: to.params.id})
        this.mode = 'edit'
        this.type = to.query.type
      } else if(to.meta.title === from.meta.title && to.params.mode === 'add') {
        this.videoFormData = {
          type: 2,
          user_id: '',
          title: '',
          video_url: '',
          cover: '',
          introduce: '',
          is_well: 0,
          parent_id: null,
          category_id: 0,
          tags: '',
          game_id: null
        }
        this.imgFormData = {
          type: 1,
          user_id: '',
          title: '',
          parent_id: null,
          category_id: 0,
          cover: '',
          is_well: 0,
          tags: '',
          introduce: '',
          game_id: null
        }
        this.type = '1'
        this.selectTags = []
        this.mode = 'add'
      }
    }
  },
  data () {
    const titleValidator = (rule, value, callback) => {
      if(!value) callback(new Error('请输入标题'))

      if(this.getByteLen(value) < 12 || this.getByteLen(value) > 60) {
        callback(new Error('请输入12到60个字符'))
      }
      callback()
    }
    return {
      mode: '',
      modalVisible: false,
      loading: false,
      type: '',
      accounts: [],
      gameId: [],
      selectTags: [],
      defaultSelectTags: [],
      videoFormData: {
        type: 2,
        user_id: '',
        title: '',
        video_url: '',
        cover: '',
        introduce: '',
        is_well: 0,
        parent_id: null,
        category_id: 0,
        tags: '',
        game_id: null
      },
      imgFormData: {
        type: 1,
        user_id: '',
        title: '',
        parent_id: null,
        category_id: 0,
        cover: '',
        is_well: 0,
        tags: '',
        introduce: '',
        game_id: null
      },
      imgFormRules: { 
        user_id: [{ required: true, message: '请选择发布账号' }],
        introduce: [{ required: true, message: '请输入内容' }],
        parent_id: [{ required: true, message: '请选择一级分类' }],
        cover: [{ required: true, message: '请上传封面图片' }],
        title: [
          { validator: titleValidator, trigger: 'blur, change' }
        ]
      },
      videoFormRules: {
        user_id: [{ required: true, message: '请选择发布账号' }],
        title: [
          { validator: titleValidator, trigger: 'blur, change' }
        ],
        video_url: [{ required: true, message: '请上传视频' }],
        parent_id: [{ required: true, message: '请选择一级分类' }],
        cover: [{ required: true, message: '请上传封面图片' }]
      }
    }
  },
  mounted () {
    this.getContentUserData()
    this.getgameData()
    const { params, query } = this.$route
    if (params.mode) {
      this.mode = params.mode
    }
    if (query.type) {
      this.type = query.type
    }
    if (params.id) {
      this.getContentInfo({ id: params.id })
    }
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    showModal () {
      this.modalVisible = true
    },
    // 获取游戏数据
    getgameData () {
      getGameData().then(res => {
        if (res.data.code === 200) {
          this.gameId = res.data.data
        }
      })
    },
    hideModal () {
      this.modalVisible = false
    },
    handleCloseTag (e, id) {
      this.selectTags = this.selectTags.filter(tag => tag.id !== id)
    },
    selectTagChange (selectTags) {
      this.selectTags = [...selectTags]
    },
    getContentInfo (data) {
      getContentInfo(data)
        .then(res => {
          if (res.data.code === 200) {
            if (res.data.data.tags) {
              this.selectTags = res.data.data.tags
              this.defaultSelectTags = res.data.data.tags
            }
            if (this.type === '1') {
              this.imgFormData = res.data.data
            } else {
              this.videoFormData = res.data.data
            }
          }
        })
    },
    editContentInfo (checkcode) {
      const data = this.type === '1' ? { ...this.imgFormData, checkcode } : { ...this.videoFormData, checkcode }
      data.is_well = Number(data.is_well)
      data.tags = this.selectTags.map(item => item.id).join(',')
      data.id = data.id
      if (this.mode === 'add') {
        addContentData(data)
          .then(res => {
            if (res.data.code === 200) {
              this.$Message.success('添加成功')
              this.closeTag(this.$route)
              this.$router.push({ path: '/content/content' })
            }
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
      } else if (this.mode === 'edit') {
        editContentInfo(data)
          .then(res => {
            if (res.data.code === 200) {
              this.$Message.success('修改成功')
              this.closeTag(this.$route)
              this.$router.push({ path: '/content/content' })
            }
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    getContentCheckCode () {
      return new Promise((resolve, reject) => {
        getContentCheckCode()
          .then(res => {
            if (res.data.code === 200) {
              resolve(res.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getContentUserData () {
      getContentUserData()
        .then(res => {
          if (res.data.code === 200) {
            this.accounts = res.data.data
          }
        })
    },
    handleReset() {
      this.selectTags = []
      this.imgFormData = {
        type: 1,
        user_id: '',
        title: '',
        parent_id: null,
        category_id: 0,
        cover: '',
        is_well: 0,
        tags: '',
        introduce: ''
      }
      this.videoFormData = {
        type: 2,
        user_id: '',
        title: '',
        video_url: '',
        cover: '',
        introduce: '',
        is_well: 0,
        parent_id: null,
        category_id: 0,
        tags: ''
      }
    },
    handleFormSubmit () {
      this.loading = true
      this.getContentCheckCode()
        .then(res => {
          this.editContentInfo(res.data.checkcode)
        })
        .catch(() => {
          this.loading = false
        })
    },
    getByteLen(val) {
      let len = 0
      for (let i = 0; i < val.length; i++) {
        let a = val.charAt(i)
        if (a.match(/[^\x00-\xff]/ig) != null) len += 2
        else len += 1
      }
      return len
    }
  }
}
</script>
