<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <!-- 列表 -->
    <Card>
      <p class="add-btn" style="margin-bottom: 10px">
        <i-button type='primary' @click="addOrEdit('add',true)">添加圈子</i-button>
      </p>
      <Table border :columns="columns" :data="tableData" ref="table"></Table>
      <div style="text-align: center;margin-top: 15px">
        <Page
          class="page"
          show-elevator
          show-sizer
          show-total
          :total="total"
          :current="page"
          :page-size="per_page"
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
        />
      </div>
    </Card>
    <!-- 编辑 or 添加弹框 -->
    <Modal v-model="editOraddModel" :mask-closable="false" @on-cancel="resetBanned">
      <p slot="header" style="text-align:center">
        <span>{{editOraddText}}圈子</span>
      </p>
      <Form ref="editOraddForm" :model="contentFormData" :rules="contentFormRules">
        <FormItem label="圈子名称：" prop="name">
          <Input v-model="contentFormData.name" style="width:200px" :maxlength="20" />
        </FormItem>
        <!-- 文本图片 -->
        <FormItem label="圈子背景图：" prop="img_url">
          <div class="demo-upload-list" v-if="banner_img">
            <template v-if="banner_img">
              <img :src="banner_img" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove"></Icon>
              </div>
            </template>
          </div>
          <Upload
            ref="upload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            :format="['jpg','jpeg','png']"
            :before-upload="handleBeforeUpload"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="圈子头像：" prop="head_img_url">
          <div class="demo-upload-list" v-if="head_img">
            <template v-if="head_img">
              <img :src="head_img" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove_head"></Icon>
              </div>
            </template>
          </div>
          <Upload
            ref="upload_head"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            :format="['jpg','jpeg','png']"
            :before-upload="handleBeforeUpload_head"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        <FormItem label=" 圈子简介：" prop="introduce">
          <Input
            type="textarea"
            :autosize="{minRows: 4,maxRows: 4}"
            v-model="contentFormData.introduce"
            style="width:200px"
            :maxlength="50"
          />
        </FormItem>
        <!-- 是否显示 -->
        <FormItem label="是否显示：" prop="is_show">
          <i-switch v-model="contentFormData.is_show" />
        </FormItem>
      </Form>
      <div slot="footer" style="text-align:center">
        <Button type="primary" size="default" :disabled="editStatus" @click="submitData()">提交</Button>
      </div>
    </Modal>
    <!-- 图片截图 -->
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

    <!-- 图片截图 -->
    <modal
      v-model="cropperFlag_head"
      :mask-closable="false"
      width="432"
      :closable="false"
      @on-ok="onCubeImg_head"
    >
      <div class="cropper">
        <vueCropper
          ref="cropperFlag_head"
          :img="option_head.img"
          :outputSize="option_head.outputSize"
          :outputType="option_head.outputType"
          :info="option_head.info"
          :canScale="option_head.canScale"
          :autoCrop="option_head.autoCrop"
          :autoCropWidth="option_head.autoCropWidth"
          :autoCropHeight="option_head.autoCropHeight"
          :fixedBox="option_head.fixedBox"
          :fixed="option_head.fixed"
          :fixedNumber="option_head.fixedNumber"
          :full="option_head.full"
          :centerBox="option_head.centerBox"
        />
      </div>
    </modal>
    <!-- 图片弹窗 -->
    <Modal v-model="tabelDataImgModel" :width="600" :mask-closable="false">
      <div style="padding-top: 25px;">
        <img :src="tabImgUrl" alt="图片" style="width: 400px;align-items: center;margin-left:95px" />
      </div>
      <div slot="footer"></div>
    </Modal>
    <!-- 新增热度值弹窗 -->
    <Modal v-model="addHotModal" width="400" title="修改热度值" footer-hide>
      <Form :model="hotFormData" ref="hotFormData" label-position="left" :label-width="120">
        <!-- <FormItem label="游戏名称：">{{hotFormData.game_name}}</FormItem> -->
        <FormItem label="热度值：">
          <span style="color:red">{{hotFormData.extra_hots}}</span>
          + {{hotFormData.true_hots}} = {{Number(hotFormData.extra_hots) + Number(hotFormData.true_hots)}}
        </FormItem>
        <FormItem label="新增热度值：" prop="hots">
          <input
            type="text"
            v-model="hotFormData.extra_hots"
            name="tel"
            oninput="value=value.replace(/[^\d]/g,'')"
            maxlength="9"
            style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"
          />
        </FormItem>
      </Form>
      <Button
        type="primary"
        style="margin-left: 104px;"
        @click="handleHotSubmit('hotFormData')"
        :loading="submitLoadingStatus"
      >提交</Button>
    </Modal>
  </div>
</template>
<script>
import SearchForm from "@/components/searchForm";
import { VueCropper } from "vue-cropper";
import { getTagNavListFromLocalstorage } from "@/libs/util";
import axios from "axios";
import {
  getQiniuToken,
  circleList,
  saveCircle,
  addCircleHot,
  CircleInfo,
  clearCircleHot,
  addCircleData,
  circleStatus,
  deleteCircle
} from "@/api/data";
export default {
  components: { SearchForm, VueCropper },
  data() {
    return {
      tableData: [],
      editOraddModel: false,
      editId: null,
      editOraddText: "添加",
      qiniuToken: "",
      cropperFlag: false, // 裁剪框
      cropperFlag_head: false,
      uploadList: [],
      // 图片
      imageBaseUrl: "https://cdn.tinytiger.cn/",
      option: {
        img: "", // 裁剪图片的地址
        type: "",
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: "jpeg", // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, //是否输出原图比例的截图
        fixed: true, //是否开启截图框宽高固定比例
        fixedNumber: [375, 210], //截图框的宽高比例
        autoCropWidth: 375, // 默认生成截图框宽度
        autoCropHeight: 210, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      option_head: {
        img: "", // 裁剪图片的地址
        type: "",
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: "jpeg || png", // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, //是否输出原图比例的截图
        fixed: true, //是否开启截图框宽高固定比例
        fixedNumber: [80, 80], //截图框的宽高比例
        autoCropWidth: 80, // 默认生成截图框宽度
        autoCropHeight: 80, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      head_img: "",
      banner_img: "",
      contentFormData: {
        name: "",
        img_url: "",
        head_img_url: "",
        introduce: "",
        is_show: true
      },
      contentFormRules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        img_url: [{ required: true, message: "请上传图片" }],
        head_img_url: [{ required: true, message: "请上传图片" }],
        introduce: [{ required: true, message: "请输入简介", trigger: "blur" }],
        is_show: [{ required: false, message: "" }]
      },
      editStatus: false,
      classfiyData: [],
      tabelFormDataModel: false,
      tabelFormData: {
        hotValue: 0
      },
      submitLoadingStatus: false,
      addHotModal: false, // 新增热度值弹窗
      hotFormData: {
        id: "",
        hots: "",
        extra_hots: "",
        true_hots: "",
        hotsVal: ""
      },
      tableHotValue: "",
      total: 0,
      page: 1,
      per_page: 10,
      tabelDataImgModel: false,
      tabImgUrl: "",
      radioValue: "",
      prohibitUserList: {},
      bannedUser: "",
      prohibit_reason: [],
      prohibit_type: [],
      prohibit_source: [],
      select1: [],
      select2: [],
      searchParams: {
        date: ""
      },
      searchData: {
        date: ""
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.searchParams = { ...this.searchData };
              this.page = 1;
              this.circleList();
            }
          }
        ],
        components: [
          {
            name: "Input",
            prop: "keyword",
            label: "搜索：",
            placeholder: "输入圈子名称搜索圈子"
          },
          {
            name: "SelectDate",
            prop: "date",
            label: "创建日期："
          }
        ]
      },
      columns: [
        {
          title: "圈子名称",
          key: "name",
          align: "center",
          // width: "170px"
        },
        {
          title: "圈子背景图",
          key: "background",
          // width: "150px",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: { src: params.row.background },
                style: {
                  margin: "10px 20px 0px 0px",
                  width: "60px",
                  height: "60px",
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.showBgimg(params.row.background);
                  }
                }
              })
            ]);
          }
        },
        {
          title: "圈子头像",
          key: "logo",
          align: "center",
          // width: "130px",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: { src: params.row.logo },
                style: {
                  margin: "10px 20px 0px 0px",
                  width: "60px",
                  height: "60px",
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.showAuthimg(params.row.logo);
                  }
                }
              })
            ]);
          }
        },
        {
          title: "圈子热度值",
          key: "reason",
          align: "center",
          // width: '140px',
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    color: "#D9001B"
                  }
                },
                params.row.extra_hots + "+"
                // 20 + '+'
              ), // 运营增加的热度值
              h(
                "span",
                {
                  // style: {
                  //   color: '#D9001B'
                  // }
                },
                params.row.true_hots + "="
                // 30 + '='
              ), // 真实的热度值
              h(
                "span",
                {
                  // style: {
                  //   color: '#D9001B'
                  // }
                },
                params.row.hots
              ), // 综合热度值
              h("div", [
                h(
                  "span",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      color: "#2D8CF0",
                      "margin-right": "8px",
                      cursor: "pointer"
                    },
                    on: {
                      click: () => {
                        this.addHotModal = true;
                        let hotData = params.row;
                        this.hotFormData.id = hotData.id;
                        // this.hotFormData.game_name = hotData.name
                        this.hotFormData.hots = hotData.hots;
                        this.hotFormData.extra_hots = hotData.extra_hots;
                        this.hotFormData.true_hots = hotData.true_hots;
                        this.submitLoadingStatus = false;
                        this.hotFormData.hotsVal = hotData.extra_hots;
                      }
                    }
                  },
                  "新增"
                ),
                +params.row.extra_hots !== 0
                  ? h(
                      "span",
                      {
                        style: {
                          color: "#ED4014",
                          cursor: "pointer"
                        },
                        on: {
                          click: () => {
                            this.$Modal.confirm({
                              title: "确认清空热度值吗？",
                              onOk: () => {
                                clearCircleHot({
                                  id: params.row.id
                                }).then(res => {
                                  if (res.data.code === 200) {
                                    this.$Message.success("已清空热度值");
                                    this.circleList();
                                  }
                                });
                              }
                            });
                          }
                        }
                      },
                      "清空"
                    )
                  : ""
              ])
            ]);
          }
        },
        {
          title: "圈子发帖数",
          key: "circle_post",
          align: "center",
          // width: "110px"
        },
        {
          title: "圈子人数",
          key: "add_circle_num",
          align: "center",
          // width: "100px"
        },
        {
          title: "圈子简介",
          key: "one_introduce",
          align: "center",
          // width: "240px"
        },
        {
          title: "创建时间",
          // width: "180px",
          key: "create_time",
          align: "center"
        },
        {
          align: "center",
          title: "显示/隐藏",
          // width: '140px',
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 1,
                "true-color": "#19be6b",
                "before-change": () => this.editCateStatus(params.row.id)
              }
            });
          }
        },
        {
          title: "操作",
          key: "operation",
          width: '250px',
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  style: { margin: "0px 20px 0px 0px" },
                  on: {
                    click: () => {
                      this.addOrEdit("edit", params);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  style: { margin: "0px 20px 0px 0px" },
                  on: {
                    click: () => {
                      // this.editAtheme(params.row)
                      // 编辑当前的页签展示一个
                      let tagList = getTagNavListFromLocalstorage() || [];
                      let flag = true;
                      if (tagList.length) {
                        tagList.forEach(item => {
                          if (item.name === "editCircle") {
                            flag = false;
                          }
                        });
                      }
                      if (flag) {
                        this.$router.push({
                          path: `/game/editCircle?id=${params.row.id}`
                        })
                      } else {
                        this.$Modal.error({
                          content: "已有模板正在编辑，请关闭后在编辑当前模板",
                          title: "提示"
                        });
                      }
                    }
                  }
                },
                "圈子"
              ),
              h(
                "Button",
                {
                  props: { type: "error", size: "small" },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "确定删除吗？",
                        onOk: () => {
                          this.deleteCircle(params.row.id);
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ]
    };
  },
  mounted() {
    getQiniuToken().then(res => {
      // 获取七牛云token
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken;
      }
    });
    this.circleList();
  },
  methods: {
    // 删除圈子
    deleteCircle(id) {
      deleteCircle({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("操作成功");
          this.circleList();
        }
      });
    },
    // 添加圈子
    addOrEdit(value, data) {
      if (value === "add") {
        this.editOraddModel = true;
        this.head_img = "";
        this.banner_img = "";
        this.$refs.editOraddForm.resetFields();
        this.editOraddText = "添加";
        //  添加
      } else {
        this.editOraddText = "编辑";
        this.editId = data.row.id;
        this.editStatus = true;
        //  编辑
        CircleInfo({ id: data.row.id }).then(res => {
          this.editOraddModel = true;
          if (res.data.code === 200 && res.data.data) {
            // console.log(res.data.data.name)
            this.contentFormData.name = res.data.data.name;
            this.banner_img = res.data.data.background;
            this.head_img = res.data.data.logo;
            this.contentFormData.img_url = res.data.data.background;
            this.contentFormData.head_img_url = res.data.data.logo;
            this.contentFormData.introduce = res.data.data.one_introduce;
            this.contentFormData.is_show =
              res.data.data.is_show === 1 ? true : false;
            this.editStatus = false;
          }
        });
      }
    },
    // 图片
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
      this.$refs.cropper.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data);
        let formData = new FormData();
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
              this.banner_img = this.imageBaseUrl + res.data.key;
              this.contentFormData.img_url = this.banner_img;
            }
          });
      });
      this.option.img = "";
      this.cropperFlag = false;
    },
    onCubeImg_head() {
      // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      let that = this;
      this.$refs.cropperFlag_head.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data);
        let formData = new FormData();
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
              that.head_img = that.imageBaseUrl + res.data.key;
              that.contentFormData.head_img_url = that.head_img;
            }
          });
      });
      this.option_head.img = "";
      this.cropperFlag_head = false;
    },
    getPic(file, type) {
      if (
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/png"
      ) {
        this.$Modal.error({
          title: "文件格式不正确",
          desc: "文件 " + file.name + " 格式不正确，请上传 jpg 格式的图片。"
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
        this.option.fixedNumber = [375, 210];
        this.option.autoCropWidth = 375;
        this.option.autoCropHeight = 210;
      }
      this.$refs.cropper.refresh();
      this.cropperFlag = true;
    },
    getPic_head(file, type) {
      if (
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/png"
      ) {
        this.$Modal.error({
          title: "文件格式不正确",
          desc: "文件 " + file.name + " 格式不正确，请上传 jpg 格式的图片。"
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
        this.option_head.img = data;
      };
      reader.readAsDataURL(file);
      if (type === "cover") {
        this.option_head.fixedNumber = [80, 80];
        this.option_head.autoCropWidth = 80;
        this.option_head.autoCropHeight = 80;
      }
      this.$refs.cropperFlag_head.refresh();
      this.cropperFlag_head = true;
    },
    handleRemove(file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      this.banner_img = "";
      this.contentFormData.img_url = "";
    },
    handleRemove_head(file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload_head.fileList;
      this.$refs.upload_head.fileList.splice(fileList.indexOf(file), 1);
      this.head_img = "";
      this.contentFormData.head_img_url = "";
    },
    handleBeforeUpload(file) {
      this.option.type = "hdfile";
      this.getPic(file, "cover");
      return false;
    },
    // 上传头部
    handleBeforeUpload_head(file) {
      this.option_head.type = "hdfile";
      this.getPic_head(file, "cover");
      return false;
    },
    // 获取圈子列表
    circleList() {
      const params = { ...this.searchParams };
      const { date } = this.searchParams;
      delete params.date;
      if (date) {
        params.start_time = date[0];
        params.end_time = date[1];
      }
      let data = {
        page: this.page,
        per_page: this.per_page,
        ...params
      };
      this.tableData = [];
      circleList(data).then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data.data;
          this.page = res.data.data.current_page;
          this.total = res.data.data.total;
          if (res.data.data.data.length === 0) {
            if (this.page !== 1) {
              this.page = this.page - 1;
              this.circleList();
            }
          } else {
            return;
          }
        }
      });
    },
    // 圈子背景图 modal
    showBgimg(url) {
      this.tabelDataImgModel = true;
      this.tabImgUrl = url;
    },
    // 圈子头像 modal
    showAuthimg(url) {
      this.tabelDataImgModel = true;
      this.tabImgUrl = url;
    },
    // 分页
    handlePageChange(page) {
      this.page = page;
      this.circleList();
    },
    handlePageSizeChange(size) {
      this.per_page = size;
      this.circleList();
    },
    // 提交编辑用户
    submitData() {
      this.$refs.editOraddForm.validate(valid => {
        if (valid) {
          let data = {
            id: this.editId ? this.editId : "",
            name: this.contentFormData.name,
            one_introduce: this.contentFormData.introduce,
            background: this.contentFormData.img_url,
            logo: this.contentFormData.head_img_url,
            is_show: this.contentFormData.is_show ? 1 : 0
          };
          if (this.editOraddText == "添加") {
            delete data.id;
            addCircleData(data).then(res => {
              if (res.data.code === 200) {
                this.$Message.success("操作成功");
                this.editOraddModel = false;
                this.circleList();
              }
            });
          } else {
            saveCircle(data).then(res => {
              if (res.data.code === 200) {
                this.$Message.success("操作成功");
                this.editOraddModel = false;
                this.contentFormData = Object.assign({}, this.contentFormData);
                this.circleList();
              }
            });
          }
        }
      });
    },
    // 提交新增或编辑热度值
    handleHotSubmit(name) {
      if (!this.hotFormData.extra_hots)
        return this.$Message.error("请完善信息");
      this.submitLoadingStatus = true;
      let paramsData = { ...this.hotFormData };
      addCircleHot({
        id: paramsData.id,
        hots: paramsData.extra_hots
      }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("编辑成功");
          this.addHotModal = false;
          this.circleList();
        } else {
          this.submitLoadingStatus = false;
        }
      });
    },
    // 表格显示隐藏
    editCateStatus(id) {
      circleStatus({ id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("操作成功");
          this.circleList();
        }
      });
    },
    // 重置封禁弹框
    resetBanned() {
      this.$refs.editOraddForm.resetFields();
    }
  }
};
</script>
<style lang='less' scoped>
.contentBox {
  margin: 20px auto;
  width: 800px;
}

.demo-upload-list {
  display: inline-block;
  width: 105px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin: 0px 4px;
}
.demo-upload-list img {
  width: 100%;
  height: 100%;
}
.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}
.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
.info {
  width: 720px;
  margin: 0 auto;
  .oper-dv {
    height: 20px;
    text-align: right;
    margin-right: 100px;
    a {
      font-weight: 500;
      &:last-child {
        margin-left: 30px;
      }
    }
  }
  .info-item {
    margin-top: 15px;
    label {
      display: inline-block;
      width: 100px;
      text-align: right;
    }
    .sel-img-dv {
      position: relative;
      .sel-file {
        position: absolute;
        width: 90px;
        height: 30px;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }
      .sel-btn {
        position: absolute;
        cursor: pointer;
        z-index: 1;
      }
    }
  }
}
.cropper {
  width: 400px;
  height: 400px;
}
.publishBtn {
  margin-left: 225px;
}
</style>