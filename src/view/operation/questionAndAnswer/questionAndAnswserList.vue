<template>
  <div>
    <Card>
      <div style="margin-top:10px">
        <SearchForm :searchForm="searchForm" :searchData="searchData" />
      </div>
      <div style="margin-bottom:20px">
        <Button class="add" @click="add" type="primary">添加用户</Button>
      </div>
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
      <!-- 添加用户弹窗框 -->
      <Modal
        v-model="addTagVisble"
        title="添加推荐用户"
        @on-visible-change="cleanAddFormData"
      >
        <Form
          ref="addFormData"
          :model="addFormData"
          :label-width="100"
          :rules="ruleInline"
          inline
        >
          <FormItem prop="phone" label="手机号：" style=" width:80%">
            <Input type="text" v-model="addFormData.phone" clearable></Input>
          </FormItem>
          <FormItem label="关联用户：" style=" width:80%">
            <Button type="success" long @click="getUser">
              {{
                getUserMassger.length === 0
                  ? isClickText
                    ? "点击获取用户"
                    : getNoUsser
                  : getUserMassger[0].nickname
              }}
            </Button>
          </FormItem>
          <FormItem prop="sort" label="排序值：" style=" width:80%">
            <Input type="text" v-model="addFormData.sort" clearable></Input>
          </FormItem>
        </Form>
        <div slot="footer" class="confim">
          <Button type="primary" @click="handleSubmit('addFormData')"
            >提交</Button
          >
        </div>
      </Modal>
      <!-- 修改排序弹窗 -->
      <Modal v-model="isSortShow" title="编辑排序值">
        <Form ref="editFormData" :model="editFormData" :label-width="80" inline>
          <FormItem prop="sort" label="排序值：" style=" width:80%">
            <Input type="text" v-model.trim="editFormData.sort" placeholder="请输入正整数排序值" clearable maxlength=4></Input>
          </FormItem>
        </Form>
        <div slot="footer" class="confim">
          <Button type="primary" @click="editFormDataSubmit('editFormData')"
            >确定</Button
          >
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import {
  getUser,
  getQuestionsLists,
  deleteQuestions,
  addFollowRecommend,
  sortQuestions,
  addQuestions,
  editQuestionsSort
} from "@/api/data";
import { arrSort, arrSortSize, formatDate, validatePhone } from "@/libs/util";
import SearchForm from "../../../components/searchForm";
export default {
  name: "questionAndAnswserList",
  components: { SearchForm },
  data() {
    const validateSort = (rule, value, callback) => {
      if (value % 1 != 0) {
        callback(new Error("请输入整数"));
      } else {
        callback();
      }
    };
    return {
      current_page: "",
      last_page: "",
      editFormData: {
        sort: ""
      },
      isSortShow: false,
      // oneId: "",
      isAdd: true,
      isClickText: true, // 控制初始文字
      getUserMassger: [],
      getNoUsser: "",
      addFormData: {
        phone: "",
        user_id: "",
        sort: ""
      },
      addTagVisble: false,
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      searchData: {
        start_time: "", // 开始时间
        end_time: "", // 结束时间
        keyword: "",
        date: ""
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
              this.getQuestionsLists();
            }
          }
        ],
        components: [
          {
            name: "Input",
            prop: "keyword",
            style: "width:200px",
            label: "搜索:",
            placeholder: "输入用户昵称/手机号搜索"
          },
          {
            name: "SelectDate",
            prop: "date",
            label: "操作日期:"
          }
        ]
      },
      columns: [
        {
          title: "用户昵称",
          key: "nickname",
          align: "center"
        },
        {
          title: "用户头像",
          key: "avatar",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: { src: params.row.avatar },
                style: { width: "50px", height: "50px", margin: "auto" }
              })
            ]);
          }
        },
        {
          title: "用户手机号",
          key: "username",
          align: "center"
        },
        {
          title: "达人属性",
          key: "apply_type",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    margin: "auto",
                    color:
                      +params.row.apply_type === 0
                        ? "red"
                        : +params.row.apply_type === 1
                        ? "#1ABC9C"
                        : "#57a3f3"
                  }
                },
                +params.row.apply_type === 0
                  ? "无"
                  : +params.row.apply_type === 1
                  ? "站内达人"
                  : "站外达人"
              )
            ]);
          }
        },
        {
          title: "排序",
          key: "sort",
          align: "center",
          render: (h, params) => {
            if (params.row.sort) {
              return h("div", [
                h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        shape: "circle"
                      },
                      style: {
                        margin: "0 10px"
                      },
                      on: {
                        click: () => {
                          this.editFormData = {
                            ...params.row
                          };
                          this.isSortShow = true;
                        }
                      }
                    },
                    params.row.sort
                  ),
                  h("Button", {
                    props: {
                      shape: "circle",
                      icon: "md-arrow-round-up"
                    },
                    style: {
                      color: "#19be6b",
                      visibility:
                        params.row.show == true && this.pageParams.page == 1
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 上升排序
                        params.row.type = "up";
                        this.sortQuestions(params.row);
                      }
                    }
                  }),

                  h("Button", {
                    props: {
                      shape: "circle",
                      icon: "md-arrow-round-down"
                    },
                    style: {
                      color: "#2db7f5",
                      visibility:
                        params.row.hide == true &&
                        this.current_page == this.last_page
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 下降排序
                        params.row.type = "down";
                        this.sortQuestions(params.row);
                      }
                    }
                  })
                ])
              ]);
            } else {
              return h("div", {}, "无");
            }
          }
        },
        {
          title: "添加时间",
          key: "create_time",
          align: "center"
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "确认要删除吗？",
                        content: "（删除后不可恢复，请谨慎操作）",
                        onOk: () => {
                          this.deleteQuestions(params.row.id);
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
      tableList: [],
      ruleInline: {
        phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
        sort: [
          { required: true, validator: validateSort, trigger: "blur" },
          { required: true, message: "请输入排序值", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    this.getQuestionsLists();
  },
  methods: {
    //问答团列表排序
    sortQuestions(data) {
      try {
        let params = {
          id: data && data.id,
          sort_type: data.type === "up" ? 1 : 2
        };
        sortQuestions(params).then(res => {
          if (res.data.code === 200) {
            this.$Message.success("操作成功");
            this.getQuestionsLists();
          }
        });
      } catch {}
    },
    cleanAddFormData() {
      this.$refs.addFormData.resetFields();
      this.getUserMassger = [];
    },
    getUser() {
      if (!this.addFormData.phone) {
        return false;
      }
      this.isClickText = false;
      this.addFormData.user_id = "";
      const data = {
        mobile: this.addFormData.phone
      };
      getUser(data).then(res => {
        if (res.data.data && res.data.data[0]) {
          this.addFormData.user_id = res.data.data[0].user_id;
        } else {
          this.$Message.loading("暂时无该用户id!");
        }
        this.getNoUsser = res.data.msg;
        this.getUserMassger = res.data.data;
        this.isClickText = true;
      });
    },
    // 修改问答团列表排序
    editQuestionsSort() {
      let data = {
        id: this.editFormData.id,
        sort: this.editFormData.sort
        // ...this.editFormData
      };
      editQuestionsSort(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getQuestionsLists();
        }
      });
    },
    //修改排序值提交按钮
    editFormDataSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (this.editFormData.sort === "") {
            return this.$Message.error("请输入排序值!");
          }
          this.editQuestionsSort();
          this.isSortShow = false;
        } else {
          this.$Message.error("请完善信息!");
        }
      });
    },
    // 提交添加用户表单
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (this.addFormData.user_id === "") {
            return this.$Message.error("暂无该用户id!");
          }
          this.addQuestions();
        } else {
          this.$Message.error("请完善表单信息!");
        }
      });
    },
    // 获取问答团列表
    getQuestionsLists() {
      // this.$Spin.show();
      if (this.searchParams) {
        delete this.searchParams.date;
      }
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      };
      getQuestionsLists(data).then(res => {
        try {
          if (res.data.code === 200 && res.data.data.data) {
            // this.$Spin.hide();
            res.data.data.data = res.data.data.data.sort(
              arrSortSize("is_show")
            );
            // 将第一个的上升排序隐藏
            res.data.data.data[0].show = true;
            res.data.data.data[res.data.data.data.length - 1].hide = true;
          }
        } catch {}
        this.$nextTick(() => {
          this.current_page = res.data.data.current_page;
          this.last_page = res.data.data.last_page;
          this.tableList = res.data.data.data;
          this.pageParams.total = res.data.data.total;
          // 最后一页删除，数据向前请求
          if (res.data.data.data.length === 0) {
            if (this.pageParams.page !== 1) {
              this.pageParams.page = this.pageParams.page - 1;
              this.getQuestionsLists();
            }
          } else {
            return;
          }
        });
      });
    },
    //删除问答团列表
    deleteQuestions(id) {
      let dataId = {
        id: id
      };
      deleteQuestions(dataId).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功");
          this.getQuestionsLists();
        }
      });
    },
    // 添加问答团列表
    addQuestions() {
      const data = {
        user_id: this.addFormData.user_id,
        sort: this.addFormData.sort
      };
      addQuestions(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("添加成功");
          this.addTagVisble = false;
          this.getQuestionsLists();
        }
      });
    },
    add() {
      this.addTagVisble = true;
      this.isAdd = true;
    },
    handlePageChange(page) {
      this.pageParams.page = page;
      this.getQuestionsLists();
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size;
      this.getQuestionsLists();
    }
  }
};
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>
