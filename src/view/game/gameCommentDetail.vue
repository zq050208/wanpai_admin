<template>
  <Card>
    <p slot="title">游戏评价详情</p>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="14" :sm="18" :xs="24">
        <Card>
            <div class="container">
            <div class="avatar">
              <Avatar size="large" :src="contentData.avatar" />
            </div>
            <div class="user-info">
              <p class="user-name">{{ contentData.nickname }}</p>
              <p>{{ contentData.create_time }}发布</p>
            </div>
          </div>
          <p style="font-size:20px; text-align: center">{{ contentData.title }}</p>
          <div class="container contentMain" v-html="contentData.content"></div>

          <div class="desc">
            <p>{{ contentData.view_num }}浏览 / {{ contentData.comment_num }}评论 / {{ contentData.like_num }}赞</p>
            <p style="margin-top: 12px"><Icon type="ios-chatbubbles" /> 全部评论 {{ contentData.comment_num }}</p>
          </div>
          <Divider v-if="commentData.length > 0" />
          <div v-if="commentData.length > 0" v-for="item in commentData" :key="item.id" class="container">
            <div class="avatar">
              <Avatar size="large" :src="item.avatar" />
            </div>
            <div class="user-info">
              <p>{{ item.nickname }}</p>
              <p>{{ item.content }}</p>
              <p>{{ item.create_time }}</p>
            </div>
            <div class="replys" v-if="item.replys && item.replys.length > 0">
              <div v-if="!item.showAllReplays" v-for="i in item.replys.slice(0, 3)">{{i.commentUserinfo ? `${i.replysUserinfo.nickname} 回复 ${i.commentUserinfo.nickname}` : i.replysUserinfo.nickname}}：{{i.content}}</div>
              <div v-if="item.showAllReplays" v-for="i in item.commentData2">{{i.secCommentUserinfo ? `${i.nickname} 回复 ${i.secCommentUserinfo.nickname}` : i.nickname}}：{{i.content}}</div>

              <!-- <div v-if="!showAllReplays" v-for="i in item.replys.slice(0, 3)">{{i.replysUserinfo.nickname}}：{{i.content}}</div>
              <div v-if="showAllReplays" v-for="i in commentData2">{{i.nickname}}：{{i.content}}</div> -->
              <p v-if="item.comment_num > 3 && !item.showAllReplays" style="text-align: left"><a @click="viewAllReply(item)">查看全部{{item.comment_num}}条回复</a></p>
            </div>
          </div>
          <Divider />
          <p style="text-align: center"><a @click="addComment">{{ commentData.length === totalComment ? '没有更多评论' : '点击加载更多' }}</a></p>

        </Card>
      </Col>
    </Row>
  </Card>
</template>
<script>
import Hls from 'hls.js'
import { getGameAssessInfo, getGamedetailComment } from '@/api/data'
export default {
  watch: {
    '$route' (to, from) {
      if (to.meta.title === from.meta.title && to.query.id !== from.query.id) {
        this.type = to.query.type
        this.getContentInfo({ assess_id: to.query.id })
        this.content_id = to.query.id
        this.getContentCommentList({
          assess_id: to.query.id
        })
      }
    }
  },
  data () {
    return {
      type: '',
      content_id: null,
      contentData: {},
      commentData: [],
      totalComment: 0,
      pageParams: {
        page: 1,
        per_page: 15
      }
    }
  },
  mounted () {
    const { query } = this.$route
    if (query.id) {
      this.getContentInfo({ assess_id: query.id })
      this.content_id = query.id
      this.getContentCommentList({
        assess_id: query.id
      })
    }
  },
  methods: {
    viewAllReply (item) {
      this.commentData.forEach(i => {
        if (i.id === item.id) {
          i.showAllReplays = true
        }
      })
      this.getContentCommentList({
        assess_id: this.content_id,
        comment_id: item.id,
        per_page: item.comment_num
      }, item)
    },
    addComment () {
      this.pageParams.per_page = this.pageParams.per_page + 15
      this.getContentCommentList({
        assess_id: this.content_id
      })
    },
    getContentInfo (data) {
      getGameAssessInfo(data).then(res => {
        if (res.data.code === 200) {
          this.contentData = res.data.data
        }
      })
    },
    formatCommentData (data) {
      return data.map(item => {
        return {
          ...item,
          showAllReplays: false,
          commentData2: []
        }
      })
    },
    getContentCommentList (params, comment) {
      const data = {
        ...this.pageParams,
        ...params
      }
      getGamedetailComment(data).then(res => {
        if (res.data.code === 200) {
          if (data.comment_id) {
            this.commentData.forEach(i => {
              if (i.id === comment.id) {
                i.commentData2 = res.data.data.data
              }
            })
          } else {
            this.totalComment = res.data.data.total
            this.commentData = this.formatCommentData(res.data.data.data)
          }
        }
      })
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
  color: #666
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
<style >
img {
    width: 100%
}
</style>
