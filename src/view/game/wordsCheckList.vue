<template>
  <div>
    <Card>
      <div class="search-content">
        <div style="display: flex">
        <span class='label-text'>内容分类：</span>
        <Select
          style="width: 150px; margin-right: 20px"
          @on-change="changeSelectClassify"
          v-model="searchParams.template_id"
        >
          <Option
            v-for="item in contentClassify"
            :value="item.id"
            :key="item.id"
            :label="item.name"
          ></Option>
        </Select>
      </div>
      <div style="display: flex">
        <span class='label-text'>搜索类型：</span>
        <Select style="width: 150px; margin:0 20px 20px 0" @on-change='changeSelectgameType' v-model="searchParams.search_type">
          <Option v-for="item in searchTypeList" :value="item.search_type" :key="item.search_type" :label="item.name"></Option>
        </Select>
      </div>
      <div style="display: flex" v-if='gameType_id == 1'>
        <span class='label-text'>用户名称：</span>
        <Input style="width: 180px; margin-right: 20px" v-model="searchParams.keywords" placeholder="请输入用户名称" />
      </div>

      <div style="display: flex" v-if='gameType_id == 2'>
        <span class='label-text'>游戏名称：</span>
        <Select
          style="width: 180px; margin-right: 20px"
          @on-change="changeSelectgameName"
          @on-query-change="searchgameNameChange"
          @on-clear='clearGameName'
          clearable
          remote
          :remote-method="searchgameName"
          filterable
          v-model="searchParams.game_id"
        >
          <Option v-for="item in gameList" :value="item.id" :key="item.id" :label="item.name">{{item.name}}</Option>
        </Select>
      </div>

      <div style="display: flex" v-if='gameType_id == 2'>
        <span class='label-text'>所属模块：</span>
        <Select
          style="width: 150px; margin-right: 20px"
          @on-change="changeSelectModule"
          v-model="searchParams.modular_id"
        >
          <Option v-for="item in modularList" :value="item.id" :key="item.id" :label="item.name"></Option>
        </Select>
      </div>

      <div style="display: flex" v-if='gameType_id == 2'>
        <span class='label-text'>一级分类：</span>
        <Select style="width: 150px; margin-right: 20px" @on-change="changeSelectone" v-model="searchParams.pid">
          <Option
            v-for="item in oneClassiftyList"
            :value="item.id"
            :key="item.id"
            :label="item.name"
          ></Option>
        </Select>
      </div>

      <div style="display: flex" v-if='gameType_id == 2'>
        <span class='label-text'>二级分类：</span>
        <Select style="width: 150px; margin-right: 20px" v-model="searchParams.pid_2">
          <Option
            v-for="item in twoClassiftyList"
            :value="item.id"
            :key="item.id"
            :label="item.name"
          ></Option>
        </Select>
      </div>
      <Button type="primary" @click='getGameCategoryData'>查询</Button>
      </div>
    </Card>
    <div class='tabel-wrap'>
      <Table border stripe :data="tableData" :columns="columns" />
    <div class="m-top">
      <Checkbox :disabled="!tableData.length > 0" @on-change="checkBoxChange" v-model="checkShow" />
      <span>显示/隐藏当前页内容</span>
      <i-switch v-model="switchAll" @on-change="switchChange" :disabled="!checkShow" />
    </div>
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[10, 20, 30, 50]"
      :total="pageParams.total"
      :current="pageParams.page"
      :page-size="pageParams.per_page"
      @on-change="handlePageChange"
      @on-page-size-change="handlePageSizeChange"
    />
    </div>
  </div>
</template>

<script>
// import SearchForm from "@/components/searchForm";
import {
  getGameCategoryDataList,
  getGameContentList,
  getGameLinkAgeList,
  getGameEntryDel,
  wikiSearchGames,
  getGameEntryStatus
} from "@/api/data";
import { getTagNavListFromLocalstorage, debounce } from "@/libs/util";
export default {
  components: {
    // SearchForm
  },
  data() {
    return {
      submitLoading: false,
      flag_is_show: null,
      editData: {},
      tableData: [],
      checkShow: false, // 底部checkbox状态
      switchAll: false, // 底部switch状态
      contentClassify: [], // 分类
      gameType_id: 2,
      gameKeywords: 0, // 游戏搜索的keywords
      gameList: [], // 游戏List
      modularList: [], // 模块
      oneClassiftyList: [], // 分类一
      twoClassiftyList: [], // 分类二
      searchTypeList: [
        { name: "用户名称", search_type: 1 },
        { name: "游戏名称", search_type: 2 }
      ], // 类型搜索
      columns: [
        {
          align: "center",
          title: "词条id",
          key: "id"
        },
        {
          align: "center",
          title: "文本名称",
          key: "name"
        },
        {
          align: "center",
          title: "所属二级分类",
          key: "child_cate_name"
        },
        {
          align: "center",
          title: "所属一级分类",
          key: "parent_cate_name"
        },
        {
          align: "center",
          title: "模块名称",
          key: "submodular_name"
        },
        {
          align: "center",
          title: "调用模块",
          key: "template_name"
        },
        {
          align: "center",
          title: "所属游戏",
          key: "game_name"
        },
        {
          align: "center",
          title: "用户昵称",
          key: "nickname"
        },
        {
          align: "center",
          title: "显示/隐藏",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                value: params.row.is_show === 1,
                "true-color": "#19be6b",
                "before-change": () => this.handleSwitchChange(params.row)
              }
            });
          }
        },
        {
          align: "center",
          title: "操作",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    "margin-right": "8px"
                  },
                  on: {
                    click: () => {
                      // 编辑当前的页签展示一个
                      let tagList = getTagNavListFromLocalstorage() || [];
                      let flag = true;
                      if (tagList.length) {
                        tagList.forEach(item => {
                          if (item.name === "editmoudelContent") {
                            flag = false;
                          }
                        });
                      }
                      if (flag) {
                        this.$router.push({
                          path: `editmoudel/edit/?id=${params.row.id}&template_id=${this.searchParams.template_id}&submod_id=${params.row.submod_id}`
                        });
                      } else {
                        this.$Modal.error({
                          content: "已有模板正在编辑，请关闭后在编辑当前模板",
                          title: "提示"
                        });
                      }
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "确认要删除此分类吗？",
                        content: "（删除后不可恢复，请谨慎操作）",
                        onOk: () => {
                          this.deleteGameCategory(params.row, params.index);
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
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      searchParams: {
        keywords: "",
        game_id: 0,
        template_id: Number(this.$route.query.id)
          ? Number(this.$route.query.id)
          : 3,
        search_type: 2,
        modular_id: 0,
        pid: 0,
        pid_2: 0
      },
      searchData: {
        keywords: "",
        template_id: Number(this.$route.query.id)
          ? Number(this.$route.query.id)
          : 3,
        game_id: "",
        search_type: 1,
        modular_id: 0,
        pid: 0,
        pid_2: 0
      }
    };
  },
  mounted() {
    this.getGameContentList(); // 获取内容列表
    this.getGameCategoryData(); // 获取游戏审核列表
    this.wikiSearchGamesInit() // 模糊搜索游戏下拉默认
  },
  methods: {
    // 模糊搜索游戏下拉默认
    wikiSearchGamesInit() {
      let params = {
        template_id: this.searchParams.template_id,
        keywords: 0,
        per_page: 100
      }
      wikiSearchGames(params).then(res => {
        if (res.data.code == 200 && res.data.data) {
          this.gameList = res.data.data
        }
      })
    },
    // 模糊搜索游戏下拉
    searchgameName: debounce(function () {
      let params = {
        template_id: this.searchParams.template_id,
        keywords: this.gameKeywords,
      }
      wikiSearchGames(params).then(res => {
        if (res.data.code == 200 && res.data.data) {
          this.gameList = res.data.data
        }
      })
    }, 500),
    searchgameNameChange (val) {
      this.gameKeywords = val ? val : 0
      if (!val) {
        this.wikiSearchGamesInit()
      }
    },
    changeSelectgameType(id) {
      this.pageParams.page = 1
      this.gameType_id = id
      this.gameList = []
      this.modularList = []
      this.oneClassiftyList = []
      this.twoClassiftyList = []
      this.searchParams.keywords = ''
      this.searchParams.game_id = 0
      this.searchParams.pid = 0
      this.searchParams.pid_2 = 0
      this.searchParams.modular_id = 0
      this.wikiSearchGamesInit()
      this.getGameCategoryData()
    },
    changeSelectClassify() {
      this.pageParams.page = 1
      this.gameList = []
      this.modularList = []
      this.oneClassiftyList = []
      this.twoClassiftyList = []
      this.searchParams.keywords = ''
      if (this.searchParams.search_type == 2) {
        this.searchParams.keywords = 0
      }
      this.searchParams.game_id = 0
      this.searchParams.pid = 0
      this.searchParams.pid_2 = 0
      this.searchParams.modular_id = 0
      this.getGameCategoryData()
      this.wikiSearchGamesInit()
    },
    // 游戏名称下拉触发
    changeSelectgameName(val) {
      this.searchParams.keywords = val
      this.getGameLinkDataModel();
      this.searchParams.pid = 0
      this.searchParams.pid_2 = 0
      this.searchParams.modular_id = 0
      this.modularList = []
      this.oneClassiftyList = []
      this.twoClassiftyList = []
    },
    changeSelectModule() {
      this.getGameLinkDataFirst();
      this.searchParams.pid = 0
      this.searchParams.pid_2 = 0
      this.oneClassiftyList = []
      this.twoClassiftyList = []
    },
    changeSelectone() {
      this.getGameLinkDataSecend();
      this.searchParams.pid_2 = 0
      this.twoClassiftyList = []
    },

    // 关键字查询
    getGameLinkDataModel(data) {
      // console.log(data,'ppp');
      // this.searchData.modular_id = 0;
      // this.searchData.pid = 0;
      // this.searchData.pid_2 = 0;
      // console.log(this.searchParams, '000')
      if (!this.searchParams.keywords) {
        return
      }
      getGameLinkAgeList(this.searchParams).then(res => {
        if (res.data.code === 200) {
          this.modularList = res.data.data.list;
        }
      });
    },
    // 分类-1
    getGameLinkDataFirst(data) {
      // console.log(this.searchParams, '分类-1');
      if (!this.searchParams.keywords) {
        return
      }
      getGameLinkAgeList(this.searchParams).then(res => {
        if (res.data.code === 200) {
          let temp = res.data.data.list;
          this.oneClassiftyList = temp;
        }
      });
    },
    // 分类-2
    getGameLinkDataSecend(data) {
      if (!this.searchParams.pid) {
        return false;
      }
      getGameLinkAgeList(this.searchParams).then(res => {
        if (res.data.code === 200) {
          let temp = res.data.data.list;
          this.twoClassiftyList = temp;
        }
      });
    },
    // 获取内容列表
    getGameContentList() {
      this.searchData.keywords = "";
      this.searchData.modular_id = 0;
      this.searchData.pid = 0;
      this.searchData.pid_2 = 0;
      getGameContentList().then(res => {
        if (res.data.code === 200) {
          let temp = res.data.data.list;
          this.contentClassify = temp;
        }
      });
    },
    // 清空游戏
    clearGameName() {
      this.tableData = []
      this.searchParams.keywords = ''
      if (this.searchParams.search_type == 2) {
        this.searchParams.keywords = 0
      }
      this.searchParams.game_id = 0
      this.searchParams.pid = 0
      this.searchParams.pid_2 = 0
      this.searchParams.modular_id = 0
      this.modularList = []
      this.oneClassiftyList = []
      this.twoClassiftyList = []
      this.getGameCategoryData()
    },
    // 获取游戏审核列表
    getGameCategoryData() {
      const data = {
        ...this.pageParams,
        ...this.searchParams
      }
      delete data.total
      // console.log(data, 'hhhhhhh')
      if (data.pid_2) {
        data.pid = data.pid_2;
      }
      if (this.searchParams.search_type == 1) {
        delete data.modular_id
        delete data.pid
        delete data.pid_2
        delete data.game_id
      }
      this.switchAll = false;
      this.checkShow = false;
      // let flag
      getGameCategoryDataList(data).then(res => {
        if (res.data.code === 200) {
          this.pageParams.total = res.data.data.total;
          this.tableData = res.data.data.list;
        }
      });
    },
    // 列表内显示隐藏开关
    handleSwitchChange(params) {
      // console.log(params.is_show, '----');
      let data = {
        ids: [params.id],
        is_show: params.is_show === 1 ? 0 : 1,
        template_id: this.searchParams.template_id
      };
      // console.log(data, "====>>>");
      getGameEntryStatus(data).then(res => {
        if (res.data.code === 200) {
          this.tableData.forEach(item => {
            if (params.id === item.id) {
              item.is_show = params.is_show === 1 ? 0 : 1;
            }
          });
        }
      });
      // flag标识 是否全部打开
      // let flag
      setTimeout(() => {
        this.flag_is_show = this.tableData.every(item => {
          return item.is_show === 1;
        });
        this.switchAll = !!(this.checkShow && this.flag_is_show);
      }, 500);
      // console.log(this.tableData, '===============>>>')
    },
    checkBoxChange() {
      this.flag_is_show = this.tableData.every(item => {
        return item.is_show === 1;
      });
      this.switchAll = !!(this.checkShow && this.flag_is_show);
    },
    // 底部显示隐藏开关项
    switchChange() {
      this.checkShow = true;
      let is_showArr = [];
      this.tableData.forEach(item => {
        is_showArr.push(item.id);
      });
      let data = {
        ids: is_showArr,
        is_show: this.switchAll ? 1 : 0,
        template_id: this.searchParams.template_id
      };
      getGameEntryStatus(data).then(res => {
        if (res.data.code === 200) {
          this.tableData.forEach(item => {
            item.is_show = data.is_show;
          });
        }
      });
    },
    // 删除某一项
    deleteGameCategory(params, index) {
      let data = {
        id: params.id,
        template_id: this.searchParams.template_id
      };
      getGameEntryDel(data).then(res => {
        if (res.data.code === 200) {
          this.tableData.splice(index, 1)
          this.getGameCategoryData()
        }
      });
    },
    handlePageChange(page) {
      this.pageParams.page = page;
      this.getGameCategoryData();
    },
    handlePageSizeChange(size) {
      this.pageParams.per_page = size;
      this.getGameCategoryData();
    }
  }
};
</script>

<style scoped>
.page {
  /* margin-top: 20px; */
  text-align: center;
}
.m-top {
  margin-top: 15px;
}
.search-content{
  display: flex;
  width: 100%;
 flex-wrap: wrap;
}
.label-text{
  width: 80px;
  height: 30px;
  line-height: 30px;
}
.tabel-wrap{
  background-color: #fff;
  padding: 20px 20px 20px 20px;
}
</style>
