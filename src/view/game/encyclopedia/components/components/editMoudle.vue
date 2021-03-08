<template>
  <div class="addContent">
    <Card class="card">
      <div class="contentBox">
        <Form
          ref="editBannerForm"
          :label-width="150"
          :model="contentFormData"
          :rules="contentFormRules"
        >
          <!-- 文本名称 -->
          <FormItem :label=" Number(category.template_id) === 1 ? '广告名称：' : '文本名称：'" prop="name">
            <Input type="text" v-model="contentFormData.name" />
          </FormItem>

          <FormItem label="开始时间：" v-if='Number(category.template_id) === 1 || Number(category.template_id) === 2' prop="start_time">
            <DatePicker
              v-model="contentFormData.start_time"
              type="datetime"
              @on-change="handleStartDateChange"
              :options="startTimeOptions"
              placeholder="请选择开始时间"
            />
          </FormItem>
          <FormItem label="到期时间：" v-if='Number(category.template_id) === 1 || Number(category.template_id) === 2' prop="end_time">
            <DatePicker
              v-model="contentFormData.end_time"
              type="datetime"
              @on-change="handleEndDateChange"
              :options="endTimeOptions"
              placeholder="请选择到期时间"
            />
          </FormItem>
          <!-- 文本图片 -->
          <FormItem label="文本图片：" prop="img_url">
            <div class="demo-upload-list">
              <template v-if="banner_img">
                <img :src="banner_img" />
                <div class="demo-upload-list-cover">
                  <Icon type="ios-trash-outline" @click="handleRemove"></Icon>
                </div>
              </template>
            </div>
            <Upload
              v-if='Number(category.template_id) != 4'
              ref="upload"
              type="drag"
              action="//upload-z2.qiniu.com"
              :data="{ token: qiniuToken }"
              :show-upload-list="false"
              :format="['jpg','jpeg','png']"
              :before-upload="handleBeforeUpload"
              style="display: inline-block;width:58px;"
            >
              <div style="width: 58px;height:58px;line-height: 58px;">
                <Icon type="ios-cloud-upload-outline" size="20"></Icon>
              </div>
            </Upload>
            <p>只能上传jpg/png格式文件</p>
            <p>上图下文图片尺寸：60*60pt</p>
            <p>左图右文图片尺寸：18*18pt</p>
          </FormItem>
          <!-- yuhan 跳转类型 -->
          <FormItem label=" 跳转类型：" v-if='Number(category.template_id) === 1 || Number(category.template_id) === 2' prop="jump_type">
            <Select @on-change='changeSelect' v-model="contentFormData.jump_type">
              <Option
                v-for="item in ad_jump_type"
                :value="item.id"
                :key="item.id"
                :label="item.name"
              ></Option>
            </Select>
          </FormItem>
          <FormItem
            label="跳转链接："
            prop="jump_url"
            class="jump-url-border"
            v-if="contentFormData.jump_type === 1"
          >
            <Input ref="inpDom" v-model="contentFormData.jump_url" type="text" />
          </FormItem>

          <FormItem label="跳转文章/视频：" prop="jump_view_content" v-if="contentFormData.jump_type === 6">
            <Button long @click="selectContent">
              {{contentFormData.jump_view_content && this.contentcurrentid ? '查看已选作品' : '选择文章/视频'}}
              </Button>
          </FormItem>
          <!-- liwei的新增 -->
          <FormItem label="跳转游戏：" prop="jump_view_game" v-if="contentFormData.jump_type === 3">
            <Button long @click="selectGame">
              {{contentFormData.jump_view_game && this.currentid ? "查看已选游戏" : "选择关联游戏"}}
            </Button>
          </FormItem>
          <FormItem label="跳转百科：" prop="jump_view_wiki" v-if="contentFormData.jump_type === 4">
            <Button long @click="selectWiki">
              {{contentFormData.jump_view_wiki && this.wikicurrentid ? "查看已选百科" : "选择关联百科"}}
            </Button>
          </FormItem>
          <FormItem label="跳转词条：" prop="jump_view_citiao" v-if="contentFormData.jump_type === 5">
            <Button long @click="selectCitiao">
              {{contentFormData.jump_view_citiao && this.citiaocurrentid ? "查看已选词条" : "选择关联词条"}}
            </Button>
          </FormItem>

          <!-- 所属一级分类 -->
          <FormItem label="所属一级分类：" v-if='Number(category.template_id) === 3 || Number(category.template_id) === 4 || Number(category.template_id) ===  5' prop="first_cate">
            <Select style="width:200px" :transfer="true" @on-change="selectOneLevel" v-model='contentFormData.first_cate'>
              <Option v-for="item  in categoryData" :key="item.id" :value="item.id">{{item.name}}</Option>
            </Select>
          </FormItem>

          <!-- 所属二级分类 -->
          <FormItem label="所属二级分类："  v-if='Number(category.template_id) ===  3 || Number(category.template_id) ===  4 || Number(category.template_id) ===  5' prop="cate_id">
            <Select v-model='contentFormData.cate_id' :transfer="true" @on-change="selectTwoLevel" style="width:200px">
              <Option v-for="item  in twoCategoryData" :key="item.id" :value="item.id">{{item.name}}</Option>
            </Select>
          </FormItem>

          <!-- 富文本内容 -->
          <FormItem label="内容：" v-if='Number(category.template_id) === 3 || Number(category.template_id) === 4 || Number(category.template_id) ===  5'>
            <vue-ueditor-wrap v-model="contentFormData.content" :config="myConfig"></vue-ueditor-wrap>
          </FormItem>

          <!-- 是否显示 -->
          <FormItem label="是否显示：" prop="is_show">
            <i-switch v-model="contentFormData.is_show" />
          </FormItem>
        </Form>
        <div class="publishBtn">
          <Button type="primary" @click='handleSubmit'>发布</Button>
        </div>
      </div>
    </Card>

    <Modal title="关联作品" v-model="visible" width="825" @on-cancel="cancelCurrentID">
      <p>
        提示:
        <span style="color: red">不选择则默认跳转文章/视频列表</span>
      </p>
      <Table border :columns="columns" :data="data" max-height="550"></Table>
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
      <template #footer>
        <Button type="primary" @click="contentConfirm">确认</Button>
      </template>
    </Modal>

    <!-- 游戏弹窗 -->
    <Modal title="关联游戏" v-model="gameShow" width="825" @on-cancel="cancelCurrentID">
      <div>
        <span>搜索内容：</span>
        <Input v-model="gameSearch" placeholder="输入游戏名称或者ID" style="width: 300px" />
        <Button type="primary" @click="searchGame">查询</Button>
      </div>
      <Table border :columns="gameColumns" :data="gameData" max-height="550"></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParamsYX.total"
        :current="pageParamsYX.page"
        :page-size="pageParamsYX.per_page"
        @on-change="handlePageChangeYX"
        @on-page-size-change="handlePageSizeChangeYX"
      />
      <template #footer>
        <Button type="primary" @click="gameConfirm">确认</Button>
      </template>
    </Modal>
    <!-- 词条弹窗 -->
    <Modal title="关联百科词条" v-model="citiaoShow" width="825" @on-cancel="cancelCurrentID">
      <div>
        <span>搜索内容：</span>
        <Input v-model="citiaoSearch" placeholder="输入百科词条名称" style="width: 300px" />
        <Button type="primary" @click="searchCt">查询</Button>
      </div>
      <Table border :columns="citiaoColumns" :data="citiaoData" max-height="550"></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParamsCt.total"
        :current="pageParamsCt.page"
        :page-size="pageParamsCt.per_page"
        @on-change="handlePageChangeCt"
        @on-page-size-change="handlePageSizeChangeCt"
      />
      <template #footer>
        <Button type="primary" @click="citiaoConfirm">确认</Button>
      </template>
    </Modal>
    <!-- 百科弹窗 -->
    <Modal title="关联百科" v-model="wikiShow" width="825" @on-cancel="cancelCurrentID">
      <div>
        <span>搜索内容：</span>
        <Input v-model="wikiSearch" placeholder="输入游戏名称或ID" style="width: 300px" />
        <Button type="primary" @click="searchWiki">查询</Button>
      </div>
      <Table border :columns="wikiColumns" :data="wikiData" max-height="550"></Table>
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="pageParamsBk.total"
        :current="pageParamsBk.page"
        :page-size="pageParamsBk.per_page"
        @on-change="handlePageChangeBk"
        @on-page-size-change="handlePageSizeChangeBk"
      />
      <template #footer>
        <Button type="primary" @click="wikiConfirm">确认</Button>
      </template>
    </Modal>

    <!-- 图片截图 -->
    <modal
      v-model="cropperFlag"
      :mask-closable="false"
      width="432"
      :closable="false"
      @on-ok="onCubeImg"
    >
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
/* eslint-disable */
import { getQiniuToken, bannerEditCode, gameList, BannerContentListList, getEeitView, getEditConten, getEditSubmodular, gameWikiList, getGameCitiaoInfo, getContentList, TemCategoryIndexCategory, gameWikiEntryList, getAdCode } from '@/api/data'
import { VueCropper } from 'vue-cropper'
import axios from 'axios'
import VueUeditorWrap from 'vue-ueditor-wrap'

import "_p/ueditor/ueditor.config";
import "_p/ueditor/ueditor.all.js";
import "_p/ueditor/lang/zh-cn/zh-cn.js";
// 秀米
import "_p/xiumi/xiumi-ue-v5.css";
import "_p/xiumi/xiumi-ue-dialog-v5.js";

import { mapMutations } from "vuex";
export default {
  name: 'addContent',
  components: {
    VueCropper,
    VueUeditorWrap
  },
  data () {
    return {
      /* ueditor */
      myConfig: {
        serverUrl: `${server.BASE_URL}Ueditor/doAction`, // 上传功能的后端服务器接口地址
        UEDITOR_HOME_URL: '/ueditor/', // 你的UEditor资源存放的路径,相对于打包后的index.html
        autoHeightEnabled: true, // 编辑器是否自动被内容撑高
        autoFloatEnabled: false, // 工具栏是否可以浮动
        initialFrameHeight: 340, // 初始容器高度
        initialFrameWidth: '100%', // 初始容器高度
        enableAutoSave: true, // 关闭自动保存
        UEDITOR_HOME_URL: process.env.NODE_ENV !== "development" ? "/wanpai_h5_package/dist/ueditor/" : '/ueditor/'
      },
      categoryData: [], // 一级分类数据
      twoCategoryData: [], // 二级分类数据
      category: {
        page: 1,
        per_page: 99999,
        is_one_level: 1, // 获取1级分类
        // is_one_level: 2, // 获取2级分类
        submod_id: this.ids,
        pid: 0,
        template_id: 0,
        startTimechuo: null,
        endTimechuo: null
      },
      // 图片
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      qiniuToken: '',
      banner_img: '',
      cropperFlag: false,
      uploadList: [],
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, //是否输出原图比例的截图
        fixed: true, //是否开启截图框宽高固定比例
        fixedNumber: [50, 50], //截图框的宽高比例
        autoCropWidth: 50, // 默认生成截图框宽度
        autoCropHeight: 50, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      // yuhan 开始时间选择禁止小于当前时间
      startTimeOptions: {
        // disabledDate (date) {
        //   // 返回true就禁用，false就不禁用
        //   // 这里是禁用今天之前的日子，禁用昨天之前为2*24*60*60*1000，以此类推
        //   return date && date.valueOf() < Date.now() - 1 * 24 * 60 * 60 * 1000
        // }
      },
      endTimeOptions: {},
      // 分页参数
      pageParams: {
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParamsYX: {
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParamsCt: {
        total: 0,
        page: 1,
        per_page: 10
      },
      pageParamsBk: {
        total: 0,
        page: 1,
        per_page: 10
      },
      // model框 input
      wikiSearch: '',
      gameSearch: '',
      citiaoSearch: '',
      // model
      visible: false,
      gameShow: false,
      citiaoShow: false,
      wikiShow: false,
      // table 数据
      data: [],
      gameData: [],
      citiaoData: [],
      wikiData: [],
      // colums
      citiaoColumns: [
        {
          title: '内容ID',
          key: 'id'
        },
        {
          title: '词条名称',
          key: 'name'
        },
        {
          title: '所属游戏名称',
          key: 'game_name'
        },
        {
          title: '选择',
          render: (h, params) => {
            let id = params.row.id
            let flag = false
            let self = this
            if (Number(this.citiaocurrentid) === id) flag = true
            else flag = false
            return h('div', [
              h('Radio', {
                props: { value: flag },
                on: {
                  'on-change': () => {
                    self.citiaocurrentid = id
                    self.contentFormData.jump_view_citiao = id
                  }
                }
              })
            ])
          }
        }
      ],
      wikiColumns: [
        {
          title: '游戏ID',
          key: 'id'
        },
        {
          title: '游戏名称',
          key: 'name'
        },
        {
          title: '游戏logo',
          key: 'logo'
        },
        {
          title: '上传时间',
          key: 'create_time'
        },
        {
          title: '选择',
          render: (h, params) => {
            let id = params.row.id
            let flag = false
            let self = this
            if (Number(this.wikicurrentid) === id) flag = true
            else flag = false
            return h('div', [
              h('Radio', {
                props: { value: flag },
                on: {
                  'on-change': () => {
                    self.wikicurrentid = id
                    self.contentFormData.jump_view_wiki = id
                  }
                }
              })
            ])
          }
        }
      ],
      wikicurrentid: 0,
      tempwikicurrentid: 0,
      currentid: 0,
      tempCurrentid: 0,
      tempcitiaocurrentid: 0,
      citiaocurrentid: 0,
      contentcurrentid: 0,
      tempcontentcurrentid: 0,
      gameColumns: [
        {
          title: '游戏ID',
          key: 'id'
        },
        {
          title: '游戏名称',
          key: 'name'
        },
        {
          title: '游戏logo',
          key: 'logo'
        },
        {
          title: '上传时间',
          key: 'create_time'
        },
        {
          title: '选择',
          render: (h, params) => {
            let id = params.row.id
            let flag = false
            let self = this
            if (Number(this.currentid) === id) flag = true
            else flag = false
            return h('div', [
              h('Radio', {
                props: { value: flag },
                on: {
                  'on-change': () => {
                    self.currentid = id;
                    self.contentFormData.jump_view_game = id
                  }
                }
              })
            ])
          }
        }
      ],
      columns: [
        {
          title: '内容id',
          width: 80,
          key: 'id'
        },
        {
          title: '标题',
          key: 'title'
        },
        {
          title: '类型',
          width: 80,
          render: (h, params) => {
            return h('div', {}, params.row.type === 1 ? '图文' : '视频')
          }
        },
        {
          title: '上传时间',
          key: 'create_time'
        },
        {
          title: '选择',
          width: 60,
          render: (h, params) => {
            let id = params.row.id
            let flag = false
            let self = this
            if (Number(this.contentcurrentid) === id) {
              flag = true 
            } else {
              flag = false
            }
            return h('div', [
              h('Radio', {
                props: { value: flag },
                on: {
                  'on-change': () => {
                    self.contentcurrentid = id
                    self.contentFormData.jump_view_content = id
                  }
                }
              })
            ])
          }
        }
      ],
      // 图片
      contentFormData: {
        name: '',
        submod_id: '',
        checkcode: '',
        img_url: '',
        is_show: false,
        content: '',
        cate_id: '',
        update: 0,
        start_time: '',
        end_time: '',
        jump_type: '',
        jump_url: '',
        jump_view_content: '',
        jump_view_game: '',
        jump_view_wiki: '',
        jump_view_citiao: '',
        first_cate: '',
        formDataObj: {}
      },
      ad_jump_type: [
        { id: 0, name: '无跳转' },
        { id: 1, name: '外部url跳转' },
        // { id: 2, name: '跳转功能界面' },
        { id: 3, name: '跳转游戏详情-详情' },
        { id: 4, name: '跳转游戏详情-百科' },
        { id: 5, name: '跳转百科词条' },
        { id: 6, name: '跳转文章/视频' }
      ],
      contentFormRules: {
        name: [
          {
            required: true,
            message: '请输入文本名称'
          }
        ],
        img_url: [
          {
            required: true,
            message: '请选择文本图片'
          }
        ],
        start_time: [
          {
            required: true,
            message: '请选择开始时间'
          }
        ],
        end_time: [
          {
            required: true,
            message: '请选择到期时间'
          }
        ],
        sort: [
          {
            required: true,
            message: '请选择所属分类'
          }
        ],
        cate_id: [
          {
            required: true,
            message: '请选择所属分类'
          }
        ],
        first_cate: [
          {
            required: true,
            message: '请选择所属分类'
          }
        ],
        is_show: [
          {
            required: true,
            message: ''
          }
        ],
        jump_type: [{ required: true, message: '请选择跳转类型' }],
        jump_url: [{ required: true, message: '请输入跳转链接' }],
        jump_view_content: [{ required: true, message: '请选择关联作品' }],
        jump_view_game: [{ required: true, message: '请选择关联作品' }],
        jump_view_wiki: [{ required: true, message: '请选择关联作品' }],
        jump_view_citiao: [{ required: true, message: '请选择关联作品' }],

      }
    }
  },

  methods: {
    changeSelect (val) {
      // iview form表单 valied验证属性
      this.$refs.editBannerForm.fields.forEach( (e) =>{
        if (e.prop == 'jump_url') {
            e.resetField()
          }
        })
      },
    // 时间格式转换
    getCheckTime (timer) {
      let date = new Date(timer)
      let checkTime = (i) => {
        if (i < 10) {
          i = '0' + i
        }
        return i
      }
      let new_date = date.getFullYear() + '-' + (checkTime(date.getMonth() + 1)) + '-' + checkTime(date.getDate()) + ' ' + checkTime(date.getHours()) + ':' + checkTime(date.getMinutes()) + ':' + checkTime(date.getSeconds())
      return new_date
    },
    handleSubmit () {
      this.$refs.editBannerForm.validate(valid => {
        if (valid) {
          let params = {
            id: this.$route.query.id,
            name: this.contentFormData.name,
            start_time: this.getCheckTime(this.contentFormData.start_time),
            end_time: this.getCheckTime(this.contentFormData.end_time),
            img_url: this.contentFormData.img_url,
            jump_type: this.contentFormData.jump_type,
            jump_url: !this.contentFormData.jump_url ? 0 : this.contentFormData.jump_url,
            is_show: this.contentFormData.is_show ? 1 : 0,
            submod_id: this.$route.query.submod_id,
            content_id: this.$route.query.id,
            checkcode: this.contentFormData.checkcode,
            content: this.contentFormData.content,
            cate_id: this.contentFormData.cate_id
          }
          if (this.contentFormData.jump_type == 6) {
            params.jump_url = this.contentFormData.jump_view_content
          }
          if (this.contentFormData.jump_type == 3) {
            params.jump_url = this.contentFormData.jump_view_game
          }
          if (this.contentFormData.jump_type == 4) {
            params.jump_url = this.contentFormData.jump_view_wiki
          }
          if (this.contentFormData.jump_type == 5) {
            params.jump_url = this.contentFormData.jump_view_citiao
          }
          if (this.category.template_id == 1 || this.category.template_id == 2) {
            getEditSubmodular(params).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('成功!')
                this.closeTag(this.$route)
                this.$router.push({ path: '/game/wordsCheckList' })
              }
            })
          } else {
            if (!params.cate_id) {
              return false
            }
            getEditConten(params).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('成功!')
                this.closeTag(this.$route)
                this.$router.push({ path: '/game/wordsCheckList' })
              }
            })
          }
        }
      })
    },
    // // yuhan 开始时间,
    handleStartDateChange (date, type) {
      let nowDate = new Date(date)
      let nowTime = new Date().valueOf()
      // if (nowDate.getTime() < nowTime) {
      //   this.$Message.info('选择时间不能小于当前时间')
      //   return
      // }
      this.contentFormData.end_time = ''
      this.contentFormData.start_time = date

      this.endTimeOptions = {
        disabledDate: date => {
          // const disabledDay  = date
          // console.log(disabledDay.getTime())
          // disabledDate 是函数，参数为当前的日期，需要返回 Boolean 是否禁用这天。
          let startTime = this.contentFormData.start_time
            ? new Date(this.contentFormData.start_time).valueOf()
            : ''
          return date && date.valueOf() < startTime
        }
      }
    },
    handleEndDateChange (date, type) {
      if (this.contentFormData.start_time == '') {
        this.$Message.info('请先选择开始时间')
        return
      }
      this.contentFormData.end_time = date
      let endTime = this.contentFormData.end_time
        ? new Date(this.contentFormData.end_time).valueOf() - 1 * 24 * 60 * 60 * 1000
        : ''
      this.startTimeOptions = {
        disabledDate: date => {
          return date && date.valueOf() > endTime
        }
      }
    },
    // 选定一级标签触发
    selectOneLevel (value) {
      this.category.is_one_level = 0
      this.category.pid = value
      this.contentFormData.cate_id = '' 
      this.getIndexCategory()
    },
    // 选定二级触发
    selectTwoLevel (value) {
      this.contentFormData.cate_id = value
    },
    // 获取模块一级|二级分类列表
    async getIndexCategory () {
      await TemCategoryIndexCategory(this.category).then(res => {
        // console.log(res, 'res====');
        if (this.category.pid === 0) {
          this.categoryData = res.data.data.data
          this.categoryData.filter((item) => {
            if (item.id == this.contentFormData.first_cate) {
              this.contentFormData.first_cate = item.id
            }
          })
          res.data.data.data.forEach((item) => {
            if (item.cate_list.length) {
              this.twoCategoryData.push(...item.cate_list)
            }
          })
        } 
        else {
          this.twoCategoryData = []
          this.twoCategoryData = res.data.data
          this.twoCategoryData.filter((item) => {
            if (item.id == this.contentFormData.cate_id) {
              this.contentFormData.cate_id = item.id
            }
          })
        }
      })
    },
    // 选择游戏
    selectGame() {
      this.gameShow = true
      if (this.currentid) this.tempCurrentid = this.currentid;
    },
    //取消四个弹窗的清空事件
    cancelCurrentID() {
      if (this.tempCurrentid) {
        this.currentid = this.tempCurrentid;
      } else {
        this.currentid = 0
      }
      if (this.tempwikicurrentid) {
        this.wikicurrentid = this.tempwikicurrentid;
      } else {
        this.wikicurrentid = 0
      }
      if (this.tempcitiaocurrentid) {
        this.citiaocurrentid = this.tempcitiaocurrentid;
      } else {
        this.citiaocurrentid = 0
      }
      if (this.tempcontentcurrentid) {
        this.contentcurrentid = this.tempcontentcurrentid;
      } else {
        this.contentcurrentid = 0
      }
    },
    // 游戏列表确认
    gameConfirm() {
      if (!this.currentid) {
        this.$Message.error("请勾选一个游戏！")
      }
      this.gameShow = false
    },
    // 百科列表确认
    wikiConfirm() {
      if (!this.wikicurrentid) {
        this.$Message.error("请勾选一个游戏！")
      }
      this.wikiShow = false
    },
    // 词条列表确认
    citiaoConfirm() {
      if (!this.citiaocurrentid) {
        this.$Message.error("请勾选一个游戏！")
      }
      this.citiaoShow = false
    },
    // 文章列表确认
    contentConfirm() {
      if (!this.contentcurrentid) {
        this.$Message.error("请勾选一个游戏！")
      }
      this.visible = false
    },
    // 图片
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob (urlData) {
      let bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length)
      let ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    },
    onCubeImg () {
      // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios
          .post(url, formData, {
            contentType: false,
            processData: false,
            headers: { 'Content-Type': 'application/octet-stream' }
          })
          .then(res => {
            if (res.status === 200) {
              this.banner_img = this.imageBaseUrl + res.data.key
              this.contentFormData.img_url = this.banner_img
              this.uploadList.push({
                status: 'finished',
                url: this.contentFormData.img_url
              })
            }
          })
      })
      this.option.img = ''
      this.cropperFlag = false
    },

    getPic (file, type) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg') {
        this.$Modal.error({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 格式的图片。'
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
        if (Number(this.$route.query.template_id) === 1) {
          this.option.fixedNumber = [345, 194]
          this.option.autoCropWidth = 345
          this.option.autoCropHeight = 194
        } else {
          this.option.fixedNumber = [50, 50]
          this.option.autoCropWidth = 50
          this.option.autoCropHeight = 50
        }
        this.$refs.cropper.refresh()
      }
      this.cropperFlag = true
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.banner_img = ''
      this.contentFormData.img_url = ''
    },
    handleBeforeUpload (file) {
      this.uploadList = []
      this.option.type = 'hdfile'
      this.getPic(file, 'cover')
      return false
    },
    // 查询词条数据
    searchCt () {
      this.pageParamsCt.page = 1
      this.gameWikiEntryList()
    },
    // 查询条件百科
    searchWiki () {
      this.pageParamsBk.page = 1
      this.gameWikiList()
    },
    // 查询文章数据
    selectContent () {
      this.pageParams.page = 1
      this.visible = true
      if (this.contentcurrentid) this.tempcontentcurrentid = this.contentcurrentid;
    },
    selectWiki() {
      this.wikiShow = true
      if (this.wikicurrentid) this.tempwikicurrentid = this.wikicurrentid;
    },
    selectCitiao() {
      this.citiaoShow = true
      if (this.citiaocurrentid) this.tempcitiaocurrentid = this.citiaocurrentid;
    },
    // 查询游戏数据
    searchGame () {
      this.pageParamsYX.page = 1
      this.gameList()
    },
    // 获取百科列表
    async getAdCode () {
      await getAdCode().then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.content_list.data  // 文章
          this.pageParams.total = res.data.data.content_list.total

          this.gameData = res.data.data.game_list.data // 游戏列表
          this.pageParamsYX.total = res.data.data.game_list.total

          this.citiaoData = res.data.data.wiki_entry.data // 百科词条
          this.pageParamsCt.total = res.data.data.wiki_entry.total

          this.wikiData = res.data.data.game_wiki.data // 游戏百科列表
          this.pageParamsBk.total = res.data.data.game_wiki.total

        }
      })
    },
    // 获取游戏百科列表
    async gameWikiList () {
      await gameWikiList({
        search: this.wikiSearch,
        page: this.pageParamsBk.page,
        per_page: this.pageParamsBk.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.wikiData = res.data.data.data
          this.pageParamsBk.total = res.data.data.total
        }
      })
    },
    // 获取游戏百科词条列表
    async gameWikiEntryList () {
      await gameWikiEntryList({
        search: this.citiaoSearch,
        page: this.pageParamsCt.page,
        per_page: this.pageParamsCt.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.citiaoData = res.data.data.data
          this.pageParamsCt.total = res.data.data.total
        }
      })
    },
    // 获取百科文章列表
    async getContentList () {
      await getContentList({
        page: this.pageParams.page,
        per_page: this.pageParams.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.pageParams.total = res.data.data.total
        }
      })
    },
    // 获取游戏列表查询
    async gameList () {
      await gameList({
        search: this.gameSearch,
        page: this.pageParamsYX.page,
        per_page: this.pageParamsYX.per_page
      }).then(res => {
        if (res.data.code === 200) {
          this.gameData = res.data.data.data
          this.pageParamsYX.total = res.data.data.total
        }
      })
    },
    // 获取词条模板详情
    async getGameCitiaoInfo () {
      await getGameCitiaoInfo({
        id: this.$route.query.id,
        template_id: this.$route.query.template_id
      }).then(res => {
        if (res.data.code === 200) {
          this.contentFormData.name = res.data.data.name
          this.contentFormData.start_time = res.data.data.start_time
          this.contentFormData.end_time = res.data.data.end_time
          this.contentFormData.is_show = res.data.data.is_show != 0
          this.banner_img = res.data.data.img_url
          this.contentFormData.img_url = res.data.data.img_url,
          this.contentFormData.jump_url = res.data.data.jump_url,
          this.contentFormData.jump_type = res.data.data.jump_type,
          this.contentFormData.content = res.data.data.content,
          this.contentFormData.first_cate = res.data.data.first_cate,
          this.contentFormData.cate_id = res.data.data.cate_id
          if (this.contentFormData.jump_type == 1) {
            this.contentFormData.jump_url = res.data.data.jump_url
          }
          if (this.contentFormData.jump_type == 3) {
            this.contentFormData.jump_view_game = res.data.data.jump_url
            this.currentid = res.data.data.jump_url
          }
          if (this.contentFormData.jump_type == 4) {
            this.contentFormData.jump_view_wiki = res.data.data.jump_url
            this.wikicurrentid = res.data.data.jump_url
          }
          if (this.contentFormData.jump_type == 5) {
            this.contentFormData.jump_view_citiao = res.data.data.jump_url
            this.citiaocurrentid = res.data.data.jump_url
          }
          if (this.contentFormData.jump_type == 6) {
            this.contentFormData.jump_view_content = res.data.data.jump_url
            this.contentcurrentid = res.data.data.jump_url
          }
          if (res.data.data.jump_type == 7) {
            this.contentFormData.jump_type = 6
            this.contentcurrentid = res.data.data.jump_url
            this.contentFormData.jump_view_content = res.data.data.jump_url
          }
        }
      })
    },
    // 获取校验码
    getEeitView () {
      let data = {
        content_id: this.$route.query.id,
        submod_id: this.$route.query.submod_id
      }
      getEeitView(data).then(res => {
        if (res.data.code === 200) {
          this.contentFormData.checkcode = res.data.data.checkcode
        }
      })
    },
    // 文章
    handlePageChange (page) {
      this.pageParams.page = page
      this.getContentList()
    },
    handlePageSizeChange (size) {
      this.pageParams.per_page = size
      this.getContentList()
    },
    // 词条
    handlePageChangeCt (page) {
      this.pageParamsCt.page = page
      this.gameWikiEntryList()
    },
    handlePageSizeChangeCt (size) {
      this.pageParamsCt.per_page = size
      this.gameWikiEntryList()
    },
    // 百科
    handlePageChangeBk (page) {
      this.pageParamsBk.page = page
      this.gameWikiEntryList()
    },
    handlePageSizeChangeBk (size) {
      this.pageParamsBK.per_page = size
       this.gameWikiEntryList()
    },
    // 游戏
    handlePageChangeYX (page) {
      this.pageParamsYX.page = page
      this.gameList()
    },
    handlePageSizeChangeYX (size) {
      this.pageParamsYX.per_page = size
      this.gameList()
    },
    // 当前的路由标签关闭
    ...mapMutations(["closeTag"]),
  },
  mounted () {
    console.log("env", process.env.NODE_ENV)
    console.log('UEDITOR_HOME_URL:', process.env.NODE_ENV)
    this.category.submod_id = this.$route.query.submod_id
    this.category.template_id = this.$route.query.template_id
    if (Number(this.$route.query.template_id) === 1) {
      this.option.fixedNumber = [345, 194]
      this.option.autoCropWidth = 345
      this.option.autoCropHeight = 194
    }
    getQiniuToken().then(res => {
      // 获取七牛云token
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken
      }
    })
    this.getAdCode()
    this.getGameCitiaoInfo()
    this.getEeitView()
    this.getIndexCategory()
  },

  watch: {
    template_id: {
      immediate: true,
      handler () {
        this.option.autoCropWidth = this.template_id === 3 ? 60 / 2 : 18 / 2
        this.option.autoCropHeight = this.template_id === 3 ? 60 / 2 : 18 / 2
      }
    }
  }
}

</script>

<style lang='less' scoped>
.contentBox {
  margin: 20px auto;
  width: 800px;
}

.demo-upload-list {
  display: inline-block;
  width: 105px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin: 0px 4px;
}
.demo-upload-list img {
  width: 100%;
  height: 100%;
}
.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}
.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
.info {
  width: 720px;
  margin: 0 auto;
  .oper-dv {
    height: 20px;
    text-align: right;
    margin-right: 100px;
    a {
      font-weight: 500;
      &:last-child {
        margin-left: 30px;
      }
    }
  }
  .info-item {
    margin-top: 15px;
    label {
      display: inline-block;
      width: 100px;
      text-align: right;
    }
    .sel-img-dv {
      position: relative;
      .sel-file {
        position: absolute;
        width: 90px;
        height: 30px;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }
      .sel-btn {
        position: absolute;
        cursor: pointer;
        z-index: 1;
      }
    }
  }
}
.cropper {
  width: 400px;
  height: 400px;
}
.publishBtn {
  margin-left: 225px;
}
</style>