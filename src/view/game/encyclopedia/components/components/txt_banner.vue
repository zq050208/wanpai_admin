<template>
  <div class="txt_banner">
    <!-- 三级tabs -->
    <Tabs v-model="three_tabsVal" @on-click="tabsClick" name="three_tabs">
      <TabPane
        :label="item.label"
        :name="item.key"
        tab="three_tabs"
        v-for="(item, index) in three_tabs"
        :key="index"
      />
    </Tabs>
    <Button type="primary" @click="handlerAddEvent">{{btnText}}</Button>
    <!-- 一级select -->
    <Select
      v-model="one_select"
      style="width:200px"
      :disabled="one_isDisabled"
      class="selectCs"
      placeholder="请选择一级分类"
      clearable
      @on-change="one_selectChange"
      filterable
    >
      <Option v-for="item in select_oneLevel" :value="item.id" :key="item.id">{{ item.name }}</Option>
    </Select>
    <!-- 二级select -->
    <Select
      v-model="two_select"
      style="width:200px"
      :disabled="two_isDisabled"
      class="selectCs"
      placeholder="请选择二级分类"
      clearable
      @on-change="two_selectChange"
      filterable
    >
      <Option v-for="item in select_twoLevel" :value="item.id" :key="item.id">{{ item.name }}</Option>
    </Select>
    <!-- 内容搜索框 -->
    <template v-if="three_tabsVal === 'content_list'">
      <Input
        v-model="content_params.name"
        placeholder="输入文本名称搜索"
        style="width:198px;margin-left:10px"
        clearable
      />
      <Button type="primary" @click="searchContent" style="margin-left:5px">查询</Button>
    </template>
    <template v-if="is_sort">
      <!-- 分类表格 -->
      <Table :columns="sort_columns" :data="sort_data" border />
    </template>
    <template v-else>
      <!-- 内容表格 -->
      <Table :columns="content_th" :data="content_data" border></Table>
    </template>
    <!-- 分页 -->
    <page
      class="page"
      show-elevator
      show-sizer
      show-total
      :current="current_page"
      :total="total"
      :page-size-opts="[10,20,30]"
      @on-change="page_change"
      @on-page-size-change="page_size_change"
    />

    <!-- 编辑&添加分类 -->
    <Modal v-model="sortIs_show" :title="modal_title" @on-cancel="modalCancel">
      <Form
        ref="sortForm"
        :model="sortFormData"
        inline
        :label-width="140"
        :rules="sortFormRules"
        label-colon
      >
        <FormItem :label="btnText2" prop="name">
          <Input
            v-model="sortFormData.name"
            placeholder="请输入分类名称"
            style="width: 100%"
            maxlength="10"
          />
        </FormItem>
        <FormItem label="所属一级分类" prop="chooseLevel" v-if="is_one">
          <Select v-model="sortFormData.pid" style="width:200px">
            <Option v-for="item in select_oneLevel" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="排序值" prop="order">
          <InputNumber
            :min="1"
            v-model="sortFormData.order"
            placeholder="请输入排序值,不可重复"
            style="width:100px"
          ></InputNumber>
        </FormItem>
      </Form>
      <template #footer>
        <Button type="primary" @click="confirmBtn">提交</Button>
      </template>
    </Modal>

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
  TemCategoryIndexCategory,
  editCateStatus2,
  editCateOrder2,
  delCate,
  temCategoryAddView,
  temCategoryEditView,
  temCategoryAddCate,
  temCategoryEditCate,
  temContentIndexContent,
  temContentEditContentStatus,
  temContentEditContentOrder,
  temContentDelContent
} from "@/api/data";

export default {
  name: "txt_banner",
  props: ["current_template_id", "submod_id"],
  data() {
    return {
      bigImg_isShow: false,
      bigImg_url: "",
      // 获取校验码的参数
      viewParams: {
        cate_id: null,
        is_one_level: 1,
        submod_id: this.submod_id
      },
      // 获取内容的参数
      content_params: {
        page: 1,
        per_page: 10,
        submod_id: this.submod_id,
        cate_id: 0,
        name: ""
      },

      is_one: false,
      modal_title: "",
      sortIs_show: false,
      sortFormData: {
        name: "",
        submod_id: this.submod_id,
        order: null,
        pid: "", // 一级分类ID 添加二级分类的时候需要
        checkcode: ""
      },
      sortFormRules: {
        name: [
          { required: true, message: "请输入分类名称", trigger: "change" }
        ],
        chooseLevel: [
          {
            required: true,
            message: "请选择一级分类",
            trigger: "change",
            validator: (rule, value, callback) => {
              if (!this.sortFormData.pid) {
                return callback(new Error("文本图片不能为空"));
              } else {
                callback();
              }
            }
          }
        ],
        order: [
          {
            required: true,
            message: "请输入排序值",
            trigger: "change",
            type: "number"
          }
        ]
      },

      total: 0,
      pid: 0,
      is_showDown: 1, // 分类用
      is_showDown_: 1, // 内容用
      contentSearchVal: "", // 内容筛选
      last_page: null,
      current_page: null,
      sort_params: {
        page: 1,
        per_page: 10,
        is_one_level: 1,
        pid: 0,
        submod_id: this.submod_id
      },
      three_tabsVal: "",
      btnText: "添加一级分类",
      btnText2: "一级分类名称",
      three_tabs: [
        { key: "one_level", label: "一级分类" },
        { key: "two_level", label: "二级分类" },
        { key: "content_list", label: "内容列表" }
      ],
      one_select: "",
      two_select: undefined,
      one_isDisabled: true,
      two_isDisabled: true,
      select_oneLevel: [],
      select_twoLevel: [],
      sort_columns: [
        {
          title: "排序",
          key: "order",
          align: "center",
          render: (h, params) => {
            if (params.row.is_show === 0) {
              return h("div", {}, "无");
            } else {
              return h("div", [
                h("div", [
                  h(
                    "span",
                    {
                      style: {
                        margin: "0 10px"
                      }
                    },
                    params.row.order
                  ),
                  h("Button", {
                    props: {
                      shape: "circle",
                      icon: "md-arrow-round-up"
                    },
                    style: {
                      color: "#19be6b",
                      visibility:
                        params.index === 0 && this.sort_params.page === 1
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

                  h("Button", {
                    props: {
                      shape: "circle",
                      icon: "md-arrow-round-down"
                    },
                    style: {
                      color: "#2db7f5",
                      visibility:
                        (this.sort_data[params.index + 1] &&
                          this.sort_data[params.index + 1].is_show === 0) ||
                        (this.last_page === this.current_page &&
                          params.index === this.sort_data.length - 1) ||
                        (this.is_showDown === 0 &&
                          params.index === this.sort_data.length - 1)
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
            }
          }
        },
        {
          title: `一级分类名称`,
          key: "name",
          align: "center"
        },
        {
          title: `包含二级分类`,
          align: "center",
          render: (h, params) => {
            let subCategory = "无";
            // 一级分类渲染逻辑
            if (params.row.cate_list && params.row.cate_list.length > 0) {
              subCategory = [];
              for (const item of params.row.cate_list) {
                subCategory.push(item.name);
              }
            }
            // 二级分类渲染逻辑
            else if (params.row.cate_info) {
              subCategory = params.row.cate_info.name;
            }
            return h("span", [h("span", {}, `${subCategory}`)]);
          }
        },
        {
          title: "隐藏/显示",
          key: "is_show",
          align: "center",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 1, //0是不启用 1是启用
                "before-change": () => this.handleSwitchChange(params.row.id)
              }
            });
          }
        },
        {
          title: "操作",
          key: "name",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px" },
                  on: {
                    // 一级 二级分类,编辑按钮点击事件
                    click: () => {
                      this.btnText2 =
                        this.three_tabsVal === "one_level"
                          ? "一级分类名称"
                          : "二级分类名称";
                      this.modal_title =
                        this.three_tabsVal === "one_level"
                          ? "编辑一级分类"
                          : "编辑二级分类";
                      this.sortFormData = { ...params.row };
                      this.sortIs_show = true;
                      this.sortFormData.cate_id = params.row.id;
                      this.temCategoryEditView(params.row.id);
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
                          this.delCate(params.row.id);
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
      sort_data: [],
      allSort_data: [],
      // 内容列表表头
      content_columns: [
        {
          title: "排序",
          align: "center",
          key: "order",
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
                    params.row.order
                  ),
                  h("Button", {
                    props: {
                      shape: "circle",
                      icon: "md-arrow-round-up"
                    },
                    style: {
                      color: "#19be6b",
                      visibility:
                        params.index === 0 && this.content_params.page === 1
                          ? "hidden"
                          : "visible"
                    },
                    // 内容上升排序
                    on: {
                      click: () => {
                        this.temContentEditContentOrder(params.row.id, "up");
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
                        (this.content_data[params.index + 1] &&
                          this.content_data[params.index + 1].is_show === 0) ||
                        (this.last_page === this.current_page &&
                          params.index === this.content_data.length - 1) ||
                        (this.is_showDown_ === 0 &&
                          params.index === this.content_data.length - 1)
                          ? "hidden"
                          : "visible"
                    },
                    // 内容下降排序
                    on: {
                      click: () => {
                        this.temContentEditContentOrder(params.row.id, "down");
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
          title: "所属一级分类",
          align: "center",
          render: (h, params) => {
            return h("div", {}, `${params.row.parent_cate_info.name}`);
          }
        },
        {
          title: "所属二级分类",
          align: "center",
          render: (h, params) => {
            return h("div", {}, `${params.row.cate_info.name}`);
          }
        },
        {
          title: "文本名称",
          align: "center",
          key: "name"
        },
        {
          title: "图片",
          align: "center",
          key: "img_url",
          width: 0,
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: `${params.row.img_url}`
              },
              style: {
                width: "50px"
              },
              on: {
                click: () => {
                  this.bigImg_url = params.row.img_url;
                  this.bigImgShow();
                }
              }
            });
          }
        },
        {
          title: "隐藏/显示",
          align: "center",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 1,
                "before-change": () =>
                  this.temContentEditContentStatus(params.row.id)
              }
            });
          }
        },
        {
          title: "点击人/次",
          align: "center",
          render: (h, params) => {
            return h("span", {}, `${params.row.pv}/${params.row.uv}`);
          }
        },
        {
          title: "人均点击",
          align: "center",
          render: (h, params) => {
            let av = params.row.uv == 0 ? 0 : params.row.pv / params.row.uv;
            return h("span", {}, `${av}`);
          }
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px" },
                  // 内容列表 编辑按钮事件
                  on: {
                    // 编辑按钮点击事件
                    click: () => {
                      this.addOrEditContent("edit", params.row.id);
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
                    // 删除内容
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "确认删除该内容吗？",
                        onOk: () => {
                          this.temContentDelContent(params.row.id);
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
      content_data: [],
      allContent_data: [],
      is_sort: true // true显示分类表格 false显示内容表格
    };
  },
  methods: {
    // 三级tabs切换事件
    tabsClick(name) {
      this.three_tabsVal = name;
      this.temCategoryAddView();
      switch (name) {
        case "one_level":
          this.sort_columns[1].title = `一级分类名称`; // 表头title
          this.sort_columns[2].title = `包含二级分类`; // 表头title
          this.btnText2 = "一级分类名称";
          this.requestSortData(1); // 请求的是1级分类
          break;
        case "two_level":
          this.sort_columns[1].title = `二级分类名称`;
          this.sort_columns[2].title = `所属一级分类`;
          this.btnText2 = "二级分类名称";
          // 为了获取一级分类数据 做编辑二级分类的数据回
          this.requestSortData(2);
          break;
        case "content_list":
          this.is_sort = this.one_isDisabled = this.two_isDisabled = false;
          this.btnText = "添加内容";
          this.one_select = this.two_select = undefined;
          this.content_params.page = 1;
          // 获取内容数据
          this.temContentIndexContent();
          this.allTemContentIndexContent();
          // 清除本地记录
          this.$nextTick(() => {
            window.sessionStorage.removeItem("three_tabs_");
          });
          break;
      }
    },
    // 请求分类数据
    requestSortData(level) {
      this.btnText = level === 1 ? "添加一级分类" : "添加二级分类";
      this.is_one = level === 1 ? false : true;
      this.one_isDisabled = level === 1 ? true : false;
      this.sort_params.is_one_level = level; // 请求的是1级分类
      this.sort_params.page = 1;
      this.is_sort = this.two_isDisabled = true;
      this.one_select = this.two_select = "";
      this.TemCategoryIndexCategory();
      this.allTemCategoryIndexCategory();
    },
    // 获取当前分页分类
    async TemCategoryIndexCategory() {
      this.sort_data = [];
      let { data } = await TemCategoryIndexCategory(this.sort_params);
      this.three_tabsVal === "content_list"
        ? (this.select_twoLevel = data.data.data)
        : (this.sort_data = this.handlerPageData(data));
      this.pid === 0 && (this.select_twoLevel = []);
    },
    // 获取所有分类
    async allTemCategoryIndexCategory() {
      let { data } = await TemCategoryIndexCategory({
        per_page: 9999,
        is_one_level: this.sort_params.is_one_level,
        pid: this.pid,
        submod_id: this.submod_id
      });
      this.allSort_data = data.data.data;
      // 给当页最后一条数据加上标志 隐藏下降排序
      try {
        const length = this.sort_params.per_page * this.sort_params.page;
        this.is_showDown = this.allSort_data[length].is_show;
      } catch {}
    },
    // 分页切换
    page_change(page) {
      this.content_params.page = this.sort_params.page = page;
      this.getData();
    },
    // 当前页显示数据数量改变
    page_size_change(size) {
      this.content_params.per_page = this.sort_params.per_page = size;
      this.getData();
    },
    // 显示隐藏
    async handleSwitchChange(id) {
      let { data } = await editCateStatus2({
        cate_id: id,
        submod_id: this.submod_id
      });
      this.handlerSuccess(data);
    },
    // 排序
    async handlerSort(id, type) {
      const index = this.allSort_data.findIndex(item => {
        return item.id === id;
      });
      let { data } = await editCateOrder2({
        cate_id: id,
        submod_id: this.submod_id,
        edit_cate_id:
          type === "up"
            ? this.allSort_data[index - 1].id
            : this.allSort_data[index + 1].id
      });

      this.handlerSuccess(data);
    },
    // 搜索内容
    searchContent() {
      this.content_params.page = 1;
      this.temContentIndexContent();
      this.allTemContentIndexContent();
    },
    // 删除
    async delCate(id) {
      this.sort_data.length === 1 && (this.sort_params.page = 1);
      let { data } = await delCate({ cate_id: id, submod_id: this.submod_id });
      this.handlerSuccess(data);
    },
    // 处理添加分类按钮点击事件
    handlerAddEvent() {
      // 添加分类
      if (this.three_tabsVal !== "content_list") {
        this.modal_title =
          this.three_tabsVal === "one_level" ? "添加一级分类" : "添加二级分类";
        delete this.sortFormData["_index"];
        this.sortFormData.pid = "";
        this.$refs.sortForm.resetFields();
        this.sortIs_show = true;
        this.temCategoryAddView();
      }
      // 添加内容
      else {
        this.addOrEditContent("add");
      }
    },
    // 确认添加&编辑按钮
    confirmBtn() {
      this.$refs.sortForm.validate(v => {
        if (v) {
          this.current_page = this.sort_params.page = this.content_params.page = 1;
          this.sortFormData.hasOwnProperty("_index")
            ? this.temCategoryEditCate()
            : this.temCategoryAddCate();
        } else {
          this.$Message.error("请检查输入内容");
        }
      });
    },
    // 获取添加分类校验码 这里拿到了一级下拉筛选的数据
    async temCategoryAddView() {
      let { data } = await temCategoryAddView(this.viewParams);
      this.select_oneLevel = data.data.data;
      this.sortFormData.checkcode = data.data.checkcode;
    },
    // 获取编辑分类校验码
    async temCategoryEditView(id) {
      this.viewParams.cate_id = id;
      let { data } = await temCategoryEditView(this.viewParams);
      this.sortFormData.checkcode = data.data.checkcode;
    },
    // 添加
    async temCategoryAddCate() {
      let { data } = await temCategoryAddCate(this.sortFormData);
      this.handlerSuccess(data);
    },
    // 编辑
    async temCategoryEditCate() {
      this.sortFormData.submod_id = this.submod_id;
      let { data } = await temCategoryEditCate(this.sortFormData);
      this.handlerSuccess(data);
    },
    // 一级分类筛选选定事件
    one_selectChange(id) {
      console.log(id);
      if (id) {
      }
      this.content_params.page = this.sort_params.page = 1;
      this.two_select = "";
      this.pid = this.sort_params.pid = id ? id : 0;
      // 如果当前tabs是内容列表 , 当一级分类选定后请求二级分类   this.sort_params.is_one_level = 2
      if (this.three_tabsVal === "content_list")
        this.sort_params.is_one_level = 2;
      this.TemCategoryIndexCategory();
      this.allTemCategoryIndexCategory(id);
    },
    // 二级分类筛选选定事件
    two_selectChange(id) {
      this.content_params.cate_id = id;
      this.current_page = this.content_params.page = this.sort_params.page = 1;
      this.temContentIndexContent();
    },
    // 获取内容列表
    async temContentIndexContent() {
      this.content_data = [];
      let { data } = await temContentIndexContent(this.content_params);
      this.content_data = this.handlerPageData(data);
    },
    // 获取所有内容列表
    async allTemContentIndexContent() {
      let { data } = await temContentIndexContent({
        page: 1,
        per_page: 9999,
        submod_id: this.submod_id,
        cate_id: 0,
        name: this.content_params.name
      });
      this.allContent_data = data.data.data;
      try {
        const length = this.content_params.per_page * this.content_params.page;
        this.is_showDown_ = this.allContent_data[length].is_show;
      } catch {}
    },
    // 内容隐藏/显示
    async temContentEditContentStatus(id) {
      let { data } = await temContentEditContentStatus({
        content_id: id,
        submod_id: this.submod_id
      });
      this.handlerSuccess(data);
    },
    // 内容排序
    async temContentEditContentOrder(id, type) {
      if(this.two_select){
      let index = this.allContent_data.findIndex(item => {
        return item.id === id;
      });

      let { data } = await temContentEditContentOrder({
        content_id: id,
        edit_content_id:
          type === "up"
            ? this.allContent_data[index - 1].id
            : this.allContent_data[index + 1].id,
        submod_id: this.submod_id
      });
      this.handlerSuccess(data);
      }else{
        this.$Message.error('请选择二级分类后进行排序')
      }
    },
    // 内容删除
    async temContentDelContent(id) {
      let { data } = await temContentDelContent({
        content_id: id,
        submod_id: this.submod_id
      });
      // 删除最后一条数据 分页--
      this.content_data.length === 1 &&
        this.content_params.page > 1 &&
        this.content_params.page--;
      this.handlerSuccess(data);
    },
    // 添加或编辑内容
    addOrEditContent(type, id) {
      this.$router.push({
        path: "encyclopedia/addOrEdit_content",
        query: {
          submod_id: this.submod_id,
          type: type,
          template_id: this.current_template_id,
          content_id: id
        }
      });
    },
    // 点击图片展示大图
    bigImgShow() {
      this.bigImg_isShow = true;
    },
    // 处理成功操作
    handlerSuccess(data) {
      if (data.code === 200) {
        this.$Message.success("操作成功");
        this.sortIs_show = false;
        this.getData();
      } else {
        // 失败了重新获取验证码
        this.temCategoryAddView();
      }
    },
    getData() {
      if (this.three_tabsVal === "content_list") {
        this.temContentIndexContent(); // 获取内容数据
        this.allTemContentIndexContent();
      } else {
        this.TemCategoryIndexCategory(); //获取一级或二级数据
        this.allTemCategoryIndexCategory();
      }
    },
    // 处理下降排序与分页数据
    handlerPageData(data) {
      // 分页
      this.total = data.data.total;
      this.current_page = data.data.current_page;
      this.last_page = data.data.last_page;
      return data.data.data;
    },
    // 添加&编辑对话框关闭
    modalCancel() {
      this.$refs.sortForm.resetFields();
    }
  },
  created() {
    const tabsName = window.sessionStorage.getItem("three_tabs_");
    if (tabsName) {
      this.three_tabsVal = tabsName;
      this.tabsClick(tabsName);
    }
    this.temCategoryAddView(); // 获取一级分类 内容筛选用
  },
  watch: {
    // submod_id变化 说明二级tabs被切换了
    submod_id: {
      immediate: true,
      handler() {
        // 调用tabs点击事件 ，传入one_level 触发第一个tab
        let tabsName = window.sessionStorage.getItem("three_tabs_");
        this.tabsClick(tabsName === null ? "one_level" : tabsName);
        // 保存submod_id到请求参数
        this.viewParams.submod_id = this.content_params.submod_id = this.sortFormData.submod_id = this.sort_params.submod_id = this.submod_id;
      }
    },
    current_template_id: {
      immediate: true,
      handler() {
        // 如果是纯文本模板 删除第四列[图片]
        this.content_th =
          this.current_template_id == 4
            ? this.content_columns.filter((item, index) => {
                return index != 4;
              })
            : this.content_columns;
      }
    }
  }
};
</script>

<style>
.selectCs {
  margin-left: 10px;
}
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
