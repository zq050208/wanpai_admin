<template>
  <div class="publicmedal">
    <div class="header-box">
      <div>
        <Input v-model="keywords" placeholder="输入ID/昵称/手机号查询" style="width: 300px" />
        <Button class="search-btn" type="primary" @click="getMedalList">查询</Button>
      </div>
      <Button @click="addMedal">发放勋章</Button>
    </div>
    <div>
      <Table border :columns="medalColumns" :data="tableData" ref="table"></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="total"
        :current="pageParams.page"
        :page-size="pageParams.per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </div>
    <Modal v-model="medalModel" :mask-closable="false" title="发放勋章" @on-visible-change="commentVisibleChange">
      <Form :label-width="100" ref="handCommentData" :model="handCommentData" :rules="handCommentRuleInline">
      <FormItem label="选择勋章：" prop="id" style="margin-bottom: 20px">
        <Select style="width:300px" filterable remote @on-query-change='searchQueryChange' :remote-method='searchMedal' v-model="handCommentData.id" prefix="ios-search">
          <Option v-for="item in userData" :key="item.id" :value="item.id">{{item.name}}</Option>
        </Select>
        </FormItem>
        <FormItem label="输入用户：" prop="content">
          <Input  type="textarea" v-model="handCommentData.content" :autosize="{minRows: 5,maxRows: 8}" placeholder="请输入用户账号" style="width: 300px" />
          <br>
        <span style="display:inline-block;color:#ccc">Tips: 输入多个请用空格隔开</span>
        </FormItem>
        </Form>
        <div slot="footer">
            <Button type="primary" size="large" @click="handleSubmit">确定</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import { publicMedalList, sendMedalList, addMedalList } from '@/api/data'
  export default {
    name: 'publicmedal',
    data () {
      return {
        keywords: '',
        tableData: [],
        medalModel: false,
        userData: [],
        handCommentData:{
          content: '',
          id: ''
        },
        handCommentRuleInline: {
        id: [{ required: true, message: '请选择用户' }],
        content: [{ required: true, message: '请输入内容' }]
      },
        total: 0,
        pageParams: {
          page: 1,
          per_page: 10
        },
        medalColumns: [
        {
          title: '用户ID',
          key: 'user_id'
        },
        {
          title: '用户昵称',
          key: 'nickname'
        },
        {
          title: '手机号',
          key: 'username'
        },
        {
          title: '头像',
          key: 'avatar',
          width: '100px',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.avatar },
                style: { width: '50px', height: '50px', margin: 'auto' }
              })
            ])
          }
        },
        {
          title: '性别',
          key: 'sex'
        },
        {
          title: '已获得勋章',
          key: 'medal_list_val'
        }
      ],
      }
    },
    methods: {
      // 获取列表
      getMedalList () {
        let params = {
          ...this.pageParams,
          search: this.keywords
        }
        publicMedalList(params).then(res => {
          if (res.data.code === 200 && res.data.data) {
            res.data.data.data.forEach(item => {
              if (item.medal_list) {
                item.medal_list_val = item.medal_list.join('、')
              }
              if (item.gender == 2){
                item.sex = '女'
              } else if (item.gender == 1){
                item.sex = '男'
              } else{
                item.sex = '未知'
              }
            })
            this.tableData = res.data.data.data
            this.total = res.data.data.total
          }
        })
      },
      // 添加勋章
      addMedal () {
        this.medalModel = true
        this.sendMedalList()
      },
      // modal 勋章下拉默认
      sendMedalList () {
        let params = {
          search: ''
        }
        sendMedalList(params).then(res => {
          if (res.data.code === 200) {
            this.userData = res.data.data
          }
        })
      },
      //  输入搜索
      searchMedal(item){
        let params = {
          search: item
        }
        sendMedalList(params).then(res => {
          if (res.data.code === 200) {
            this.userData = []
            this.userData = res.data.data
          }
        })
      },
      // 输入搜索值改变
      searchQueryChange(val){
        if (!val) {
          this.sendMedalList()
        }
      },
      // modal框
      commentVisibleChange () {
        this.handCommentData = {}
        this.$refs.handCommentData.resetFields()
      },
      // 提交添加
      handleSubmit () {
        let reg = /^1[0123456789]\d{9}$/
        let mobileList = []
        if (this.handCommentData.content) {
          mobileList = this.handCommentData.content.trim().split(/\s+/)
          let isChecked = mobileList.every((item) => {
            return reg.test(item)
          })
          if(!isChecked){
            return this.$Message.warning('手机号格式不正确')
          }
        }
        let data = {
          medal_id: this.handCommentData.id,
          mobiles: `${JSON.stringify(mobileList)}`
        }
        // console.log(data, '000')
        this.$refs.handCommentData.validate((valid) => {
          if (valid) {
            addMedalList(data).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('操作成功')
                this.getMedalList()
                this.medalModel = false
              }
            })
          }
        })
      },
      handlePageChange (page) {
        this.pageParams.page = page
        this.getMedalList()
      },
      handlePageSizeChange (size) {
        this.pageParams.per_page = size
        this.getMedalList()
      }
    },
    mounted () {
      this.getMedalList()
      this.sendMedalList()
    }
  }
</script>  
<style lang="less" scoped>
.header-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  .search-btn{
    margin-left: 100px;
  }
}
.page {
  margin-top: 15px;
  text-align: center;
}
</style>