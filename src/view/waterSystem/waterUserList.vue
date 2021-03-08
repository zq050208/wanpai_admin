<template>
  <Card :padding="0">
    <div>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
    </div>
    <div class="layout">
      <!--左侧栏-->
      <div class="left-sider">
        <!--搜索-->
        <div style="padding: 5px">
          <Input
            placeholder="搜索群组"
            :search="true"
            :value="keyword"
            @on-search="onSearch"
            style="width: auto"
          >
            <Icon type="ios-search" slot="suffix" />
          </Input>
        </div>
        <!--分组栏-->
        <div style="height: 550px; overflow-y: scroll;">
          <div
            v-for="(item, i) in list"
            @click="show(i)"
            :key="i"
            style="border-bottom: 1px solid #dcdee2; box-sizing: border-box"
          >
            <Dropdown
              trigger="contextMenu"
              :transfer="true"
              @on-click="drop"
              @on-visible-change="menuChange(i)"
              style="width: 100%;"
            >
              <div style="position: relative; height: 30px; line-height: 30px;">
                <span
                  :class="(selected && currentIndex === i)? 'selected' : ''"
                  style="padding-left: 10px;"
                >{{item.name}}</span>
                <Icon type="ios-arrow-forward" style="position: absolute; right: 10px; top: 10px"></Icon>
              </div>
              <DropdownMenu slot="list">
                <DropdownItem name="rename">重命名</DropdownItem>
                <DropdownItem name="istop" :divided="true">置顶</DropdownItem>
                <DropdownItem name="moveUp" :divided="true">上移</DropdownItem>
                <DropdownItem name="moveDown" :divided="true">下移</DropdownItem>
                <DropdownItem name="delete" :divided="true" style="color: #ed4014">删除</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div>
          <Button
            type="primary"
            style="width: 100%;border-radius: 0;border-bottom: 1px solid #cccccc"
            :disabled="disabled"
            @click="showGroupAssess"
          >新增群组成员</Button>
          <Button type="primary" style="width: 100%;border-radius: 0" @click="showGroup">新增群组</Button>
        </div>
      </div>
      <!--内容-->
      <Layout :style="{marginLeft: '200px'}">
        <Content style="min-height: 650px;background: #ffffff;">
          <Table :columns="columns" :data="data" @on-selection-change="selectionChange" ref="table"></Table>
          <Page
            class="page"
            show-elevator
            show-total
            border="true"
            :current="current"
            :total="total"
            :page-size="per_page"
            @on-change="pageChange"
          />
        </Content>
      </Layout>
    </div>
    <Modal v-model="addModal" :title="'新增虚拟用户'" :mask-closable="false">
      <Form ref="userForm" :model="userFormData" :label-width="120">
        <FormItem label="账号数量：">
          <Input v-model="userFormData.user_num" />
        </FormItem>
        <FormItem label="性别比例：">
          <Input style="width: 40%" v-model="userFormData.man_ratio" />男：女
          <Input style="width: 40%" v-model="userFormData.woman_ratio" />
        </FormItem>
        <FormItem label="年龄区间：">
          <Input style="width: 40%" v-model="userFormData.start_age" />一
          <Input style="width: 40%" v-model="userFormData.end_age" />
        </FormItem>
        <FormItem label="地域分布：">
          <RadioGroup v-model="territory" @on-change="handleRadioGroup">
            <Radio label="random">
              <span>随机分布</span>
            </Radio>
            <Radio label="assign">
              <span>指定城市</span>
            </Radio>
          </RadioGroup>
          <Cascader
            style="width:200px"
            v-if="territory === 'assign'"
            :data="cityList"
            v-model="city"
            @on-change="handleCascader"
          ></Cascader>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="default" @click="addModal = false">取消</Button>
        <Button type="primary" size="default" @click="handleAddUserSubmit" :loading="loading">确定新增</Button>
      </div>
    </Modal>
    <!-- 达人属性编辑弹框 -->
    <Modal v-model="editTalent" title="配置达人属性" width="230px">
      <Select v-model="updateMasterStatus.master_status" style="width:200px">
        <Option v-for="item in talentSelect" :value="item.value" :key="item.value">{{ item.status }}</Option>
      </Select>
      <template #footer>
        <Button type="primary" @click="confirmBtn">确定</Button>
      </template>
    </Modal>
  </Card>
</template>
<script>
import SearchForm from "@/components/searchForm";
import groupTable from "@/components/waterSystem/group-table";
import {
  getAreaList,
  getAddVirtualUser,
  getVirtualList,
  getGroupIndex,
  getUserGroupList,
  getAssessByGroup,
  addUserGroup,
  editUserGroup,
  groupSort,
  exportVirtualUserList,
  userJoinGroup,
  delGroup,
  updateMasterStatus
} from "@/api/data";
import { getToken } from "@/libs/util";
const allGroup = [
  { id: 0, name: "全部用户" },
  { id: -1, name: "未分组用户" }
];
export default {
  name:'waterUserList',
  components: { SearchForm, groupTable },
  data() {
    return {
      updateMasterStatus:{
        master_status:'',
        user_id:''
      },
      talentSelect: [
        {
          status: "无",
          value: 0
        },
        {
          status: "站内达人",
          value: 1
        },
        {
          status: "站外达人",
          value: 2
        }
      ],
      editTalent: false,
      addModal: false,
      territory: "random",
      city: [],
      cityList: [], // 城市数据
      userFormData: {
        user_num: "",
        man_ratio: "",
        woman_ratio: "",
        start_age: "",
        end_age: "",
        city_id: 0
      },
      searchData: {
        range: []
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.current = 1;
              this.searchParams = {
                start_id: this.searchData.range[0]
                  ? Number(this.searchData.range[0])
                  : "",
                end_id: this.searchData.range[1]
                  ? Number(this.searchData.range[1])
                  : "",
                content: this.searchData.input,
                status: this.status
              };
              this.getVirtualList();
            }
          },
          {
            text: "导出数据",
            type: "primary",
            handle: () => {
              this.exportVirtualUserList();
            }
          },
          {
            text: "添加",
            type: "primary",
            handle: () => {
              this.userFormData = {
                user_num: "",
                man_ratio: "",
                woman_ratio: "",
                start_age: "",
                end_age: "",
                city_id: 0
              };
              this.city = [];
              this.addModal = true;
            }
          }
        ],
        components: [
          {
            name: "RangeInput",
            prop: "range",
            label: "ID区间："
          },
          {
            name: "Input",
            prop: "input",
            label: "ID/昵称：",
            placeholder: "输入ID/昵称"
          }
        ]
      },
      searchParams: {}, // 搜索内容
      list: [...allGroup], // 群组列表
      groupId: [], // 选择分组ID
      disabled: true, // 新增群组评价按钮开启状态
      keyword: "", // 群组搜索关键字
      selected: true, // 是否左键点击
      group_id: 0, // 分组id
      checkcode: "", // 校验码
      currentIndex: 0, // 当前分组选择项
      forwardIndex: 0, // 右键选择项
      val: "", // 重命名内容
      addVal: "", // 新增分组名
      selection: [], // 当前选中数据
      loading: false, // card2 右边按钮状态
      per_page: 10, // 每页条数
      current: 1, // 当前页
      total: 1, // 总页数
      columns: [
        { type: "selection", width: 60, align: "center" },
        { title: "用户ID", key: "user_id" },
        { title: "用户昵称", key: "nickname" },
        { title: "用户账号", key: "username" },
        {
          title: "性别",
          render: (h, params) => {
            let str = "";
            if (params.row.gender === 1) {
              str = "男";
            } else if (params.row.gender === 2) {
              str = "女";
            }
            return h("div", {}, str);
          }
        },
        { title: "年龄", key: "age" },
        { title: "城市", key: "city_name" },
        { title: "简介", key: "resume" },
        {
          title: "所属群组",
          render: (h, params) => {
            let list = params.row.group_list;
            let str = "";
            if (list.length) {
              list.forEach(item => {
                str += `${item.name}、`;
              });
              str = str.substring(0, str.length - 1);
            }
            return h("div", {}, str);
          }
        },
        {
          title: "达人属性",
          width:'130px',
          render: (h, params) => {
            let status = "";
            if (params.row.master_status === 0) {
              status = "无";
            } else if (params.row.master_status === 1) {
              status = "站内达人";
            } else if (params.row.master_status === 2) {
              status = "站外达人";
            }

            return h(
              "Button",
              {
                on: {
                  click: () => {
                    this.editTalent = true;
                    this.updateMasterStatus = {
                      master_status : params.row.master_status,
                      user_id:params.row.user_id
                    }
                  }
                }
              },
              status
            );
          }
        },
        {
          title: "操作",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: "/waterSystem/edit_user/edit",
                        query: { id: params.row.user_id }
                      });
                    }
                  }
                },
                "编辑"
              )
            ]);
          }
        }
      ],
      data: []
    };
  },
  mounted() {
    this.getVirtualList();
    this.getUserGroupList();
    this.getAreaList();
  },
  methods: {
    handleRadioGroup(val) {
      if (val === "random") this.userFormData.city_id = 0;
    },
    handleCascader(value, selectedData) {
      this.userFormData.city_id = value[1];
    },
    /**
     * 城市数据获取过滤
     */
    getAreaList() {
      getAreaList().then(res => {
        let listStr = JSON.stringify(res.data.data);
        listStr = listStr.replace(/city_list/g, "children");
        listStr = listStr.replace(/short_name/g, "label");
        listStr = listStr.replace(/city_id/g, "value");
        this.cityList = JSON.parse(listStr);
      });
    },
    getAddVirtualUser() {
      if (this.territory === "assign" && this.userFormData.city_id === 0) {
        this.$Message.error("请选择城市");
        return;
      }
      this.loading = true;
      getAddVirtualUser(this.userFormData).then(res => {
        this.loading = false;
        if (res.data.code === 200) {
          this.addModal = false;
          this.current = 1;
          this.$Message.success("成功");
          this.getVirtualList();
        }
      });
    },
    handleAddUserSubmit() {
      this.getAddVirtualUser();
    },
    /**
     * 群组列表
     **/
    getUserGroupList() {
      getUserGroupList({
        keywords: this.keyword,
        page: 1,
        per_page: 1000
      }).then(res => {
        if (res.data.code === 200) {
          this.list = [...allGroup, ...res.data.data.data];
        }
      });
    },
    /**
     * 群组评价列表
     **/
    getAssessByGroup() {
      let data = {
        page: this.current,
        per_page: this.per_page,
        group_id: this.group_id
      };
      getAssessByGroup(data).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data;
        }
      });
    },
    /**
     * 评价列表
     **/
    getVirtualList() {
      let data = {
        page: this.current,
        per_page: this.per_page,
        group_id:
          this.currentIndex === 0
            ? 0
            : this.currentIndex === 1
            ? -1
            : this.group_id,
        ...this.searchParams
      };
      getVirtualList(data).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data;
          this.total = res.data.data.total;
        }
      });
    },
    /**
     * 群组排序
     * @param type 排序方式 1=上移 2=下移 3=置顶
     **/
    groupSort(type) {
      let data = {
        id: this.group_id,
        sort_type: type
      };
      groupSort(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("成功");
          // 当前左键选择与右键选择的群组一致时，改变选中状态位置
          if (type === 1 && this.currentIndex === this.forwardIndex) {
            this.currentIndex--;
          } else if (type === 2 && this.currentIndex === this.forwardIndex) {
            this.currentIndex++;
          } else if (type === 3 && this.currentIndex === this.forwardIndex) {
            this.currentIndex = 1;
          }
          this.getUserGroupList();
        }
      });
    },
    /**
     * 添加分组
     **/
    addUserGroup() {
      let data = { group_name: this.addVal };
      addUserGroup(data).then(res => {
        this.addVal = "";
        if (res.data.code === 200) {
          this.$Message.success("成功");
          this.getUserGroupList();
        }
      });
    },
    /**
     * 分组重命名
     **/
    editUserGroup() {
      editUserGroup({ id: this.group_id, group_name: this.val }).then(res => {
        this.val = "";
        if (res.data.code === 200) {
          this.$Message.success("成功");
          this.getUserGroupList();
        }
      });
    },
    /**
     * 删除群组
     **/
    delGroup() {
      delGroup({ id: this.group_id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("成功");
          this.getUserGroupList();
        }
      });
    },
    /**
     * 搜索按钮
     **/
    onSearch(value) {
      this.keyword = value;
      this.getUserGroupList();
    },
    /**
     * card1 左边按钮
     **/
    leftBtnClick() {
      if (this.selection.length) {
        this.$Modal.confirm({
          title: "提示",
          content: "确定删除吗？",
          onOk: () => {
            delAssess({ assess_ids: JSON.stringify(this.selection) }).then(
              res => {
                if (res.data.code === 200) {
                  this.$Message.success("成功");
                  this.getEvaluateList(1);
                } else {
                  this.$Message.error(res.data.msg);
                }
              }
            );
          }
        });
      } else {
        this.$Message.error("请选择需要删除项");
      }
    },
    /**
     * card1 右边按钮
     **/
    rightBtnClick() {
      let action = server.BASE_URL + "AssessLibrary/import";
      let token = getToken();
      this.$Modal.confirm({
        render: h => {
          return h("div", [
            h(
              "upload",
              {
                style: {
                  textAlign: "center",
                  height: "100px",
                  lineHeight: "100px",
                  cursor: "pointer"
                },
                props: {
                  action: action,
                  ref: "upload",
                  type: "drag",
                  name: "excel_data",
                  headers: { token: token },
                  format: ["xls", "xlsx"],
                  "show-upload-list": false,
                  "on-success": this.handleSuccessUpload
                }
              },
              "上传文件,支持xls、xlsx格式。"
            ),
            h(
              "div",
              { style: { marginTop: "10px" } },
              "备注： 一次最多5000条数据"
            )
          ]);
        },
        onOk: () => {
          console.log(`onOk`);
        },
        onCancel: () => {
          console.log(`onCancel`);
        }
      });
    },
    /**
     * 导出
     **/
    exportVirtualUserList() {
      this.loading = true;
      let data = {
        content: this.searchParams.content,
        start_id: this.searchParams.start_id,
        end_id: this.searchParams.end_id,
        group_id:
          this.currentIndex === 0
            ? 0
            : this.currentIndex === 1
            ? -1
            : this.group_id
      };
      exportVirtualUserList(data).then(res => {
        this.loading = false;
        if (res.data.code === 200) {
          let list = res.data.data.user_list;
          if (list.length) {
            list.forEach(v => {
              if (v.group_list.length) {
                let str = "";
                v.group_list.forEach(item => {
                  str += `${item.name}、`;
                });
                str = str.substring(0, str.length - 1);
                v.group_list = str;
              }
            });
          }
          let columns = [
            { title: "用户ID", key: "user_id" },
            { title: "用户昵称", key: "nickname" },
            { title: "用户账号", key: "username" },
            { title: "性别", key: "gender" },
            { title: "年龄", key: "age" },
            { title: "城市", key: "city_name" },
            { title: "简介", key: "resume" },
            { title: "所属群组", key: "group_list" }
          ];
          this.$refs.table.exportCsv({
            quoted: true,
            separator: ",",
            filename: `虚拟用户列表`,
            columns: columns,
            data: list
          });
        }
      });
    },
    /**
     * 上传文件成功回调
     * @param res
     * @param file
     **/
    handleSuccessUpload(res, file) {
      if (res.code === 200) {
        this.$Message.success({ content: res.msg });
        this.current = 1;
        this.getEvaluateList(1);
      } else {
        this.$Message.error({ content: res.msg });
      }
    },
    /**
     * 分组右键触发
     **/
    menuChange(i) {
      this.forwardIndex = i;
    },
    /**
     * 获取校验码
     **/
    getAssessCode(cb) {
      getAssessCode().then(res => {
        if (res.data.code === 200) {
          cb(res.data.data.checkcode);
        } else {
          this.$Message.error(res.data.msg);
        }
      });
    },
    /**
     * 添加群组评价
     **/
    userJoinGroup() {
      let user_ids = [];
      this.selection.forEach(item => {
        user_ids.push(item.user_id);
      });
      let str1 = JSON.stringify(this.groupId);
      let str2 = JSON.stringify(user_ids);

      let data = {
        group_ids: str1.substring(0, str1.length - 1).slice(1),
        user_ids: str2.substring(0, str2.length - 1).slice(1)
      };
      userJoinGroup(data).then(res => {
        if (res.data.code === 200) {
          this.disabled = true;
          this.current = 1;
          this.$Message.success("成功");
          this.getVirtualList();
        }
      });
    },
    /**
     * 设置选择的群组ID
     * @param list 所选群组
     **/
    setGroupId(list) {
      this.groupId = list;
    },
    /**
     * 新增分组评价弹窗显示
     **/
    showGroupAssess() {
      let list = this.list.slice(2);
      this.$Modal.confirm({
        title: "选择分组",
        render: (h, params) => {
          return h(groupTable, {
            props: {
              data: list,
              selectList: this.setGroupId
            }
          });
        },
        onOk: () => {
          if (this.groupId.length) {
            this.userJoinGroup();
          } else {
            this.$Message.error("请选择群组");
          }
        }
      });
    },
    /**
     * 新增分组弹窗显示
     **/
    showGroup() {
      this.$Modal.confirm({
        title: "提示",
        render: h => {
          return h("Input", {
            props: {
              type: "text",
              value: this.addVal,
              placeholder: "输入新增分组名",
              clearable: true,
              autofocus: true,
              maxlength: 20
            },
            on: {
              "on-blur": event => {
                this.addVal = event.target.value;
              }
            }
          });
        },
        onOk: () => {
          if (this.addVal) {
            this.addUserGroup();
          } else {
            this.$Message.error("请输入新增分组名");
          }
        }
      });
    },
    /**
     * table选中项发生变化时就会触发
     * @param selection 已选项数据
     **/
    selectionChange(selection) {
      this.selection = selection;
      if (this.selection.length) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },
    /**
     * 切换页数触发
     * @param e 当前页数
     */
    pageChange(e) {
      this.current = e;
      this.getVirtualList();
    },
    show(i) {
      this.disabled = true;
      this.currentIndex = i;
      this.current = 1;
      this.selected = true;
      if (this.currentIndex > 1) {
        if (this.columns[0].type === "selection") {
          this.columns = this.columns.slice(1);
        }
      } else {
        if (!this.columns[0].type) {
          this.columns = [
            { type: "selection", width: 60, align: "center" },
            ...this.columns
          ];
        }
      }
      this.group_id = this.list[this.currentIndex].id;
      this.getVirtualList();
    },
    /**
     * 点击菜单项时触发
     * @param name DropdownItem 的 name 值
     */
    drop(name) {
      this.group_id = this.list[this.forwardIndex].id;
      if (this.group_id <= 0) {
        this.$Message.error("默认分组不可操作");
        return;
      }
      switch (name) {
        case "rename": // 重命名
          this.val = this.list[this.forwardIndex].name;
          this.$Modal.confirm({
            title: "提示",
            render: h => {
              return h("Input", {
                props: {
                  type: "text",
                  value: this.val,
                  placeholder: "输入新命名",
                  clearable: true,
                  autofocus: true,
                  maxlength: 20
                },
                on: {
                  "on-blur": event => {
                    this.val = event.target.value;
                  }
                }
              });
            },
            onOk: () => {
              if (this.val) {
                this.editUserGroup();
              } else {
                this.$Message.error("请输入新命名");
              }
            }
          });
          break;
        case "istop": // 置顶
          this.$Modal.confirm({
            title: "提示",
            content: "确定置顶吗？",
            onOk: () => {
              this.groupSort(3);
            }
          });
          break;
        case "moveUp": // 上移
          this.$Modal.confirm({
            title: "提示",
            content: "确定上移吗？",
            onOk: () => {
              this.groupSort(1);
            }
          });
          break;
        case "moveDown": // 下移
          this.$Modal.confirm({
            title: "提示",
            content: "确定下移吗？",
            onOk: () => {
              this.groupSort(2);
            }
          });
          break;
        case "delete": // 删除
          this.$Modal.confirm({
            title: "提示",
            content: "确定删除吗？",
            onOk: () => {
              this.delGroup();
            }
          });
          break;
      }
    },
    // 修改达人属性状态 确认按钮点击事件
   async confirmBtn(){
     let { data } = await updateMasterStatus(this.updateMasterStatus)
    if(data.code === 200) {
      this.$Message.success('操作成功')
      this.editTalent = false
      this.getVirtualList();
    }
     
    }
  }
};
</script>
<style scoped>
.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
}
.left-sider {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  position: absolute;
  background: rgb(255, 255, 255);
  left: 0px;
}
.selected {
  color: #f59a23;
}
.page {
  margin-top: 20px;
  text-align: center;
}
/*修改滚动条样式*/
div::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
div::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}
div::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 5px;
}
div::-webkit-scrollbar-thumb:hover {
  background: #333;
}
</style>
