<template>
  <div>
    <Card>
      <div style="margin-top:10px">
        <SearchForm :searchForm="searchForm" :searchData="searchData" />
      </div>
      <Table border :columns="columns" :data="tableList" ref="table"></Table>
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
      <!-- 添加用户弹窗框 -->
      <Modal v-model="addTagVisble" title="点亮用户数" width="600" @on-cancel="cancelModal">
        <Row>
          <div>
            <Input
              type="text"
              clearable
              v-model="pageParams1.keyword"
              placeholder="输入用户ID或昵称搜索"
              style="width:300px"
            />
            <span style="margin-left:20px">
              <Button type="primary" @click="searchLightList">查询</Button>
            </span>
          </div>
        </Row>
        <div style="margin-top:10px">
          <Table border :columns="modalColumns" :data="modalTableData" ref="table"></Table>
          <Page
            class="page"
            show-elevator
            show-sizer
            show-total
            :page-size-opts="[10, 20, 30, 50]"
            :total="pageParams1.total"
            :current="pageParams1.page"
            :page-size="pageParams1.per_page"
            @on-change="handlePageChange1"
            @on-page-size-change="handlePageSizeChange1"
          />
        </div>
          <div slot="footer"></div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import SearchForm from "@/components/searchForm"
import { getLightGameWikiList, seeLightGameWikiUserList } from "@/api/data"
export default {
  components: { SearchForm },
  data() {
    return {
      gameId: "",
      addFormData: {},
      addTagVisble: false,
      pageParams: {
        is_call: 0,
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParams1: {
        keyword: "",
        page: 1,
        per_page: 10
      },
      searchData: {
        is_call: 0,
        keyword: ""
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.pageParams.page = 1
              this.searchParams = {
                ...this.searchData
              }
              this.getLightGameWikiList()
            }
          }
        ],
        components: [
          {
            name: "Input",
            prop: "keyword",
            label: "查询内容:",
            placeholder: "输入游戏名称或ID搜索"
          },
          {
            name: "Select",
            label: "百科界面详情：",
            width: 200,
            prop: "is_call",
            style: "width:200px",
            options: [
              {
                label: "全部",
                value: 0
              },
              {
                label: "已开启",
                value: 1
              },
              {
                label: "未开启",
                value: 2
              }
            ]
          }
        ]
      },
      columns: [
        {
          title: "游戏ID",
          key: "game_id",
          align: "center"
        },
        {
          title: "游戏名称",
          key: "name",
          align: "center"
        },
        {
          title: "点亮人数",
          key: "total",
          align: "center"
        },
        {
          title: "开启点亮界面时间",
          key: "add_time",
          align: "center"
        },
        {
          title: "百科详情界面",
          key: "is_call",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    "margin-right": "10px",
                    color: +params.row.is_call === 0 ? "#AAAAAA" : "#1ABC9C"
                  }
                },
                +params.row.is_call === 0 ? "未开启" : "已开启 "
              )
            ]);
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
                  props: {
                    type: "success",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.gameId = params.row.game_id
                      this.seeLightGameWikiUserList(params.row.game_id)
                      this.addTagVisble = true
                    }
                  }
                },
                "查看点亮用户"
              )
            ])
          }
        }
      ],
      modalColumns: [
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
          title: "点亮时间",
          key: "create_time",
          align: "center"
        }
      ],
      modalTableData: [],
      tableList: [],
    }
  },
  mounted() {
    this.getLightGameWikiList()
  },
  methods: {
    cancelModal () {
      this.pageParams1.keyword = ""
    },
    searchLightList() {
      this.pageParams1.page = 1
      this.seeLightGameWikiUserList(this.gameId)
    },
    // 获取查看用户点亮列表
    seeLightGameWikiUserList(id) {
      const data = {
        game_id: id,
        ...this.pageParams1
      }
      seeLightGameWikiUserList(data).then(res => {
        if (res.data.code === 200) {
          this.modalTableData = res.data.data.data
          this.pageParams1.total = res.data.data.total
        }
      })
    },
    //获取点亮百科列表
    getLightGameWikiList() { 
      const data = {
        is_call: this.pageParams.is_call,
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      }
      getLightGameWikiList(data).then(res => {
        if (res.data.code === 200) {
          this.tableList = res.data.data.data
          this.pageParams.total = res.data.data.total
        }
      })
    },
    handlePageChange(page) {
      this.pageParams.page = page
      this.getLightGameWikiList()
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1
      this.pageParams.per_page = size
      this.getLightGameWikiList()
    },
    handlePageChange1(page) {
      this.pageParams1.page = page
      this.seeLightGameWikiUserList(this.gameId)
    },
    handlePageSizeChange1(size) {
      this.pageParams1.page = 1
      this.pageParams1.per_page = size
      this.seeLightGameWikiUserList(this.gameId)
    }
  }
};
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>