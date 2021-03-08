<template>
  <div class="moduleSortList">
    <Card>
      词条查询：
      <Input
        v-model="modularList_params.keywords"
        placeholder="请输入分类名称"
        style="width: 300px"
        clearable
        @on-clear="getModularList()"
        maxlength="10"
      />
      <Button type="primary" @click="getModularList()">查询</Button>
      <Table stripe :columns="modularList_columns" :data="modularList_data" border></Table>

      <!-- 分页 -->
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="total"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>
  </div>
</template>

<script>
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
  name: "moduleSortList",
  data() {
    return {
      total: 0,
      modular_id: null,
      modularList_params: {
        page: 1,
        per_page: 10,
        keywords: "",
        game_id: this.$route.query.id
      },
      modularList_data: [],
      modularList_columns: [
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
                disabled: params.row.is_call === 1,
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
      ]
    };
  },
  methods: {
    async getModularList() {
      let { data } = await getModularList(this.modularList_params);
      if (data.code === 200 && data.data.data) {
        this.total = data.data.total;
        this.modularList_data = data.data.data;

        for (let i = 0; i < this.modularList_data.length; i++) {
          if (this.modularList_data[i].category_id === 1) {
            this.modular_id = this.modularList_data[i].id;
            // 保存modular_id到本地
            window.sessionStorage.setItem("modular_id", this.modular_id);
            return;
          }
        }
      }else {
        this.total = 0
        this.modularList_data = []
      }
    },
    async handleSwitchChange(params) {
      let { data } = await modularCall({
        modular_id: params.id,
        game_id: this.$route.query.id
      });
      data.code === 200 && this.getModularList();
    },
    handlePageChange(page) {
      this.modularList_params = page;
      this.getModularList();
    },
    handlePageSizeChange(size) {
      this.modularList_params.per_page = size;
      this.getModularList();
    }
  },
  mounted() {
    this.getModularList();
  }
};
</script>

<style scope>
button.ivu-btn.ivu-btn-primary {
  margin-left: 10px;
}

.ivu-table-wrapper {
  margin-top: 10px;
}

.page {
  margin-top: 20px;
  text-align: center;
}
</style>
