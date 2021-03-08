<template>
  <div>
    <div class="head_btn">
      <Button type="primary" @click="addPosts" style="margin-bottom: 8px;" :disabled="tableData.length >= 5">添加置顶帖子</Button>
    </div>
    <Table
      border
      stripe
      :data="tableData"
      :columns="columns"
    />
    <modal v-model="addPostModal" title="添加置顶帖子" width="400" footer-hide>
      <input type="text" placeholder="请输入帖子id" v-model="postsId" name="tel" oninput="value=value.replace(/[^\d]/g,'')" maxlength="9" 
      style="width: 300px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"/>
      <div style="text-align:center;margin-top: 15px;">
        <Button type="primary" @click="confirm">确定</Button>
      </div>
    </modal>
    <modal v-model="postsContModal" title="查看帖子内容" width="60%" footer-hide>
      <div class="header">
        <img :src="postCont.avatar" alt="" class="user_pic">
        <div class="user_name">
          <h2>{{postCont.nickname}}</h2>
          <p>{{postCont.user_create_time}}</p>
        </div>
      </div>
      <p class="content"><span v-for="item in postCont.topic_circle_list" style="color:#F59A23;">#{{item}}</span><span v-if="postCont.topic_circle_list.length > 0" style="color:#F59A23;">#</span>{{postCont.content}}</p>
    </modal>
  </div>
</template>

<script>
import { 
  getCirclePostModularList, 
  editCirclePostModular, 
  bannerTemp_addView, 
  delCirclePostModular, 
  setTopcirclePostModular, 
} from '@/api/data'
export default {
  components: {
    
  },
  data () {
    return {
      addPostModal: false, // 添加置顶帖子弹窗
      postsContModal: false, // 查看帖子弹窗
      postCont: {
        avatar: 'http://cdn.tinytiger.cn/user/user2.jpg',
        nickname: '当世间没有下雨天',
        user_create_time: '03-20 18:20:20',
        content: '​当世间没有下雨天！剧里黄晓明成功脱油，尹正特别惊艳，全程狂飙当世间没有下雨天！剧里黄晓明成功脱油，尹正特别惊艳，全程狂飙',
        topic_circle_list: []
      },
      tableData: [],
      circleId: this.$route.query.id,
      // circleId: 3,
      postsId: '', // 帖子ID
      columns: [
        {
          align: 'center',
          title: '序号',
          render: (h, params) => {
            return h('div', [
              h('span', {}, params.row.id),
            ])
          }
        },
        {
          align: 'center',
          title: '用户昵称',
          key: 'nickname'
        },
        {
          align: 'center',
          title: '帖子内容',
           render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin-right': '8px'
                  },
                  on: {
                    click: () => {
                      this.lookContent(params.index)
                     
                    }
                  }
                },
                '查看内容'
              )
            ])
          }
        },
        {
          title: '帖子图片',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('viewer',
                {
                  style: { width: '52px', height: '52px', overflow: 'hidden', margin: '3px auto', }
                },
                params.row.img_url && JSON.parse(params.row.img_url).map(i => h('img', {
                  attrs: { src: i},
                  style: { width: '52px', height: '52px', margin: '0 auto' }
                }))
              ),
              h('span', {}, params.row.img_url ? JSON.parse(params.row.img_url).length + '张' : '')
            ])
          }
        },
        {
          align: 'center',
          title: '圈子/模块',
          render: (h, params) => {
            return h('div', [
              h('span', {}, params.row.circle_name + '-'),
              h('span', {}, params.row.tab_name),
            ])
          }
        },
        {
          align: 'center',
          title: '携带话题',
          render: (h,params) => { 
            return h('div', {},
            params.row.topic_circle_list && JSON.parse(params.row.topic_circle_list).map(i => h('span', {
              style: {display: 'inline-block', padding: '3px 5px', margin: '3px', 'border-radius': '20px', background: '#F59A23', color: '#ffff'}
            }, i))
            )
          }
        },
        {
          align: 'center',
          title: '是否置顶',
          key: 'is_top',
          render: (h, params) => {
            return h('i-switch', {
              props: {
                'true-color': 'rgb(26,188,156)',
                value: params.row.is_top === 1,
                'before-change': () => this.handleSwitchChange(params.row)
              }
            })
          }
        },
        {
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认要删除此分类吗？',
                        content: '（删除后不可恢复，请谨慎操作）',
                        onOk: () => {
                          this.delCirclePostModular(params.row.id)
                        }
                      })
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
    }
  },
  mounted () {
    // this.getInitList()
  },
  methods: {
    getInitList () {
      let params = {
        circle_id: this.circleId
      }
      getCirclePostModularList(params).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data
        }
      })
    },
    lookContent (index) {
      this.postsContModal = true
      let data = this.tableData[index]
      this.postCont = Object.assign({}, data)
      if(this.postCont.topic_circle_list) this.postCont.topic_circle_list = JSON.parse(this.postCont.topic_circle_list)
      console.log(this.postCont)
    },
    handleSwitchChange (row) {
      row.is_top = !row.is_top
      row.is_top = row.is_top ? 1 : 0
      let params = {
        circle_id: this.circleId,
        id: row.id,
        is_top: row.is_top
      }
      setTopcirclePostModular(params).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getInitList()
        }
      })
    },
    addPosts () {
      this.addPostModal = true
      this.postsId = ''
    },
    confirm () {
      if (!this.postsId) return this.$Message.error("输入框不能为空");
      bannerTemp_addView().then(({ data }) => {
        if (data.code === 200){
          this.checkcode = data.data.checkcode;
          let params = {
            post_id: this.postsId,
            circle_id: this.circleId,
            checkcode: this.checkcode,
          }
          editCirclePostModular(params).then(res => {
            if (res.data.code === 200) {
              this.$Message.success("成功");
              this.addPostModal = false
              this.getInitList()
            }
          })
        }
      });
    },
    delCirclePostModular (id) {
      let params = {
        id: id,
        circle_id: this.circleId,
      }
      delCirclePostModular(params).then(res => {
        if(res.data.code === 200){
          this.$Message.success("删除成功");
          this.getInitList()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.page{
  margin-top: 20px;
  text-align: center;
}
.head_btn{
  text-align: right;
}
.header{
  display: flex;
  align-items: center;
  .user_pic{
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  .user_name{
    margin-left: 10px;
    h2{
      font-size: 14px;
    }
  }
}
.content {
  padding: 10px 10px 30px;
}
</style>
