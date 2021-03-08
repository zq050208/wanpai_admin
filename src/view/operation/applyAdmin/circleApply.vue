<template>
  <div>
    <Card>
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
import { delCircleApply, examineApply, applyCircleMagageList } from "@/api/data";
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
              this.applyCircleMagageList();
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
          title: "用户手机号",
          key: "username",
          align: "center"
        },
        {
          title: "申请的圈子名称",
          key: "circle_name",
          align: "center"
        },
        {
          title: "在该游戏花费的时间",
          key: "game_take_time",
          align: "center"
        },
        {
          title: "玩过多少款游戏",
          key: "play_game_num",
          align: "center"
        },
        {
          title: "每天有多少时间管理圈子",
          key: "free_time",
          align: "center"
        },
        {
          title: "上任时间",
          key: "fast_take_office_time",
          align: "center"
        },
        {
          title: "年龄",
          key: "how_old",
          align: "center"
        },
        {
          title: "是否有经验",
          key: "experience",
          align: "center"
        },
        {
          title: "担任了什么圈子的圈主",
          key: "already_admin",
          align: "center"
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
              +params.row.status === 1
                ? [
                  h(
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
                              this.passList(params.row.id, 2);
                            }
                          });
                        }
                      },
                      style: {
                        "margin-right": "10px"
                      }
                    },
                    "通过"
                  ),
                  h(
                    "Button",
                    {
                      props: {
                        type: "default"
                      },
                      on: {
                        click: () => {
                          this.$Modal.confirm({
                            title: "提示",
                            content: "确认拒绝通过审核吗？",
                            onOk: () => {
                              this.passList(params.row.id, 3);
                            }
                          });
                        }
                      },
                      style: {
                        "margin-right": "10px"
                      }
                    },
                    "拒绝"
                  )
                ] : [
                  h(
                    "span",
                    {
                      style: {
                        "margin-right": "10px",
                        color: +params.row.status === 2 ? "#1ABC9C" : "#AAAAAA"
                      }
                    },
                    +params.row.status === 2 ? "已通过" : "已拒绝 "
                  ),
                  h(
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
                              this.delCircleApply(params.row.id);
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
                ]
            ]);
          }
        }
      ]
    };
  },
  mounted() {
    this.applyCircleMagageList();
  },
  methods: {
    // 列表操作
    delCircleApply(id) {
      let data = {
        id: id
      };
      delCircleApply(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功!");
          if (this.data.length === 1 && this.current > 1) {
            this.current--;
          }
          this.applyCircleMagageList();
        }
      });
    },
    passList(id,status) {
      let data = {
        status: status,
        id: id
      };
      examineApply(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("操作成功!");
          this.applyCircleMagageList();
        }
      });
    },
    // 获取列表数据
    applyCircleMagageList() {
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      };
      applyCircleMagageList(obj).then(res => {
        this.data = res.data.data.data;
        this.current = res.data.data.current_page;
        this.per_page = res.data.data.per_page
        this.total = res.data.data.total;
      });
    },
    // 页码改变
    handlePageChange(page) {
      this.current = page;
      this.applyCircleMagageList();
    },
    // size 改变
    handlePageSizeChange(size) {
      this.per_page = size;
      this.applyCircleMagageList();
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
