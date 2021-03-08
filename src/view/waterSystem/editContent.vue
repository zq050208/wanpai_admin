<template>
  <Card>
    <p slot="title">资讯内容详情</p>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="14" :sm="18" :xs="24">
      <Card>
        <p style="text-align: center" slot="title">{{ contentData.title }}</p>
        <img v-if="type === '1'" :src="contentData.cover" alt="" style="width: 100%" />
        <video v-if="type === '2'" id="video" controls style="width: 100%; height: 500px" name="media">
          <source type="video/mp4" :src="contentData.video_url">
        </video>
        <div class="container">
          <div class="avatar">
            <Avatar size="large" :src="contentData.avatar" />
          </div>
          <div class="user-info">
            <p class="user-name">{{ contentData.nickname }}</p>
            <p>{{ contentData.create_time }}发布</p>
          </div>
        </div>

        <div class="container" v-html="contentData.introduce"></div>

        <div class="desc">
          <Row>
            <Col span="12">
              <p>{{ contentData.view_num }}浏览 / {{ contentData.comment_num }}评论 / {{ contentData.like_num }}赞</p>
            </Col>
            <Col span="12" style="text-align: right; color: #2d8cf0; font-size: 16px">
              <span style="cursor: pointer;margin-right: 15px;" @click="showCommentModal"><Icon type="md-text" />评论</span>
              <span style="cursor: pointer;" @click="showLiveModal"><Icon type="md-thumbs-up" />点赞</span>
            </Col>
          </Row>
        </div>

      </Card>
      </Col>
    </Row>
    <!-- 评论弹框 -->
    <Modal v-model="commentVisible" title="评论配置" :mask-closable="false" width="600"  @on-visible-change="commentVisibleChange">
      <Tabs :value="String(tabIndex)" @on-click="tabClick">
        <TabPane label="自动评论" name="0"></TabPane>
        <TabPane label="手动评论" name="1"></TabPane>
      </Tabs>
      <!-- 自动评论 -->
      <div v-show="tabIndex === 0">
        <Form :label-width="100" ref="commentData" :model="commentData" :rules="commentDataRuleInline">
          <FormItem label="选择用户组:" prop="user_group_id" style="magin-bottom: 10px">
            <div>
              <Select style="width:300px" filterable v-model="commentData.user_group_id" prefix="ios-search"  >
                <Option v-for="item in groupData" :key="item.id" :value="item.id" @click.native="groupDataChange(item)" :label="item.name"></Option>
              </Select>
              <div v-if="user_num" style="color:#bebebe">{{user_num}}位用户</div>
            </div>
          </FormItem>
          <FormItem label="选择评论组:" prop="comment_group_id">
            <div>
              <Select style="width:300px" filterable v-model="commentData.comment_group_id" prefix="ios-search">
                <Option v-for="item in assessGroupData" :key="item.id" @click.native="assessGroupDataChange(item)" :value="item.id">{{item.name}}</Option>
              </Select>
              <div v-if="assess_num" style="color:#bebebe">{{assess_num}}条评论</div>
            </div>
          </FormItem>
          <FormItem label="完成时间:"  required>
            <div style="display: flex">
              <FormItem prop="start_time"> <DatePicker @on-change="startTimeChange" :options="startTimeOption" type="datetime" v-model="commentData.start_time" format="yyyy-MM-dd HH:mm:ss"  placeholder="请选择开始时间" style="width: 180px"></DatePicker></FormItem>
              <div style="margin: 0 10px">——</div>
              <FormItem prop="end_time"> <DatePicker @on-change="endTimeChange" :options="endTimeOption" type="datetime" v-model="commentData.end_time" format="yyyy-MM-dd HH:mm:ss"  placeholder="请选择完成时间" style="width: 180px"></DatePicker> </FormItem>
            </div>
          </FormItem>
          <FormItem label="评论间隔:" required>
            <div style="display: flex">
              <FormItem prop="start">
                <InputNumber v-model="commentData.start" style="margin-right:5px; width: 100px"></InputNumber>s
              </FormItem>
              <div style="margin: 0 10px">——</div>
              <FormItem prop="end">
                <InputNumber v-model="commentData.end" style="margin-right:5px; width: 100px"></InputNumber>s
              </FormItem>
            </div>
          </FormItem>

           <FormItem label="同步点赞:"><Checkbox v-model="checked"></Checkbox></FormItem>
           <FormItem v-if="checked" label="点赞比例:" prop="like_num" >
               <InputNumber v-model="commentData.like_num" :max="100" :min="1" style="margin-right:5px; width: 100px"></InputNumber>
               <span v-if="checked">%</span>
            </FormItem>
          <div style="font-size:12px; color:#bebebe">提示：当用户组数量=评论组数量时，评论会一对一匹配；当用户组数量＞评论组数量时，评论将会一对一匹配用户，剩余用户挂空不评论；当用户组数量＜评论组数量时，用户组将会随机一对多条评论</div>
        </Form>
      </div>
      <!-- 手动评论 -->
      <div v-show="tabIndex === 1">
        <Form :label-width="100" ref="handCommentData" :model="handCommentData" :rules="handCommentRuleInline">
          <FormItem label="选择用户:" prop="user_id" style="margin-bottom: 20px">
            <Select style="width:300px" filterable  v-model="handCommentData.user_id" prefix="ios-search">
              <Option v-for="item in userData" :key="item.user_id" :value="item.user_id">{{item.nickname}}</Option>
            </Select>
          </FormItem>
          <FormItem label="评论内容:" prop="content">
            <Input  type="textarea" maxlength="1000" v-model="handCommentData.content" :autosize="{minRows: 5,maxRows: 8}" show-word-limit placeholder="请输入评论内容！" style="width: 300px" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="display: flex;justify-content: center">
        <Button type="success" @click="addCommentClick()" :loading="loading">发布评论</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import { getContentInfo, getUserData, getCommentGroupData, getUserGroupData, autoCommentContent, addCommentContent, likeContent } from '@/api/data'
import { mapMutations } from 'vuex'
export default {
  name: 'editContent',
  watch: {
    '$route' (to, from) {
      if (to.meta.title === from.meta.title && to.query.id !== from.query.id) {
        this.type = to.query.type
        this.commentData.content_id = to.query.id
        this.getContentInfo()
      }
    }
  },
  data () {
    const commenttimeValidator = (rule, value, callback) => {
      if (!value) callback(new Error('请输入评论间隔结束时间'))
      if (this.commentData.end < this.commentData.start) callback(new Error('完成间隔时间需大于开始时间'))
      callback()
    }
    const timeValidator = (rule, value, callback) => {
      if (!value) callback(new Error('请输入完成时间'))
      var start = this.getUnixTime(this.commentData.start_time)
      var end = this.getUnixTime(this.commentData.end_time)
      if (end <= start) callback(new Error('完成时间需大于开始时间'))
      callback()
    }
    const likeNumValidator = (rule, value, callback) => {
      if (!value) callback(new Error('请输入点赞比例'))
      if (value > 100 || value < 0) {
        callback(new Error('请输入正确比例1-100'))
      }
      callback()
    }
    return {
      loading: false,
      tabIndex: 0,
      checked: false,
      groupData: [], // 用户组
      assessGroupData: [], // 评论组
      userData: [], // 用户
      user_num: null, // 用户数量
      assess_num: null, // 评论数量
      commentData: {
        content_id: null, // 内容id
        parent_user_id: null, // 发布者id
        user_group_id: null, // 用户组id
        comment_group_id: null, // 评论组id
        like_num: null, // 点赞百分数
        start_time: '',
        end_time: '',
        start: null,
        end: null
      },
      handCommentData: {
        content_id: null,
        user_id: null,
        content: ''
      },
      commentVisible: false,
      type: '',
      id: '',
      contentData: {},
      addVal: null,
      handCommentRuleInline: {
        user_id: [{ required: true, message: '请选择用户' }],
        content: [{ required: true, message: '请输入内容' }]
      },
      commentDataRuleInline: {
        user_group_id: [{ required: true, message: '请选择用户组' }],
        comment_group_id: [{ required: true, message: '请选择评论组' }],
        start_time: [{ required: true, message: '请选择开始时间' }],
        end_time: [{ validator: timeValidator }],
        start: [{ required: true, message: '请输入评论间隔' }],
        end: [{ validator: commenttimeValidator }],
        like_num: [{ validator: likeNumValidator }]
      },
      startTimeOption: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      },
      endTimeOption: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    init () {
      const { query } = this.$route
      if (query.type) this.type = query.type
      if (query.id) {
        this.handCommentData.content_id = this.commentData.content_id = this.$route.query.id
        this.getContentInfo()
      }
    },
    /**
     * 获取资讯详情
     */
    getContentInfo () {
      getContentInfo({ id: this.commentData.content_id }).then(res => {
        if (res.data.code === 200) {
          this.contentData = res.data.data
          this.commentData.parent_user_id = res.data.data.user_id
          if (this.type == '2') {
            this.componentDidMount()
          }
        }
      })
    },
    componentDidMount () {
      const video = document.getElementById('video')
      if (Hls.isSupported()) {
        const hls = new Hls()
        this.hls = hls
        hls.loadSource(this.contentData.video_url)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play()
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = this.contentData.video_url
        video.addEventListener('loadedmetadata', function () {
          video.play()
        })
      }
    },
    commentVisibleChange (visible) {
      if (!visible) {
        this.tabIndex = 0
        this.$refs.commentData.resetFields()
        this.$refs.handCommentData.resetFields()
        this.commentData.like_num = null
      }
    },
    /**
     * 显示点赞弹窗
     */
    showLiveModal () {
      this.addVal = null
      this.$Modal.confirm({
        title: '编辑点赞',
        render: (h) => {
          return h('Input', {
            props: {
              type: 'number',
              value: this.addVal,
              placeholder: '输入点赞数量',
              maxlength: 10
            },
            style: { width: '100%' },
            on: {
              'on-blur': (event) => {
                this.addVal = Number(event.target.value)
                console.log(this.addVal)
              }
            }
          })
        },
        onOk: () => {
          if (this.addVal) {
            this.likeContent()
          } else {
            this.$Message.error('请输入点赞数量')
          }
        }
      })
    },
    // 日期格式转时间戳
    getUnixTime (dateStr) {
      var newstr = dateStr.replace(/-/g, '/')
      var date = new Date(newstr)
      var time_str = date.getTime().toString()
      return time_str.substr(0, 10)
    },
    // 获取用户组
    getUserGroup () {
      getUserGroupData().then(res => {
        if (res.data.code === 200) {
          this.groupData = res.data.data
        }
      })
    },
    // 获取评论组
    getCommentGroupData () {
      getCommentGroupData({ page: 1, per_page: 1000, status: 1 }).then(res => {
        if (res.data.code === 200) {
          this.assessGroupData = res.data.data
        }
      })
    },
    // 选择用户
    getUser () {
      getUserData().then(res => {
        if (res.data.code === 200) {
          this.userData = res.data.data
        }
      })
    },
    // 评论点击
    tabClick (name) {
      this.tabIndex = Number(name)
      if (this.tabIndex === 0) {
        this.$refs.commentData.resetFields()
        this.user_num = null
        this.assess_num = null
        this.commentData.like_num = null
      } else {
        this.$refs.handCommentData.resetFields()
      }
    },
    // 开始时间
    startTimeChange (date) {
      this.commentData.start_time = date
    },
    endTimeChange (date) {
      this.commentData.end_time = date
    },
    // 用户组值改变
    groupDataChange (item) {
      this.user_num = item.user_num
    },
    // 用户评论数量改变
    assessGroupDataChange (item) {
      this.assess_num = item.comment_num
    },
    // 发布评论
    addCommentClick () {
      if (this.tabIndex === 0) {
        // 自动评论
        this.$refs.commentData.validate((valid) => {
          if (valid) {
            this.loading = true
            autoCommentContent(this.commentData).then(res => {
              this.loading = false
              if (res.data.code === 200) {
                this.$Message.success(res.data.msg)
                this.commentVisible = false
                this.commentData.like_num = null
                this.user_num = null
                this.assess_num = null
                this.getContentInfo()
              }
            })
          }
        })
      } else {
        // 手动评论
        this.$refs.handCommentData.validate((valid) => {
          if (valid) {
            this.loading = true
            addCommentContent(this.handCommentData).then(res => {
              this.loading = false
              if (res.data.code === 200) {
                this.tabIndex = 0
                this.$Message.success(res.data.msg)
                this.commentVisible = false
                this.getContentInfo()
              }
            })
          }
        })
      }
    },
    // 资讯点赞
    likeContent () {
      let data = {
        content_id: this.commentData.content_id,
        user_num: this.addVal,
        parent_user_id: this.commentData.parent_user_id
      }
      console.log(data)
      likeContent(data).then(res => {
        console.log(res)
        if (res.data.code === 200) {
          this.$Message.success(res.data.msg)
          this.getContentInfo()
        }
      })
    },
    showCommentModal () {
      this.commentVisible = true
      this.getUserGroup()
      this.getCommentGroupData()
      this.getUser()
    }
  }
}
</script>

<style scoped>
.container {
  margin: 20px 0;
  padding: 6px 0;
  word-break: break-word;
}
.avatar {
  display: inline-block;
  margin-right: 12px;
  box-sizing: border-box;
  vertical-align: top;
  height: 50px;
  width: 50px;
}
.user-info {
  display: inline-block;
  vertical-align: top;
  width: calc(100% - 62px);
}
.desc {
  color: #666;
  position: relative;
}
.replys {
  background-color: #f2f2f2;
  padding: 12px;
  margin-left: 52px;
  margin-top: 18px;
}

.user-name {
  font-size: 18px;
}
</style>
