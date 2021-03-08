<template>
  <div class="subModule">
    <Card>
      关键词查询：
      <Input
        v-model="subModule_params.keywords"
        placeholder="请输入子模块名称"
        style="width: 300px"
        clearable
        @on-clear="getSubModularList()"
      />
      <Button type="primary" @click="getSubModularList('search')" style="margin-left:10px">查询</Button>
      <Button type="primary" @click="addModuleBtn" style="margin-left:10px">添加模块</Button>
      <Table :columns="subModule_columns" :data="subModule_data" border />

      <!-- 分页 -->
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="total"
        :current="subModule_params.page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>

    <!-- 添加&编辑模块 -->
    <Modal v-model="modal_isShow" :title="modal_title" @on-visible-change="closeModal">
      <Form ref="subModulRef" :model="subModulForm" :rules="subModulRules" :label-width="120">
        <FormItem prop="category_name" label="子模块名称：">
          <Input
            type="text"
            v-model="subModulForm.category_name"
            placeholder="请输入子模块名称"
            maxlength="15"
          />
        </FormItem>

        <FormItem label="所属模块：" prop="module">
          <Select v-model="subModulForm.module" style="width:200px" :disabled="select_disabled">
            <Option value="百科">百科</Option>
          </Select>
        </FormItem>

        <FormItem label="子模块排序：" prop="sort">
          <InputNumber :min="1" v-model="subModulForm.sort" style="width:300px"></InputNumber>
        </FormItem>

        <FormItem label="调用模板：" prop="template_id">
          <Select v-model="subModulForm.template_id" :disabled="select_disabled">
            <Option v-for="item in subModularList" :key="item.id" :value="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>

        <FormItem label="是否显示：" prop="is_show">
          <i-switch v-model="is_showVal" size="large" @on-change="switchStatus"></i-switch>
        </FormItem>
      </Form>

      <template #footer>
        <Button type="primary" @click="putIn">提交</Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import {
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
  name: "subModule",
  data() {
    return {
      last_page: null,
      current_page: null,
      select_disabled: false,
      subModularList: [],
      is_controllerModule: false,
      is_showVal: false,
      subModulForm: {
        category_name: "",
        sort: null,
        template_id: "",
        is_show: 1,
        sub_modular_id: "",
        category_id: 2,
        module: "",
        modular_id: window.sessionStorage.getItem("modular_id"),
        game_id: this.$route.query.id
      },
      subModulRules: {
        category_name: [
          {
            required: true,
            message: "请输入子模块名称",
            trigger: "change"
          }
        ],
        sort: [
          {
            required: true,
            message: "请输入子模块排序"
          }
        ],
        template_id: [
          {
            required: true,
            message: "请选择调用模版"
          }
        ],
        is_show: [
          {
            required: true,
            message: "是否显示"
          }
        ],
        module: [
          {
            required: true,
            message: "请选择所属模块",
            trigger: "change"
          }
        ]
      },
      modal_title: "",
      modal_isShow: false,
      total: 0,
      is_showDown: 0,
      subModule_params: {
        page: 1,
        per_page: 10,
        keywords: "",
        game_id: this.$route.query.id
      },
      subModule_columns: [
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
                      visibility:
                        params.index === 0 && this.subModule_params.page === 1
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 上升排序
                        this.handlerSort(params.row.id, "up");
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
                        (this.subModule_data[params.index + 1] &&
                          this.subModule_data[params.index + 1].is_show ===
                            1) ||
                        (this.last_page === this.current_page &&
                          params.index === this.subModule_data.length - 1) ||
                        (this.is_showDown === 1 &&
                          params.index === this.subModule_data.length - 1)
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 下降排序
                        this.handlerSort(params.row.id, "down");
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
                "before-change": () => this.handleSwitchChange(params.row.id)
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
                      this.editModuleBtn(params.row);
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
      subModule_data: [],
      allSubModule_data: []
    };
  },
  methods: {
    // 获取当前分页子模块
    async getSubModularList(type) {
      this.subModule_data = [];
      type === "search" && (this.subModule_params.page = 1);
      let { data } = await getSubModularList(this.subModule_params);
      if (data.code === 200) {
        this.total = data.data.total;
        this.last_page = data.data.last_page;
        this.current_page = data.data.current_page;
        data.data.data.sort(arrSort("is_show"));
        this.subModule_data = data.data.data;
      } else {
        this.total = 0;
        this.subModule_data = [];
      }
    },
    // 获取所有子模块
    async getAllSubModularList() {
      let { data } = await getSubModularList({
        per_page: 9999,
        game_id: this.$route.query.id
      });
      if (data.code === 200) {
        // 处理排序
        data.data.data.sort(arrSort("is_show"));
        this.allSubModule_data = data.data.data;
        // 切割管理员
        this.is_controllerModule = data.data.data.some(item => {
          return item.template_id == 6;
        });
        // 给当页最后一条数据加上标志 隐藏下降排序
        try {
          const length = this.subModule_params.per_page;
          this.is_showDown = this.allSubModule_data[length].is_show;
        } catch {}
      }
    },
    // 显示隐藏
    async handleSwitchChange(id) {
      let { data } = await saveSubModularStatus(id);
      if (data.code === 200) {
        this.$Message.success("操作成功");
        this.getData();
      }
    },
    // 排序
    async handlerSort(id, type) {
      const index = this.allSubModule_data.findIndex(item => {
        return item.id === id;
      });
      let { data } = await saveSort({
        sub_modular_id: id,
        exchange_id:
          type === "up"
            ? this.allSubModule_data[index - 1].id
            : this.allSubModule_data[index + 1].id
      });
      if (data.code === 200) {
        this.getData();
      }
    },
    // 获取子模块模板
    async getTemplateList() {
      let { data } = await getTemplateList();
      this.subModularList = data.data;
    },
    // 分页
    handlePageChange(page) {
      this.subModule_params.page = page;
      this.getSubModularList();
    },
    handlePageSizeChange(size) {
      this.subModule_params.per_page = size;
      this.getSubModularList();
    },
    // 添加
    addModuleBtn() {
      this.modal_title = "添加模块";
      this.modal_isShow = true;
      this.select_disabled = false;
      if (this.is_controllerModule) {
        this.subModularList = this.subModularList.filter(item => item.id !== 6);
      }
    },
    // 编辑
    editModuleBtn(params) {
      this.modal_title = "编辑模块";
      this.select_disabled = this.modal_isShow = true;
      this.is_showVal = params.is_show == 0 ? true : false;
      this.subModulForm = {
        ...params,
        sub_modular_id: params.id,
        module: params.ascription_modular
      };
    },
    // 显示隐藏开关状态
    switchStatus() {
      this.subModulForm.is_show = this.subModulForm.is_show === 1 ? 0 : 1;
    },
    // 确认添加
    async putIn() {
      this.$refs.subModulRef.validate(async res => {
        if (res) {
          if (this.modal_title === "添加模块") {
            this.subModulForm.modular_id = window.sessionStorage.getItem(
              "modular_id"
            );
            this.subModulForm.game_id = this.$route.query.id;
            let { data } = await addSubModular(this.subModulForm);
            this.handlerSuccess(data);
          } else {
            let { data } = await modularSaveSubModular(this.subModulForm);
            this.handlerSuccess(data);
          }
        }
      });
    },
    // 删除
    async delSubModular(id) {
      if (this.subModule_params.page > 1 && this.subModule_data.length === 1)
        this.subModule_params.page--;
      let { data } = await delSubModular({ sub_modular_id: id });
      if (data.code === 200) {
        this.getData();
        this.getTemplateList(); // 子模块模板
      }
    },
    // 操作成功
    handlerSuccess(data) {
      if (data.code === 200) {
        this.$Message.success("操作成功");
        this.modal_isShow = false;
        this.$refs.subModulRef.resetFields();
        this.getData();
      }
    },
    getData() {
      this.getSubModularList();
      this.getAllSubModularList();
    },
    // 关闭对话框
    closeModal(status) {
      if (!status) {
        this.$refs.subModulRef.resetFields();
        this.is_showVal = false;
      }
    }
  },
  mounted() {
    this.getSubModularList();
    this.getAllSubModularList();
    this.getTemplateList();
  }
};
</script>

<style>
.page {
  margin-top: 20px;
  text-align: center;
}

.ivu-table-wrapper {
  margin-top: 10px;
}
</style>
