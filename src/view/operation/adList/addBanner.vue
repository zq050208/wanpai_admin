<template>
  <Card>
    <template slot="title">{{ this.id ? "编辑" : "添加" }}banner</template>
    <Row type="flex" align="middle" justify="center">
      <Col :lg="12" :sm="18" :xs="24">
        <Form
          ref="addBannerForm"
          :model="formData"
          :rules="formRules"
          :label-width="150"
          label-position="right"
        >
          <FormItem label="目标应用:" prop="app_id">
            <Select v-model="formData.app_id">
              <Option
                v-for="item in app"
                :value="item.id"
                :key="item.id"
                :label="item.web_name"
              ></Option>
            </Select>
          </FormItem>
          <FormItem label="广告位置:" prop="position_id">
            <Select v-model="formData.position_id">
              <Option
                v-if="formData.app_id === item.app_id"
                v-for="item in ad_position"
                :value="item.id"
                :key="item.id"
                :label="item.position_name"
              ></Option>
            </Select>
          </FormItem>
          <FormItem label="广告名称：" prop="title">
            <Input v-model="formData.title" type="text" />
            <p>广告名称只是作为辨别多个广告条目之用，并不显示在广告中</p>
          </FormItem>
          <FormItem label="开始时间：" prop="start_time">
            <DatePicker
              v-model="formData.start_time"
              type="datetime"
              @on-change="handleStartDateChange"
              placeholder="请选择开始时间"
            />
          </FormItem>
          <FormItem label="到期时间：" prop="end_time">
            <DatePicker
              v-model="formData.end_time"
              type="datetime"
              @on-change="handleEndDateChange"
              placeholder="请选择到期时间"
            />
          </FormItem>
          <!-- <FormItem label="广告图片：" prop="image">
            <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
              <template v-if="item.status === 'finished'">
                <img :src="item.url" />
                <div class="demo-upload-list-cover">
                  <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
                </div>
              </template>
              <template v-else>
                <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
              </template>
            </div>
            <Upload
              ref="upload"
              :show-upload-list="false"
              :format="['jpg','jpeg','png']"
              :max-size="1024"
              :on-success="handleSuccess"
              :on-format-error="handleFormatError"
              :on-exceeded-size="handleMaxSize"
              :before-upload="handleBeforeUpload"
              type="drag"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
            >
              <Button icon="ios-cloud-upload-outline">选择上传文件或者将文件拖拽至区域内</Button>
              <p>只能上传jpg/png格式文件，文件不能超过1M</p>
              <p>首页banner尺寸：335×187px</p>
              <p>引导页尺寸：123×345px</p>
              <p>弹窗广告尺寸：123×345px</p>
            </Upload>
          </FormItem>-->
          <FormItem label="广告图片：" prop="image">
            <div
              class="demo-upload-list"
              v-for="(item, index) in uploadList"
              :key="index"
            >
              <template v-if="item.status === 'finished'">
                <img
                  :src="item.url"
                  style="width: 335px;height:144px;line-height: 144px;margin-right:10px"
                />
                <div class="demo-upload-list-cover">
                  <Icon
                    type="ios-trash-outline"
                    @click="handleRemove(item)"
                  ></Icon>
                </div>
              </template>
              <template v-else>
                <Progress
                  v-if="item.showProgress"
                  :percent="item.percentage"
                  hide-info
                ></Progress>
              </template>
            </div>
            <Upload
              v-show="uploadList.length < 1"
              ref="upload"
              :show-upload-list="false"
              :format="['jpg', 'jpeg', 'png']"
              :before-upload="handleBeforeUpload"
              type="drag"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
              style="display: inline-block;width:335px;"
            >
              <div
                style="width:335px; height:160px; display:flex; flex-direction: column;justify-content: center; align-items: center"
              >
                <Button icon="ios-cloud-upload-outline"
                  >选择上传文件或者将文件拖拽至区域内</Button
                >
                <p>只能上传jpg/png格式文件</p>
                <p>首页/百科banner尺寸：335*144px</p>
                <p>分子派对：345*140</p>
                <p>引导页尺寸：px</p>
                <p>弹窗广告尺寸：px</p>
                <p>开屏广告尺寸：px</p>
              </div>
            </Upload>
          </FormItem>
          <FormItem label=" 跳转类型：" prop="jump_type">
            <Select v-model="formData.jump_type" @on-change="changeSelect">
              <Option
                v-for="item in ad_jump_type"
                :value="item.id"
                :key="item.id"
                :label="item.name"
              ></Option>
            </Select>
          </FormItem>
          <FormItem
            label="跳转链接："
            prop="jump_url"
            v-if="formData.jump_type === 1 || formData.jump_type === 2"
          >
            <Input v-model="formData.jump_url" type="text" />
          </FormItem>
          <FormItem
            label="跳转文章/视频："
            prop="jump_view"
            v-if="formData.jump_type === 3"
          >
            <Button long @click="selectContent">{{
              formData.jump_view ? "查看已选作品" : "选择关联作品"
            }}</Button>
          </FormItem>
          <!-- liwei的新增 -->
          <FormItem
            label="跳转游戏："
            prop="jump_view"
            v-if="formData.jump_type === 4"
          >
            <Button long @click="selectGame">
              {{ formData.jump_view ? "查看已选游戏" : "选择关联游戏" }}
            </Button>
          </FormItem>
          <FormItem
            label="跳转百科："
            prop="jump_view"
            v-if="formData.jump_type === 5"
          >
            <Button long @click="selectWiki">{{
              formData.jump_view ? "查看已选百科" : "选择关联百科"
            }}</Button>
          </FormItem>
          <FormItem
            label="跳转词条："
            prop="jump_view"
            v-if="formData.jump_type === 6"
          >
            <Button long @click="selectCitiao">
              {{ formData.jump_view ? "查看已选词条" : "选择关联词条" }}
            </Button>
          </FormItem>
          <FormItem
            label="跳转词条："
            prop="jump_view"
            v-if="formData.jump_type === 7"
          >
            <Button long @click="selectTZ">
              {{ formData.jump_view ? "查看已选帖子" : "选择关联帖子" }}
            </Button>
          </FormItem>
          <Button
            type="primary"
            size="large"
            @click="handleSubmit"
            style="display: block; margin: 0 auto;"
            >提交</Button
          >
        </Form>
      </Col>
    </Row>
    <Modal title="关联作品" v-model="visible" width="825" @on-cancel="cancel">
      <p>
        提示:
        <span style="color: red">不选择则默认跳转文章/视频列表</span>
      </p>
      <Table border :columns="columns" :data="data" max-height="550"></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParams.total"
        :current="pageParams.page"
        :page-size="pageParams.per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Modal>

    <!-- 游戏弹窗 -->
    <Modal title="关联游戏" v-model="gameShow" width="825" @on-cancel="cancel">
      <div>
        <span>搜索内容：</span>
        <Input
          v-model="gameSearch"
          placeholder="输入游戏名称或者ID"
          style="width: 300px"
        />
        <Button type="primary" @click="searchGame">查询</Button>
      </div>
      <Table
        border
        :columns="gameColumns"
        :data="gameData"
        max-height="550"
      ></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParamsYX.total"
        :current="pageParamsYX.page"
        :page-size="pageParamsYX.per_page"
        @on-change="handlePageChangeYX"
        @on-page-size-change="handlePageSizeChangeYX"
      />
    </Modal>
    <!-- 词条弹窗 -->
    <Modal
      title="关联百科词条"
      v-model="citiaoShow"
      width="825"
      @on-cancel="cancel"
    >
      <div>
        <span>搜索内容：</span>
        <Input
          v-model="citiaoSearch"
          placeholder="输入百科词条名称"
          style="width: 300px"
        />
        <Button type="primary" @click="searchCt">查询</Button>
      </div>
      <Table
        border
        :columns="citiaoColumns"
        :data="citiaoData"
        max-height="550"
      ></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParamsCt.total"
        :current="pageParamsCt.page"
        :page-size="pageParamsCt.per_page"
        @on-change="handlePageChangeCt"
        @on-page-size-change="handlePageSizeChangeCt"
      />
    </Modal>
    <!-- 百科弹窗 -->
    <Modal title="关联百科" v-model="wikiShow" width="825" @on-cancel="cancel">
      <div>
        <span>搜索内容：</span>
        <Input
          v-model="wikiSearch"
          placeholder="输入游戏名称或ID"
          style="width: 300px"
        />
        <Button type="primary" @click="searchWiki">查询</Button>
      </div>
      <Table
        border
        :columns="wikiColumns"
        :data="wikiData"
        max-height="550"
      ></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParamsBk.total"
        :current="pageParamsBk.page"
        :page-size="pageParamsBk.per_page"
        @on-change="handlePageChangeBk"
        @on-page-size-change="handlePageSizeChangeBk"
      />
    </Modal>
    <!-- 帖子弹窗 -->
    <Modal title="关联帖子" v-model="circleShow" width="825" @on-cancel="cancel">
      <div style="margin-bottom: 20px">
        <span>搜索内容：</span>
        <Input
          v-model="circleSearch"
          placeholder="请输入帖子ID搜索"
          clearable
          style="width: 300px"
        />
        <Button type="primary" @click="searchTZ">查询</Button>
      </div>
      <Table
        border
        :columns="circleColumns"
        :data="circleData"
        max-height="550"
      ></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParamsTZ.total"
        :current="pageParamsTZ.page"
        :page-size="pageParamsTZ.per_page"
        @on-change="handlePageChangeTZ"
        @on-page-size-change="handlePageSizeChangeTZ"
      />
    </Modal>
    <!-- 图片裁剪弹窗 -->
    <modal
      v-model="cropperFlag"
      :mask-closable="false"
      width="432"
      :closable="false"
      @on-ok="onCubeImg"
    >
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
  </Card>
</template>

<script>
import axios from "axios";
import { VueCropper } from "vue-cropper";
import { formateDate } from "@/directive/tool.js";
import {
  BannerTempGetPostList,
  getAdCode,
  getContentList,
  getQiniuToken,
  bannerAdd,
  bannerEditCode,
  bannerEdit,
  gameWikiList,
  gameWikiEntryList,
  gameList
} from "@/api/data";
import { mapMutations } from "vuex";
export default {
  watch: {
    $route(to, from) {
      if (to.meta.title === from.meta.title && to.query.id !== from.query.id) {
        this.bannerEditCode(to.query.id);
      }
    }
  },
  components: {
    VueCropper
  },
  data() {
    return {
      circleSearchParams:'',
      circleSearch:'',
      tempCurrentid: "",
      wikiSearch: "",
      wikiSearchParams: "",
      citiaoSearch: "",
      citiaoSearchParams: "",
      gameSearch: "",
      gameSearchParams: "",
      visible: false,
      gameShow: false,
      citiaoShow: false,
      wikiShow: false,
      id: null,
      app: [],
      ad_position: [],
      ad_jump_type: [],
      qiniuToken: "",
      uploadList: [],
      cropperFlag: false,
      imageBaseUrl: "https://cdn.tinytiger.cn/",
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParamsYX: {
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParamsCt: {
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParamsBk: {
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParamsTZ: {
        total: 0,
        page: 1,
        per_page: 10
      },
      option: {
        img: "", // 裁剪图片的地址
        type: "",
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: "jpeg", // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, // 是否输出原图比例的截图
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [335, 144], // 截图框的宽高比例
        autoCropWidth: 335, // 默认生成截图框宽度
        autoCropHeight: 144, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      currentChoose: "",
      data: [],
      gameData: [],
      citiaoData: [],
      wikiData: [],
      circleData:[],
      circleShow:false,
      citiaoColumns: [
        {
          title: "内容ID",
          key: "id"
        },
        {
          title: "词条名称",
          key: "name"
        },
        {
          title: "所属游戏名称",
          key: "game_name"
        },
        {
          title: "选择",
          render: (h, params) => {
            let id = params.row.id;
            let flag = false;
            let self = this;
            if (Number(self.formData.jump_view) === id) flag = true;
            else flag = false;
            return h("div", [
              h("Radio", {
                props: { value: flag },
                on: {
                  "on-change": () => {
                    self.formData.jump_view = id;
                  }
                }
              })
            ]);
          }
        }
      ],

      wikiColumns: [
        {
          title: "游戏ID",
          key: "id"
        },
        {
          title: "游戏名称",
          key: "name"
        },
        {
          align: "center",
          title: "logo",
          key: "logo",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: { src: params.row.logo },
                style: { width: "50px", height: "50px", margin: "auto" }
              })
            ]);
          }
        },
        {
          title: "上传时间",
          key: "create_time"
        },
        {
          title: "选择",
          render: (h, params) => {
            let id = params.row.id;
            let flag = false;
            let self = this;
            if (Number(self.formData.jump_view) === id) flag = true;
            else flag = false;
            return h("div", [
              h("Radio", {
                props: { value: flag },
                on: {
                  "on-change": () => {
                    self.formData.jump_view = id;
                  }
                }
              })
            ]);
          }
        }
      ],

      gameColumns: [
        {
          title: "游戏ID",
          key: "id"
        },
        {
          title: "游戏名称",
          key: "name"
        },
        {
          align: "center",
          title: "logo",
          key: "logo",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: { src: params.row.logo },
                style: { width: "50px", height: "50px", margin: "auto" }
              })
            ]);
          }
        },
        {
          title: "上传时间",
          key: "create_time"
        },
        {
          title: "选择",
          render: (h, params) => {
            let id = params.row.id;
            let flag = false;
            let self = this;
            if (Number(self.formData.jump_view) === id) flag = true;
            else flag = false;
            return h("div", [
              h("Radio", {
                props: { value: flag },
                on: {
                  "on-change": () => {
                    self.formData.jump_view = id;
                  }
                }
              })
            ]);
          }
        }
      ],
      columns: [
        {
          title: "内容id",
          width: 80,
          key: "id"
        },
        {
          title: "标题",
          key: "title"
        },
        {
          title: "类型",
          width: 80,
          render: (h, params) => {
            return h("div", {}, params.row.type === 1 ? "图文" : "视频");
          }
        },
        {
          title: "上传时间",
          key: "create_time"
        },
        {
          title: "选择",
          width: 60,
          render: (h, params) => {
            let id = params.row.id;
            let flag = false;
            let self = this;
            if (Number(self.formData.jump_view) === id) flag = true;
            else flag = false;
            return h("div", [
              h("Radio", {
                props: { value: flag },
                on: {
                  "on-change": () => {
                    self.formData.jump_view = id;
                  }
                }
              })
            ]);
          }
        }
      ],
      circleColumns:[
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
              // if (Number(this.currentid) === id) flag = true;
              if (Number(self.formData.jump_view) === id) flag = true;

              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      // self.currentid = id;
                      self.formData.jump_view = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
      ],
      formData: {
        checkcode: "",
        app_id: null,
        position_id: null,
        title: "",
        start_time: "",
        end_time: "",
        image: "",
        jump_type: null,
        jump_url: "",
        jump_view: 0
      },
      formRules: {
        app_id: [{ required: true, message: "请选择目标应用" }],
        position_id: [{ required: true, message: "请选择广告位置" }],
        title: [
          { required: true, message: "请输入广告名称" },
          { type: "string", max: 30, message: "最多只能输入30个字符" }
        ],
        start_time: [{ required: true, message: "请选择开始时间" }],
        end_time: [{ required: true, message: "请选择到期时间" }],
        image: [{ required: true, message: "请上传广告图片" }],
        jump_type: [{ required: true, message: "请选择跳转类型" }],
        jump_url: [{ required: true, message: "请输入广告链接" }],
        jump_view: [{ required: true, message: "请选择关联作品" }]
      }
    };
  },
  mounted() {
    this.init();
    // this.formData.start_time = new Date();
    // this.formData.end_time = ""
    // this.startTimeOption(this.formData.start_time)
    // this.endTimeOption(this.formData.end_time)
  },
  methods: {
    
    selectTZ() {
      this.circleShow = true;
      this.getGameData_jumptype7();
      this.tempCurrentid = this.formData.jump_view;
    },
    // 选择词条的按钮
    selectCitiao() {
      this.citiaoShow = true;
      this.tempCurrentid = this.formData.jump_view;
    },
    selectGame() {
      this.gameShow = true;
      this.tempCurrentid = this.formData.jump_view;
    },
    selectWiki() {
      this.wikiShow = true;
      this.tempCurrentid = this.formData.jump_view;
    },
    cancel() {
      if (this.formData.jump_view) {
        this.formData.jump_view = this.tempCurrentid;
      }
    },
    changeSelect() {
      this.formData.jump_view = "";
      //20200506切换跳转链接清空的问题
      this.formData.jump_url = "";
    },
    // 查询游戏数据
    searchGame() {
      this.gameSearchParams = this.gameSearch;
      this.pageParamsYX.page = 1;
      this.gameList();
    }, // 获取游戏列表查询
    async gameList() {
      await gameList({
        search: this.gameSearchParams,
        page: this.pageParamsYX.page,
        per_page: this.pageParamsYX.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.gameData = res.data.data.data;
          this.pageParamsYX.total = res.data.data.total;
        }
      });
    },
    ...mapMutations(["closeTag"]),
    init() {
      this.getQiniuToken();
      this.id = this.$route.query.id;
      if (this.id) this.bannerEditCode(this.id);
      else this.getAdCode();
    },

    async getQiniuToken() {
      await getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken;
        }
      });
    },
    // 获取关联帖子的数据 当jump_type=7时
    getGameData_jumptype7() {
      BannerTempGetPostList({
        post_id: this.circleSearch,
        page: this.pageParamsTZ.page,
        per_page: this.pageParamsTZ.per_page
      }).then(res => {
        this.circleData = res.data.data.data;
        this.pageParamsTZ.total = res.data.data.total
      });
    },
    async getAdCode() {
      await getAdCode().then(res => {
        if (res.data.code === 200) {
          this.app = res.data.data.app;
          this.ad_position = res.data.data.ad_position;
          this.ad_jump_type = res.data.data.jump_type;
          this.data = res.data.data.content_list.data;
          this.pageParams.total = res.data.data.content_list.total;
          this.gameData = res.data.data.game_list.data; // 游戏列表
          this.pageParamsYX.total = res.data.data.game_list.total;
          this.citiaoData = res.data.data.wiki_entry.data; // 百科词条
          this.pageParamsCt.total = res.data.data.wiki_entry.total;
          this.wikiData = res.data.data.game_wiki.data; // 游戏百科列表
          this.pageParamsBk.total = res.data.data.game_wiki.total;
          this.formData.checkcode = res.data.data.checkcode;
          this.pageParams.total = res.data.data.content_list.total;
        }
      });
    },
    //编辑数据回显
    bannerEditCode(id) {
      bannerEditCode({ id: id }).then(res => {
        if (res.data.code === 200) {
          if (res.data.code === 200) {
            this.app = res.data.data.app;
            this.ad_position = res.data.data.ad_position;
            this.ad_jump_type = res.data.data.jump_type;
            this.data = res.data.data.content_list.data;
            this.gameData = res.data.data.game_list.data; // 游戏列表
            this.citiaoData = res.data.data.wiki_entry.data; // 百科词条
            this.wikiData = res.data.data.game_wiki.data; // 游戏百科列表

            this.$refs.upload.fileList = [
              {
                percentage: 100,
                showProgress: false,
                status: "finished",
                url: res.data.data.info.image
              }
            ];
            this.uploadList = this.$refs.upload.fileList;
            this.formData = {
              checkcode: res.data.data.checkcode,
              ...res.data.data.info
            };
            this.pageParams.total = res.data.data.content_list.total;
            this.pageParamsYX.total = res.data.data.game_list.total;
            this.pageParamsBk.total = res.data.data.game_wiki.total;
            this.pageParamsCt.total = res.data.data.wiki_entry.total;
          }
        }
      });
    },
    selectContent() {
      this.visible = true;
      this.tempCurrentid = this.formData.jump_view;
      // 当点击查看已选
      // this.bannerEditCode(this.$route.query.id)
      // this.getContentList()
    },
    // 查询词条数据
    searchCt() {
      this.citiaoSearchParams = this.citiaoSearch;
      this.pageParamsCt.page = 1;
      this.gameWikiEntryList();
    },
    // 查询遊戲百科
    searchWiki() {
      this.pageParamsBk.page = 1;
      this.wikiSearchParams = this.wikiSearch;
      this.gameWikiList();
    },
    searchTZ() {
      this.pageParamsTZ.page = 1;
      this.circleSearchParams = this.circleSearch;
      this.getGameData_jumptype7();
    },
    // 获取游戏百科列表
    // async gameWikiList () {
    //   await gameWikiList({
    //     search: this.gameSearch,
    //     page: this.pageParamsYX.page,
    //     per_page: this.pageParamsYX.per_page
    //   }).then(res => {
    //     if (res.data.code === 200) {
    //       this.gameData = res.data.data.data;
    //       this.pageParamsYX.total = res.data.data.total;
    //     }
    //   });
    // },
    // 获取游戏百科列表
    async gameWikiList() {
      await gameWikiList({
        search: this.wikiSearchParams,
        page: this.pageParamsBk.page,
        per_page: this.pageParamsBk.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.wikiData = res.data.data.data;
          this.pageParamsBk.total = res.data.data.total;
        }
      });
    },
    // 获取游戏词条列表
    async gameWikiEntryList() {
      await gameWikiEntryList({
        search: this.citiaoSearchParams,
        page: this.pageParamsCt.page,
        per_page: this.pageParamsCt.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.citiaoData = res.data.data.data;
          this.pageParamsCt.total = res.data.data.total;
        }
      });
    },

    async getContentList() {
      await getContentList({
        page: this.pageParams.page,
        per_page: this.pageParams.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data;
          // console.log('关联作品', this.data)
          this.pageParams.total = res.data.data.total;
        }
      });
    },
    bannerAdd() {
      const { start_time, end_time } = this.formData;
      if (start_time) this.formData.start_time = formateDate(start_time);
      if (end_time) this.formData.end_time = formateDate(end_time);
      if (
        start_time &&
        end_time &&
        new Date(end_time).getTime() < new Date(start_time).getTime()
      ) {
        return this.$Message.warning("结束时间不能小于开始时间");
      }
      // console.log('提交：', this.formData)
      bannerAdd(this.formData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("成功!");
          this.closeTag(this.$route);
          this.$router.push({ path: "/operation/ad_list" });
        }
      });
    },
    bannerEdit() {
      this.formData.start_time = formateDate(this.formData.start_time);
      this.formData.end_time = formateDate(this.formData.end_time);
      bannerEdit(this.formData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("成功!");
          this.closeTag(this.$route);
          this.$router.push({ path: "/operation/ad_list" });
        }
      });
    },
    handlePageChange(page) {
      this.pageParams.page = page;
      this.getContentList();
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1;
      this.pageParams.per_page = size;
      this.getContentList();
    },
    handlePageChangeCt(page) {
      this.pageParamsCt.page = page;
      this.gameWikiEntryList();
    },
    handlePageSizeChangeCt(size) {
      this.pageParamsCt.page = 1;
      this.pageParamsCt.per_page = size;
      this.gameWikiEntryList();
    },

    handlePageChangeBk(page) {
      this.pageParamsBk.page = page;
      this.gameWikiList();
    },
    handlePageSizeChangeBk(size) {
      this.pageParamsBk.page = 1;
      this.pageParamsBk.per_page = size;
      this.gameWikiList();
    },

    handlePageChangeYX(page) {
      this.pageParamsYX.page = page;
      this.gameList();
    },
    handlePageSizeChangeYX(size) {
      this.pageParamsYX.page = 1;
      this.pageParamsYX.per_page = size;
      this.gameList();
    },
    
    handlePageChangeTZ(page) {
      this.pageParamsTZ.page = page;
      this.getGameData_jumptype7();
    },
    handlePageSizeChangeTZ(size) {
      this.pageParamsTZ.page = 1;
      this.pageParamsTZ.per_page = size;
      this.getGameData_jumptype7();
    },

    handleStartDateChange(date, type) {
      // let nowDate = new Date(date)
      // let nowTime = new Date().valueOf()
      // if (nowDate.getTime() < nowTime) {
      //   this.$Message.info('选择时间不能小于当前时间')
      //   return
      // }
      // console.log(this.formData.start_time)
      // this.formData.start_time = date
    },
    handleEndDateChange(date, type) {
      if (this.formData.start_time == "") {
        this.$Message.info("请先选择开始时间");
        return;
      }
      this.formData.end_time = date;
      let endTime = this.formData.end_time
        ? new Date(this.formData.end_time).valueOf() - 1 * 24 * 60 * 60 * 1000
        : "";
      this.startTimeOptions = {
        disabledDate: date => {
          return date && date.valueOf() > endTime;
        }
      };
    },
    handleSubmit() {
      this.$refs.addBannerForm.validate(valid => {
        if (valid) {
          let id = this.$route.query.id;
          if (id) this.bannerEdit();
          else this.bannerAdd();
        }
      });
    },
    // 图片 上传
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob(urlData) {
      let bytes = window.atob(urlData.split(",")[1]); // 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length);
      let ia = new Uint8Array(ab);
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], { type: "image/jpeg" });
    },
    onCubeImg() {
      // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this;
      this.$refs.cropper.getCropData(data => {
        this.getQiniuToken();
        let file = this.convertBase64UrlToBlob(data);
        var formData = new FormData();
        formData.append("file", file);
        formData.append("token", this.qiniuToken);
        const url = "http://upload-z2.qiniu.com/";
        axios
          .post(url, formData, {
            contentType: false,
            processData: false,
            headers: { "Content-Type": "application/octet-stream" }
          })
          .then(res => {
            if (res.status === 200) {
              if (this.option.type === "hdfile") {
                this.formData.image = this.imageBaseUrl + res.data.key;
                this.uploadList.push({
                  status: "finished",
                  url: this.formData.image
                });
              }
            } else {
              that.$Message.error("上传失败");
            }
          });
      });
      this.option.img = "";
      this.cropperFlag = false;
      this.submitStatus = false;
    },
    getPic(file, type) {
      if (
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/png"
      ) {
        this.$Modal.error({
          title: "文件格式不正确",
          desc:
            "文件 " +
            file.name +
            " 格式不正确，请上传 jpg 或者 png 格式的图片。"
        });
        return false;
      }
      var reader = new FileReader();
      reader.onload = e => {
        let data;
        if (typeof e.target.result === "object") {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]));
        } else {
          data = e.target.result;
        }
        this.option.img = data;
      };
      reader.readAsDataURL(file);
      if (type === "cover") {
        this.option.fixedNumber = [335, 144];
        this.option.autoCropWidth = 335;
        this.option.autoCropHeight = 187;
        this.$refs.cropper.refresh();
      }
      // console.log('formData.position_id', this.formData.position_id)
      this.cropperFlag = true;
    },
    handleRemove(file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      this.uploadList = this.$refs.upload.fileList;
      this.formData.image = "";
    },
    handleBeforeUpload(file) {
      this.uploadList = [];
      this.option.type = "hdfile";
      this.getPic(file, "cover");
      return false;
    }
    // handleSuccess (res, file) {
    //   file.url = this.imageBaseUrl + res.key
    //   this.uploadList = this.$refs.upload.fileList
    //   this.formData.image = file.url
    // },
    // handleFormatError (file) {
    //   this.$Notice.warning({
    //     title: '文件格式不正确',
    //     desc:
    //       '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
    //   })
    // },
    // handleMaxSize (file) {
    //   this.$Notice.warning({
    //     title: '超出文件大小限制',
    //     desc: '文件 ' + file.name + ' 太大，不能超过 1M。'
    //   })
    // },
    // handleBeforeUpload () {
    //   const check = this.uploadList.length < 1
    //   if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
    //   return check
    // }
  }
};
</script>

<style>
.page {
  margin-top: 20px;
  text-align: center;
}
.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 335px;
  height: 144px;
  background: rgba(0, 0, 0, 0.6);
}
.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i {
  display: block;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 70px auto;
}
.cropper {
  width: 400px;
  height: 400px;
}
</style>
