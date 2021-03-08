<template>
  <div class="circleClassify-wrap">
    <Card>
      <p class="add-btn">
        <Select
          style="width: 200px"
          v-model="classfiyName"
          clearable
          :label-in-value="true"
          @on-change="selectSearch"
          filterable
          placeholder="请输入关键词搜索分类"
        >
          <Option
            v-for="item in classfiyData"
            :value="item.id"
            :key="item.id"
            :label="item.name"
          >{{item.name}}</Option>
        </Select>
        <i-button type="primary" @click="addTabOrEditRow('add', '')">添加圈子</i-button>
      </p>
      <Table border :columns="columns" :data="tabelData" ref="table" :max-height="550"></Table>
      <div style="text-align: center;margin-top: 15px" v-if="false">
        <Page
          class="page"
          show-elevator
          show-sizer
          show-total
          :total="total"
          :current="page"
          :page-size="per_page"
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
        />
      </div>
    </Card>
    <!--添加-->
    <Modal v-model="tabaddOrEditModel" :mask-closable="false" @on-cancel="resetBanned">
      <p slot="header" style="text-align:left">
        <span>{{tabaddOrEditflag ? '添加圈子：' : '编辑圈子：'}}</span>
      </p>
      <Form ref="tabelFormData" :model="tabelFormData" :rules="tabelFormDRules">
        <FormItem label="选择分类：" :label-width="95" style="text-align:left" prop="selectClassify">
          <Select
            style="width: 200px"
            v-model="tabelFormData.selectClassify"
            filterable
            @on-change="classifySelect"
            :label-in-value="true"
            placeholder="请输入圈子名称搜索"
          >
            <Option
              v-for="item in addClassfiyData"
              :disabled="item.disabled"
              :value="item.id"
              :key="item.id"
              :label="item.name"
            >{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem :label="tabaddOrEditflag ? '添加圈子：' : '编辑圈子：'" prop="addOrEditCircle">
          <Select
            ref='Select'
            style="width: 200px"
            v-model="tabelFormData.addOrEditCircle"
            :filterable='true'
            @on-query-change="searchCircleChange"
            remote
            :remote-method="searchCircleData"
            @on-change="changeSelect"
            :label-in-value="true"
            placeholder="请输入圈子名称搜索"
          >
            <Option
              v-for="item in circleData"
              :disabled="item.disabled"
              :value="item.id"
              :key="item.id"
              :label="item.name"
            >{{item.name}}</Option>
          </Select>
        </FormItem>
        <div v-if="circleErr" style="margin-left: 85px;margin-top: -20px;color: #ed4014">请选择圈子</div>
        <FormItem prop="tabName">
          <div class="circle-content">
            <div class="main-content">
              <Tag
                style="max-width: 360px"
                closable
                v-for="(item,index) in tagList"
                :key="index"
                @on-close="handleClose(item,index)"
              >{{item.name}}</Tag>
            </div>
          </div>
        </FormItem>
        <!-- <span style="display:inline-block;color: red;margin: 10px 5px 0 0">*</span><span>{{tabaddOrEditflag ? '添加圈子：' : '编辑圈子：'}}</span> -->
      </Form>
      <div slot="footer" style="text-align: center">
        <Button type="primary" size="default" @click="confirmData()">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  circleClassifyList,
  circleClassifyInfo,
  circleClassifySelect,
  addCircleClassify,
  eddCircleClassify,
  searchCircle
} from "@/api/data";
import { arrSortSize, debounce } from "@/libs/util"; // 排序
export default {
  name: "circleClassify",
  data() {
    return {
      total: 0,
      page: 1,
      per_page: 10,
      circleKeywords: '', // 圈子搜索的keywords
      tabaddOrEditModel: false, // 添加
      tabaddOrEditflag: false,
      addOrEditText: false,
      classfiyName: "", // 搜索select
      classAddOrEditfiyName: "", // model select
      tabelImgModel: false, // 表格图片展示Model
      classfiyData: [], // 搜索下拉
      addClassfiyData: [], // 分类添加 编辑下拉
      circleData: [],
      circleErr: false, // 圈子err
      tabelData: [],
      tagList: [],
      tabelFormData: {
        selectClassify: "",
        addOrEditCircle: "",
        tabName: ""
      },
      tabelFormDRules: {
        selectClassify: [
          { required: true, message: "请选择分类", type: "number" }
        ],
        addOrEditCircle: [{ required: false, message: "请选择圈子" }],
        tabName: [{ required: false, message: "请选择圈子" }]
      },
      columns: [
        {
          title: "排序",
          key: "sort",
          align: "center",
          width: "100px"
        },
        {
          title: "所属分类",
          key: "name",
          align: "center"
        },
        {
          title: "圈子名称",
          key: "circle_name",
          align: "center"
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
                      if (params.row.circle_name) {
                        this.addTabOrEditRow("edit", params.row)
                      } else {
                        this.addTabOrEditRow("add", params.row)
                      }
                    }
                  }
                },
                params.row.circle_name ? "编辑" : '添加'
              )
            ]);
          }
        }
      ]
    };
  },
  methods: {
    // 获取分类列表
    getCircleClassify(name) {
      let params = {
        keyword: name
      };
      circleClassifyList(params).then(res => {
        if (res.data.code == 200) {
          this.tabelData = res.data.data.map(item => {
            return {
              sort: item.sort,
              id: item.id,
              name: item.name,
              circle_name: item.circle_name.length
                ? item.circle_name.join(",")
                : ""
            };
          });
        }
      });
    },
    // 下拉
    getCircleClassifySelect() {
      let params = {
        keyword: ""
      };
      circleClassifySelect().then(res => {
        if (res.data.code == 200) {
          this.classfiyData = res.data.data;
          this.addClassfiyData = res.data.data;
        }
      });
    },
    // 下拉筛选
    selectSearch(val) {
      if (!val) {
        this.getCircleClassify("");
      } else {
        this.getCircleClassify(val.label);
      }
    },
    // 圈子搜索
    searchCircleList() {
      let params = {
        keyword: ""
      };
      searchCircle(params).then(res => {
        if (res.data.code == 200) {
          this.circleData = res.data.data;
          console.log(this.circleData);
        }
      });
    },
    // 分页
    handlePageChange(page) {
      this.page = page;
    },
    handlePageSizeChange(size) {
      this.per_page = size;
    },
    // 添加分类
    addTab() {
      this.tabModel = true;
    },
    // 添加 or 编辑圈子 提交
    confirmData() {
      let tagListJoin = [];
      if (this.tagList.length) {
        this.tagList.forEach(item => {
          if (item) {
            tagListJoin.push(item.id);
          }
        });
        this.tabelFormData.tabName = tagListJoin.join(",");
      }
      this.$refs.tabelFormData.validate(valid => {
        if (!this.tagList.length) {
          this.circleErr = true;
          return;
        }
        if (valid) {
          if (this.tabaddOrEditflag) {
            // console.log(this.tabelFormData, '====add')
            this.addCircleClassify(this.tabelFormData);
            // console.log('添加')
          } else {
            // console.log(this.tabelFormData, '=====edit')
            this.eddCircleClassify(this.tabelFormData);
            // console.log('编辑')
          }
        }
      });
    },
    //  取消
    cancleMedel() {
      this.tabModel = false;
      this.$refs.tabelFormData.resetFields();
    },
    //  添加 or 编辑
    addTabOrEditRow(type, row) {
      this.getCircleClassifySelect();
      this.circleKeywords = ''
      this.searchCircleData()
      this.tabelFormData.selectClassify = "";
      this.$refs.tabelFormData.resetFields();
      this.tabaddOrEditModel = true;
      if (type == "add") {
        this.tagList = [];
        this.tabelFormData = {};
        if (row) {
          this.tabelFormData.selectClassify = row.id;
        }
        this.tabaddOrEditflag = true;
        // 添加
      } else {
        this.tabelFormData.selectClassify = row.id;
        // 编辑
        let data = { id: row.id }
        this.tagList = []
        circleClassifyInfo(data).then(res => {
          if (res.data.code === 200) {
            let tempArr = [];
            tempArr = res.data.data.map(item => {
              if (item.name.length > 10) {
                item.name = item.name.substring(0, 20) + "...";
              }
              return {
                id: item.circle_id,
                circle_id: item.circle_id,
                name: item.name
              };
            });
            let hash = {};
            this.tagList = tempArr.reduce((cur, next) => {
              hash[next.circle_id]
                ? ""
                : (hash[next.circle_id] = true && cur.push(next));
              return cur;
            }, []);
            console.log(this.tagList, "tagList");
          }
        });
        this.tabaddOrEditflag = false;
      }
    },
    // 添加圈子
    addCircleClassify(params) {
      let data = {
        category_id: params.selectClassify,
        circle_id: params.tabName
      };
      addCircleClassify(data).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("操作成功");
          this.tabaddOrEditModel = false;
          this.getCircleClassify("");
        }
      });
    },
    // 修改圈子
    eddCircleClassify(params) {
      let circle_id = [];
      if (this.tagList.length) {
        this.tagList.forEach(item => {
          circle_id.push(item.id);
        });
      }
      let data = {
        category_id: params.selectClassify,
        circle_id: circle_id.join(",")
      };
      eddCircleClassify(data).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("操作成功");
          this.tabaddOrEditModel = false;
          this.getCircleClassify("");
        }
      });
    },
    // 搜索圈子
    searchCircleData: debounce(function (val) {
      let data = {
        keyword: this.circleKeywords
      }
      searchCircle(data).then(res => {
        if (res.data.code == 200 && res.data.data) {
          this.circleData = [];
          this.circleData = res.data.data;
        }
      })
    }, 500),
    // 圈子keyworlds
    searchCircleChange(val) {
      this.circleKeywords = val ? val : ''
      if (!val) {
        this.searchCircleData()
      }
    },
    // 删除标签
    handleClose(item, index) {
      this.tagList.splice(index, 1);
      if (item.id == 1) {
        this.tagList = [];
        this.circleData.forEach(el => {
          el.disabled = false;
        });
      }
    },
    // modal 分类下拉框选择
    classifySelect(item) {
      if (!item) {
        this.getCircleClassifySelect("");
      }
    },
    // modal 圈子下拉框选择
    changeSelect(item) {
      // 全部
      // this.$refs.Select.clearSingleSelect()
      if (item && item.value == 1) {
        this.circleErr = false;
        this.classfiyData.forEach(el => {
          if (el.id != item.value) {
            el.disabled = true;
          }
        });
        this.tagList = [{ name: "全部", id: 1 }];
      } else if (item) {
        this.circleErr = false;
        // 其他选项
        let tempArr = [];
        tempArr = this.tagList;
        if (this.tagList.length) {
          this.tagList.find(v => {
            if (v.id == item.value) {
              this.$Message.warning("圈子已存在，请重新添加");
              return;
            }
          });
        }
        // 添加去重
        this.tagList.push({ id: item.value, name: item.label });
        let hash = {};
        this.tagList = tempArr.reduce((cur, next) => {
          hash[next.id] ? "" : (hash[next.id] = true && cur.push(next));
          return cur;
        }, []);
      }
    },
    // 重置弹框验证
    resetBanned() {
      this.$refs.tabelFormData.resetFields();
    }
  },
  mounted() {
    this.getCircleClassify();
    this.getCircleClassifySelect();
    this.searchCircleList();
    // let isShowSort = []
    // let isTimeSort = []
    // isShowSort = this.dataList.sort(arrSortSize("is_show"))
    // isTimeSort = isShowSort.sort( (a, b) => {
    //   return a.create_time < b.create_time ? 1 : -1
    // })
  }
};
</script>

<style scoped lang="less">
.add-btn {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.circle-content {
  margin: 20px 0 0 80px;
  .main-content {
    padding: 10px 10px 0 13px;
    width: 405px;
    height: 200px;
    overflow: auto;
    background-color: #eee;
  }
}
</style>
<style scoped>
/deep/ .main-content .ivu-icon {
  color: red;
  font-weight: bold;
}
</style>