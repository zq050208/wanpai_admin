<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
      <Button @click="addClick" style="margin-bottom: 20px">添加模块</Button>
      <Table ref="table" border stripe :data="tableData" :columns="columns" />
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="total"
        :current="pageParams.page"
        :page-size="pageParams.per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>

    <!-- 新增、 编辑弹框 -->
    <Modal
      v-model="editVisible"
      :mask-closable="false"
      @on-visible-change="visibleChange"
      width="500"
      :title="modalTitle"
    >
      <Form ref="form" :model="formData" :label-width="140" :rules="rules" style="margin: 30px 0">
        <FormItem label="子模块名称：" prop="category_name">
          <Input v-model="formData.category_name" placeholder="请输入子模块名称" maxlength="15" />
        </FormItem>

        <FormItem label="所属模块：" prop="ascription_modular">
          <Select v-model="formData.ascription_modular" :disabled="mode === 'edit'">
            <Option
              :value="formData.ascription_modular"
              v-if="formData.ascription_modular"
            >{{ formData.ascription_modular }}</Option>
            <Option value="百科" v-else>百科</Option>
          </Select>
        </FormItem>

        <FormItem label="子模块排序：" prop="sort">
          <!-- <Input v-model.number="formData.sort" /> -->
          <InputNumber :min="1" v-model="formData.sort" style="width:300px"></InputNumber>
        </FormItem>

        <FormItem label="调用模板：" prop="template_id">
          <Select v-model="formData.template_id" :disabled="this.mode==='edit'">
            <Option v-for="item in subModularList" :key="item.id" :value="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>

        <FormItem label="是否显示：" prop="is_show">
          <i-switch :value="sub_isShow" size="large" @on-change="switchStatus">
            <span slot="open">显示</span>
            <span slot="close">隐藏</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="handleSubmit">{{this.mode==='edit'?'保存':'提交'}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import SearchForm from "@/components/searchForm";
import Editor from "@/components/quillEditor";
import {
  // getWikiListByGameId,
  saveSubModularStatus,
  addSubModular,
  editGameWiki,
  delSubModular,
  saveSort,
  getWikiData,
  getContentUserData,
  getWikiDataByGameId,
  getSubModularList,
  getTemplateList,
  modularSaveSubModular
} from "@/api/data";
import { arrSort, arrSortSize } from "@/libs/util";

export default {
  // 子模块
  name: "subModuleList",
  components: { SearchForm, Editor },
  data() {
    return {
      is_controllerModule: false, // 是否已经有管理员模块?
      modular_id: "", // 父级模块id
      subModularList: [], // 子模块模板列表
      modalTitle: "添加",
      accounts: [],
      wikiData: [],
      game_id: "", // 游戏id
      current_page: "",
      pageParams: {
        page: 1,
        per_page: 10
      },
      total: 1,
      tableData: [], // 子模块表格数据

      mode: "",
      editVisible: false,
      // 编辑子模块对话框表单数据
      formData: {
        name: "",
        user_id: null,
        url: "",
        pid: null,
        content: "",
        order: null,
        sub_modular_id: null, // 子模块id
        category_name: "", // 子模块名称
        ascription_modular: "", // 所属主模块
        sort: null, // 子模块排序权重
        is_show: null, // 是否显示 0显示 1隐藏
        template_id: null // 调用子模块模板ID
      },

      searchData: {
        keywords: ""
      },
      searchParams: {
        keywords: ""
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.pageParams.page = 1;
              this.searchParams = {
                ...this.searchData
              };
              this.getDataList();
            }
          }
        ],
        components: [
          {
            name: "Input",
            label: "关键词查询:",
            prop: "keywords",
            placeholder: "请输入子模块名称",
            style: "width:250px"
          }
        ]
      },
      columns: [
        {
          align: "center",
          title: "子模块id",
          key: "id"
        },
        {
          align: "center",
          title: "子模块名称",
          key: "category_name"
        },
        {
          align: "center",
          title: "所属模块",
          key: "ascription_modular"
        },
        {
          align: "center",
          title: "排序",
          key: "order",
          render: (h, params) => {
            let then = this;
            if (params.row.is_show === 0) {
              return h("div", [
                h("div", [
                  h(
                    "span",
                    {
                      style: {
                        margin: "0 3px"
                      }
                    },
                    `${params.row.sort}`
                  ),
                  h("Button", {
                    props: {
                      shape: "circle",
                      icon: "md-arrow-round-up"
                    },
                    style: {
                      color: "#19be6b",
                      visibility: params.index === 0 ? "hidden" : "visible"
                    },
                    on: {
                      click: () => {
                        // 上升排序
                        this.saveSort(params.row.id, "up");
                      }
                    }
                  }),

                  h(
                    "span",
                    {
                      style: {
                        margin: "0 3px"
                      }
                    },
                    params.row.order
                  ),

                  h("Button", {
                    props: {
                      shape: "circle",
                      icon: "md-arrow-round-down"
                    },
                    style: {
                      color: "#2db7f5",
                      visibility:
                        params.row.hide == true || params.row.most
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 下降排序
                        this.saveSort(params.row.id, "down");
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
          align: "center",
          title: "隐藏/显示",
          key: "status",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 0,
                "before-change": () => this.handleSwitchChange(params.row)
              }
            });
          }
        },
        {
          align: "center",
          title: "更新时间",
          key: "create_time"
        },
        {
          align: "center",
          title: "操作",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: {
                    marginRight: "10px",
                    visibility:
                      params.row.template_id === 6 ? "hidden" : "visible"
                  },

                  on: {
                    // 编辑按钮点击事件
                    click: () => {
                      this.formData = { ...params.row };
                      this.mode = "edit";
                      this.editVisible = true;
                      this.modalTitle = "编辑";
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px" },
                  on: {
                    // 删除子模块
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "确认删除该内容吗？",
                        onOk: () => {
                          this.delSubModular(params.row.id);
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
        // 子模块名称
        category_name: [{ required: true, message: "请输入子模块名称" }],
        // 子模块排序
        sort: [{ required: true, message: "请输入排序数字", type: "number" }],
        // 子模块所属模块
        ascription_modular: [{ required: true, message: "请选择所属模块" }],
        // 子模块调用模板
        template_id: [{ required: true, message: "请选择调用模板" }],
        // 是否显示
        is_show: [{ required: true, message: "默认隐藏" }]
      }
    };
  },
  methods: {
    // 编辑子模块中的开关状态改变触发[对应改变表单中is_show状态]
    switchStatus() {
      this.formData.is_show = this.sub_isShow ? 1 : 0;
    },
    // 获取子模块模板列表
    getTemplateList() {
      getTemplateList().then(res => {
        this.subModularList = res.data.data;
      });
    },
    // 获取子模块列表
    getDataList() {
      this.tableData = [];
      const data = {
        ...this.pageParams,
        ...this.searchParams,
        game_id: this.game_id
      };
      getSubModularList(data).then(res => {
        try {
          this.current_page = res.data.data.current_page;
          // this.tableData = [];
          if (res.data.code === 200 && res.data.data.data) {
            // 处理按sort排序从小到大
            res.data.data.data.sort(arrSort("sort"));
            // 给最大的排序加上一个标志,用来做下降按钮判断
            res.data.data.data[res.data.data.data.length - 1].most = true;

            // 处理隐藏往后移动
            res.data.data.data.sort(arrSort("is_show"));
            let index = res.data.data.data.findIndex(item => {
              return item.is_show == 1;
            });
            if (res.data.data.data[index - 1]) {
              res.data.data.data[index - 1].hide = true;
            }
            this.total = res.data.data.total;
            // 遍历查看是否有申请管理员模板
            this.is_controllerModule = res.data.data.data.some(item => {
              return item.template_id == 6;
            });

            // 使用$nextTick解决显示/隐藏排序
            this.$nextTick(() => {
              this.tableData = res.data.data.data;
            });
          }
        } catch {}
      });
    },
    // 添加子模块
    addSubModular() {
      const data = {
        ...this.formData,
        game_id: this.game_id,
        category_id: 2,
        modular_id: this.modular_id
      };
      addSubModular(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("添加成功");
          this.editVisible = false;
          this.getDataList();
        }
      });
    },
    // 编辑子模块
    modularSaveSubModular() {
      const data = {
        ...this.formData,
        modular_id: this.modular_id,
        sub_modular_id: this.formData.id
      };
      modularSaveSubModular(data).then(res => {
        if (res.data.code === 200) {
          this.getDataList();
          this.editVisible = false;
          this.$Message.success("操作成功");
        }
      });
    },
    getWikiData(data) {
      return new Promise((resolve, reject) => {
        getWikiData(data)
          .then(res => {
            if (res.data.code === 200) {
              resolve(res.data.data);
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    // 编辑词条
    editGameWiki() {
      this.getContentUserData();
      const data = {
        game_id: this.game_id,
        id: this.formData.id,
        name: this.formData.name,
        order: this.formData.order,
        pid: this.formData.pid,
        user_id: this.formData.user_id,
        content: this.formData.content,
        url: this.formData.url
      };
      editGameWiki(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("编辑成功");
          this.editVisible = false;
          this.getDataList();
          this.getTemplateList();
        }
      });
    },
    // 删除子模块
    delSubModular(id) {
      delSubModular({ sub_modular_id: id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功");
          if (this.pageParams.page > 1 && this.tableData.length === 1)
            this.pageParams.page--;
          this.getDataList();
          this.getTemplateList();
        }
      });
    },
    // 子模块排序 [上升&下降]
    saveSort(id, type) {
      // 找到当前被点击的数据索引
      let index = this.tableData.findIndex(item => {
        return item.id == id;
      });
      // 根据点击类型判断是上升还是下降排序
      let data = {
        sub_modular_id: id,
        exchange_id:
          type === "up"
            ? this.tableData[index - 1].id
            : this.tableData[index + 1].id
      };
      saveSort(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getDataList();
        }
      });
    },
    // 修改子模块隐藏/显示
    saveSubModularStatus(data) {
      saveSubModularStatus(data.id).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getDataList();
        }
      });
    },
    // 弹框确定事件[添加子模块 | 编辑子模块]
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.mode === "add") {
            this.addSubModular();
          } else {
            this.modularSaveSubModular();
          }
        } else {
          this.$Message.error("请完善信息");
        }
      });
    },
    // 获取发布账号数据
    getContentUserData() {
      getContentUserData().then(res => {
        if (res.data.code === 200) {
          this.accounts = res.data.data;
        }
      });
    },
    getWikiDataByGameId() {
      getWikiDataByGameId({ game_id: this.game_id }).then(res => {
        if (res.data.code === 200) {
          this.wikiData = res.data.data;
        }
      });
    },
    handleEditorChange(html) {
      this.formData.content = html;
    },
    // 添加模块按钮点击事件[弹出添加模块对话框]
    addClick() {
      // 重置表单
      this.$refs.form.resetFields();
      this.mode = "add";
      this.formData.is_show = 1;
      this.editVisible = true;
      this.modalTitle = "添加";

      // 根据判断过滤掉申请管理员模块
      if (this.is_controllerModule) {
        this.subModularList = this.subModularList.filter(item => item.id !== 6);
      }
      this.getWikiDataByGameId();
    },
    // 修改子模块隐藏/显示
    handleSwitchChange(data) {
      this.saveSubModularStatus(data);
    },
    handlePageChange(page) {
      this.pageParams.page = page;
      this.getDataList();
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1;
      this.pageParams.per_page = size;
      this.getDataList();
    },
    // 编辑子模块对话框状态改变时触发
    visibleChange(status) {
      // 对话框关闭时重置表单内容
      if (status === false) {
        this.$refs.form.resetFields();
      }
    }
  },
  mounted() {
    this.modular_id = this.$store.state.app.modular_id;
    const id = this.$route.query.id;
    if (id) {
      this.game_id = id;
      this.getDataList();
    }
    this.getContentUserData();
    this.getTemplateList();
  },
  computed: {
    // 根据本行数据判断开关按钮状态
    sub_isShow() {
      return this.formData.is_show !== 1;
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
