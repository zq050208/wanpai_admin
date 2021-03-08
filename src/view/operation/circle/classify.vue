<template>
  <div class="classify-wrap">
    <Card>
      <p class="add-btn">
        <i-button type='primary' @click="addTabOrEditRow('add','')">添加tab分类</i-button>
      </p>
      <Table border :columns="columns" :data="tabelData" ref="table" :max-height="550"></Table>
      <!-- 后台说无分页 -->
      <!-- <div style="text-align: center;margin-top: 15px">
        <Page class="page" show-elevator show-sizer show-total :total="total" :current="page" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
      </div>-->
    </Card>
    <Modal v-model="tabModel" :mask-closable="false" @on-cancel="resetForm">
      <p slot="header" style="text-align:left">
        <span>{{addOrEditText ? '添加分类' : '编辑分类'}}</span>
      </p>
      <Form ref="tabelFormData" :model="tabelFormData" :rules="tabelFormDRules">
        <FormItem label="tab分类名称：" prop="tabName">
          <Input
            style="width: 200px"
            :maxlength="4"
            v-model="tabelFormData.tabName"
            placeholder="请输入名称，上限4个字"
          />
        </FormItem>
      </Form>
      <div slot="footer" style="text-align: center">
        <Button type="default" size="default" @click="cancleMedel()">取消</Button>
        <Button type="primary" size="default" @click="confirmData()">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { arrSortSize } from "@/libs/util"; // 排序
import {
  circleColumnList,
  addCircle,
  circleSort,
  updateStatus,
  bannerTempEditSort,
  editCircle,
  delCircle
} from "@/api/data";
export default {
  name: "classify",
  data() {
    return {
      total: 0,
      page: 1,
      per_page: 10,
      tabModel: false,
      addOrEditText: false,
      tabelData: [],
      allPage: 0,
      allData: [],
      tabelFormData: {
        tabName: "",
        id: ""
      },
      tabelFormDRules: {
        tabName: [{ required: true, message: "请输入名称" }]
      },
      columns: [
        {
          title: "排序",
          key: "sort",
          align: "center",
          width: "150px",
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
                        params.row.show == true && this.page == 1
                          ? "hidden"
                          : "visible"
                    },
                    on: {
                      click: () => {
                        // 上升排序
                        params.row.type = 1;
                        this.upOrDownSort(params.row);
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
                      visibility: params.row.hide == true ? "hidden" : "visible"
                    },
                    on: {
                      click: () => {
                        // 下降排序
                        params.row.type = 2;
                        this.upOrDownSort(params.row);
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
          title: "话题圈子分类名称",
          key: "name",
          align: "center"
        },
        {
          align: "center",
          title: "显示/隐藏",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 1,
                "true-color": "#19be6b",
                "before-change": () => this.editCateStatus(params.row.id)
              }
            });
          }
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  style: { margin: "0px 20px 0px 0px" },
                  on: {
                    click: () => {
                      this.addTabOrEditRow("edit", params.row);
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
                          this.deleteClassify(params.row.id);
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
      ]
    };
  },
  methods: {
    // 分页
    handlePageChange(page) {
      this.page = page;
      this.getClassifyData();
    },
    handlePageSizeChange(size) {
      this.per_page = size;
      this.getClassifyData();
    },
    // 获取所有分类数据
    getClassifyData() {
      let data = {
        page: this.page,
        per_page: this.per_page
      };
      circleColumnList(data).then(({ data }) => {
        try {
          if (data.code === 200 && data.data) {
            data.data = data.data.sort(arrSortSize("is_show"));
            // 将第一个的上升排序隐藏
            data.data[0].show = true;
            // 获取第一个状态为隐藏的数据下标
            let is_hide_index = data.data.findIndex(item => {
              return item.is_show == 0;
            });
            // 根据第一个状态为隐藏的数据下标 为上一条的数据加上hide属性为true ,做下降排序按钮隐藏
            if (is_hide_index != -1 && data.data[is_hide_index - 1]) {
              data.data[is_hide_index - 1].hide = true;
            }
            // 最后一条显示
            if (data.data[data.data.length -1].is_show == 1) {
              data.data[data.data.length -1].hide = true
            }
            this.tabelData = [];
            this.$nextTick(() => {
              this.tabelData = data.data;
              this.total = data.data.total;
            });
            if (data.data.length === 0) {
              if (this.page !== 1) {
                this.page = this.page - 1;
                this.circleColumnList();
              }
            } else {
              return;
            }
          }
        } catch {}
      });
    },
    // 排序
    upOrDownSort(data) {
      // 拿到当前被点击的数据id
      try {
        let index = this.allData.findIndex(item => {
          return item.id === data.id;
        });
        // 向上排序被调换的id
        let upId = this.allData[index - 1] && this.allData[index - 1].id;
        // 向下排序被调换的id
        let downId = this.allData[index + 1] && this.allData[index + 1].id;
        // 准备参数
        let params = {
          id: data && data.id,
          sort_type: data.type
        };
        circleSort(params).then(res => {
          if (res.data.code === 200) {
            this.$Message.success("操作成功");
            this.getClassifyData();
            this.getAllClassifyData();
          }
        });
      } catch {}
    },
    // 添加tab提交
    confirmData() {
      this.$refs.tabelFormData.validate(valid => {
        if (valid) {
          if (this.addOrEditText) {
            // 添加
            this.addCircleData(this.tabelFormData.tabName);
          } else {
            // 修改
            this.editCircleData(this.tabelFormData.tabName);
          }
          this.tabModel = false;
        }
      });
    },
    //  取消
    cancleMedel() {
      this.tabModel = false;
      this.$refs.tabelFormData.resetFields();
    },
    //  添加 or 编辑
    addTabOrEditRow(type, data) {
      this.tabModel = true;
      if (type == "add") {
        this.addOrEditText = true;
      } else {
        this.tabelFormData.tabName = data.name;
        this.tabelFormData.id = data.id;
        this.addOrEditText = false;
      }
    },
    // 添加分类
    addCircleData(tabName) {
      let data = {
        category_name: tabName
      };
      addCircle(data).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("添加成功");
          this.getClassifyData();
        }
      });
    },
    // 修改分类
    editCircleData() {
      let data = {
        id: this.tabelFormData.id,
        category_name: this.tabelFormData.tabName
      };
      editCircle(data).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("修改成功");
          this.getClassifyData();
        }
      });
    },
    // 表单重置
    resetForm() {
      this.$refs.tabelFormData.resetFields();
    },
    // 显示/隐藏
    editCateStatus(id) {
      let params = {
        id: id
      };
      updateStatus(params).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("修改成功");
          this.getClassifyData();
        }
      });
    },
    //  删除
    deleteClassify(id) {
      let params = {
        id: id
      };
      delCircle(params).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("操作成功");
          this.getClassifyData();
        }
      });
    },
    // 获取所有的数据
    //获取模块下的内容列表[所有数据]
    getAllClassifyData() {
      let data = {
        page: 1,
        per_page: 9999999
      };
      this.allData = [];
      circleColumnList(data).then(res => {
        res.data.data = res.data.data.sort(arrSortSize("is_show"));
        this.allData = res.data.data;
        this.allPage = Math.ceil(res.data.data / 10);
      });
    }
  },
  mounted() {
    this.getClassifyData();
    this.getAllClassifyData();
  }
};
</script>

<style scoped>
.add-btn {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}
</style>