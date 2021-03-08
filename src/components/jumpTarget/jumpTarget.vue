<template>
  <div>
    <div class="content">
      <Form ref="bannerForm" :model="formData" :label-width="100">
        <!-- 跳转类型 -->
        <FormItem label="跳转类型：" prop="jump_type">
          <!-- <Input v-model="formData.jump_type" placeholder="请选择跳转类型" /> -->
          <Select v-model="formData.jump_type" style="width:60%" @on-change="changeSelect">
            <Option
              v-for="item in myJump_type"
              :value="item.value"
              :key="item.value"
            >{{ item.type }}</Option>
          </Select>
        </FormItem>
        <!-- [跳转外部链接] -->
        <FormItem label="跳转目标：" prop="jump_url" v-show="formData.jump_type === 1">
          <Input v-model="formData.jump_out_url" placeholder="请输入外部链接" style="width:60%;"/>
        </FormItem>
        <!-- [跳转帖子详情] -->
        <FormItem label="跳转目标：" prop="jump_url" v-show="formData.jump_type === 8">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button style="width:60%;" @click="jumpTargetPage(8)">关联帖子</Button>
        </FormItem>
        <!-- [跳转游戏] -->
        <FormItem label="跳转游戏详情-详情" prop="jump_url" v-show="formData.jump_type === 3">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button style="width:60%;" @click="jumpTargetPage(3)">{{formData.jump_url ? "查看已选游戏" : "选择关联游戏"}}</Button>
        </FormItem>

        <!-- [跳转百科] -->
        <FormItem label="跳转游戏详情-百科：" prop="jump_url" v-show="formData.jump_type === 4">
          <Button style="width:60%;" @click="jumpTargetPage(4)">{{formData.jump_url ? "查看已选百科" : "选择关联百科"}}</Button>
        </FormItem>

        <!-- 跳转词条 -->
        <FormItem label="跳转词条：" prop="jump_url" v-show="formData.jump_type === 5">
          <Button style="width:60%;" @click="jumpTargetPage(5)">
            {{
            formData.jump_url ? "查看已选词条" : "选择关联词条"
            }}
          </Button>
        </FormItem>
        <!-- 跳转文章视频 -->
        <FormItem label="跳转文章视频：" prop="jump_url" v-show="formData.jump_type === 6">
          <Button style="width:60%;" @click="jumpTargetPage(6)">
            {{
            formData.jump_url ? "关联文章视频" : "关联文章视频"
            }}
          </Button>
        </FormItem>
      </Form>
    </div>
    <!-- 关联游戏对话框区域 -->
    <Modal v-model="gameAssociate" :title="targetModalTitle" width="800" height="500" @on-cancel="cancel" @on-ok="confirmTarVal">
      <div class="searchInput" v-if="formData.jump_type !== 6">
        搜索内容：
        <Input
          v-model="targetSearch"
          :placeholder="searchPlaceholder"
          style="width: 300px;marginRight:63px"
          v-if="formData.jump_type !== 8"
        />
        <input type="text" v-model="targetSearch" :placeholder="searchPlaceholder"  name="tel" 
        oninput="value=value.replace(/[^\d]/g,'')" 
        style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"
        v-if="formData.jump_type === 8"
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
  </div>
</template>

<script>
import axios from 'axios'
import { VueCropper } from 'vue-cropper'
import { formatDate } from "@/libs/util";
import { 
  getQiniuToken, 
  BannerTempGetGameList, 
  BannerTempGetWikiList, 
  BannerTempGetWikiEntryList, 
  BannerTempGetContentList, 
  editCircleBanner,
  bannerTemp_addView,
  BannerTempGetPostList 
} from '@/api/data'
import { mapMutations } from 'vuex'
export default {
  components: {
    VueCropper
  },
  data () {
    return {
      qiniuToken: '', // Token
      gameAssociate: false,
      targetDetailColumns: [],
      targetGameList: [],
      tempCurrentid: '',
      targetModalTitle: '关联游戏',
      targetSearch: '',
      circleId: this.$route.query.id,
      bannerId: this.$route.query.bannerId,
      moduleId: this.$route.query.moduleId,
      allJumpType: 3, // 全局的跳转目标值
      searchPlaceholder: '输入游戏名称或id',
      saveType: 'add',
      pageParams: {
        page: 1,
        page_size: 20
      },
      newPageParams: {
        page: 1,
        page_size: 20
      },
      myJump_type: [
        { type: "无跳转", value: 0 },
        { type: "跳转外部链接", value: 1 },
        { type: "跳转帖子详情", value: 8 },
        { type: "跳转游戏详情-详情", value: 3 },
        { type: "跳转游戏详情-百科", value: 4 },
        { type: "跳转词条", value: 5 },
        { type: "跳转文章视频", value: 6 }
      ],
      // formData: { 
      //   id: this.$route.query.bannerId, // bannerID 编辑必传
      //   img_url: "",
      //   jump_type: null, // 跳转类型 0=无 1=外部 2=功能页面 3=游戏
      //   jump_url: "", // 跳转链接当jump_type=1时外部链接，为2时内部链接，为3时游戏id
      //   jump_out_url: "", // 跳转链接当jump_type=1时外部链接，为2时内部链接，为3时游戏id
      //   checkcode: "", // 新增banner 校验码
      //   circle_id: this.$route.query.id, 
      //   circle_modular_id: this.$route.query.moduleId
      // },
    }
  },
  props: {
    formData: {
      type: Object,
      required: true
    },
  },
  computed: {

  },
  mounted () {
    console.log("跳转type", this.formData.jump_type,this.formData.jump_url)
    if(this.formData.jump_type === 1){
      this.formData.jump_out_url = this.formData.jump_url
    }
    this.getqinniuToken()
    // this.getGameData_jumptype3()
    // if (this.$route.query.bannerId) {
    //   this.getCircleBannerDetail()
    //   this.saveType = 'edit'
    // } else {
    //   this.saveType = 'add'
    // }
  },
  methods: {
    // 确认新增或编辑
    ...mapMutations([
      'closeTag'
    ]),
    confirmTarVal () {
      this.$emit('getJumpUrl', this.formData.jump_url)
      // console.log(this.formData.jump_url)
    },
    // 选择跳转目标 去关联作品
    jumpTargetPage (type) {
      this.allJumpType = type
      this.targetSearch = ''
      if (this.formData.currentid) this.tempCurrentid = this.formData.currentid;
      // type 3 跳转游戏详情-详情 4 跳转游戏详情-百科 5 跳转词条 6 跳转文章视频
      this.pageParams = Object.assign({}, this.newPageParams)
      this.gameAssociate = true
      if(type === 8){
        // console.log("帖子详情")
        this.getGameData_jumptype8()
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
              console.log("id:",id)
              if (Number(self.formData.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.formData.currentid = id;
                      self.formData.jump_url = id;
                      console.log("self.formData.currentid:",self.formData.currentid)
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
      }else if (type === 3) {
        this.getGameData_jumptype3()
        this.targetModalTitle = "关联游戏"
        this.searchPlaceholder = "请输入游戏名称或ID"
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
              if (Number(this.formData.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.formData.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
      } else if (type === 4) {
        this.getGameData_jumptype4()
         this.targetModalTitle = "关联百科"
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
              console.log("currentid",this.formData.currentid,'id',params.row.id)
              if (Number(this.formData.currentid) === id) flag = true;
              else flag = false;
              console.log(flag)
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.formData.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
       
      } else if (type === 5) {
        this.getGameData_jumptype5()
        this.targetModalTitle = "关联百科词条"
        this.searchPlaceholder = "请输入百科词条名称"
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
              if (Number(this.formData.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.formData.currentid = id;
                      self.formData.jump_url = id;
                    }
                  }
                })
              ]);
            }
          }
        ]
      } else {
        this.getGameData_jumptype6()
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
              if (Number(this.formData.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.formData.currentid = id;
                      self.formData.jump_url = id;
                    }
                  }
                })
              ]);
            }
          }
        ]
        this.targetModalTitle = "关联文章/视频"
      }
    },
    // 获取关联游戏的游戏数据 当jump_type=3时调用
    getGameData_jumptype3() {
      let params = {
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }
      BannerTempGetGameList(params).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
        
      });
    },
    // 获取关联百科的数据 当jump_type=4时调用
    getGameData_jumptype4() {
      // BannerTempGetWikiList(this.addViewBk).then(res => {
      BannerTempGetWikiList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取关联词条的数据 当jump_type=5时调用
    getGameData_jumptype5() {
      // BannerTempGetWikiList(this.addViewBk).then(res => {
      BannerTempGetWikiEntryList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    //当获取关联文章视频的数据 当junp_type=6时调用
    getGameData_jumptype6() {
      BannerTempGetContentList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取关联帖子的数据 当jump_type=8时
    getGameData_jumptype8() {
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
      console.log("this.tempCurrentid:",this.tempCurrentid)
      if (this.tempCurrentid) {
        this.formData.currentid = this.tempCurrentid;
      } else {
        this.formData.currentid = ''
      }
    },
    // 查询关联游戏，百科，词条等
    searchGame () {
      this.pageParams.page = 1
      this.updateData(this.allJumpType)
    },
    changeSelect(val) {
      this.formData.jump_out_url = "";
      this.formData.currentid = "";
      this.$refs.bannerForm.fields.forEach(e => {
        if (e.prop == "jump_url") {
          e.resetField();
        }
      });
    },
    // 根据page及search内容去更新对应的列表
    updateData (type) {
      switch(type){
        case 3:
          this.getGameData_jumptype3()
          break;
        case 4:
          this.getGameData_jumptype4()
          break;
        case 5:
          this.getGameData_jumptype5()
          break;
        case 6:
          this.getGameData_jumptype6()
          break;
        case 8:
          this.getGameData_jumptype8()
          break;
      }
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
    // 图片上传
    getqinniuToken () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
  }
}
</script>

<style scoped>
.content{
  width: 600px;
  margin: 30px auto;
}
.demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 356px;
    height: 200px;
    background: rgba(0,0,0,.6);
}
.demo-upload-list:hover .demo-upload-list-cover{
    display: block;
}
.demo-upload-list-cover i{
    display: block;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 95px auto;
}
.cropper{
  width: 400px;
  height: 400px;
}
.searchInput {
  margin-bottom: 20px;
}
</style>
