<template>
  <div>
    <Card>
      <template slot="title">申请管理员列表</template>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
      <Table width="100%" border :columns="columns" :data="data" ref="table"></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :total="total"
        :current="current"
        :page-size="per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>
  </div>
</template>
<script>
import SearchForm from "@/components/searchForm";
import { delApply, checkStatus, indexApplyAdmin } from "@/api/data";
export default {
  components: {
    SearchForm
  },
  data() {
    return {
      total: 1,
      current: 1,
      per_page: 10,
      data: [],
      searchParams: {
        keywords: ""
      },
      searchData: {
        keywords: ""
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.searchParams = { ...this.searchData };
              this.current = 1;
              this.indexApplyAdmin();
            }
          }
        ],
        components: [
          {
            name: "Input",
            label: "关键词查询",
            prop: "keywords",
            placeholder: "请输入ID、昵称、联系方式搜索",
            style: {
              width: "230px"
            }
          }
        ]
      },
      columns: [
        {
          title: "序号",
          key: "id",
          align: "center",
          width: "80px"
        },
        {
          title: "用户ID",
          key: "user_id",
          align: "center"
        },
        {
          title: "用户昵称",
          key: "nickname",
          align: "center"
        },
        {
          title: "游戏名称",
          key: "game_name",
          align: "center"
        },
        {
          title: "游戏认识",
          key: "about_game",
          align: "center"
        },
        {
          title: "联系方式",
          key: "connect_info",
          align: "center"
        },
        {
          title: "是否有经验",
          key: "has_experience",
          align: "center"
        },
        {
          title: "做百科时间",
          key: "week_time",
          align: "center"
        },
        {
          title: "何时开始",
          key: "office_hours",
          align: "center"
        },
        {
          title: "备选游戏",
          key: "other_game",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.other_game),
              h("div", params.row.other_game_name)
            ]);
          },
          width: "200px"
        },
        {
          title: "申请时间",
          key: "create_time",
          align: "center"
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          width: "200px",
          render: (h, params) => {
            return h("div", [
              +params.row.status === 2
                ? h(
                    "Button",
                    {
                      props: {
                        type: "default"
                      },
                      on: {
                        click: () => {
                          this.$Modal.confirm({
                            title: "提示",
                            content: "确认通过审核吗？",
                            onOk: () => {
                              this.passList(params.row.id);
                            }
                          });
                        }
                      },
                      style: {
                        "margin-right": "10px"
                      }
                    },
                    "通过"
                  )
                : h(
                    "span",
                    {
                      style: {
                        "margin-right": "10px",
                        color: +params.row.status === 1 ? "#1ABC9C" : "#AAAAAA"
                      }
                    },
                    +params.row.status === 1 ? "已通过" : "已拒绝 "
                  ),

              +params.row.status === 2
                ? h(
                    "Button",
                    {
                      props: {
                        type: "default"
                      },
                      on: {
                        click: () => {
                          this.$Modal.confirm({
                            title: "提示",
                            content: "确认拒绝审核吗？",
                            onOk: () => {
                              this.rejectList(params.row.id);
                            }
                          });
                        }
                      }
                    },
                    "拒绝"
                  )
                : h(
                    "Button",
                    {
                      props: {
                        type: "text"
                      },
                      on: {
                        click: () => {
                          this.$Modal.confirm({
                            title: "提示",
                            content: "确认删除该内容吗？",
                            onOk: () => {
                              this.delApply(params.row.id);
                            }
                          });
                        }
                      },
                      style: {
                        color: "#ed4014"
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
    this.indexApplyAdmin();
  },
  methods: {
    // 列表操作
    delApply(id) {
      let data = {
        apply_id: id
      };
      delApply(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功!");
          if (this.data.length === 1 && this.current > 1) {
            this.current--;
          }
          this.indexApplyAdmin();
        }
      });
    },
    passList(id) {
      let data = {
        status: 1,
        apply_id: id
      };
      checkStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("审核成功!");
          this.indexApplyAdmin();
        }
      });
    },
    rejectList(id) {
      let data = {
        status: -1,
        apply_id: id
      };
      checkStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("拒绝成功!");
          this.indexApplyAdmin();
        }
      });
    },
    // 获取列表数据
    indexApplyAdmin() {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      };
      indexApplyAdmin(obj).then(res => {
        this.data = res.data.data.data;
        this.current = res.data.data.current_page;
        this.per_page = res.data.data.per_page
        this.total = res.data.data.total;
      });
    },
    // 页码改变
    handlePageChange(page) {
      this.current = page;
      this.indexApplyAdmin();
    },
    // size 改变
    handlePageSizeChange(size) {
      this.per_page = size;
      this.indexApplyAdmin();
    }
  }
};
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
table,
tr,
td {
  border: 1px solid #d7d7d7;
  border-collapse: collapse;
  text-align: center;
  padding: 10px;
}
td {
  word-break: break-all;
}
</style>
