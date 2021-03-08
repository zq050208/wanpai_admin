<template>
  <div>
    <Card>
    <template slot="title">勋章列表</template>
    <SearchForm :searchForm="searchForm" :searchData="searchData" />
    <Table border :columns="columns" :data="list" ref="table"></Table>
      <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
  </Card>
  <Modal v-model="addMedalShow" :mask-closable="false" @on-cancel="resetForm">
     <p slot="header" style="text-align:center">{{title}}</p>
      <Form ref='formData' :model="formData" :rules="rules" :label-width="120">
        <FormItem label="勋章名称：" prop="name">
          <Input v-model="formData.name" placeholder="请输入勋章名称！" type="text" maxlength="10"/>
        </FormItem>
        <FormItem label="勋章图片：" prop="image">
            <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
              <template v-if="item.status === 'finished'">
                <img :src="item.url" style="width: 104px;height:52px;line-height: 160px;margin-right:10px" >
                <div class="demo-upload-list-cover">
                  <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
                </div>
              </template>
              <template v-else>
                <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
              </template>
            </div>
          <!-- <img :src="formData.image" alt="" style="width: 160px;height:160px;line-height: 160px;margin-right:10px"> -->
          <Upload
            v-show="uploadList.length < 1"
            ref="upload"
            :show-upload-list="false"
            :format="['jpg','jpeg','png']"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:104px;">
            <div :style="formData.images_introduce_type===1? 'padding: 20px 0': 'width:104px; height:52px; display:flex; flex-direction: column;justify-content: center; align-items: center'">
              <Icon type="md-add-circle" size="22" style="color: #3399ff; margin-top: 6px;" />
              <p style="font-size: 12px; color: #999;line-height: 20px;">上传勋章图片</p>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="勋章说明：" prop="textarea">
          <Input  v-model="formData.textarea" type="textarea"
            :autosize="{minRows: 5,maxRows: 8}" maxlength='50'
            show-word-limit placeholder="请输入相关描述！" style="width: 280px" />
        </FormItem>
        <FormItem label="是否显示：" prop="switch">
          <i-switch v-model="formData.switch" true-value=1 false-value=2></i-switch>
        </FormItem>
        <!-- 跳转类型 -->
        <FormItem label="跳转类型：" prop="jump_type">
          <!-- <Input v-model="formData.jump_type" placeholder="请选择跳转类型" /> -->
          <Select v-model="formData.jump_type" style="width:100%" @on-change="changeSelect">
            <Option
              v-for="item in myJump_type"
              :value="item.value"
              :key="item.value"
            >{{ item.type }}</Option>
          </Select>
        </FormItem>
        <!-- [跳转外部链接] -->
        <FormItem label="跳转目标：" prop="jump_url" v-show="formData.jump_type === 1">
          <Input v-model="formData.jump_out_url" placeholder="请输入外部链接" />
        </FormItem>
        <!-- [跳转帖子详情] -->
        <FormItem label="跳转目标：" prop="jump_url" v-show="formData.jump_type === 8">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button long @click="jumpTargetPage(8)">关联帖子</Button>
        </FormItem>
        <!-- [跳转游戏] -->
        <FormItem label="跳转游戏详情-详情" prop="jump_url" v-show="formData.jump_type === 3">
          <!-- <Button @click="gameAssociateClick" style="width:100%">关联游戏：{{game_name}}</Button> -->
          <Button long @click="jumpTargetPage(3)">{{formData.jump_url ? "查看已选游戏" : "选择关联游戏"}}</Button>
        </FormItem>

        <!-- [跳转百科] -->
        <FormItem label="跳转游戏详情-百科：" prop="jump_url" v-show="formData.jump_type === 4">
          <Button long @click="jumpTargetPage(4)">{{formData.jump_url ? "查看已选百科" : "选择关联百科"}}</Button>
        </FormItem>

        <!-- 跳转词条 -->
        <FormItem label="跳转词条：" prop="jump_url" v-show="formData.jump_type === 5">
          <Button long @click="jumpTargetPage(5)">
            {{
            formData.jump_url ? "查看已选词条" : "选择关联词条"
            }}
          </Button>
        </FormItem>
        <!-- 跳转文章视频 -->
        <FormItem label="跳转文章视频：" prop="jump_url" v-show="formData.jump_type === 6">
          <Button long @click="jumpTargetPage(6)">
            {{
            formData.jump_url ? "关联文章视频" : "关联文章视频"
            }}
          </Button>
        </FormItem>
      </Form>
      <div slot="footer">
          <Button type="primary" size="default" @click="submitData('formData')" :loading="submitLoadingStatus">提交</Button>
      </div>
  </Modal>
  <!-- 关联游戏对话框区域 -->
  <Modal v-model="gameAssociate" :title="targetModalTitle" width="800" height="500" @on-cancel="cancel">
    <div class="searchInput" v-if="formData.jump_type !== 6">
      搜索内容：
      <Input
        v-model="targetSearch"
        :placeholder="searchPlaceholder"
        style="width: 300px;marginRight:63px"
        v-if="formData.jump_type !== 8"
      />
      <input type="text" v-model="targetSearch" :placeholder="searchPlaceholder"  name="tel" 
      oninput="value=value.replace(/[^\d]/g,'')" 
      style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"
      v-if="formData.jump_type === 8"
      />
      <Button type="primary" @click="searchGame">查询</Button>
    </div>
    <!-- 游戏数据表格 -->
    <Table :columns="targetDetailColumns" :data="targetGameList" border height="400" style="margin-bottom: 20px;" ref="tableList"></Table>
    <!-- 分页区域 -->
    <Page
      class="page"
      show-elevator
      show-sizer
      show-total
      :page-size-opts="[5, 10, 20, 50]"
      :total="pageParams.total"
      :current="pageParams.page"
      :page-size="pageParams.page_size"
      @on-change="handleJumpPageChange"
      @on-page-size-change="handleJumpPageSizeChange"
    />
  </Modal>
  <!-- 图片裁剪弹窗 -->
  <modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
    <div class="cropper">
      <vueCropper
        ref="cropper"
        :img="option.img"
        :outputSize="option.outputSize"
        :outputType="option.outputType"
        :info="option.info"
        :canScale="option.canScale"
        :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :fixedBox="option.fixedBox"
        :fixed="option.fixed"
        :fixedNumber="option.fixedNumber"
        :full="option.full"
        :centerBox="option.centerBox"
      />
    </div>
  </modal>
  </div>
</template>
<script>
import axios from 'axios'
import { VueCropper } from 'vue-cropper'
import SearchForm from '@/components/searchForm'
import { getQiniuToken, getMedalList, saveMedalStatus, delMedal, addMedal, saveMedal, 
  BannerTempGetGameList, 
  BannerTempGetWikiList, 
  BannerTempGetWikiEntryList, 
  BannerTempGetContentList, 
  BannerTempGetPostList 
 } from '@/api/data'
export default {
  name: 'medal',
  components: {
    SearchForm,
    VueCropper,
  },
  data () {
    return {
      title: '添加勋章',
      addMedalShow: false,
      total: 1,
      current: 1,
      per_page: 10,
      submitLoadingStatus: false, // 提交按钮loading状态
      cropperFlag: false, // 图片裁剪弹窗
      list: [],
      currentid: '',
      tempCurrentid: '',
      targetModalTitle: '关联游戏',
      targetSearch: '',
      targetDetailColumns: [],
      targetGameList: [],
      gameAssociate: false,
      pageParams: {
        page: 1,
        page_size: 20
      },
      newPageParams: {
        page: 1,
        page_size: 20
      },
      myJump_type: [
        { type: "无跳转", value: 0 },
        { type: "跳转外部链接", value: 1 },
        { type: "跳转帖子详情", value: 8 },
        { type: "跳转游戏详情-详情", value: 3 },
        { type: "跳转游戏详情-百科", value: 4 },
        { type: "跳转词条", value: 5 },
        { type: "跳转文章视频", value: 6 }
      ],
      allJumpType: 3, // 全局的跳转目标值
      searchPlaceholder: '输入游戏名称或id',
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg || png', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 104, // 默认生成截图框宽度
        autoCropHeight: 52, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        full: true, // 是否输出原图比例的截图
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [104, 52], // 截图框的宽高比例
        centerBox: true // 截图框是否被限制在图片里面
      },
      searchParams: {
        keywords: '',
        status: 0
      },
      searchData: {
        keywords: '',
        status: 0
      },
      formData: {
        name: '',
        image: '',
        textarea: '',
        switch: '2',
        jump_type: null, // 跳转类型 0=无 1=外部 2=功能页面 3=游戏
        jump_url: "", // 跳转链接当jump_type=1时外部链接，为2时内部链接，为3时游戏id
        jump_out_url: "", // 跳转链接当jump_type=1时外部链接，为2时内部链接，为3时游戏id
      },
      rules: {
        name: [{ required: true, message: '请选择输入勋章名称' }],
        image: [{ required: true, message: '请选择上传勋章图片' }],
        textarea: [{ required: true, message: '请输入勋章说明' }]
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = { ...this.searchData }
              this.current = 1
              this.getMedalListList()
            }
          },
          {
            text: '添加勋章',
            type: 'primary',
            handle: () => {
              this.addMedalShow = true
              this.submitLoadingStatus = false
              this.title = '添加勋章'
            }
          }
        ],
        components: [
          {
            name: 'Select',
            label: '显示/隐藏：',
            prop: 'status',
            options: [
              {
                label: '全部',
                value: 0
              },
              {
                label: '显示',
                value: 1
              },
              {
                label: '隐藏',
                value: 2
              }
            ],
            style: {
              'width': '150px'
            }
          },
          {
            name: 'Input',
            label: '关键词查询：',
            prop: 'keywords',
            placeholder: '请输入勋章名称查询',
            style: {
              'width': '230px'
            }
          }
        ]
      },
      columns: [
        {
          title: '序号',
          key: 'id',
          align: 'center',
          width: '80px'
        },
        {
          title: '勋章名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '勋章图片',
          key: 'source',
          align: 'center',
          render: (h, params) => {
            return h('viewer',
              {
                props: { images: [{ img: params.row.image ? params.row.image : 'http://cdn.tinytiger.cn/user/user2.jpg' }] },
                style: { width: '104px', height: '52px', margin: '0 auto' }
              },
              [
                h('img', {
                  attrs: { src: params.row.image ? params.row.image : 'http://cdn.tinytiger.cn/user/user2.jpg' },
                  style: { width: '104px', height: '52px', margin: '0 auto' }
                })
              ])
          }
        },
        {
          title: '勋章说明',
          key: 'explain',
          align: 'center',
          width: '280px'
        },
        {
          title: '显示/隐藏',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            return h('i-switch',
              {
                props: {
                  'value': params.row.status === 1,
                  'before-change': () => {
                    this.showChange(params.row.id)
                  }
                }
              }
            )
          }
        },
        {
          title: '上传管理员',
          key: 'operator',
          align: 'center'
        },
        {
          title: '上传时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'default'
                },
                on: {
                  click: () => {
                    if (params.row.id) {
                      this.editList(params.row)
                    }
                  }
                },
                style: {
                  'margin-right': '20px'
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'default'
                },
                on: {
                  click: () => {
                    this.deleteList(params.row.id)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],

      // 图片上传
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      qiniuToken: '',
      uploadList: '',
    }
  },
  mounted () {
    this.getMedalListList()
    this.getqinniuToken()
  },
  methods: {
    getJumpUrl(data){
      console.log("从子组件接收到的data",data)
    },
    changeSelect(val) {
      this.formData.jump_out_url = "";
      this.currentid = "";
      this.$refs.formData.fields.forEach(e => {
        if (e.prop == "jump_url") {
          e.resetField();
        }
      });
    },
    // 根据page及search内容去更新对应的列表
    updateData (type) {
      switch(type){
        case 3:
          this.getGameData_jumptype3()
          break;
        case 4:
          this.getGameData_jumptype4()
          break;
        case 5:
          this.getGameData_jumptype5()
          break;
        case 6:
          this.getGameData_jumptype6()
          break;
        case 8:
          this.getGameData_jumptype8()
          break;
      }
    },
    // 查询关联游戏，百科，词条等
    searchGame () {
      this.pageParams.page = 1
      this.updateData(this.allJumpType)
    },
    // 页码
    handleJumpPageChange (page) {
      this.pageParams.page = page
      document.getElementsByClassName('ivu-table-body')[0].scroll(0, 0)
      this.updateData(this.allJumpType)
    },
    handleJumpPageSizeChange (size) {
      this.pageParams.page = 1
      this.pageParams.page_size = size
      this.updateData(this.allJumpType)
    },
    // 选择跳转目标 去关联作品
    jumpTargetPage (type) {
      this.allJumpType = type
      this.targetSearch = ''
      if (this.currentid) this.tempCurrentid = this.currentid;
      // type 3 跳转游戏详情-详情 4 跳转游戏详情-百科 5 跳转词条 6 跳转文章视频
      this.pageParams = Object.assign({}, this.newPageParams)
      this.gameAssociate = true
      if(type === 8){
        console.log("帖子详情")
        this.getGameData_jumptype8()
        this.targetModalTitle = "关联帖子"
        this.searchPlaceholder = "请输入帖子ID搜索"
        this.targetDetailColumns = [
          {
            title: "帖子ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "帖子内容",
            key: "content",
            align: "center"
          },
          {
            title: "所属圈子-模块",
            align: "center",
            width: "150",
            render: (h, params) => {
            return h('div', [
              h('span', {}, params.row.circle_name ? params.row.circle_name  + '-' : ''),
              h('span', {}, params.row.modular_name ? params.row.modular_name : ''),
            ])
          }
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
                    }
                  }
                })
              ]);
            }
          }
        ]
      }else if (type === 3) {
        this.getGameData_jumptype3()
        this.targetModalTitle = "关联游戏"
        this.searchPlaceholder = "请输入游戏名称或ID"
        this.targetDetailColumns = [
          {
            title: "游戏ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "游戏名称",
            key: "name",
            align: "center"
          },
          {
            title: "游戏Logo",
            key: "logo",
            align: "center",
            render: (h, params) => {
              return h("div", [
                h("img", {
                  attrs: {
                    src: params.row.logo
                  },
                  style: {
                    width: "50px",
                    height: "50px"
                  }
                })
              ]);
            }
          },
          {
            title: "上传时间",
            key: "create_time",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
      } else if (type === 4) {
        this.getGameData_jumptype4()
         this.targetModalTitle = "关联百科"
        this.searchPlaceholder = "输入游戏名称或ID"
        this.targetDetailColumns = [
          {
            title: "游戏ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "游戏名称",
            key: "name",
            align: "center"
          },
          {
            title: "游戏Logo",
            key: "logo",
            align: "center",
            render: (h, params) => {
              return h("div", [
                h("img", {
                  attrs: {
                    src: params.row.logo
                  },
                  style: {
                    width: "50px",
                    height: "50px"
                  }
                })
              ]);
            }
          },
          {
            title: "上传时间",
            key: "create_time",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
       
      } else if (type === 5) {
        this.getGameData_jumptype5()
        this.targetModalTitle = "关联百科词条"
        this.searchPlaceholder = "请输入百科词条名称"
        this.targetDetailColumns = [
          {
            title: "内容ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "词条名称",
            key: "name",
            align: "center"
          },
          {
            title: "所属游戏名称",
            key: "game_name",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
      } else {
        this.getGameData_jumptype6()
        this.targetDetailColumns = [
          {
            title: "内容ID",
            key: "id",
            align: "center",
            width: "80"
          },
          {
            title: "标题",
            key: "title",
            align: "center"
          },
          {
            title: "类型",
            align: "center",
            render: (h, params) => {
              return h("div", {}, params.row.type === 1 ? "图文" : "视频");
            }
          },
          {
            title: "上传时间",
            key: "create_time",
            align: "center",
            width: "150"
          },
          {
            title: "选择",
            width: 60,
            render: (h, params) => {
              let id = params.row.id;
              let flag = false;
              let self = this;
              if (Number(this.currentid) === id) flag = true;
              else flag = false;
              return h("div", [
                h("Radio", {
                  props: { value: flag },
                  on: {
                    "on-change": () => {
                      self.currentid = id;
                      self.formData.jump_url = id;
                      // this.names = params.row;
                    }
                  }
                })
              ]);
            }
          }
        ]
        this.targetModalTitle = "关联文章/视频"
      }
    },
    // 获取关联游戏的游戏数据 当jump_type=3时调用
    getGameData_jumptype3() {
      let params = {
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }
      BannerTempGetGameList(params).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
        
      });
    },
    // 获取关联百科的数据 当jump_type=4时调用
    getGameData_jumptype4() {
      // BannerTempGetWikiList(this.addViewBk).then(res => {
      BannerTempGetWikiList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取关联词条的数据 当jump_type=5时调用
    getGameData_jumptype5() {
      // BannerTempGetWikiList(this.addViewBk).then(res => {
      BannerTempGetWikiEntryList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    //当获取关联文章视频的数据 当junp_type=6时调用
    getGameData_jumptype6() {
      BannerTempGetContentList({
        search: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    // 获取关联帖子的数据 当jump_type=8时
    getGameData_jumptype8() {
      BannerTempGetPostList({
        post_id: this.targetSearch,
        page: this.pageParams.page,
        per_page: this.pageParams.page_size
      }).then(res => {
        this.targetGameList = res.data.data.data;
        this.pageParams.total = res.data.data.total
      });
    },
    cancel () {
      if (this.tempCurrentid) {
        this.currentid = this.tempCurrentid;
      } else {
        this.currentid = ''
      }
    },
    // 图片上传相关
    getqinniuToken () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
      this.formData.image = file.url
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
      })
    },
    handleBeforeUpload (file) {
      // const check = this.uploadList.length < 1
      // if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
      // return check
      this.uploadList = []
      this.option.type = 'hdfile'
      this.getPic(file, 'cover')
      return false
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formData.image = ''
    },
    handleError (error, file) {
      this.$Modal.error({
        title: '上传失败',
        content: '文件 ' + file.name + ' 上传失败'
      })
    },
    onCubeImg () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        this.getqinniuToken()
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              if (this.option.type === 'hdfile') {
                this.formData.image = this.imageBaseUrl + res.data.key
                this.uploadList.push({
                  status: 'finished',
                  url: this.formData.image
                })
              }
            } else {
              that.$Message.error('上传失败')
            }
          })
      })
      this.option.img = ''
      this.cropperFlag = false
    },
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob (urlData) {
      let bytes = window.atob(urlData.split(',')[1])// 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length)
      let ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    },
    // 拿到需要截图图片
    getPic (file, type) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.$Modal.error({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg或者png 格式的图片。'
        })
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
      }
      reader.readAsDataURL(file)
      if (type === 'cover') {
        this.option.fixedNumber = [104, 52]
        this.option.autoCropWidth = 104
        this.option.autoCropHeight = 52
        this.$refs.cropper.refresh()
      }
      this.cropperFlag = true
    },
    // 列表隐藏/显示
    showChange (id) {
      let data = {
        id: id
      }
      saveMedalStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('修改成功!')
          this.getMedalListList()
        }
      })
    },
    // 编辑列表显示
    editList (row) {
      console.log(row)
      this.addMedalShow = true
      this.submitLoadingStatus = false
      this.title = '修改勋章'
      this.editId = row.id
      this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: row.image }]
      this.uploadList = this.$refs.upload.fileList
      this.formData = {
        name: row.name,
        image: row.image,
        textarea: row.explain,
        switch: String(row.status),
        jump_type: row.jump_type,
        jump_url: row.jump_url
      }
      this.formData.jump_out_url =  this.currentid = row.jump_url
    },
    // 删除列表显示
    deleteList (id) {
      let data = {
        id: id
      }
      this.$Modal.confirm({
        title: '确认删除吗？',
        onOk: () => {
          delMedal(data).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('删除成功!')
              if (this.list.length === 1 && this.current > 1) {
                this.current--
              }
              this.getMedalListList()
            }
          })
        }
      })
    },
    // 获取列表数据
    getMedalListList () {
      this.list = []
      var obj = {
        page: this.current,
        per_page: this.per_page,
        ...this.searchParams
      }
      getMedalList(obj).then(res => {
        this.list = res.data.data.data
        this.current = res.data.data.current_page
        this.per_page = res.data.data.per_page
        this.total = res.data.data.total
      })
    },
    // 举报提交
    submitData (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (
            !this.currentid &&
            this.formData.jump_type !== 0 &&
            !this.formData.jump_out_url
          ) {
            return this.$Message.error("请选择跳转目标");
          }
          if (+this.formData.jump_type === 1) {
            this.formData.jump_url = this.formData["jump_out_url"];
          }
          this.submitLoadingStatus = true
          let data = {
            id: this.editId,
            name: this.formData.name,
            image: this.formData.image,
            explain: this.formData.textarea,
            is_show: this.formData.switch,
            jump_type: this.formData.jump_type,
            jump_url: this.formData.jump_url
          }
          if (this.editId) {
            saveMedal(data).then(res => {
              this.submitLoadingStatus = false
              if (res.data.code === 200) {
                this.$Message.success('修改成功!')
                this.getMedalListList()
                this.resetSuccessForm()
              }
            })
          } else {
            addMedal(data).then(res => {
              this.submitLoadingStatus = false
              if (res.data.code === 200) {
                this.$Message.success('新增成功!')
                this.getMedalListList()
                this.resetSuccessForm()
              }
            })
          }
        }
      })
    },
    // 重置表单
    resetSuccessForm () {
      this.addMedalShow = false
      this.$refs.formData.resetFields()
      this.uploadList = ''
      this.editId = undefined
    },
    resetForm () {
      this.resetSuccessForm()
    },
    // 页码改变
    handlePageChange (page) {
      this.current = page
      this.getMedalListList()
    },
    // size 改变
    handlePageSizeChange (size) {
      this.per_page = size
      this.getMedalListList()
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
table,
tr,
td{
  border: 1px solid #d7d7d7;
  border-collapse:collapse;
  text-align: center;
  padding: 10px
}
td{

  word-break: break-all
}
.demo-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 104px;
    height: 52px;
    background: rgba(0,0,0,.6);
}
.demo-upload-list:hover .demo-upload-list-cover{
    display: block;
}
.demo-upload-list-cover i{
    display: block;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 18px auto;
}
.cropper{
  width: 400px;
  height: 400px;
}
</style>
