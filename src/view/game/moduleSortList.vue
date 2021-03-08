<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />

      <Table ref="table" border stripe :data="tableData" :columns="columns" />

      <!-- 分页 -->
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
  </div>
</template>

<script>
import SearchForm from "@/components/searchForm";
import {
  hideGameWiki,
  addGameWikiCate,
  editGameWikiCate,
  delGameWiki,
  orderGameWiki,
  getModularList,
  modularCall
} from "@/api/data";

export default {
  // 模块分类列表
  name: "moduleSortList",
  components: { SearchForm },
  data() {
    return {
      game_id: "", // 游戏id
      modular_id: "", // 父级模块id

      pageParams: {
        // 页码
        page: 1,
        per_page: 10
      },
      total: 1,
      tableData: [],

      mode: "",
      editVisible: false,
      formData: {
        name: "",
        order: ""
      },

      searchData: {
        // 搜索关键字
        keywords: ""
      },
      searchParams: {
        keywords: ""
      },
      searchForm: {
        // 查询按钮
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
            label: "词条查询",
            prop: "keywords",
            placeholder: "请输入分类名称",
            style: "width:250px"
          }
        ]
      },
      columns: [
        // 表格
        {
          align: "center",
          title: "分类ID",
          key: "id"
        },
        {
          align: "center",
          title: "分类名称",
          key: "category_name"
        },
        {
          align: "center",
          title: "所属模块",
          key: "ascription_modular"
        },
        {
          align: "center",
          title: "是否调用",
          key: "status",
          // 根据子模块是否启用 ,渲染调用按钮
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_call === 1,
                disabled:params.row.is_call === 1,
                "before-change": () => this.handleSwitchChange(params.row)
              }
            });
          }
        },
        {
          align: "center",
          title: "启用子模块",
          key: "sub_modular_list",
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.sub_modular_list &&
                params.row.sub_modular_list.length > 0
                ? params.row.sub_modular_list.map(i =>
                    h("Tag", {}, i.category_name)
                  )
                : "无"
            );
          }
        }
      ],
      rules: {
        // 分类规则
        name: [
          { required: true, message: "请输入分类名称" },
          { type: "string", max: 20, message: "名称不能大于20字符" }
        ],
        order: [{ required: true, message: "请输入分类排序" }]
      }
    };
  },
  mounted() {
    const id = this.$route.query.id;
    if (id) {
      this.game_id = id;
      this.getDataList();
    }
  },
  methods: {
    // 获取百科分类列表
    getDataList() {
      const data = {
        ...this.pageParams,
        ...this.searchParams,
        game_id: this.game_id
      };
      getModularList(data).then(res => {
        // 重置数据
        this.total = 0;
        this.tableData = [];
        if (res.data.code === 200) {
          if (res.data.data.total !== 0) {
            this.total = res.data.data.total;
            // 过滤掉服务器返回的空对象
            this.tableData = res.data.data.data.filter(item => {
              if (item.category_id === 1) {
                this.modular_id = item.id;
                // 把模块id存到vuex 在添加内容功能用得到
                this.$store.commit("setModular_id", this.modular_id);
              }
              if (item.id) return item;
            });
          }
        }
      });
    },
    // 添加分类
    addGameWikiCate() {
      const data = {
        order: this.formData.order,
        name: this.formData.name,
        game_id: this.game_id
      };
      addGameWikiCate(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("添加成功");
          this.editVisible = false;
          this.getDataList();
        }
      });
    },
    // 编辑分类
    editGameWikiCate() {
      const data = {
        game_id: this.game_id,
        id: this.formData.id,
        name: this.formData.name,
        order: this.formData.order
      };
      editGameWikiCate(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("编辑成功");
          this.editVisible = false;
          this.getDataList();
        }
      });
    },
    // 删除分类
    delGameWiki(id) {
      delGameWiki({ id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功");
          this.getDataList();
        }
      });
    },
    // 排序分类
    orderGameWiki(data) {
      orderGameWiki(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getDataList();
        }
      });
    },
    // 显示/隐藏 分类
    hideGameWiki(item) {
      const data = {
        id: item.id,
        status: item.status === 1 ? 0 : 1
      };
      hideGameWiki(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getDataList();
        }
      });
    },
    // 弹框确定事件
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.mode === "add") {
            this.addGameWikiCate();
          } else {
            this.editGameWikiCate();
          }
        }
      });
    },
    addClick() {
      this.mode = "add";
      this.editVisible = true;
    },
    // 处理[是否调用子模块]开关切换
    handleSwitchChange(data) {
      if (data.is_call === 1) {
        this.$Message.error("已是开启状态");
      } else {
        this.modularCall(data);
      }
    },
    // [是否调用子模块]开关切换
    modularCall(data) {
      modularCall({ modular_id: data.id, game_id: this.game_id }).then(res => {
        if (res.data.code === 200) {
          this.getDataList();
          this.$Message.success(res.data.msg);
        }
      });
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
    visibleChange(visible) {
      if (visible && this.mode === "add") {
        this.$refs.form.resetFields();
      }
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
