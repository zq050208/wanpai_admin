<template>
  <div>
    <Card>
      <div style="margin-top:10px">
        <SearchForm :searchForm="searchForm" :searchData="searchData" />
      </div>
      </br>
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
    </Card>
  </div>
</template>

<script>
import { getTemContentErrorList , changeUpStatus} from "@/api/data";
import SearchForm from "../../../components/searchForm";
export default {
  name: "wikiErrorList",
  components: { SearchForm },
  data() {
    return {
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      searchData: {
        status: 0,
        start_time: "", 
        end_time: "", 
        keyword: "",
        date: ""
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "primary",
            handle: () => {
              this.pageParams.page = 1;
              this.searchParams = {
                ...this.searchData,
                start_time: this.searchData.date[0]
                  ? this.searchData.date[0]
                  : "",
                end_time: this.searchData.date[1] ? this.searchData.date[1] : ""
              };
              this.getLists();
            }
          }
        ],
        components: [
          {
            name: "Select",
            width: 10,
            prop: "status",
            style: "width:200px",
            options: [
              {
                label: "全部",
                value: 0
              },
              {
                label: "未审核",
                value: 1
              },
              {
                label: "已修正",
                value: 2
              },
              {
                label: "已忽略",
                value: 3
              }
            ]
          },
          {
            name: "Input",
            prop: "keyword",
            style: "width:200px",
            label: "搜索:",
            placeholder: "输入用户昵称或词条名称搜索"
          },
          {
            name: "SelectDate",
            prop: "date",
            label: "操作日期:"
          }
        ]
      },
      columns: [
        {
          title: "序号",
          key: "id",
          align: "center"
        },
        {
          title: "词条名称",
          key: "name",
          align: "center"
        },
        {
          title: "二级分类",
          key: "two_cate_name",
          align: "center"
        },
        {
          title: "一级分类",
          key: "one_cate_name",
          align: "center"
        },
        {
          title: "子模块名称",
          key: "submod_name",
          align: "center"
        },
        {
          title: "圈子名称",
          key: "game_name",
          align: "center"
        },
        {
          title: "纠错内容",
          key: "error_desc",
          align: "center"
        },

        {
          title: "图片说明",
          key: "images",
          align: "center",
          render: (h, params) => {
            return h('div', [
              h('viewer',
                {
                  style: { width: '52px', height: '52px', overflow: 'hidden', margin: '3px auto',cursor:"pointer" }
                },
                params.row.images && params.row.images.map(i => h('img', {
                  attrs: { src: i},
                  style: { width: '52px', height: '52px', margin: '0 auto' }
                }))
              ),
              h('span', {}, params.row.images ? params.row.images.length + '张' : '')
            ])
          }
        },
        {
          title: "提交时间",
          key: "create_time",
          width:180,
          align: "center"
        },
        {
          title: "纠错用户",
          key: "nickname",
          align: "center"
        },
        {
          title: "操作",
          width:180,
          align: "center",
          render: (h, params) => {
            return h("div", [
              +params.row.status === 2 &&
                h(
                  "span",
                  {
                    style: {
                      "margin-right": "8px",
                      color:"#2ba245"
                    },
                  },
                  "已修正"
                ),
              +params.row.status === 3 &&
                h(
                  "span",
                  {
                    style: {
                      "margin-right": "8px",
                       color:"#f0584c"
                    }
                  },
                  "已忽略"
                ),

               +params.row.status == 1 &&
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small"
                    },
                    style: {
                      "margin-right": "8px"
                    },
                    on: {
                      click: () => {
                        this.$Modal.confirm({
                          title: "确定修正该内容吗?",
                          onOk: () => {
                            this.changeStatus(params.row.id,2)
                          }
                        })
                      }
                    }
                  },
                  "修正"
                ),
                +params.row.status == 1 &&
                 h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small"
                    },
                    style: {
                      "margin-right": "8px"
                    },
                    on: {
                      click: () => {
                        this.$Modal.confirm({
                          title: "确定忽略该内容吗?",
                          onOk: () => {
                            this.changeStatus(params.row.id,3)
                          }
                        })
                      }
                    }
                  },
                  "忽略"
                )
            ]);
          }
        }
      ],
      tableList: [],
    };
  },
  created() {
    this.getLists()
  },
  mounted() {

  },
  methods: {
    //获取列表数据
    getLists() { 
      if (this.searchParams) {
        delete this.searchParams.date;
      }
      const data = {
        page: this.pageParams.page,
        per_page: this.pageParams.per_page,
        ...this.searchParams
      }
      getTemContentErrorList(data).then(res => {
        if (res.data.code === 200) {
          this.tableList = res.data.data.data
          this.pageParams.total = res.data.data.total
        }
      })
    },
    changeStatus(id,type) {
        changeUpStatus({id:id,status: type}).then(res => {
          if (res.data.code === 200) {
            this.$Message.success("操作成功");
            this.getLists();
          }
        });
    },
    handlePageChange(page) {
      this.pageParams.page = page;
      this.getLists();
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1;
      this.pageParams.per_page = size;
      this.getLists();
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
