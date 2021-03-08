<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <!-- 列表 -->
    <Card>
      <p class="add-btn" style="margin-bottom: 10px">
        <Button type="primary" @click="addOrEdit()">添加帖子</Button>
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
    <Modal
      v-model="editOraddModel"
      width="800px;"
      :mask-closable="false"
      @on-cancel="resetBanned"
    >
      <p slot="header" style="text-align:center">
        <span>{{editOraddText}}帖子</span>
      </p>
      <Form ref="editOraddForm" :model="contentFormData" :rules="contentFormRules">
        <FormItem label="绑定用户：" :label-width="100" prop="userName">
          <Select
            :disabled="editOraddText == '编辑'"
            ref="select"
            style="width: 200px"
            v-model="contentFormData.userName"
            @on-query-change="searchUserChange"
            @on-open-change="changeSelectUserShow"
            remote
            :remote-method="searchUser"
            filterable
            placeholder="请输入昵称搜索用户"
          >
            <Option
              v-for="item in userData"
              :value="item.user_id"
              :key="item.user_id"
              :label="item.nickname"
            ></Option>
          </Select>
        </FormItem>
        <!-- 绑定圈子： -->
        <div class="circle-wrap">
          <FormItem label="绑定圈子：" :label-width="100" prop="circle">
            <!-- <Input v-model="contentFormData.name" style="width:200px" /> -->
            <Select
              style="width: 200px;margin-right: 10px"
              v-model="contentFormData.circle"
              @on-query-change="searchCircleChange"
              remote
              :remote-method="searchCircle"
              @on-change="changeItemCircle"
              filterable
              @on-open-change="changeSelectShow"
              placeholder="请输入名称搜索圈子"
            >
              <Option
                v-for="item in circlerData"
                :value="item.id"
                :key="item.id"
                :label="item.name"
              >{{item.name}}</Option>
            </Select>
          </FormItem>
          <!-- 关联分类 -->
          <Select
            :disabled="!contentFormData.circle"
            style="width: 200px;margin-top:2px"
            v-model="contentFormData.contactCircle"
            placeholder="请输入选择分类"
          >
            <Option
              v-for="item in contactCircle"
              :value="item.id"
              :key="item.id"
              :label="item.name"
            ></Option>
          </Select>
        </div>
        <!-- 添加话题 最多三个-->
        <FormItem label="添加话题：" :label-width="100" prop="addtheme">
          <Select
            ref="Select"
            style="width: 200px"
            :label-in-value="true"
            v-model="addthemeData"
            @on-query-change="searchAddthemeChange"
            @on-change="changeAddtheme"
            @on-open-change="changeSelectAddthemeShow"
            :clearable="true"
            :filterable="true"
            placeholder="请输入名称搜索话题"
          >
            <Option v-for="item in addthemeData" :value="item.id" :key="item.id" :label="item.name"></Option>
          </Select>
          <div v-if="addthemeTagList.length">
            <Tag
              v-for="(item,index) in addthemeTagList"
              color="#E6A23C"
              :key="index"
              @on-close="delTag(index)"
              closable
            >{{item.label}}</Tag>
          </div>
        </FormItem>
        <!-- 帖子内容 -->
        <FormItem label="帖子内容：" :label-width="100" class="textarea-width" prop="invitatContent">
          <Input
            type="textarea"
            :rows="6"
            :maxlength="2000"
            :autosize="{maxRows: 6,minRows: 6}"
            v-model="contentFormData.invitatContent"
            placeholder="请输入帖子内容"
            style="width:200px"
          />
        </FormItem>
        <!-- 文本图片 最多9张 -->
        <Checkbox v-model="checkImg" style="position:relative;top:30px;"  @click.native="checkImgChange($event)" :disabled="checkVideo"></Checkbox>
        <FormItem label="图片：" :label-width="100" prop="img_url">
          <div class="demo-upload-list" v-for="(item,index) in uploadList" :key="index">
            <template>
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
              </div>
            </template>
          </div>
          <Upload
            ref="upload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            multiple
            :format="['jpg','jpeg','png']"
            :on-success="handleSuccess"
            :before-upload="handleBeforeUpload"
            style="display: inline-block;width:58px;"
            :disabled="!checkImg"
          >
            <div style="width: 58px;height:58px;line-height: 58px;" v-if="uploadList.length < 9" :style="{'cursor': !checkImg ? 'not-allowed' : 'default'}">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        <Checkbox v-model="checkVideo" style="position:relative;top:60px;" @click.native="checkVideoChange($event)" :disabled="checkImg"></Checkbox>
        <FormItem label="上传视频：">
          <Row type="flex">
            <Col span="12">
              <FormItem  prop="video_url">
                <div
                  class="demo-upload-list"
                  style="width: 345px;height: 195px;"
                  v-for="(item,index) in videoList"
                  :key="item.id"
                >
                  <template v-if="item.status === 'finished'">
                    <video :src="item.url"></video>
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemoveVideo(item)" style="margin-top:85px;"></Icon>
                    </div>
                  </template>
                </div>
                <Upload
                  v-show="videoList.length < 1"
                  ref="video_introduce"
                  type="drag"
                  action="//upload-z2.qiniu.com"
                  :format="['mp4']"
                  :data="{ token: qiniuToken }"
                  :on-format-error="handleFormatError"
                  :on-success="handleVideosSuccess"
                  :on-error="handleError"
                  :max-size="1048576"
                  :on-exceeded-size="handleVideoMaxSize"
                  style="width: 345px;hieght:195px;"
                  :disabled="!checkVideo"
                >
                  <div
                    style="width: 345px; height: 195px; display:flex; flex-direction: column; justify-content: center; align-items: center;" :style="{'cursor': !checkVideo ? 'not-allowed' : 'default'}"
                  >
                    <Icon type="md-add-circle" size="52" style="color: #3399ff" />
                    <p>上传视频</p>
                  </div>
                </Upload>
                <!-- <Button style="margin-top: 10px; display:block" type="default" @click="videotypeClick">{{formData.video_introduce_type === 1? '切换竖版' : '切换横板'}}</Button> -->
                <div style="margin-top: 6px">
                  <p>点击介绍视频重新上传，支持上传mp4格式，1G以下</p>
                  <p>视频，封面宽高比（横版：345*195）</p>
                </div>
              </FormItem>
            </Col>
            <Col span="12">
            <FormItem prop="cover_url">
              <div class="demo-upload-list" style="width:345px;height:195px;" v-for="(item,index) in videoCoverList" :key="index">
                <template v-if="item.status === 'finished'">
                  <img :src="item.url" />
                  <div class="demo-upload-list-cover">
                    <Icon type="ios-trash-outline" @click="handleRemovePoster(item)" style="margin-top:85px;"></Icon>
                  </div>
                </template>
              </div>
              <Upload
                v-show="videoCoverList.length < 1"
                ref="videoCoverUpload"
                type="drag"
                action="//upload-z2.qiniu.com"
                :data="{ token: qiniuToken }"
                :show-upload-list="false"
                multiple
                :format="['jpg','jpeg','png']"
                :before-upload="handleBeforeUploadPoster"
                style="display: inline-block;width:345px;"
                :disabled="!checkVideo"
              >
                <div style="width: 345px;height:195px;padding-top:60px;" v-if="uploadList.length < 9" :style="{'cursor': !checkVideo ? 'not-allowed' : 'default'}">
                  <Icon type="ios-cloud-upload-outline" size="20"></Icon>
                  <p>上传视频封面</p>
                </div>
              </Upload>
            </FormItem>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" size="default" :disabled="editStatus" @click="submitData()" :loading="submitStatus">提交</Button>
      </div>
    </Modal>
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
    <!-- 展示视频 -->
    <Modal v-model="videoModel" :mask-closable="true" width="400">
      <video :src="videoUrl" :poster="posterUrl" controls="controls" width="345" height="200"> </video>
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
import { debounce } from "@/libs/util";
import axios from "axios";
import {
  invitationEditInfo,
  invitationCreate,
  invitationCode,
  invitationList,
  getQiniuToken,
  invitationListStatus,
  invitationListHotVal,
  invitationListUser,
  invitationListCategoryList,
  invitationListCircle,
  invitationListDel,
  passPostListCheck
} from "@/api/data";
export default {
  components: { SearchForm, VueCropper },
  name: "invitation",
  data() {
    return {
      carouselNum: 1, //幻灯片index
      is_search: true,
      tableData: [],
      editOraddModel: false,
      editOraddText: "添加",
      qiniuToken: "",
      cropperFlag: false, // 裁剪框
      videoModel: false, //视频弹窗
      posterUrl: '', // 视屏封面图
      videoUrl: '', //视频url
      uploadList: [],
      userNameList: [],
      invitaImglist: [],
      videoList: [],
      videoCoverList: [],
      checkImg: false,
      checkVideo: false,
      imgDisabled: true, // 上传图片默认禁止
      videoDisabled: true, // 上传视频默认禁止
      submitStatus: false,
      // 图片
      imageBaseUrl: "https://cdn.tinytiger.cn/",
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
        fixedNumber: [345, 195], // 截图框的宽高比例
        autoCropWidth: 345, // 默认生成截图框宽度
        autoCropHeight: 195, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      banner_img: "",
      addthemeData: "",
      contentFormData: {
        userName: "",
        circle: "",
        contactCircle: "",
        invitatContent: "",
        img_url: "",
        video_url: "",
        cover_url: ""
      },
      contentFormRules: {
        userName: [
          {
            required: true,
            message: "请输入用户昵称",
            trigger: "change",
            type: "number"
          }
        ],
        invitatContent: [
          { required: true, message: "请输入帖子内容", trigger: "blur" }
        ],
        // img_url: [{ required: true, message: "请上传图片", trigger: "change" }],
        // circle: [
        //   {
        //     required: true,
        //     message: "请选择圈子",
        //     trigger: "change",
        //     type: "number"
        //   }
        // ]
      },
      // modal提交状态
      editStatus: false,
      // 用户
      userKeywords: "",
      circlerKeywords: "",
      addthemeKeywords: "",
      userData: [],
      // 圈子
      circlerData: [
        // { id: 1, name: "全部" },
        // { id: 2, name: "二次元" },
        // { id: 3, name: "卡牌" }
      ],
      // 关联分类
      contactCircle: [
        // { id: 1, name: "全部" },
        // { id: 2, name: "二次元" },
        // { id: 3, name: "卡牌" }
      ],
      // 话题
      addthemeData: [
        // { id: 1, name: "全部" },
        // { id: 2, name: "二次元" },
        // { id: 3, name: "卡牌" }
      ],
      editId: "", // 编辑id
      addthemeTagList: [], // 话题标签
      checkCode: "", // 校验码
      // 跑马灯配置
      setting: {
        value: 0,
        autoplay: false,
        autoplaySpeed: 2000,
        dots: "none",
        trigger: "click",
        arrow: "hover"
      },
      addHotModal: false, // 新增热度值弹窗
      hotFormData: {
        id: "",
        hots: "",
        extra_hots: "",
        true_hots: "",
        hotsVal: ""
      },
      submitLoadingStatus: false, // 新增热度值提交按钮状态
      tabelFormDataModel: false,
      tabelFormData: {
        hotValue: 0
      },
      tabelFormDRules: {
        hotValue: [{ required: true, message: "请输入热度值" }]
      },
      tableHotValue: "",
      total: 0,
      page: 1,
      per_page: 10,
      keywords: "",
      start_time: "",
      end_time: "",
      radioValue: "",
      prohibitUserList: {},
      bannedUser: "",
      prohibit_reason: [],
      prohibit_type: [],
      prohibit_source: [],
      select1: [],
      select2: [],
      searchParams: {
        keywords: "",
        date: ""
      },
      searchData: {
        keywords: "",
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
              this.invitationList();
            }
          }
        ],
        components: [
          {
            name: "Select",
            prop: "status",
            label: "",
            style: "width: 100px",
            options: [
              {
                label: "已审核",
                value: 1
              },
              {
                label: "未审核",
                value: -1
              }
            ]
          },
          {
            name: "Input",
            prop: "keywords",
            label: "搜索：",
            style: "width: 210px",
            placeholder: "输入帖子ID/内容/用户昵称搜索"
          },
          {
            name: "SelectDate",
            prop: "date",
            label: "发布时间："
          },
        ]
      },
      columns: [
        {
          title: "帖子ID",
          key: "id",
          align: "center"
          // width: "100px"
        },
        {
          title: "标题",
          key: "title",
          align: "center"
          // width: "100px"
        },
        {
          title: "帖子内容",
          key: "content",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {},
                  //就是这里加的属性
                  domProps: {
                    title:
                      params.row.content.length > 100 ? params.row.content : ""
                  }
                },
                params.row.content.length > 100
                  ? params.row.content.substring(0, 100) + "..."
                  : params.row.content
              )
            ]);
          }
        },
        {
          title: "帖子图片",
          key: "img_url",
          align: "center",
          // width: "130px",
          render: (h, params) => {
            return h('div', [
              params.row.img_url.length > 0 ? h('viewer',
                {
                  style: { width: '52px', height: '52px', overflow: 'hidden', margin: '3px auto', }
                },
                params.row.img_url && params.row.img_url.map(i => h('img', {
                  attrs: { src: i},
                  style: { width: '52px', height: '52px', margin: '0 auto' }
                }))
              ) : '',
              params.row.img_url.length > 0 ? h('span', {}, params.row.img_url ? params.row.img_url.length + '张' : '') : '',
              params.row.video_url ? h("img",
                {
                  attrs: { src: params.row.cover_url },
                  style: { width: '52px', height: '52px' },
                  on: {
                    click: () => {
                      this.viewVideo(params.row);
                    }
                  }
                },) : ''
            ])
          }
        },
        {
          title: "所属圈子模块",
          key: "tab_name",
          align: "center"
          // width: "130px"
        },
        {
          title: "携带话题",
          key: "topic_circle_list",
          align: "center"
          // width: "120px"
        },
        {
          title: "发布用户",
          key: "nickname",
          align: "center"
          // width: "100px"
        },
        {
          title: "热度值",
          key: "extra_hots",
          align: "center",
          // width: "120px",
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
                        this.hotFormData.hotsVal = hotData.extra_hots;
                        this.submitLoadingStatus = false;
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
                                invitationListHotVal({
                                  id: params.row.id,
                                  hot: 0
                                }).then(res => {
                                  if (res.data.code === 200) {
                                    this.$Message.success("已清空热度值");
                                    this.invitationList();
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
          title: "发布时间",
          key: "create_time",
          align: "center"
          // width: "110px"
        },
        {
          align: "center",
          title: "隐藏/显示",
          // width: "100px",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 1,
                "true-color": "#19be6b",
                "before-change": () =>
                  this.editCateStatus(params.row.id, params.row.is_show)
              }
            });
          }
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          // width: "150px",
          render: (h, params) => {
            return h("div", +params.row.status === 1 ? [
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  style: { margin: "0px 20px 0px 0px" },
                  on: {
                    click: () => {
                      this.editAtheme(params.row);
                    }
                  }
                },
                "编辑"
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
                          this.deleteCricle(params.row.id);
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ] : [
              h(
                "Button",
                {
                  props: { size: "small" },
                  style: { margin: "0px 20px 0px 0px" },
                  on: {
                    click: () => {
                      this.passCheck(params.row.id, 1);
                    }
                  }
                },
                "通过"
              ),
              h(
                "Button",
                {
                  props: { type: "error", size: "small" },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "确定拒绝吗？",
                        onOk: () => {
                          this.passCheck(params.row.id, -1);
                        }
                      });
                    }
                  }
                },
                "拒绝"
              )
            ]
            );
          }
        }
      ],
      rules: {
        prohibit_type: [
          { required: true, message: "请选择封禁类型", trigger: "change" }
        ],
        prohibit_hour: [
          { required: true, message: "请输入封禁时长", trigger: "blur" }
        ],
        prohibit_desc: [
          { required: true, message: "请输入封禁描述", trigger: "blur" }
        ],
        prohibit_source: [
          { required: true, message: "请选择封禁渠道", trigger: "change" }
        ]
      }
    };
  },
  watch: {
    $route(to) {
      console.log("to:",to)
    }
  },
  mounted() {
    getQiniuToken().then(res => {
      // 获取七牛云token
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken;
      }
    });
    this.invitationList();
    this.invitationCode();
  },
  methods: {
    // 删除圈子
    deleteCricle(id) {
      let data = {
        id: id
      };
      invitationListDel(data).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("操作成功");
          this.invitationList();
        }
      });
    },
    checkImgChange(e) {
      console.log(this.checkImg)
      if(this.checkImg){
        this.uploadList = []
      }
    },
    checkVideoChange(e) {
      console.log(this.checkVideo)
      if(this.checkVideo){
        this.videoList = []
        this.videoCoverList = []
        this.contentFormData.video_url = ''
        this.contentFormData.cover_url = ''
      }
    },
    // 查看视频
    viewVideo(row) {
      this.videoModel = true
      this.videoUrl = row.video_url
      this.posterUrl = row.cover_url
    },
    // 通过审核
    passCheck(id, type) {
      let params = {
        id: id,
        status: type
      }
      passPostListCheck(params).then(res => {
        if(res.data.code === 200){
          this.$Message.success("操作成功");
          this.invitationList();
        }
      })
    },
    // 添加帖子
    addOrEdit() {
      this.$refs.editOraddForm.resetFields();
      this.invitationCode();
      this.contentFormData.contactCircle = "";
      this.uploadList = [];
      this.videoList = [];
      this.videoCoverList = [];
      this.checkImg = false;
      this.checkVideo = false;
      this.addthemeTagList = [];
      this.editOraddText = "添加";
      this.userKeywords = "";
      this.circlerKeywords = "";
      this.addthemeKeywords = "";
      this.circlerData = [];
      this.contactCircle = [];
      this.userData = [];
      this.addthemeData = [];
      // this.searchTopic()
      // this.searchCircle()
      // this.searchUser()
      this.editOraddModel = true;
      this.submitStatus = false
    },
    // 编辑帖子
    editAtheme(row) {
      let data = {
        id: row.id
      };
      this.editStatus = true;
      this.editOraddModel = true;
      invitationEditInfo(data).then(res => {
        if (res.data.code === 200) {
          // console.log(res.data.data, "ppp")
          let temp = res.data.data;
          this.contentFormData.invitatContent = temp.content;
          if(temp.video_url){
            this.videoList = [{status: 'finished', url: temp.video_url }]
            this.checkVideo = true
          } else {
            this.checkVideo = false
            this.videoList = []
          } 
          // temp.video_url ? this.videoList = [{status: 'finished', url: temp.video_url }] : []
          this.videoCoverList = temp.cover_url ? [{ percentage: 100, showProgress: false, status: 'finished', url: temp.cover_url }] : []
          this.contentFormData.cover_url = temp.cover_url;
          this.contentFormData.video_url = temp.video_url;
          this.userData = [{ user_id: temp.user_id, nickname: temp.nickname }];
          this.circlerData = [{ id: temp.circle_id, name: temp.circle_name }];
          this.contactCircle = [
            { id: temp.circle_category_id, name: temp.tab_name }
          ];
          this.contentFormData.userName = this.userData[0].user_id;
          this.contentFormData.circle = this.circlerData[0].id;
          this.contentFormData.contactCircle = this.contactCircle[0].id;
          // 圈子分类
          this.changeItemCircle()
          if (temp.img_url.length) {
            let imgArr = temp.img_url
            // 照片
            this.uploadList = imgArr.map(item => {
              return {
                status: "finished",
                url: item
              };
            });
            this.contentFormData.img_url = this.uploadList[0].url;
            this.checkImg = true
          } else {
            this.uploadList = [];
            this.checkImg = false
          }
          // 话题标签
          if (temp.circle_related_id) {
            this.addthemeTagList = temp.circle_related_id.map(item => {
              return {
                label: item.name,
                value: item.id
              };
            });
          } else {
            this.addthemeTagList = [];
          }
          // 成功后取消
          this.editStatus = false;
        }
      });
      this.invitationCode();
      this.editId = row.id;
      this.editOraddText = "编辑";
    },
    // modal 用户搜索
    searchUser: debounce(function() {
      let data = {
        keywords: this.userKeywords
      };
      invitationListUser(data).then(res => {
        if (res.data.code == 200 && res.data.data) {
          //  console.log(res.data.data, 'userData');
          this.userData = [];
          this.userData = res.data.data;
        }
      });
    }, 500),
    searchUserChange(val) {
      this.userKeywords = val ? val : "";
      if (!val) {
        this.searchUser("");
      }
    },
    changeSelectShow() {
      this.searchCircle();
    },
    changeSelectUserShow() {
      this.searchUser();
    },

    // 搜索圈子
    searchCircle: debounce(function() {
      let data = {
        keywords: this.circlerKeywords
      };
      invitationListCircle(data).then(res => {
        if (res.data.code == 200 && res.data.data) {
          // console.log(res.data.data, "circlerData");
          this.circlerData = [];
          this.circlerData = res.data.data;
        }
      });
    }, 500),
    searchCircleChange(val) {
      this.circlerKeywords = val ? val : "";
      if (!val) {
        this.searchCircle("");
      }
    },
    // 圈子下拉触发分类
    changeItemCircle() {
      let data = {
        circle_id: this.contentFormData.circle
      };
      if (!data.circle_id) {
        return;
      }
      invitationListCategoryList(data).then(res => {
        if ((res.data.code = 200)) {
          this.contactCircle = [];
          this.contactCircle = res.data.data;
          if (!this.contactCircle.length) {
            this.contentFormData.contactCircle = "";
          }
        }
      });
    },
    changeSelectAddthemeShow() {
      this.addthemeKeywords = "";
      this.searchTopic();
    },
    // 话题搜索
    searchTopic: debounce(function() {
      let data = {
        keywords: this.addthemeKeywords
      };
      invitationListCircle(data).then(res => {
        if (res.data.code == 200 && res.data.data) {
          // console.log(res.data.data, 'addthemeData');
          this.addthemeData = [];
          this.addthemeData = res.data.data;
        }
      });
    }, 500),
    searchAddthemeChange(val) {
      this.addthemeKeywords = val ? val : "";
      this.searchTopic("");
    },
    changeAddtheme(val) {
      if (val) {
        if (this.addthemeTagList.length + 1 > 3) {
          this.$Message.warning("最多选择三个");
          return;
        }
        this.addthemeTagList.push(val);
        let tempArr = this.addthemeTagList;
        let hash = {};
        this.addthemeTagList = tempArr.reduce((cur, next) => {
          hash[next.value] ? "" : (hash[next.value] = true && cur.push(next));
          return cur;
        }, []);
      }
    },
    delTag(index) {
      this.addthemeTagList.splice(index, 1);
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
    
    getPic1(file, type) {
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
    },
    // 上传成功
    handleSuccess(file) {
      this.banner_img = this.imageBaseUrl + file.key;
      this.contentFormData.img_url = this.banner_img;
      this.uploadList.push({
        status: "finished",
        url: this.imageBaseUrl + file.key
      });
    },
    // 删除图片
    handleRemove(file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      this.uploadList.splice(fileList.indexOf(file), 1);
      if (!this.uploadList.length) {
        this.contentFormData.img_url = "";
        this.banner_img = "";
      }
      // this.banner_img = "";
      // this.contentFormData.img_url = "";
    },
    // 上传图片触发
    handleBeforeUpload(file) {
      // this.option.type = "hdfile";
      this.getPic1(file, "cover");
      // return false;
      const check = this.uploadList.length < 9;
      if (!check) {
        this.$Notice.warning({
            title: '最多上传9张图片'
        });
      }
      return check;
    },
    handleFormatError(file) {
      this.$Modal.error({
        title: "文件格式不正确",
        content: "文件 " + file.name + " 格式不正确,请按要求上传"
      });
    },
    // 删除视频
    handleRemoveVideo(file) {
      // 从 upload 实例删除数据
      this.videoList.splice(this.videoList.indexOf(file), 1);
      this.contentFormData.video_url = ''
    },
    // 视频
    handleVideosSuccess(file) {
      this.videoList.push({
        status: 'finished',
        url: this.imageBaseUrl + file.key
      })
      this.contentFormData.video_url = this.imageBaseUrl + file.key
      this.$refs.video_introduce.clearFiles();
    },
    handleVideoMaxSize(file){
      this.$Notice.warning({
          title: '提示',
          desc: '视频' + file.name + '大小超过1G'
      });
    },
     handleError(error, file) {
      this.$Modal.error({
        title: "上传失败",
        content: "文件 " + file.name + " 上传失败"
      });
    },
    // 删除视频封面
    handleRemovePoster(file){
      // 从 upload 实例删除数据
      this.videoCoverList.splice(this.videoCoverList.indexOf(file), 1)
      this.contentFormData.cover_url = ''
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
              // this.banner_img = this.imageBaseUrl + res.data.key;
              this.contentFormData.cover_url = this.imageBaseUrl + res.data.key;
              this.videoCoverList.push({
                status: "finished",
                url: this.contentFormData.cover_url
              });
            }
          });
      });
      this.option.img = "";
      this.cropperFlag = false;
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
    // 上传视频背景图
    handleBeforeUploadPoster(file){
      this.videoCoverList = []
      this.getPic(file)
      return false
    },
    // 展示图片
    showImg(data) {
      this.invitaImglist = []
      this.carouselNum = 1
      if (data.img_url) {
        this.$nextTick(() => {
          this.invitaImglist = data.img_url;
        })
      } else {
        this.invitaImglist = [];
      }
    },
    // 幻灯片索引
    carouselItemChange (oldValue, value) {
      // console.log(oldValue, value);
      this.carouselNum = value + 1
    },
    // 获取圈子列表
    invitationList() {
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
      invitationList(data).then(res => {
        if (res.data.code === 200 && res.data.data) {
          res.data.data.data.forEach(item => {
            if (item.topic_circle_list) {
              item.topic_circle_list = item.topic_circle_list.join(",");
            } else {
              item.topic_circle_list = "";
            }
            if (item) {
              item.true_hots =
                item.view_num +
                2 * item.like_num +
                4 * item.comment_num +
                6 * item.share_num;
              item.hots = item.true_hots + item.extra_hots;
              item.tab_name = `${item.circle_name} - ${item.tab_name}`
            }
          });
          this.tableData = res.data.data.data;
          this.page = res.data.data.current_page;
          this.total = res.data.data.total;
          if (res.data.data.data.length === 0) {
            if (this.page !== 1) {
              this.page = this.page - 1;
              this.invitationList();
            }
          } else {
            return;
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
      invitationListHotVal({
        id: paramsData.id,
        hot: paramsData.extra_hots
      }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("编辑成功");
          this.addHotModal = false;
          this.invitationList();
        } else {
          this.submitLoadingStatus = false;
        }
      });
    },
    // 分页
    handlePageChange(page) {
      this.page = page;
      this.invitationList();
    },
    handlePageSizeChange(size) {
      this.page = 1
      this.per_page = size;
      this.invitationList();
    },
    // 提交model
    async submitData() {
      let TagListJoin = []; // 话题标签
      let imgList = []; // 图片集合
      if (this.addthemeTagList.length) {
        this.addthemeTagList.forEach(item => {
          TagListJoin.push(item.value);
        });
      }
      if(!this.contentFormData.contactCircle){
        return this.$Message.error("请选择分类");
      }
      if(this.uploadList.length) {
        this.uploadList.forEach(item => {
          imgList.push(item.url);
        });
      }
      if(imgList.length === 0 && (!this.contentFormData.video_url || !this.contentFormData.cover_url)){
        return this.$Message.error("请完善图片或视频信息");
      }
      let params = {
        id: this.editId ? this.editId : "",
        user_id: this.contentFormData.userName,
        content: this.contentFormData.invitatContent,
        circle_id: this.contentFormData.circle,
        circle_category_id: this.contentFormData.contactCircle,
        circle_related_id: TagListJoin,
        img_url: imgList,
        checkcode: this.checkCode,
        video_url: this.contentFormData.video_url,
        cover_url: this.contentFormData.cover_url
      };
      await this.invitationCode();
      this.$refs.editOraddForm.validate(valid => {
        if (valid) {
          this.submitStatus = true
          if (this.editOraddText == "添加") {
            delete params.id;
          }
          invitationCreate(params).then(res => {
            if (res.data.code === 200) {
              this.submitStatus = false
              this.$Message.success("操作成功");
              this.editOraddModel = false;
              this.invitationList();
            } else {
              this.submitStatus = false
            }
          });
        }
      });
    },
    // 表格显示隐藏
    editCateStatus(id, is_show) {
      let data = {
        id: id,
        is_show: is_show == 1 ? 0 : 1
      };
      invitationListStatus(data).then(res => {
        this.$Message.success("操作成功");
        this.invitationList();
      });
    },
    // 检验码
    invitationCode() {
      this.checkCode = "";
      invitationCode().then(res => {
        if (res.data.code === 200) {
          this.checkCode = res.data.data.checkcode;
        }
      });
    },
    // 重置弹框验证
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
.demo-carousel {
  background-color: #fff;
  width: 488px;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
  }
}
.user-name {
  position: absolute;
  background-color: #fff;
  width: 200px;
  padding: 0 10px 0 10px;
  height: 200px;
  border-radius: 4px;
  overflow: auto;
  z-index: 99;
}
.user-name-content:hover {
  cursor: pointer;
}
.mpdal-wrap {
  width: 600px;
  text-align: center;
  display: flex;
  justify-items: center;
  align-items: center;
}
.circle-wrap {
  display: flex;
}
</style>
<style scoped>
.textarea-width .ivu-input-wrapper {
  width: 415px !important;
}
</style>