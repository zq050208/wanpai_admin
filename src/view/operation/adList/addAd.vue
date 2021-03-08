<template>
  <Card>
    <template slot="title">{{this.id ? '编辑' : '添加'}}弹窗广告</template>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="12" :sm="18" :xs="24">
        <Form
          ref="addBannerForm"
          :model="formData"
          :rules="formRules"
          :label-width="150"
          label-position="right"
        >
          <FormItem label="广告名称：" prop="title">
            <Input v-model="formData.title" />
            <p>广告名称只是作为辨别多个广告条目之用，并不显示在广告中</p>
          </FormItem>
          <FormItem label="开始时间：" prop="start_time">
            <DatePicker :value="formData.start_time" type="datetime" @on-change="handleStartDateChange" placeholder="请选择开始时间" />
          </FormItem>
          <FormItem label="到期时间：" prop="end_time">
            <DatePicker :value="formData.end_time" type="datetime" @on-change="handleEndDateChange" placeholder="请选择到期时间" />
          </FormItem>
          <FormItem label="广告图片：" prop="image">
            <uploadImg :optionData="optionData" @getUploadImgUrl="getUploadImgUrl"></uploadImg>
          </FormItem>
          <!-- 跳转类型 -->
          <FormItem label="跳转类型：" prop="jump_type">
            <!-- <Input v-model="formData.jump_type" placeholder="请选择跳转类型" /> -->
            <Select v-model="formData.jump_type" style="width:100%" @on-change="changeSelect">
              <Option
                v-for="item in ad_jump_type"
                :value="item.id"
                :key="item.id"
              >{{ item.name }}</Option>
            </Select>
          </FormItem>
      
          <!-- [跳转外部链接] -->
        <FormItem label="跳转目标：" prop="jump_url" v-show="formData.jump_type === 1 || formData.jump_type === 2">
          <Input v-model="formData.jump_url" placeholder="请输入链接" />
        </FormItem>
        <!-- [跳转帖子详情] -->
        <FormItem label="跳转目标：" prop="jump_view" v-show="formData.jump_type === 3">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button long @click="jumpTargetPage(3)">跳转文章/视频</Button>
        </FormItem>
        <!-- [跳转游戏] -->
        <FormItem label="跳转目标：" prop="jump_view" v-show="formData.jump_type === 4">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button long @click="jumpTargetPage(4)">跳转游戏</Button>
        </FormItem>

        <!-- [跳转百科] -->
        <FormItem label="跳转目标：" prop="jump_view" v-show="formData.jump_type === 5">
          <Button long @click="jumpTargetPage(5)">跳转百科</Button>
        </FormItem>

        <!-- 跳转词条 -->
        <FormItem label="跳转目标：" prop="jump_view" v-show="formData.jump_type === 6">
          <Button long @click="jumpTargetPage(6)">跳转词条</Button>
        </FormItem>
        <!-- 跳转文章视频 -->
        <FormItem label="跳转文章视频：" prop="jump_view" v-show="formData.jump_type === 7">
          <Button long @click="jumpTargetPage(7)">跳转帖子</Button>
        </FormItem>
          <FormItem label="按钮颜色：" prop="button_color">
            <Input v-model="formData.button_color" maxlength="6"/>
          </FormItem>
          <FormItem label="按钮文字：" prop="button">
            <Input v-model="formData.button" maxlength="6"/>
          </FormItem>
          <FormItem label="按钮文字颜色：" prop="text_color">
            <Input v-model="formData.text_color" maxlength="6"/>
          </FormItem>
          <FormItem>
            <Button type="primary" size="large" @click="handleSubmit">提交</Button>
          </FormItem>
        </Form>
        </Col>
    </Row>
    <!-- 关联游戏对话框区域 -->
    <Modal v-model="gameAssociate" :title="targetModalTitle" width="800" height="500" @on-cancel="cancel">
      <div class="searchInput" v-if="formData.jump_type !== 6">
        搜索内容：
        <Input
          v-model="targetSearch"
          :placeholder="searchPlaceholder"
          style="width: 300px;marginRight:63px"
          v-if="formData.jump_type !== 8"
        />
        <Button type="primary" @click="searchGame">查询</Button>
      </div>
      <!-- 游戏数据表格 -->
      <Table :columns="targetDetailColumns" :data="targetGameList" border height="400" style="margin-bottom: 20px;" ref="tableList"></Table>
      <!-- 分页区域 -->
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[5, 10, 20, 50]"
        :total="pageParams.total"
        :current="pageParams.page"
        :page-size="pageParams.page_size"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Modal>
  </Card>
</template>

<script>
import { getAdCode, getQiniuToken, popAdd, bannerEditCode, popEdit, getContentList, gameList, gameWikiList, gameWikiEntryList, BannerTempGetPostList } from '@/api/data'
import { mapMutations } from 'vuex'
import uploadImg from '@/components/uploadImg'
export default {
  components: {
    uploadImg
  },
  data () {
    return {
      id: null,
      ad_jump_type: [],
      qiniuToken: '',
      uploadList: [],
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      formData: {
        title: '',
        start_time: '',
        end_time: '',
        image: '',
        jump_type: '',
        jump_url: '',
        jump_view: 0,
        button_color: 'FFCC03',
        button: '打开',
        text_color: '000000'
      },
      formRules: {
        title: [
          { required: true, message: '请输入广告名称' },
          { type: 'string', max: 30, message: '最多只能输入30个字符' }
        ],
        start_time: [{ required: true, message: '请选择开始时间' }],
        end_time: [{ required: true, message: '请选择到期时间' }],
        image: [{ required: true, message: '请上传广告图片' }],
        jump_type: [{ required: true, message: '请选择跳转类型' }],
        jump_url: [{ required: true, message: '请输入广告链接' }],
        jump_view: [{ required: true, message: '请选择关联作品' }]
      },
      optionData: {
        fixedNumber: [293, 346], // 截图框的宽高比例
        autoCropWidth: 293, // 默认生成截图框宽度
        autoCropHeight: 346, // 默认生成截图框高度
        imgUrl: ''
      },
      pageParams: {
        page: 1,
        page_size: 20
      },
      newPageParams: {
        page: 1,
        page_size: 20
      },
      gameAssociate: false,
      targetDetailColumns: [],
      targetGameList: [],
      currentid: '',
      tempCurrentid: '',
      targetModalTitle: '关联游戏',
      targetSearch: '',
      allJumpType: 3, // 全局的跳转目标值
      searchPlaceholder: '输入游戏名称或id',
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    ...mapMutations([
      'closeTag'
    ]),
    changeSelect(val) {
      this.formData.jump_out_url = "";
      this.currentid = "";
      this.$refs.addBannerForm.fields.forEach(e => {
        if (e.prop == "jump_url") {
          e.resetField();
        }
      });
    },
    getUploadImgUrl(data){
      this.formData.image = data
      console.log("getUploadImgUrl:",data)
    },
    init () {
      this.getQiniuToken()
      this.id = this.$route.query.id
      if (this.id) this.bannerEditCode(this.id)
      else this.getAdCode()
    },
    async getQiniuToken () {
      await getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    async getAdCode () {
      await getAdCode().then(res => {
        if (res.data.code === 200) {
          this.ad_jump_type = res.data.data.jump_type
          this.data = res.data.data.content_list.data
          this.formData.checkcode = res.data.data.checkcode
          // this.pageParams.total = res.data.data.content_list.total
        }
      })
    },
    bannerEditCode (id) {
      bannerEditCode({ id: id }).then(res => {
        if (res.data.code === 200) {
          if (res.data.code === 200) {
            this.ad_jump_type = res.data.data.jump_type
            this.data = res.data.data.content_list.data
            this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: res.data.data.info.image }]
            this.uploadList = this.$refs.upload.fileList
            this.formData = {
              checkcode: res.data.data.checkcode,
              ...res.data.data.info
            }
          }
        }
      })
    },
    selectContent () {
      this.visible = true
    },
    popAdd () {
      popAdd(this.formData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.closeTag(this.$route)
          this.$router.push({ path: '/operation/ad_list' })
        }
      })
    },
    popEdit () {
      popEdit(this.formData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.closeTag(this.$route)
          this.$router.push({ path: '/operation/ad_list' })
        }
      })
    },
    handleStartDateChange (date, type) {
      this.formData.start_time = date
    },
    handleEndDateChange (date, type) {
      this.formData.end_time = date
    },
    handleSubmit () {
      // console.log("handleSubmit:",this.jumpData.jump_type,this.jumpData.jump_url,this.jumpData.jump_out_url)
      // this.$refs.addBannerForm.validate(valid => {
      //   if (valid) {
          let id = this.$route.query.id
          if (id) this.popEdit()
          else this.popAdd()
      //   }
      // })
    },
    // 获取跳转目标对应的数据
    // 选择跳转目标 去关联作品
    jumpTargetPage (type) {
      this.allJumpType = type
      this.targetSearch = ''
      if (this.currentid) this.tempCurrentid = this.currentid;
      // type 3 跳转游戏详情-详情 4 跳转游戏详情-百科 5 跳转词条 6 跳转文章视频
      this.pageParams = Object.assign({}, this.newPageParams)
      this.gameAssociate = true
      if(type === 7){
        console.log("帖子详情")
        this.getGameData_jumptype7()
        this.targetModalTitle = "关联帖子"
        this.searchPlaceholder = "请输入帖子ID搜索"
        this.targetDetailColumns = [
          {
            title: "帖子ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "帖子内容",
            key: "content",
            align: "center"
          },
          {
            title: "所属圈子-模块",
            align: "center",
            width: "150",
            render: (h, params) => {
            return h('div', [
              h('span', {}, params.row.circle_name ? params.row.circle_name  + '-' : ''),
              h('span', {}, params.row.modular_name ? params.row.modular_name : ''),
            ])
          }
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_view = id;
                    }
                  }
                })
              ]);
            }
          }
        ]
      }else if (type === 3) {
        this.getContentList()
        this.targetModalTitle = "关联文章/视频"
        this.searchPlaceholder = "请输入文章/视频名称或ID"
        this.targetDetailColumns = [
          {
            title: "内容ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "标题",
            key: "title",
            align: "center"
          },
          {
            title: "类型",
            align: "center",
            render: (h, params) => {
              return h("div", {}, params.row.type === 1 ? "图文" : "视频");
            }
          },
          {
            title: "上传时间",
            key: "create_time",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_view = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
      } else if (type === 4) {
        this.gameList()
         this.targetModalTitle = "关联游戏"
        this.searchPlaceholder = "输入游戏名称或ID"
        this.targetDetailColumns = [
          {
            title: "游戏ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "游戏名称",
            key: "name",
            align: "center"
          },
          {
            title: "游戏Logo",
            key: "logo",
            align: "center",
            render: (h, params) => {
              return h("div", [
                h("img", {
                  attrs: {
                    src: params.row.logo
                  },
                  style: {
                    width: "50px",
                    height: "50px"
                  }
                })
              ]);
            }
          },
          {
            title: "上传时间",
            key: "create_time",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_view = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
       
      } else if (type === 5) {
        this.gameWikiList()
        this.targetModalTitle = "关联百科"
        this.searchPlaceholder = "请输入百科名称"
        this.targetDetailColumns = [
          {
            title: "游戏ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "游戏名称",
            key: "name",
            align: "center"
          },
          {
            title: "游戏Logo",
            key: "logo",
            align: "center",
            render: (h, params) => {
              return h("div", [
                h("img", {
                  attrs: {
                    src: params.row.logo
                  },
                  style: {
                    width: "50px",
                    height: "50px"
                  }
                })
              ]);
            }
          },
          {
            title: "上传时间",
            key: "create_time",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_view = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
      } else {
        this.gameWikiEntryList()
        this.targetDetailColumns = [
          {
            title: "内容ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "词条名称",
            key: "name",
            align: "center"
          },
          {
            title: "所属游戏名称",
            key: "game_name",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_view = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
        this.targetModalTitle = "关联词条"
      }
    },
    // 根据page及search内容去更新对应的列表
    updateData (type) {
      switch(type){
        case 3:
          this.getContentList()
          break;
        case 4:
          this.gameList()
          break;
        case 5:
          this.gameWikiList()
          break;
        case 6:
          this.gameWikiEntryList()
          break;
        case 7:
          this.getGameData_jumptype7()
          break;
      }
    },
    // 获取游戏列表 4
    async gameList() {
      await gameList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取文章/视频 3
    async getContentList() {
      await getContentList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取游戏百科列表 5
    async gameWikiList() {
      await gameWikiList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取游戏词条列表 6
    async gameWikiEntryList() {
      await gameWikiEntryList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取关联帖子的数据 当jump_type=7时
    getGameData_jumptype7() {
      BannerTempGetPostList({
        post_id: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    cancel () {
      if (this.tempCurrentid) {
        this.currentid = this.tempCurrentid;
      } else {
        this.currentid = ''
      }
    },
    // 查询关联游戏，百科，词条等
    searchGame () {
      this.pageParams.page = 1
      this.updateData(this.allJumpType)
    },
     // 页码
    handlePageChange (page) {
      this.pageParams.page = page
      document.getElementsByClassName('ivu-table-body')[0].scroll(0, 0)
      this.updateData(this.allJumpType)
    },
    handlePageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.page_size = size
      this.updateData(this.allJumpType)
    },
  }
}
</script>
<style>
  .page {
    margin-top: 20px;
    text-align: center;
  }
  /* .demo-upload-list{
    display: inline-block;
    width: 172.5px;
    height: 62.5px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin-right: 4px;
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
  } */
</style>
