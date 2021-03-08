<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
      <Table border :columns="columns" :data="tableList" ref="table"></Table>
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
    </Card>
    <!-- 编辑达人信息弹出框 -->
    <Modal
      v-model="tagVisble"
      title="编辑达人信息"
      @on-visible-change="modalVisibleChange"
    >
      <Form
        ref="formData"
        :model="formData"
        :rules="rules"
        :label-width="130"
        inline
      >
        <FormItem prop="real_name" label="真实姓名：" style=" width:80%">
          <Input
            type="text"
            v-model="formData.real_name"
            maxlength="8"
            clearable
          ></Input>
        </FormItem>
        <FormItem label="身份证号码：" prop="id_number" style=" width:80%">
          <Input
            type="text"
            v-model="formData.id_number"
            maxlength="18"
            clearable
          ></Input>
        </FormItem>
        <FormItem prop="profile" label="达人简介：" style=" width:80%">
          <Input
            type="textarea"
            v-model="formData.profile"
            maxlength="20"
          ></Input>
        </FormItem>
        <FormItem prop="image_one" label="身份证正面照：" style=" width:80%">
          <div
            class="demo-upload-list"
            v-for="(item, index) in uploadList"
            :key="index"
          >
            <template v-if="item.status === 'finished' && item.url">
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon
                  type="ios-trash-outline"
                  @click="handleRemoveImg(1)"
                ></Icon>
              </div>
            </template>
          </div>
          <Upload
            ref="upload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            :format="['jpg', 'jpeg']"
            :before-upload="handleBeforeUpload"
            :on-success="handleImgSuccess"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        <FormItem prop="image_two" label="身份证反面照：" style=" width:80%">
          <div
            class="demo-upload-list"
            v-for="(item, index) in uploadListTwo"
            :key="index"
          >
            <template v-if="item.status === 'finished'">
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon
                  type="ios-trash-outline"
                  @click="handleRemoveImg(2)"
                ></Icon>
              </div>
            </template>
          </div>
          <Upload
            ref="upload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            :format="['jpg', 'jpeg']"
            :before-upload="handleBeforeUploadTwo"
            :on-success="handleImgSuccessTwo"
            style="display: inline-block;width:58px;"
          >
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
      </Form>
      <div slot="footer" class="confim">
        <Button type="primary" @click="handleSubmit('formData')">提交</Button>
      </div>
    </Modal>
    <!-- 点击图片放大 -->
    <Modal v-model="bigPicvisible" >
      <p slot="header" style="text-align:center">
        <span >图片详情</span>
      </p>
      <img :src="bigPicUrl" style=" width:100%;height:100%" />
      <span slot="footer"><Button type="primary" @click="bigPicvisible = false">返回</Button></span>
    </Modal>
  </div>
</template>
<script>
import {
  getMasterApplyStationList,
  deleteMasterApply,
  getSaveStationView,
  getQiniuToken,
  editorMasterApply,
  approveMasterApply,
  refuseMasterApply,
  GameMetricsAdminCheckCode
} from "@/api/data";
import SearchForm from "@/components/searchForm";
const baseImgUrl = "https://cdn.tinytiger.cn/";
export default {
  components: { SearchForm },
  data() {
    return {
      bigPicUrl: "",
      bigPicvisible: false,
      checkcode: "",
      editorID: "",
      uploadList: [],
      uploadListTwo: [],
      qiniuToken: "",
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      formData: {
        real_name: "",
        id_number: "",
        profile: "",
        // image: '',
        image_one: "",
        image_two: ""
      },
      tagVisble: false,
      tableList: [],
      columns: [
        {
          title: "申请用户昵称",
          key: "nickname",
          align: "center"
        },
        {
          title: "真实姓名",
          key: "real_name",
          align: "center"
        },
        {
          title: "身份证号",
          key: "id_number",
          align: "center"
        },
        {
          title: "身份证正面照",
          key: "image_one",
          align: "center",
          render: (h, params) => {
            let pics = params.row.image_one;
            if (params.row.image_one) {
              return h("div", [
                h("img", {
                  attrs: { src: pics },
                  style: { width: "100px", height: "100px", margin: "auto" },
                  on: {
                    click: () => {
                      this.showPics(pics, "image_one");
                    }
                  }
                })
              ]);
            } else {
              return h("span", "");
            }
          }
        },
        {
          title: "身份证反面照",
          key: "image_two",
          align: "center",
          render: (h, params) => {
            if (params.row.image_two) {
              return h("div", [
                h("img", {
                  attrs: { src: params.row.image_two },
                  style: { width: "100px", height: "100px", margin: "auto" },
                  on: {
                    click: () => {
                      this.showPics(params.row.image_two, "image_two");
                    }
                  }
                })
              ]);
            } else {
              return h("span", "");
            }
          }
        },
        {
          title: "达人认证简介",
          key: "profile",
          align: "center"
        },
        {
          title: "申请时间",
          key: "create_time",
          align: "center"
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h("div", [
              +params.row.status === 1 &&
                h(
                  "span",
                  {
                    style: {
                      "margin-right": "8px",
                      color: "#2ba245"
                    },
                    on: {
                      click: () => {}
                    }
                  },
                  "已通过"
                ),
              +params.row.status === 2 &&
                h(
                  "span",
                  {
                    style: {
                      "margin-right": "8px",
                      color: "#f0584c"
                    }
                  },
                  "已拒绝"
                ),
              +params.row.status === 0 &&
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small"
                    },
                    style: {
                      "margin-right": "8px"
                    },
                    on: {
                      click: () => {
                        this.approveMasterApply(params.row.id);
                      }
                    }
                  },
                  "通过"
                ),
              +params.row.status === 0 &&
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small"
                    },
                    style: {
                      "margin-right": "8px"
                    },
                    on: {
                      click: () => {
                        this.refuseMasterApply(params.row.id);
                      }
                    }
                  },
                  "拒绝"
                ),
              +params.row.apply_method === 1 &&
                +params.row.status !== 2 &&
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      "margin-right": "8px"
                    },
                    on: {
                      click: () => {
                        this.tagVisble = true;
                        this.editorID = params.row.id;
                        this.getMasterApplyDetail(params.row.id);
                      }
                    }
                  },
                  "编辑"
                ),
              +params.row.status !== 0 &&
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small"
                    },
                    style: {
                      "margin-right": "8px"
                    },
                    on: {
                      click: () => {
                        this.$Modal.confirm({
                          title: "确认要删除吗？",
                          content: "（删除后不可恢复，请谨慎操作）",
                          onOk: () => {
                            this.deleteMasterApply(params.row.id);
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
      ],
      rules: {
        real_name: [{ required: true, message: "请输入真实姓名" }],
        id_number: [{ required: true, message: "请输入身份证号码" }],
        profile: [{ required: true, message: "请输入达人简介" }],
        image_one: [{ required: true, message: "请选择上传身份证正面照" }],
        image_two: [{ required: true, message: "请选择上传身份证反面照" }]
      },
      searchData: {
        keyword: "",
        date: "",
        status: 0
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.pageParams.page = 1;
              this.searchParams = {
                ...this.searchData,
                start_time: this.searchData.date[0]
                  ? this.searchData.date[0]
                  : "",
                end_time: this.searchData.date[1] ? this.searchData.date[1] : ""
              };
              this.getMasterApplyStationList();
            }
          }
        ],
        components: [
          {
            name: "Select",
            label: "状态筛选：",
            style: "width:100px",
            prop: "status",
            options: [
              {
                label: "全部",
                value: 0
              },
              {
                label: "审核中",
                value: 1
              },
              {
                label: "已通过",
                value: 2
              },
              {
                label: "已拒绝",
                value: 3
              }
            ]
          },
          {
            name: "Input",
            prop: "keyword",
            label: "搜索:",
            style: "width:300px",
            placeholder: "输入用户昵称或真实姓名或身份证号搜索"
          },
          {
            name: "SelectDate",
            prop: "date",
            label: "申请日期:"
          }
        ]
      }
    };
  },
  mounted() {
    this.getQiniu();
    this.getMasterApplyStationList();
  },
  methods: {
    showPics(picsSrc, type) {
      this.bigPicvisible = true;
      this.bigPicUrl = picsSrc;
    },
    //获取站内达人列表
    getMasterApplyStationList() {
      // this.$Spin.show()
      if (this.searchParams) {
        delete this.searchParams.date;
      }
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      };
      getMasterApplyStationList(data).then(res => {
        // this.$Spin.hide()
        if (res.data.code === 200) {
          this.tableList = res.data.data.data;
          this.pageParams.total = res.data.data.total;
          if (res.data.data.data.length === 0) {
            if (this.pageParams.page !== 1) {
              this.pageParams.page = this.pageParams.page - 1;
              this.getMasterApplyStationList();
            }
          } else {
            return;
          }
        }
      });
    },
    // 获取站内达人详细
    getMasterApplyDetail(id) {
      let dataId = {
        id: id
      };
      getSaveStationView(dataId).then(res => {
        if (res.data.code === 200) {
          this.formData = res.data.data;
          if (res.data.data.image_one) {
            this.uploadList = [
              {
                status: "finished",
                url: res.data.data.image_one
              }
            ];
          }
          if (res.data.data.image_two) {
            this.uploadListTwo = [
              {
                status: "finished",
                url: res.data.data.image_two
              }
            ];
          }
        }
      });
    },

    //删除站内达人列表
    deleteMasterApply(id) {
      let dataId = {
        id: id
      };
      deleteMasterApply(dataId).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功");
          this.getMasterApplyStationList();
        }
      });
    },
    // 获取七牛token
    getQiniu() {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken;
        }
      });
    },
    // 获取校验码
    getToolCheckCode() {
      GameMetricsAdminCheckCode().then(res => {
        if (res.data.code === 200) {
          this.checkcode = res.data.data.checkcode;
        }
      })
    },
    modalVisibleChange(visible) {
      // if (visible) {
      this.getToolCheckCode();
      // if (this.mode === "add") {
      //   this.formData.cate_id = this.shopCate[0].id
      // }
      // } else {
      this.$refs.formData.resetFields();
      this.uploadList = [];
      this.uploadListTwo = [];
      // }
    },
    // 编辑
    editorMasterApply() {
      const data = {
        checkcode: this.checkcode,
        ...this.formData
      };
      editorMasterApply(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.tagVisble = false;
          this.getMasterApplyStationList();
        }
      });
    },
    // 提交添加用户表单
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // if (this.addFormData.user_id === "") {
          //   return this.$Message.error("暂无该用户id!")
          // }
          this.editorMasterApply();
        } else {
          this.$Message.error("请完善表单信息!");
        }
      });
    },
    handleImgSuccess(response) {
      const imgUrl = baseImgUrl + response.key;
      this.uploadList.push({
        status: "finished",
        url: imgUrl
      });
      this.formData.image_one = imgUrl;
    },
    handleImgSuccessTwo(response) {
      const imgUrl = baseImgUrl + response.key;
      this.uploadListTwo.push({
        status: "finished",
        url: imgUrl
      });
      this.formData.image_two = imgUrl;
    },
    //移除图片
    handleRemoveImg(type) {
      if (type === 1) {
        this.uploadList = [];
        this.formData.image_one = "";
      } else {
        this.uploadListTwo = [];
        this.formData.image_two = "";
      }
    },

    //申请达人列表审核通过(站内、站外共用)
    approveMasterApply(id) {
      const data = {
        id: id
      };
      approveMasterApply(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.tagVisble = false;
          this.getMasterApplyStationList();
        }
      });
    },
    //申请达人列表审核拒绝(站内、站外共用)
    refuseMasterApply(id) {
      const data = {
        id: id
      };
      refuseMasterApply(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.tagVisble = false;
          this.getMasterApplyStationList();
        }
      });
    },
    handleBeforeUpload() {
      this.uploadList = [];
    },
    handleBeforeUploadTwo() {
      this.uploadListTwo = [];
    },
    handlePageChange(page) {
      this.pageParams.page = page;
      this.getMasterApplyStationList();
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1;
      this.pageParams.per_page = size;
      this.getMasterApplyStationList();
    }
  }
};
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
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
</style>
