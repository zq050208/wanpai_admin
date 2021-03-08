<template>
  <div class="addOrEdit_pic_banner">
    <Card>
      <Form ref="bannerRef" :model="bannerForm" :rules="bannerRules" :label-width="400">
        <!-- 广告名称 -->
        <FormItem prop="name" label="广告名称：" style="width:800px">
          <Input
            type="text"
            v-model="bannerForm.name"
            placeholder="请输入广告名称"
            :maxlength="template_id == 1?'20':'6'"
          />
        </FormItem>
        <!-- 开始时间 -->
        <FormItem prop="start_time" label="开始时间：" style="width:800px">
          <DatePicker
            v-model="bannerForm.start_time"
            type="datetime"
            placeholder="请选择开始时间："
            style="width: 100%"
            @on-change="handleStartDateChange"
          />
        </FormItem>
        <!-- 结束时间 -->
        <FormItem prop="end_time" label="结束时间：" style="width:800px">
          <DatePicker
            v-model="bannerForm.end_time"
            type="datetime"
            placeholder="请选择结束时间："
            style="width: 100%"
            @on-change="handleEndDateChange"
          />
        </FormItem>
        <!-- 文本图片 -->
        <FormItem label="文本图片：" prop="img_url">
          <Cropper
            @img_url="img_url"
            :autoCropWidth="autoCropWidth"
            :autoCropHeight="autoCropHeight"
            :banner_img_url="bannerForm.img_url"
            :imgWidth="imgWidth"
            :imgHeight="imgHeight"
            :fixedNumber="fixedNumber"
          ></Cropper>
        </FormItem>
        <!-- 跳转类型 -->
        <FormItem label="跳转类型：" prop="jump_type" style="width:800px">
          <!-- <Input v-model="formData.jump_type" placeholder="请选择跳转类型" /> -->
          <Select v-model="bannerForm.jump_type" style="width:100%" @on-change="changeSelect">
            <Option
              v-for="item in myJump_type"
              :value="item.value"
              :key="item.value"
            >{{ item.type }}</Option>
          </Select>
        </FormItem>
        <!-- [跳转外部链接] -->
        <FormItem
          label="跳转目标："
          prop="jump_url"
          v-if="bannerForm.jump_type === 1"
          style="width:800px"
        >
          <Input v-model="bannerForm.jump_url" placeholder="请输入外部链接" />
        </FormItem>
        <!-- [跳转帖子详情] -->
        <FormItem
          label="跳转帖子详情："
          prop="jump_url"
          v-if="bannerForm.jump_type === 8"
          style="width:800px"
        >
          <Button long @click="jump_content('invitation')">关联帖子</Button>
        </FormItem>
        <!-- [跳转游戏] -->
        <FormItem
          label="跳转游戏："
          prop="jump_url"
          v-if="bannerForm.jump_type === 3"
          style="width:800px"
        >
          <Button long @click="jump_content('game')">{{bannerForm.jump_url ? "查看已选游戏" : "选择关联游戏"}}</Button>
        </FormItem>

        <!-- [跳转百科] -->
        <FormItem
          label="跳转百科："
          prop="jump_url"
          v-if="bannerForm.jump_type === 4"
          style="width:800px"
        >
          <Button long @click="jump_content('wiki')">{{bannerForm.jump_url ? "查看已选百科" : "选择关联百科"}}</Button>
        </FormItem>

        <!-- 跳转词条 -->
        <FormItem
          label="跳转词条："
          prop="jump_url"
          v-if="bannerForm.jump_type === 5"
          style="width:800px"
        >
          <Button long @click="jump_content('entry')">
            {{
            bannerForm.jump_url ? "查看已选词条" : "选择关联词条"
            }}
          </Button>
        </FormItem>
        <!-- 跳转文章视频 -->
        <FormItem
          label="跳转文章视频："
          prop="jump_url"
          v-if="bannerForm.jump_type === 6"
          style="width:800px"
        >
          <Button long @click="jump_content('video')">
            {{
            bannerForm.jump_url ? "查看已选作品" : "选择关联作品"
            }}
          </Button>
        </FormItem>
        <!-- 是否显示 -->
        <FormItem label="是否显示：" prop="is_show">
          <i-switch
            :value="bannerForm.is_show===0?false:true"
            @on-change="bannerForm.is_show = bannerForm.is_show === 1 ? 0 : 1"
          />
        </FormItem>
        <Button type="primary" style="margin-left:500px;" @click="issuanceBtn">发布</Button>
      </Form>
    </Card>

    <!-- 跳转对象选择对话框 -->
    <Modal v-model="jumpModal" :title="jumpModal_title" width="800" @on-cancel="cancelCurrentID">
      <!-- 顶部搜索区域 -->
      <div class="searchInput">
        <template v-if="bannerForm.jump_type!==6">
          搜索内容：
          <Input
            clearable
            v-model="searchParams.search"
            :placeholder="bannerForm.jump_type===5?'输入百科词条名称':'输入游戏名称或ID'"
            style="width: 300px;marginRight:50px"
            @on-clear="searchContent"
            v-if="bannerForm.jump_type!==8"
          />
          <InputNumber
            v-model="searchParams.post_id"
            v-else
            style="width: 300px;marginRight:50px"
            placeholder="输入帖子ID搜索"
            clearable
          />
          <Button type="primary" @click="searchContent">查询</Button>
        </template>
        <!-- 表格区域 -->
        <Table :columns="jump_tableTh" :data="jump_tableData" border style="margin-top:15px"></Table>
        <!-- 分页 -->
        <page
          class="page"
          show-elevator
          show-sizer
          show-total
          :total="total"
          :current="current"
          :page-size-opts="[10,20,30]"
          @on-change="page_change"
          @on-page-size-change="page_size_change"
        />
      </div>
      <template #footer>
        <Button type="primary" @click="comfirmClick">确认</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import axios from "axios";
import { VueCropper } from "vue-cropper";
import { formatDate } from "@/libs/util";
import Cropper from "_c/cropper_vue/cropper";
import {
  getQiniuToken,
  BannerTempGetGameList,
  BannerTempGetWikiList,
  BannerTempGetWikiEntryList,
  BannerTempGetContentList,
  BannerTempGetPostList,
  bannerTempAdd,
  bannerTempEdit,
  bannerTemp_addView,
  BannerTempDetail
} from "@/api/data";
import { mapMutations } from "vuex";
import { getQiniuToken_ } from "@/libs/util";

export default {
  name: "addOrEdit_pic_banner",
  components: {
    VueCropper,
    Cropper
  },
  data() {
    return {
      autoCropWidth: null,
      autoCropHeight: null,
      fixedNumber: [],
      imgWidth: 0,
      imgHeight: 0,
      myJump_type: [
        { type: "无跳转", value: 0 },
        { type: "跳转外部链接", value: 1 },
        { type: "跳转帖子详情", value: 8 },
        { type: "跳转游戏详情-详情", value: 3 },
        { type: "跳转游戏详情-百科", value: 4 },
        { type: "跳转词条", value: 5 },
        { type: "跳转文章视频", value: 6 }
      ],
      template_id: this.$route.query.template_id,
      bannerForm: {
        checkcode: "",
        submod_id: this.$route.query.submod_id,
        name: "",
        start_time: "",
        end_time: "",
        img_url: "",
        jump_type: null,
        jump_url: "",
        is_show: 0
      },
      bannerRules: {
        name: [
          {
            required: true,
            message: "请输入广告名称",
            trigger: "change"
          }
        ],
        start_time: [{ required: true, message: "请选择时间" }],
        end_time: [{ required: true, message: "请选择时间" }],
        img_url: [
          {
            required: true,
            message: "请选择上传图片",
            validator: (rule, value, callback) => {
              if (!this.bannerForm.img_url) {
                return callback(new Error("文本图片不能为空"));
              } else {
                callback();
              }
            }
          }
        ],
        jump_type: [{ required: true, message: "请选择跳转类型" }],
        is_show: [{ required: true }],
        jump_url: [
          {
            required: true,
            trigger: "change",
            message: "请选择跳转目标",
            validator: (rule, value, callback) => {
              if (!this.bannerForm.jump_url) {
                return callback(new Error("跳转目标不能为空"));
              } else {
                callback();
              }
            }
          }
        ]
      },
      jumpModal: false,
      jumpModal_title: "",
      currentid: "",
      searchParams: {
        page: 1,
        per_page: 10,
        search: null,
        post_id: null // 帖子id
      },
      jump_tableTh: [],
      jump_tableData: [],
      // 词条表头
      entryColumns: [
        {
          title: "内容ID",
          key: "id",
          align: "center"
        },
        {
          title: "词条名称",
          key: "name",
          align: "center"
        },
        {
          title: "所属游戏名称",
          key: "game_name",
          align: "center"
        },
        {
          title: "选择",
          align: "center",
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
                    this.names = params.row;
                  }
                }
              })
            ]);
          }
        }
      ],
      // 文章视频表头
      videoColumns: [
        {
          title: "内容id",
          width: 80,
          key: "id",
          align: "center"
        },
        {
          title: "标题",
          key: "title",
          align: "center"
        },
        {
          align: "center",
          title: "类型",
          width: 80,
          render: (h, params) => {
            return h("div", {}, params.row.type === 1 ? "图文" : "视频");
          }
        },
        {
          title: "上传时间",
          key: "create_time",
          align: "center"
        },
        {
          title: "文章视频选择",
          align: "center",
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
                    this.names = params.row;
                  }
                }
              })
            ]);
          }
        }
      ],
      // 游戏&百科表头
      gameColumns: [
        {
          title: "游戏ID",
          key: "id",
          align: "center",
          width: "80"
        },
        {
          title: "游戏名称",
          key: "name",
          align: "center",
          width: "200"
        },
        {
          title: "游戏Logo",
          key: "logo",
          align: "center",
          width: "150",
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
          align: "center"
        },
        {
          title: "选择",
          width: "80",
          align: "center",
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
                    this.names = params.row;
                  }
                }
              })
            ]);
          }
        }
      ],
      // 帖子详情表头
      targetDetailColumns: [
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
            return h("div", [
              h(
                "span",
                {},
                params.row.circle_name ? params.row.circle_name + "-" : ""
              ),
              h(
                "span",
                {},
                params.row.modular_name ? params.row.modular_name : ""
              )
            ]);
          }
        },
        {
          title: "选择",
          width: "80",
          align: "center",
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
                    this.names = params.row;
                  }
                }
              })
            ]);
          }
        }
      ],
      total: 0,
      current: 1,
      id: this.$route.query.id
    };
  },
  methods: {
    ...mapMutations(["closeTag"]),
    handleStartDateChange(date) {
      this.bannerForm.start_time = date;
    },
    handleEndDateChange(date) {
      this.bannerForm.end_time = date;
    },
    img_url(data) {
      this.bannerForm.img_url = data;
      this.$refs.bannerRef.validateField("img_url");
    },
    changeSelect(val) {
      this.bannerForm.jump_url = "";
    },
    // 跳转内容点击事件
    jump_content(type) {
      switch (type) {
        case "game":
          this.jumpModal_title = "关联游戏";
          this.jump_tableTh = this.gameColumns;
          this.getGameList(); // 游戏
          break;
        case "wiki":
          this.jumpModal_title = "关联百科";
          this.jump_tableTh = this.gameColumns;
          this.getWikiList(); // 百科
          break;
        case "entry":
          this.jumpModal_title = "关联词条";
          this.jump_tableTh = this.entryColumns;
          this.getGameWikiList(); // 词条 invitation
          break;
        case "video":
          this.jumpModal_title = "关联文章视频";
          this.jump_tableTh = this.videoColumns;
          this.getVideoList(); // 文章视频
          break;
        case "invitation":
          this.jumpModal_title = "关联帖子详情";
          this.jump_tableTh = this.targetDetailColumns;
          this.getTargetDetail(); // 帖子详情
          break;
      }
      this.jumpModal = true;
    },
    // 选择对象弹框 , 取消事件
    cancelCurrentID() {
      this.searchParams.post_id = this.searchParams.search = null;
      this.currentid = +this.bannerForm.jump_url;
    },
    // 查询游戏
    searchContent() {
      this.searchParams.page = 1;
      this.getJumpData();
    },
    // 根据jump_type 请求数据
    getJumpData() {
      // 3：游戏 4：百科 5：词条 6：视频 8：帖子详情
      switch (this.bannerForm.jump_type) {
        case 3:
          this.getGameList();
          break;
        case 4:
          this.getWikiList();
          break;
        case 5:
          this.getGameWikiList();
          break;
        case 6:
          this.getVideoList();
          break;
        case 8:
          this.getTargetDetail();
          break;
      }
    },

    // 获取游戏列表
    async getGameList() {
      let { data } = await BannerTempGetGameList(this.searchParams);
      this.handleChooseJumpType(data);
    },
    // 获取百科列表
    async getWikiList() {
      let { data } = await BannerTempGetWikiList(this.searchParams);
      this.handleChooseJumpType(data);
    },
    // 获取视频文章列表
    async getVideoList() {
      let { data } = await BannerTempGetContentList(this.searchParams);
      this.handleChooseJumpType(data);
    },
    // 获取百科词条列表
    async getGameWikiList() {
      let { data } = await BannerTempGetWikiEntryList(this.searchParams);
      this.handleChooseJumpType(data);
    },
    // 获取帖子详情列表
    async getTargetDetail() {
      let { data } = await BannerTempGetPostList(this.searchParams);
      this.handleChooseJumpType(data);
    },
    // 分页切换
    page_change(page) {
      this.searchParams.page = page;
      this.getJumpData();
    },
    // 当前页显示数据数量改变
    page_size_change(size) {
      this.searchParams.per_page = size;
      this.getJumpData();
    },
    // 选择对象弹框 ,确认按钮
    comfirmClick() {
      if (this.currentid === "") {
        this.$Message.error("请选择一个选项");
      } else {
        this.jumpModal = false;
        this.bannerForm.jump_url = this.currentid;
        this.$refs.bannerRef.validateField("jump_url");
      }
    },
    // 发布
    async issuanceBtn() {
      this.$refs.bannerRef.validate(async res => {
        if (res) {
          this.bannerForm.start_time = formatDate(this.bannerForm.start_time);
          this.bannerForm.end_time = formatDate(this.bannerForm.end_time);
          if (this.bannerForm.jump_type === 0) this.bannerForm.jump_url = "";
          this.$route.query.type === "add"
            ? this.bannerTempAdd()
            : this.bannerTempEdit();
        }
      });
    },
    // 获取新增banner校验码和游戏列表数据
    async bannerTemp_addView() {
      let { data } = await bannerTemp_addView();
      this.bannerForm.checkcode = data.data.checkcode;
    },
    // 新增banner
    async bannerTempAdd() {
      let { data } = await bannerTempAdd(this.bannerForm);
      this.handleSuccess(data);
    },
    // 编辑banner
    async bannerTempEdit() {
      let { data } = await bannerTempEdit(this.bannerForm);
      this.handleSuccess(data);
    },
    // 获取模板banner详情
    async BannerTempDetail() {
      let { data } = await BannerTempDetail({
        id: this.id
      });
      // jump_type === 7 重置为6 视频图文共用 6
      data.data.jump_type = data.data.jump_type === 7 ? 6 : data.data.jump_type;
      this.banner_img = data.data.img_url;
      this.currentid = +data.data.jump_url;
      this.bannerForm = { ...data.data };
    },
    handleSuccess(data) {
      if (data.code === 200) {
        this.$Message.success("操作成功");
        this.closeTag(this.$route);
      } else {
        this.bannerTemp_addView();
      }
    },
    handleChooseJumpType(data) {
      if (data.code === 200) {
        this.current = data.data.current_page;
        this.total = data.data.total;
        this.jump_tableData = data.data.data;
      }
    }
  },
  mounted() {
    getQiniuToken_().then(res => {
      this.qiniuToken = res;
    });
    this.bannerTemp_addView();
    this.$route.query.type === "edit" && this.BannerTempDetail();
  },
  watch: {
    template_id: {
      immediate: true,
      handler() {
        this.imgWidth = this.autoCropWidth =
          this.template_id == 1 ? 179 * 2 : 50 * 2;
        this.imgHeight = this.autoCropHeight =
          this.template_id == 1 ? 100 * 2 : 50 * 2;
        this.fixedNumber = this.template_id == 1 ? [358, 200] : [1, 1];
      }
    }
  }
};
</script>

<style lang='less' scoped>
.searchInput {
  margin-bottom: 20px;
}

.page {
  margin-top: 20px;
  text-align: center;
}

.vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal {
    top: 0;
  }
}

.searchInput {
  margin-bottom: 20px;
}
</style>
