<template>
  <div>
    <div class="content">
      <Form ref="bannerForm" :model="formData" :rules="formRules" :label-width="100">
        <!-- 广告名称 -->
        <FormItem label="广告名称：" prop="name">
          <Input v-model="formData.name" placeholder="请输入广告名称" maxlength="20"/>
        </FormItem>
        <!-- 开始时间 -->
        <FormItem label="开始时间：" prop="start_time">
          <!-- <Input v-model="formData.start_time" placeholder="请选择时间" /> -->
          <DatePicker
            v-model="formData.start_time"
            type="datetime"
            placeholder="请选择时间："
            style="width: 100%"
          />
        </FormItem>
        <!-- 到期时间 -->
        <FormItem label="到期时间：" prop="end_time">
          <DatePicker
            v-model="formData.end_time"
            type="datetime"
            placeholder="请选择时间"
            style="width: 100%"
          />
        </FormItem>
        <!-- 文本图片 -->
        <FormItem label="文本图片：" prop="img_url">
          <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" style="width: 327px;height:153px;line-height: 153px;margin-right:10px" >
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            v-show="uploadList.length < 1"
            ref="upload"
            :show-upload-list="false"
            :format="['jpg','jpeg','png']"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:327px;">
            <div style="width:327px; height:153px; display:flex; flex-direction: column;justify-content: center; align-items: center">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
              <p>只能上传jpg/png格式文件
              尺寸：327*153</p>
            </div>
          </Upload>
        </FormItem>
        <!-- 跳转类型 -->
        <FormItem label="跳转类型：" prop="jump_type">
          <!-- <Input v-model="formData.jump_type" placeholder="请选择跳转类型" /> -->
          <Select v-model="formData.jump_type" style="width:100%" @on-change="changeSelect">
            <Option
              v-for="item in myJump_type"
              :value="item.value"
              :key="item.value"
            >{{ item.type }}</Option>
          </Select>
        </FormItem>
        <!-- [跳转外部链接] -->
        <FormItem label="跳转目标：" prop="jump_url" v-show="formData.jump_type === 1">
          <Input v-model="formData.jump_out_url" placeholder="请输入外部链接" />
        </FormItem>
        <!-- [跳转帖子详情] -->
        <FormItem label="跳转目标：" prop="jump_url" v-show="formData.jump_type === 8">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button long @click="jumpTargetPage(8)">关联帖子</Button>
        </FormItem>
        <!-- [跳转游戏] -->
        <FormItem label="跳转游戏详情-详情" prop="jump_url" v-show="formData.jump_type === 3">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button long @click="jumpTargetPage(3)">{{formData.jump_url ? "查看已选游戏" : "选择关联游戏"}}</Button>
        </FormItem>

        <!-- [跳转百科] -->
        <FormItem label="跳转游戏详情-百科：" prop="jump_url" v-show="formData.jump_type === 4">
          <Button long @click="jumpTargetPage(4)">{{formData.jump_url ? "查看已选百科" : "选择关联百科"}}</Button>
        </FormItem>

        <!-- 跳转词条 -->
        <FormItem label="跳转词条：" prop="jump_url" v-show="formData.jump_type === 5">
          <Button long @click="jumpTargetPage(5)">
            {{
            formData.jump_url ? "查看已选词条" : "选择关联词条"
            }}
          </Button>
        </FormItem>
        <!-- 跳转文章视频 -->
        <FormItem label="跳转文章视频：" prop="jump_url" v-show="formData.jump_type === 6">
          <Button long @click="jumpTargetPage(6)">
            {{
            formData.jump_url ? "关联文章视频" : "关联文章视频"
            }}
          </Button>
        </FormItem>

        <!-- 是否显示 -->
        <FormItem label="是否显示：" prop="is_show">
          <i-switch :value="formData.is_show === 0 ? false : true" @on-change="handleSwitchChange" />
        </FormItem>
      </Form>
      <Button type="primary" @click="confirmClick" style="margin-left:270px;">发布</Button>
    </div>
    <!-- 图片裁剪弹窗 -->
    <modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
      <div class="cropper">
        <vueCropper
          ref="cropper"
          :img="option.img"
          :outputSize="option.outputSize"
          :outputType="option.outputType"
          :info="option.info"
          :canScale="option.canScale"
          :autoCrop="option.autoCrop"
          :autoCropWidth="option.autoCropWidth"
          :autoCropHeight="option.autoCropHeight"
          :fixedBox="option.fixedBox"
          :fixed="option.fixed"
          :fixedNumber="option.fixedNumber"
          :full="option.full"
          :centerBox="option.centerBox"
        />
      </div>
    </modal>
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
  getCircleBannerDetail, 
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
      uploadList: [],
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      cropperFlag: false,
      gameAssociate: false,
      targetDetailColumns: [],
      targetGameList: [],
      currentid: '',
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
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg || png', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, // 是否输出原图比例的截图
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [327, 153], // 截图框的宽高比例
        autoCropWidth: 327, // 默认生成截图框宽度
        autoCropHeight: 153, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      formData: { 
        id: this.$route.query.bannerId, // bannerID 编辑必传
        name: "",
        start_time: "",
        end_time: "",
        img_url: "",
        jump_type: null, // 跳转类型 0=无 1=外部 2=功能页面 3=游戏
        jump_url: "", // 跳转链接当jump_type=1时外部链接，为2时内部链接，为3时游戏id
        jump_out_url: "", // 跳转链接当jump_type=1时外部链接，为2时内部链接，为3时游戏id
        is_show: 0,
        checkcode: "", // 新增banner 校验码
        circle_id: this.$route.query.id, 
        circle_modular_id: this.$route.query.moduleId
      },
      formRules: {
        name: [{ required: true, message: "请输入广告名称" }],
        start_time: [{ required: true, message: "请选择时间" }],
        end_time: [{ required: true, message: "请选择时间" }],
        img_url: [
          {
            required: true,
            message: "请选择上传图片",
            validator: (rule, value, callback) => {
              if (!this.formData.img_url) {
                return callback(new Error("文本图片不能为空"));
              } else {
                callback();
              }
            }
          }
        ],
        jump_type: [{ required: true, message: "请选择跳转类型" }],
        // is_show: [{ required: true }],
        jump_out_url: [
          {
            required: true,
            trigger: "change",
            message: "请选择跳转目标",
            validator: (rule, value, callback) => {
              if (!this.formData.jump_url) {
                return callback(new Error("跳转目标不能为空"));
              } else {
                callback();
              }
            }
          }
        ],
        buttom_rule: [{ required: true, message: " " }]
      },
    }
  },
  mounted () {
    this.getqinniuToken()
    // this.getGameData_jumptype3()
    if (this.$route.query.bannerId) {
      this.getCircleBannerDetail()
      this.saveType = 'edit'
    } else {
      this.saveType = 'add'
    }
  },
  methods: {
    // 确认新增或编辑
    ...mapMutations([
      'closeTag'
    ]),
    confirmTarVal () {
      
    },
    // 选择跳转目标 去关联作品
    jumpTargetPage (type) {
      this.allJumpType = type
      this.targetSearch = ''
      if (this.currentid) this.tempCurrentid = this.currentid;
      // type 3 跳转游戏详情-详情 4 跳转游戏详情-百科 5 跳转词条 6 跳转文章视频
      this.pageParams = Object.assign({}, this.newPageParams)
      this.gameAssociate = true
      if(type === 8){
        console.log("帖子详情")
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
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
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
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
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
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
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
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
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
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
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
      if (this.tempCurrentid) {
        this.currentid = this.tempCurrentid;
      } else {
        this.currentid = ''
      }
    },
    getCircleBannerDetail () {
      let params = {
        id: this.bannerId,
        circle_modular_id: this.moduleId,
        circle_id: this.circleId
      }
      getCircleBannerDetail(params).then(res => {
        if (res.data.code === 200) {
          this.formData = { ...res.data.data.banner_info }
          if (+res.data.data.banner_info.jump_type === 7) this.formData.jump_type = 6
          this.formData.checkCode = ''
          this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: res.data.data.banner_info.img_url }]
          this.uploadList = this.$refs.upload.fileList
          this.newCurrentid = this.formData.jump_out_url =  this.currentid = res.data.data.banner_info.jump_url
        }
      })
    },
    // 查询关联游戏，百科，词条等
    searchGame () {
      this.pageParams.page = 1
      this.updateData(this.allJumpType)
    },
    confirmClick() {
      this.$refs.bannerForm.validate(valid => {
        if (valid) {
          if (
            !this.currentid &&
            this.formData.jump_type !== 0 &&
            !this.formData.jump_out_url
          ) {
            return this.$Message.error("请选择跳转目标");
          }
          this.formData.start_time = formatDate(this.formData.start_time);
          this.formData.end_time = formatDate(this.formData.end_time);
          if (new Date(this.formData.end_time).getTime() < new Date(this.formData.start_time).getTime()) {
            return this.$Message.warning('到期时间不能小于开始时间')
          }
          // this.formData.type = this.mode;
          if (+this.formData.jump_type === 1) {
            this.formData.jump_url = this.formData["jump_out_url"];
          }
          bannerTemp_addView().then(({ data }) => {
            if (data.code === 200){
              this.formData.checkcode = data.data.checkcode;
              this.BannerAddOrEdit(this.formData);
            }
          });
          // this.getIndexContent();
        }
      });
    },
    BannerAddOrEdit (params) {
      editCircleBanner(params).then(res => {
        if (res.data.code === 200) {
          this.closeTag(this.$route)
          this.$router.replace({ path: `/game/editCircle?id=${this.circleId}&&level=2` })
          this.$Message.success("修改成功");
        }
      })
    },
    changeSelect(val) {
      this.formData.jump_out_url = "";
      this.currentid = "";
      this.$refs.bannerForm.fields.forEach(e => {
        if (e.prop == "jump_url") {
          e.resetField();
        }
      });
    },
    handleSwitchChange() {
      this.formData.is_show = this.formData.is_show === 1 ? 0 : 1;
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
    onCubeImg () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        this.getqinniuToken()
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              // if (this.option.type === 'hdfile') {
                this.formData.img_url = this.imageBaseUrl + res.data.key
                this.uploadList.push({
                  status: 'finished',
                  url: this.formData.img_url
                })
                this.$refs.bannerForm.validateField('img_url') ;
              // }
            } else {
              that.$Message.error('上传失败')
            }
          })
      })
      this.option.img = ''
      this.cropperFlag = false
    },
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob (urlData) {
      let bytes = window.atob(urlData.split(',')[1])// 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length)
      let ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    },
    // 拿到需要截图图片
    getPic (file) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.$Modal.error({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg或者png 格式的图片。'
        })
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
      }
      reader.readAsDataURL(file)
      this.$refs.cropper.refresh()
      this.cropperFlag = true
    },
    handleBeforeUpload (file) {
      this.uploadList = []
      // this.option.type = 'hdfile'
      this.getPic(file)
      return false
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formData.img_url = ''
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
    width: 327px;
    height: 153px;
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
    margin: 70px auto;
}
.cropper{
  width: 400px;
  height: 400px;
}
.searchInput {
  margin-bottom: 20px;
}
</style>
