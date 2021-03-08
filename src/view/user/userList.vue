<template>
  <div>
    <!-- 查询内容 -->
    <Card>
      <SearchForm
        title="筛选数据"
        :searchForm="searchForm"
        :searchData="searchData"
      />
    </Card>
    <!-- 列表 -->
    <Card>
      <p slot="title">数据列表</p>
      <div slot="extra">
        <Button
          v-if="false"
          style="margin-right: 20px"
          icon="md-cloud-upload"
          type="primary"
          @click="sendMessages"
          >群发短信</Button
        >
        <!-- <Button style="margin-right: 20px" icon="md-cloud-upload" type="primary" @click="exportData">导出数据</Button> -->
      </div>
      <Table
        border
        :columns="columns"
        :data="data"
        ref="table"
        type="selection"
        @on-selection-change="handleSelectionChange"
      ></Table>
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
    <Modal
      v-model="bannedModal"
      :mask-closable="false"
      @on-cancel="cancelBannedModal"
    >
      <p slot="header" style="text-align:center">
        <span>封禁“{{ bannedUser }}”</span>
      </p>
      <Form ref="bannedData" :model="bannedData" :rules="rules">
        <FormItem label="封禁渠道：" prop="prohibit_source">
          <Select
            style="width: 280px"
            v-model="bannedData.prohibit_source"
            @on-change="sourceChange"
          >
            <Option
              :value="String(item.id)"
              v-for="item in prohibit_source"
              :key="item.id"
              :label="item.name"
            ></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁类型：" prop="prohibit_type">
          <Select style="width: 280px" v-model="bannedData.prohibit_type">
            <Option
              :value="String(item.id)"
              v-for="item in difStatus === false ? select1 : select2"
              :key="item.index"
              :label="item.name"
            ></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁时长：" prop="prohibit_hour">
          <Input
            v-model="bannedData.prohibit_hour"
            style="width:200px"
            type="number"
          />
          小时
        </FormItem>
        <FormItem label="封禁原因：" prop="prohibit_reason">
          <Select style="width: 280px" v-model="bannedData.prohibit_reason">
            <Option
              :value="String(item.id)"
              v-for="item in prohibit_reason"
              :key="item.id"
              :label="item.name"
            ></Option>
          </Select>
        </FormItem>
        <FormItem label="封禁描述：" prop="prohibit_desc">
          <Input
            v-model="bannedData.prohibit_desc"
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 8 }"
            show-word-limit
            placeholder="请输入相关描述！"
            style="width: 280px"
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" size="default" @click="submitData('bannedData')"
          >提交</Button
        >
      </div>
    </Modal>
    <Modal
      v-model="bannedModal2"
      :mask-closable="false"
      @on-cancel="cancelBannedModal2"
    >
      <p slot="header" style="text-align:center"><span>短信配置</span></p>
      <Form ref="bannedData2" :model="bannedData2" :rules="rules2">
        <FormItem label="选择用户组：" prop="prohibit_usergroup">
          <Select
            style="width: 280px"
            filterable
            v-model="bannedData2.prohibit_usergroup"
          >
            <Option
              :value="String(item.id)"
              v-for="item in prohibit_usergroup"
              :key="item.id"
              :label="item.name"
            ></Option>
          </Select>
        </FormItem>
        <FormItem label="" prop="prohibit_sendtime">
          <RadioGroup v-model="bannedData2.prohibit_sendtime">
            <Radio label="now_send">即时发送</Radio>
            <Radio label="time_send">定时发送</Radio>
            <FormItem
              style="float:right;"
              label=""
              prop="time_send"
              v-if="bannedData2.prohibit_sendtime == 'time_send'"
            >
              <DatePicker
                v-model="bannedData2.time_send"
                type="datetime"
                placeholder="请选择时间"
                style="width: 200px"
              ></DatePicker>
            </FormItem>
          </RadioGroup>
        </FormItem>
        <FormItem label="模板名称：" prop="prohibit_modulname">
          <Select style="width: 280px" v-model="bannedData2.prohibit_modulname">
            <Option
              :value="String(item.id)"
              v-for="item in prohibit_modulname"
              :key="item.id"
              :label="item.name"
            ></Option>
          </Select>
        </FormItem>
        <FormItem label="短信内容：" prop="prohibit_msgcontent">
          <Input
            v-model="bannedData2.prohibit_msgcontent"
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 8 }"
            maxlength="100"
            show-word-limit
            placeholder="请输入相关描述！"
            style="width: 280px"
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button
          type="primary"
          size="default"
          @click="submitData2('bannedData2')"
          >发送短信</Button
        >
      </div>
    </Modal>
    <!-- 修改达人属性弹窗 -->
    <Modal v-model="masterShow" title="配置达人属性" >
      <Form ref="editFormData" :model="editFormData" :label-width="80" inline>
        <FormItem prop="master_status" label="排序值：" style=" width:90%">
          <Select v-model="editFormData.master_status">
                <Option :value = "0">无</Option></Option>
                <Option :value = "1">站内达人</Option>
                <Option :value = "2">站外达人</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" class="confim">
        <Button type="primary" @click="submitMaster('editFormData')"
          >确定</Button
        >
      </div>
    </Modal>
  </div>
</template>
<script>
import SearchForm from "@/components/searchForm";
import {
  getUserList,
  prohibitUser,
  exportUserList,
  getProhibitUserData,
  updateMasterStatus
} from "@/api/data.js";
export default {
  components: { SearchForm },
  data() {
    return {
      editFormData:{
        // userId:'',
        user_id:'',
        master_status:'',
      },
      masterShow:false,
      bannedModal: false, // 封禁弹框
      bannedModal2: false, // 群发短信弹框
      bannedUser: "",
      showShare: false,
      difStatus: false,
      userSearch: {
        userAbout: "",
        time: "",
        selectData: []
      },
      bannedData: {
        prohibit_reason: "",
        prohibit_type: "",
        prohibit_hour: "",
        prohibit_desc: "",
        prohibit_source: ""
      },

      bannedData2: {
        prohibit_usergroup: "",
        prohibit_sendtime: "now_send",
        prohibit_modulname: "",
        prohibit_msgcontent: "",
        time_send: ""
      },
      rules2: {
        prohibit_usergroup: [{ required: true, message: "请选择用户组" }],
        prohibit_sendtime: [{ required: true, message: "请选择发送时间" }],
        prohibit_modulname: [{ required: true, message: "请输入模板名称" }],
        prohibit_msgcontent: [{ required: true, message: "请输入短信内容" }],
        time_send: [{ required: true, message: "请选择定时发送时间" }]
      },
      prohibit_usergroup: [
        { id: 1, name: "xxx" },
        { id: 2, name: "yyy" }
      ],
      prohibit_modulname: [
        { id: 1, name: "xxx" },
        { id: 2, name: "yyy" }
      ],

      prohibit_reason: [],
      prohibit_type: [],
      prohibit_source: [],
      select1: [],
      select2: [],
      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      data: [],
      columns: [
        {
          // type: 'selection',
          title: "用户ID",
          key: "user_id",
          align: "center",
          width: 80
        },
        {
          title: "用户昵称",
          key: "nickname",
          align: "center"
        },
        {
          title: "手机号码",
          key: "username",
          align: "center"
        },
        {
          title: "头像",
          key: "avatar",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: { src: params.row.avatar },
                style: { width: "50px", height: "50px", margin: "0 auto" }
              })
            ]);
          }
        },
        {
          title: "性别",
          key: "gender",
          align: "center",
          render: (h, params) => {
            if (params.row.gender === 1) {
              return h("div", {}, "男");
            } else if (params.row.gender === 2) {
              return h("div", {}, "女");
            }
          }
        },
        {
          title: "达人属性",
          key: "master_status",
          align: "center",
          render: (h, params) => {        
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    shape: "circle"
                  },
                  style: {
                    margin: "auto",
                    color:
                      +params.row.master_status === 0
                        ? "red"
                        : +params.row.master_status === 1
                        ? "#1ABC9C"
                        : "#57a3f3"
                  },
                  on: {
                    click: () => {
                      this.editFormData = {
                        master_status:params.row.master_status
                      }
                      this.editFormData.user_id = params.row.user_id
                      this.masterShow = true
                    }
                  }
                },
                +params.row.master_status === 0
                  ? "无"
                  : +params.row.master_status === 1
                  ? "站内达人"
                  : "站外达人"
              )
            ]);
          }
        },
        {
          title: "渠道来源",
          key: "channel",
          align: "center"
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          render: (h, params) => {
            return h("div", [
              // h('Button', {
              //   props: { type: 'primary', size: 'small' },
              //   style: { margin: '0px 20px 0px 0px' },
              //   on: {
              //     click: () => {
              //       this.sendMessages(params.row.user_id, params.row.nickname)
              //     }
              //   }
              // }, '短信'),
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  style: { margin: "0px 20px 0px 0px" },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: "/user/userDetail",
                        query: { user_id: params.row.user_id }
                      });
                    }
                  }
                },
                "查看"
              ),
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  on: {
                    click: () => {
                      this.bannedCom(params.row.user_id, params.row.nickname);
                    }
                  }
                },
                "封禁"
              )
            ]);
          }
        }
      ],
      searchParams: {
        content: "",
        date: ""
      },
      searchData: {
        content: "",
        date: ""
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.searchParams = { ...this.searchData };
              this.current = 1;
              this.getuserList();
            }
          }
        ],
        components: [
          {
            name: "Input",
            prop: "content",
            label: "查询内容",
            placeholder: "输入ID/昵称/手机号查询"
          },
          {
            name: "SelectDate",
            prop: "date",
            label: "发布时间："
          }
        ]
      },
      rules: {
        prohibit_reason: [{ required: true, message: "请选择封禁原因" }],
        prohibit_type: [{ required: true, message: "请选择封禁类型" }],
        prohibit_hour: [{ required: true, message: "请输入封禁时长" }],
        prohibit_desc: [{ required: true, message: "请输入封禁描述" }],
        prohibit_source: [{ required: true, message: "请选择封禁渠道" }]
      },
      // 选中选
      selected: []
    };
  },
  mounted() {
    this.getuserList();
  },
  methods: {
    // 勾选改变
    handleSelectionChange(selected) {
      this.selected = selected;
    },
    // 获取封禁用户数据
    getProhibitUser() {
      getProhibitUserData().then(res => {
        this.prohibit_source = res.data.data.prohibit_source;
        this.select1 = res.data.data.prohibit_source[0].type_list;
        this.select2 = res.data.data.prohibit_source[1].type_list;
        this.prohibit_reason = res.data.data.prohibit_reason_list;
        this.prohibit_type = res.data.data.prohibit_type_list;
      });
    },
    getuserList() {
      const params = { ...this.searchParams };
      const { date } = this.searchParams;
      delete params.date;
      if (date) {
        params.start_time = date[0];
        params.end_time = date[1];
      }
      var data = {
        page: this.current,
        per_page: this.per_page,
        ...params
      };
      getUserList(data).then(res => {
        this.data = res.data.data.data;
        this.total = res.data.data.total;
        this.per_page = res.data.data.per_page;
        this.last_page = res.data.data.last_page;
      });
    },
    // 选择切换
    sourceChange(value) {
      if (value === "2") {
        this.difStatus = true;
      } else {
        this.difStatus = false;
      }
    },
    // 封禁
    bannedCom(id, name) {
      this.getProhibitUser();
      this.bannedModal = true;
      this.bannedData.user_id = String(id);
      this.bannedUser = name;
    },
    submitData(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          prohibitUser(this.bannedData).then(res => {
            if (res.data.code === 200) {
              this.$Message.success("成功");
              this.bannedModal = false;
              this.resetBanned();
              this.current = 1;
              this.getuserList();
            }
          });
        }
      });
    },
    // 更新达人状态
    submitMaster (){
      let data = {
        ...this.editFormData
      }    
      updateMasterStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功")
          this.masterShow =false
          this.getuserList()
        }
      })
    },
    // 分页
    handlePageChange(page) {
      this.current = page;
      this.selected = [];
      console.log(page);
      this.getuserList();
    },
    handlePageSizeChange(size) {
      this.per_page = size;
      this.selected = [];
      this.getuserList();
    },
    // 导出数据
    // exportData () {
    //   const searchParams = { ...this.searchData }
    //   const { date } = this.searchData
    //   delete searchParams.date
    //   if (date) {
    //     searchParams.start_time = date[0]
    //     searchParams.end_time = date[1]
    //   }
    //   var data = {
    //     ...searchParams
    //   }
    //   exportUserList(data).then(res => {
    //     if (res.data.code === 200) {
    //       this.$refs.table.exportCsv({
    //         filename: '用户列表',
    //         columns: this.columns,
    //         data: res.data.data.user_list
    //       })
    //     }
    //   })
    // },
    // 重置封禁表单
    resetBanned() {
      this.$refs.bannedData.resetFields();
    },
    cancelBannedModal() {
      this.resetBanned();
    },
    // 群发短信 start
    sendMessages(id, name) {
      this.bannedModal2 = true;
      this.bannedData2.user_id = String(id);
      this.bannedUser = name;
      if (id) {
        this.getProhibitUser();
      }
    },
    submitData2(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$Message.success("成功");
          this.bannedModal2 = false;
          this.resetBanned2();
          // prohibitUser(this.bannedData2).then(res => {
          //   if (res.data.code === 200) {
          //   }
          // })
        }
      });
    },
    // 重置群发短信表单
    resetBanned2() {
      this.$refs.bannedData2.resetFields();
    },
    cancelBannedModal2() {
      this.resetBanned2();
    }
    // 群发短信 end
  }
};
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>
