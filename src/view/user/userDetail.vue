<template>
  <div>
    <p style="padding:20px 0">用户基本信息</p>
    <Card >
      <div style="display:flex;  align-items: center">
        <div style="width:200px; border:1px solid #d7d7d7 ;display:flex;  justify-content: center;  align-items: center; flex-direction: column; height:200px">
          <p>用户头像</p>
          <img
            :src="userInfo.avatar"
            alt
            style="width:150px; height:150px; margin-top:2px; border:1px solid #d7d7d7"
          />
        </div>
        <!-- <span>{{userInfo.master_status === 0 ? "普通" ：userInfo.master_status === 1 ? "站内达人" ："站外达人"}}</span> -->
        <table class="userInfo">
          <tr>
            <td>用户ID</td>
            <td>{{userInfo.user_id}}</td>
            <td>昵称</td>
            <td>{{userInfo.nickname}}</td>
            <td>性别</td>
            <td>{{gender}}</td>
          </tr>
           <tr>
            <td>手机号</td>
            <td>{{userInfo.username}}</td>
            <!-- <td>会员属性</td>
            <td>XX会员</td> -->
            <td>达人属性</td>
            <td>{{userInfo.master_status === 0 ? '无' :userInfo.master_status === 1 ? '站内达人' :'站外达人'}}</td>
            <td>生日</td>
            <td>{{userInfo.birthday}}</td>
          </tr>
          <tr>
            <td>充值货币</td>
            <td>{{userInfo.p_coin}}</td>
            <td>提现货币</td>
            <td>{{userInfo.money}}</td>
            <td>积分货币</td>
            <td>{{userInfo.integral}}</td>
          </tr>
           <tr>
            <td>城市</td>
            <td>{{userInfo.city_name}}</td>
            <td>最近一次登录时间</td>
            <td>{{userInfo.login_time}}</td>
            <td>最近一次登录IP</td>
            <td>{{userInfo.ip_address_login}}</td>
          </tr>
           <tr>
            <td>注册时间</td>
            <td>{{userInfo.create_time}}</td>
            <td>用户来源</td>
            <td>{{userInfo.channel}}</td>
            <td>APP状态</td>
            <td>{{userInfo.app_user_status}}</td>
            <!-- <td style="color:#03bf16" v-if="userInfo.status == 1">启用中</td>
            <td class="color: red" v-else>禁用中</td> -->
          </tr>
          <tr>
            <td>分子派对状态</td>
            <td>{{userInfo.party_user_status}}</td>
          </tr>
        </table>
      </div>
    </Card>
    <p style="padding:20px 0">统计信息</p>
    <table class="messageTable">
      <tr>
        <th>浏览视频数</th>
        <th>浏览视频总时长</th>
        <th>历史评论次数</th>
        <th>启动APP历史次数</th>
        <th>浏览文章数</th>
        <th>浏览文章总时长</th>
      </tr>
      <tr>
        <td>{{statistics.video_num}}</td>
        <td>{{statistics.video_view_length}}</td>
        <td>{{statistics.comment_num}}</td>
        <td>{{statistics.start_up_num}}</td>
        <td>{{statistics.text_num}}</td>
        <td>{{statistics.text_view_length}}</td>
      </tr>
    </table>
      <p style="padding:20px 0">标签点击统计信息（仅记录最近观看的100个视频覆盖的标签）</p>
      <div class="statistics"  v-if="tag_list.length">
          <div class="statisticsbox" v-for="item in tag_list" :key="item.tag_id"> <span>{{item.name}}</span><span>{{item.click_num}}次点击</span></div>
      </div>
  </div>
</template>
<script>
import { getUserDetail } from '@/api/data.js'

export default {
  data () {
    return {
      w:0,
      userInfo: {
        master_status:'',
      },
      user_id: '',
      statistics: {},
      tag_list: [],
      gender: ''
    }
  },
  watch: {
    '$route' (to, from) {
      if(to.meta.title === from.meta.title && to.query.user_id !== from.query.user_id) {
        this.user_id = to.query.user_id
        this.getuserDetail()
      }
    }
  },
  mounted () {
    this.user_id = this.$route.query.user_id
    this.getuserDetail()
  },
  methods: {
    getuserDetail () {
      getUserDetail({ user_id: this.user_id }).then(res => {
        this.userInfo = res.data.data.user_info
        // if (this.userInfo.master_status === 0) {
        //   return '普通'
        // } else if (this.userInfo.master_status === 1) {
        //   return '站内达人'
        // } else {
        //   return '站外达人'
        // }
        if (this.userInfo.gender === 1) {
          this.gender = '男'
        } else if (this.userInfo.gender === 2) {
          this.gender = '女'
        } else {
          this.gender = '未知'
        }
        this.data = res.data.data.user_info.statistics
        this.statistics = res.data.data.user_info.statistics
        this.tag_list = res.data.data.user_info.tag_click_list
      })
    }
  }
}
</script>
<style scoped>
.userInfo,
 .userInfo tr,
.userInfo td,
.messageTable,
.messageTable tr,
.messageTable td,
.messageTable th{
    border: 1px solid #d7d7d7;
     border-collapse:collapse;
     background: #fff;
     text-align: center
}
.userInfo td{
    width: 200px;
}
.messageTable th,
.messageTable td{
  width: 150px;
  height: 40px;
}
.messageTable td{
  background: #fff;
}
.userInfo td:nth-child(odd){
    background: #f2f2f2;
    width: 150px;
    height: 50px;
}
.statistics{
    display: flex;
    text-align: center;
    width: 962px;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    border-top: 1px solid #d7d7d7;
    border-left: 1px solid #d7d7d7;
}
.statisticsbox{
    display: flex;
    background: #f2f2f2;
    border-bottom: 1px solid #d7d7d7
}
.statistics span{
    display: flex;
    width: 120px;
    justify-content: center;
    align-items: center;
    height: 40px;
    border-right: 1px solid #d7d7d7
}
.statistics span:nth-child(2n) {
    background: #fff;
}
</style>
