<template>
  <div class="pic_banner">
    <!-- 头部按钮 -->
    <Button type="error" @click="delBtnClick">删除</Button>
    <Button type="primary" @click="addOrEditBanner('add')" style="margin-left:5px;">添加banner</Button>
    <!-- 表格 -->
    <Table
      :columns="banner_columns"
      :data="banner_data"
      border
      @on-selection-change="selectionChange"
    ></Table>
    <!-- 分页 -->
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="total"
      :current="bannerTemp_params.page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
    <!-- 广告大图展示,对话框区域 -->
    <Modal
      v-model="bigImg_isShow"
      class="vertical-center-modal"
      :closable="false"
      :footer-hide="true"
    >
      <img :src="bigImg_url" alt class="bigImg" />
    </Modal>
  </div>
</template>

<script>
import {
  BannerTempIndexContent,
  bannerTemp_del,
  bannerTempIsShow,
  bannerTempEditSort
} from "@/api/data";
export default {
  name: "pic_banner",
  props: ["current_template_id", "submod_id"],
  data() {
    return {
      is_showDown: 1,
      template_id: null,
      bigImg_url: "",
      bigImg_isShow: false,
      last_page: null,
      current_page: null,
      selection: [],
      banner_columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "排序",
          width: 150,
          key: "sort",
          align: "center",
          render: (h, params) => {
            if (params.row.is_show === 1) {
              return h("div", [
                h("div", [
                  h(
                    "span",
                    {
                      style: {
                        margin: "0 10px"
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
                        params.index === 0 && this.bannerTemp_params.page === 1
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 上升排序
                        params.row.type = "up";
                        this.bannerTempEditSort(params.row.id, "up");
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
                        (this.banner_data[params.index + 1] &&
                          this.banner_data[params.index + 1].is_show === 0) ||
                        (this.last_page === this.current_page &&
                          params.index === this.banner_data.length - 1) ||
                        (this.is_showDown === 0 &&
                          params.index === this.banner_data.length - 1)
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 下降排序 index
                        params.row.type = "down";
                        this.bannerTempEditSort(params.row.id, "down");
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
          title: "广告名称",
          width: 150,
          key: "name",
          align: "center"
        },
        {
          width: 160,
          title: "广告图片",
          key: "img_url",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: {
                  src: params.row.img_url
                },
                style: {
                  width: this.template_id == 1 ? "85px" : "50px",
                  height: this.template_id == 1 ? "50px" : "50px"
                },
                on: {
                  click: () => {
                    this.bigImg_url = params.row.img_url;
                    this.bigImgShow();
                  }
                }
              })
            ]);
          }
        },
        {
          title: "广告展示时间",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("p", {}, `开始时间: ${params.row.start_time}`),
              h("p", {}, `结束时间: ${params.row.end_time}`)
            ]);
          }
        },
        {
          title: "跳转目标",
          align: "center",
          render: (h, params) => {
            let type = "";
            switch (params.row.jump_type) {
              case 0:
                type = "无";
                break;
              case 1:
                type = "外部链接";
                break;
              case 2:
                type = "功能页面";
                break;
              case 3:
                type = "游戏";
                break;
              case 4:
                type = "百科";
                break;
              case 5:
                type = "词条";
                break;
              case 6:
                type = "文章";
                break;
              case 7:
                type = "视频";
                break;
              case 8:
                type = "帖子详情";
                break;
            }
            return h("div", [
              h("p", {}, `${type}`),
              h(
                "p",
                {},
                `${params.row.jump_type === 0 ? "" : params.row.jump_target}`
              )
            ]);
          }
        },
        {
          width: 120,
          title: "隐藏/显示",
          align: "center",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 1,
                // 0是隐藏 1是显示
                "before-change": () => this.bannerTempIsShow(params.row)
              }
            });
          }
        },
        {
          width: 100,
          title: "点击人/次",
          align: "center",
          render: (h, params) => {
            return h("span", {}, `${params.row.pv}/${params.row.uv}`);
          }
        },
        {
          width: 100,
          title: "人均点击",
          key: "av",
          align: "center"
        },
        {
          title: "操作",
          width: 160,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px" },
                  on: {
                    // 编辑按钮点击事件
                    click: () => {
                      this.addOrEditBanner("edit", params.row.id);
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
                      this.selection = [];
                      this.selection.push(params.row.id);
                      this.delBtnClick();
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      banner_data: [],
      allBanner_data: [],
      bannerTemp_params: {
        page: 1,
        per_page: 10,
        submod_id: null
      },

      total: 0
    };
  },
  methods: {
    async BannerTempIndexContent() {
      this.banner_data = [];
      let { data } = await BannerTempIndexContent(this.bannerTemp_params);
      if (data.code === 200) {
        this.banner_data = data.data.data;
        this.total = data.data.total;
        this.last_page = data.data.last_page;
        this.current_page = data.data.current_page;
      }
    },
    async allBannerTempIndexContent() {
      let { data } = await BannerTempIndexContent({
        per_page: 9999,
        submod_id: this.submod_id
      });
      this.allBanner_data = data.data.data;
      // 给当页最后一条数据加上标志 隐藏下降排序
      try {
        const length =
          this.bannerTemp_params.per_page * this.bannerTemp_params.page;
        this.is_showDown = this.allBanner_data[length].is_show;
      } catch {}
    },
    // 排序
    async bannerTempEditSort(id, type) {
      let index = this.allBanner_data.findIndex(item => {
        return item.id === id;
      });
      let { data } = await bannerTempEditSort({
        id,
        edit_id:
          type === "up"
            ? this.allBanner_data[index - 1].id
            : this.allBanner_data[index + 1].id
      });
      this.handleSuccess(data);
    },
    handlePageChange(page) {
      this.bannerTemp_params.page = page;
      this.getData();
    },
    handlePageSizeChange(size) {
      this.bannerTemp_params.per_page = size;
      this.getData();
    },
    delBtnClick() {
      if (this.selection.length == 0) {
        this.$Message.error("没有选中任何项");
      } else {
        this.$Modal.confirm({
          title: "提示",
          content: "确认删除选中内容吗？",
          onOk: () => {
            if (
              this.bannerTemp_params.page > 1 &&
              this.banner_data.length === 1
            )
              this.bannerTemp_params.page--;
            this.bannerTemp_del();
          }
        });
      }
    },
    handleSuccess(data) {
      if (data.code === 200) {
        this.$Message.success("操作成功");
        this.getData();
      }
    },
    // 删除
    async bannerTemp_del() {
      let { data } = await bannerTemp_del({
        ids: JSON.stringify(this.selection)
      });
      this.handleSuccess(data);
    },
    // 选项被选中触发
    selectionChange(selection) {
      this.selection = selection.map(item => {
        return item.id;
      });
    },
    // 显示隐藏
    async bannerTempIsShow(params) {
      let { data } = await bannerTempIsShow({
        id: params.id,
        is_show: params.is_show === 0 ? 1 : 0
      });
      this.handleSuccess(data);
    },
    // 添加或编辑banner
    addOrEditBanner(type, id) {
      this.$router.push({
        path: "encyclopedia/addOrEdit_banner",
        query: {
          submod_id: this.submod_id,
          type: type,
          template_id: this.current_template_id,
          id
        }
      });
    },
    // 点击图片展示大图
    bigImgShow() {
      this.bigImg_isShow = true;
    },
    getData() {
      this.BannerTempIndexContent();
      this.allBannerTempIndexContent();
    }
  },
  watch: {
    current_template_id: {
      immediate: true,
      handler() {
        this.banner_columns[2].title =
          this.current_template_id == 1 ? "广告名称" : "文本名称";
        this.banner_columns[3].title =
          this.current_template_id == 1 ? "广告图片" : "图表图片";
        this.template_id = this.current_template_id;
      }
    },
    submod_id: {
      immediate: true,
      handler() {
        this.bannerTemp_params.page = 1;
        this.bannerTemp_params.submod_id = this.submod_id;
        this.getData();
      }
    }
  }
};
</script>

<style>
.bigImg {
  width: 100%;
}

.page {
  margin-top: 20px;
  text-align: center;
}

.ivu-table-wrapper {
  margin-top: 10px;
}
</style>
