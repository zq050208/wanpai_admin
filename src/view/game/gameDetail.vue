/* eslint-disable no-dupe-keys */
<template>
  <div>
    <Card>
      <p slot="title">游戏详情</p>
      <p style="margin-bottom: 20px">游戏基本信息</p>
      <table>
        <tr>
          <td>关注数</td>
          <td>{{tableData.follow_num}}</td>
          <td>浏览数</td>
          <td>{{tableData.view_num}}</td>
          <td>评分</td>
          <td>{{tableData.score}}</td>
        </tr>
        <tr>
          <td>评价数</td>
          <td>{{tableData.assess_num}}</td>
          <td>资讯数</td>
          <td>{{tableData.information_num}}</td>
          <td style="background: #fff;">全网热度值</td>
          <td>-</td>
        </tr>
        <tr>
          <td>玩法</td>
          <td>{{tableData.assess_num}}</td>
          <td>音乐</td>
          <td>{{tableData.information_num}}</td>
          <td style="background: #fff;">美术</td>
          <td>-</td>
        </tr>
        <tr>
          <td>操作性</td>
          <td>{{tableData.assess_num}}</td>
          <td>良心度</td>
          <td>{{tableData.information_num}}</td>
          <td style="background: #fff;">-</td>
          <td>-</td>
        </tr>
      </table>
      <Form ref="formData" :model="formData" :label-width="120" :rules="ruleInline">
        <FormItem prop="logo" label="游戏图标：">
          <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            v-show="uploadList.length < 1"
            ref="upload"
            :show-upload-list="false"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:100px;"
          >
           <!-- :on-success="handleSuccess" -->
            <div style="width: 100px;height:100px;line-height: 100px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
          <p>游戏图标宽高比512*512</p>
        </FormItem>
        <FormItem label="游戏名称：" prop="name">
          <Input v-model="formData.name" placeholder="请输入游戏名称" style="width:300px" maxlength="10" />
        </FormItem>

        <FormItem label="一句话简介：" prop="one_introduce">
          <Input
            v-model="formData.one_introduce"
            placeholder="请输入游戏简介（10-50字）"
            style="width:500px"
            maxlength="50"
          />
        </FormItem>

        <FormItem label="游戏模块：" prop="game_module">
          <CheckboxGroup v-model="game_module">
            <Checkbox v-for="i in game_module_array" :key="i.id" :label="i.id">{{i.name}}</Checkbox>
          </CheckboxGroup>
        </FormItem>

        <FormItem label="游戏介绍：" prop="detail_introduce">
          <Input
            type="textarea"
            v-model="formData.detail_introduce"
            :rows="8"
            placeholder="请输入游戏介绍（800字内）"
            style="width:500px"
            maxlength="800"
          />
        </FormItem>
        <FormItem label="游戏分类:" prop='cat_ids' >
          <Tag v-for="(item, index) in formDynamic.items" v-model="item.id" :key="index" :name="index" closable @on-close="delTag">{{ item.cate_name }}</Tag>
          <Button icon="ios-add" type="dashed" size="small" @click="handleAddTage">添加游戏分类</Button>
        </FormItem>

        <FormItem label="游戏图片素材：" required>
          <Row type="flex">
            <Col span="6" style="margin-right:10px">
              <FormItem prop="background">
                <div
                  class="demoback-upload-list"
                  v-for="(item, index) in backgrounduploadList"
                  :key="index"
                >
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url" />
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click="backhandleRemove(item)"></Icon>
                    </div>
                  </template>
                  <template v-else>
                    <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                  </template>
                </div>
                <Upload
                  v-show="backgrounduploadList.length < 1"
                  ref="backupload"
                  :show-upload-list="false"
                  :format="['jpg','jpeg','png']"
                  :max-size="2048"
                  :on-format-error="handleFormatError"
                  :on-exceeded-size="handleMaxSize"
                  :before-upload="backhandleBeforeUpload"
                  type="drag"
                  action="//upload-z2.qiniu.com"
                  :data="{ token: qiniuToken }"
                  style="display: inline-block;width:250px;height:125px;"
                >
                  <!-- :on-success="backhandleSuccess" -->
                  <div style="padding: 20px 0">
                    <Icon type="md-add-circle" size="52" style="color: #3399ff" />
                    <p>上传背景图</p>
                  </div>
                </Upload>
                <div
                  v-show="backgrounduploadList.length >= 1"
                  type="flex"
                  justify="center"
                  align="middle"
                >背景图</div>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem prop="thumbnail">
                <div
                  class="demothum-upload-list"
                  v-for="(item, index) in thumbnailList"
                  :key="index"
                >
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url" />
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click="thumhandleRemove(item)"></Icon>
                    </div>
                  </template>
                  <template v-else>
                    <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                  </template>
                </div>
                <Upload
                  v-show="thumbnailList.length < 1"
                  ref="thumbnail"
                  type="drag"
                  :show-upload-list="false"
                  action="//upload-z2.qiniu.com"
                  :format="['jpg','jpeg','png']"
                  :data="{ token: qiniuToken }"
                  :on-format-error="handleFormatError"
                  :on-exceeded-size="handleMaxSize"
                  :before-upload="thumhandleBeforeUpload"
                  :on-error="handleError"
                >
                <!-- :on-success="thumhandleSuccess" -->
                  <div style="padding: 20px 0">
                    <Icon type="md-add-circle" size="52" style="color: #3399ff" />
                    <p>上传游戏缩略图</p>
                  </div>
                </Upload>
                <div
                  v-show="thumbnailList.length >= 1"
                  type="flex"
                  justify="center"
                  align="middle"
                >游戏缩略图</div>
              </FormItem>
            </Col>
          </Row>
          <div style="margin-top: 10px">
            <p>点击图片重新上传，支持上传jpg/png/jpeg格式，</p>
            <p>游戏背景图宽高比375*210</p>
            <p>游戏缩略图宽高比325*140</p>
          </div>
        </FormItem>
        <FormItem prop="images_introduce" label="游戏截图:">
          <div
            :class="formData.images_introduce_type===1?'demointroduce-upload-list' : 'vertical'"
            v-for="(item, index) in (!buttonStatus?introduceList:introduceList2)"
            :key="index"
          >
            <template
              v-if="item.status === 'finished'"
              style=" display:flex; flex-direction: column"
            >
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="introducehandleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="images_introduce"
            type="drag"
            :show-upload-list="false"
            action="//upload-z2.qiniu.com"
            :format="['jpg','jpeg','png']"
            :data="{ token: qiniuToken }"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="introducehandleBeforeUpload"
            :on-error="handleError"
            :style="formData.images_introduce_type ===1? 'width:250px' : 'width:160px'"
            v-show ='formData.images_introduce_type ===1?(introduceList.length>4?false:true):(introduceList2.length>4?false:true)'
          >
            <!-- :on-success="introducehandleSuccess" -->
            <div
              :style="formData.images_introduce_type===1? 'padding: 20px 0': 'width:160px; height:285px; display:flex; flex-direction: column;justify-content: center; align-items: center'"
            >
              <Icon type="md-add-circle" size="52" style="color: #3399ff" />
              <p>上传游戏截图</p>
            </div>
          </Upload>
          <!-- <Button style="margin-top: 10px" type="default" @click="introducetypeClick">{{formData.images_introduce_type === 1? '切换竖版' : '切换横板'}}</Button> -->
          <div style="margin-top: 10px">
            <p>请上传2-5张尺寸相同的截图，支持上传jpg/png/jpeg格式，</p>
            <p>游戏背景图宽高比（横版：309*174；竖版：160*285）</p>
          </div>
        </FormItem>
        <FormItem label="介绍视频:">
          <div
            :class="formData.video_introduce_type === 1? 'demothum-upload-list' : 'vertical'"
            v-for="(item,index) in (buttonStatus ? verticalVideoList: videoList)"
            :key="index"
          >
            <template v-if="item.status === 'finished'">
              <video :src="item.url"></video>
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="videohandleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
             v-show="(buttonStatus && verticalVideoList.length < 1 ) || (!buttonStatus && videoList.length < 1)"
            ref="video_introduce"
            type="drag"
            action="//upload-z2.qiniu.com"
            :show-upload-list="false"
            :format="['mp4']"
            :data="{ token: qiniuToken }"
            :on-success="videohandleSuccess"
            :on-format-error="handleFormatError"
            :on-error="handleError"
            :style="formData.video_introduce_type===1? 'width:250px' : 'width:160px'"
          >
            <div
              :style="formData.video_introduce_type===1? 'padding: 20px 0': 'width:160px; height:285px; display:flex; flex-direction: column;justify-content: center; align-items: center'"
            >
              <Icon type="md-add-circle" size="52" style="color: #3399ff" />
              <p>上传介绍视频</p>
            </div>
          </Upload>
          <!-- <Button style="margin-top: 10px; display:block" type="default" @click="videotypeClick">{{formData.video_introduce_type === 1? '切换竖版' : '切换横板'}}</Button> -->
          <div style="margin-top: 6px">
            <p>点击封面图重新上传，支持上传mp4格式，</p>
            <p>游戏介绍视频宽高比（横版：309*174；竖版：160*285）</p>
          </div>
        </FormItem>
        <!-- <FormItem label="游戏安装包">
          <Upload
            ref="package"
            type="drag"
            action="//upload-z2.qiniu.com"
            :format="['apk']"
            :show-upload-list="true"
            :default-file-list="defaultList"
            :data="{ token: qiniuToken }"
            :on-format-error="handleFormatError"
            :on-success="handlePackageSuccess"
            :on-error="handleError"
            :on-remove="removePackage"
            :on-exceeded-size="handleMaxSize"
            style="width:250px"
            :max-size="31457280"
          >
            <div style="padding: 20px 0">
              <Icon type="md-add-circle" size="52" style="color: #3399ff" />
              <p>上传游戏安装包</p>
            </div>
          </Upload>
          <div style="margin-top: 6px">
            <p>最大上传大小不超过3G</p>
          </div>
        </FormItem> -->
        <FormItem style="margin-top: 10px;margin-left:50px"><Button type="default" @click="buttonClick" >{{buttonStatus === false? '上传竖版' : '上传横板'}}</Button></FormItem>
        <FormItem label="安装包名：" prop="package_name_android">
          <Input
            v-model="formData.package_name_android"
            placeholder="填写安装包名称"
            style="width: 500px"
          />
        </FormItem>
        <FormItem label="版本号：" prop="version">
          <Input v-model="formData.version" placeholder="填写版本号" style="width: 500px" />
        </FormItem>
        <FormItem label="安卓下载链接：" prop="download_url">
          <Input v-model="formData.download_url" placeholder="请输入游戏下载链接" style="width: 500px" />
        </FormItem>
        <FormItem label="安卓安装包大小：" prop="package_size_android">
          <Input
            v-model="formData.package_size_android"
            placeholder="填写安卓安装包大小"
            style="width: 500px"
          />
        </FormItem>
        <FormItem label="IOS下载链接：" prop="ios_download_url">
          <Input
            v-model="formData.ios_download_url"
            placeholder="请输入ios下载链接或苹果id"
            style="width: 500px"
          />
        </FormItem>
        <FormItem label="苹果id：" prop="applestore_id">
          <Input
            v-model="formData.applestore_id"
            placeholder="请输入苹果id"
            style="width: 500px"
          />
        </FormItem>
        <FormItem label="观点：">
          <Tag
            v-for="(item,index) in count"
            :label="item.name"
            :key="index"
            :name="item"
            closable
            @on-close="handleClose2"
            @click.native="checkedOpinion(item)"
          >{{ item }}</Tag>
          <Button icon="ios-add" type="dashed" size="small" @click="handleAdd">添加观点</Button>
        </FormItem>
        <FormItem label="游戏评级：">
          <Select v-model="formData.level_id" style="width: 500px">
            <Option :value="1">S</Option>
            <Option :value="2">A</Option>
            <Option :value="3">B</Option>
            <Option :value="4">C</Option>
          </Select>
        </FormItem>
        <FormItem
          style="margin-top: 50px; display: flex;justify-content: space-between;align-items: center"
        >
          <Button type="success" @click="handleSubmit('formData')">保存</Button>
        </FormItem>
      </Form>
    </Card>
    <Modal v-model="editOpinionModal" :title="opinionCont.title" width="400">
      <input type="text" v-model="opinionCont.agreeNum" name="tel" oninput="value=value.replace(/[^\d]/g,'')" maxlength="9" style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"/>
    </Modal>
    <!-- 添加标签弹窗 -->
    <Modal v-model="addTagVisble" title="请选择游戏分类"  width="800" @on-cancel="cancel"> 
      <div style="width:100%;display: flex;justify-content: left;" >
        <!-- text-align:center;line-height:11px;height:22px -->
        <span style="margin-top:2.5px">已有分类:</span>
        <div style="display: flex;flex-wrap: wrap;">
          <Tag v-for="(item, index) in formDynamic.items" v-model="formData" :key="index" :name="index" closable @on-close="delTag">{{ item.cate_name}}</Tag>
        </div>
      </div>
      <Form ref="formDynamic" :model="formDynamic" :rules="ruleInline" inline>
        <FormItem prop="password">
          <Input type="text" v-model="requsestTageDate.keywords"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="serchTageName(requsestTageDate)">搜索</Button>
        </FormItem>
      </Form>
      <Tabs  size="default" type="line"   :value='changeTags' v-if="addTagVisble">
        <TabPane label="分类一" :disabled='isDisabled'>
          <RadioGroup  @on-change='indeTage' >
            <Radio v-for="i in formDynamic.tageNameArray" :key='i.id' :label='i.id'>
              {{i.cate_name}}
            </Radio>
          </RadioGroup>
        </TabPane>
        <TabPane label="分类二" disabled >
          <CheckboxGroup v-model="fruit">
            <Checkbox v-for="i in formDynamic.tageNameArray2" :key='i.id' :label="i.cate_name+`,`+i.id">
              <span> {{i.cate_name}} </span>
            </Checkbox>
          </CheckboxGroup>
        </TabPane>
      </Tabs>
      <div slot="footer" style="display: flex;justify-content: center">
          <Button type="success" @click="commitTag" v-show="isTagTwo" >确定</Button>
      </div>
    </Modal>
    <modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg1'>
        <div class="cropper">
          <VueCropper
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
import {
  getQiniuToken,
  getGameDetail,
  getCategoryLists,
  geteditGame
} from '@/api/data'
import { getTagNavListFromLocalstorage } from '@/libs/util'
import { VueCropper } from 'vue-cropper'
import axios from 'axios'
import { mapMutations } from "vuex";
export default {
  components: {
    VueCropper
  },
  data () {
    return {
      // 用于1分类
      pageParams1: {
        page: 1,
        per_page: 20
      },
      total1: 1,
       // 用于2分类
      pageParams2: {
        page: 1,
        per_page: 20
      },
      total2: 1,
      fruit: [],
      baseUrl: 'https://cdn.tinytiger.cn/',
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg|| png', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, // 是否输出原图比例的截图
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      cropperFlag: false,
      formDynamic: {
        items: [], // 标签分类数组
        tageNameArray: [], // 1级分类数据
        tageNameArray2: [], // 2级分类数据
        serchTage: '' // 添加标签里面的搜索标签
      },
      tageName: '', // 添加的标签名
      tageNameId: '', // 标签id
      isDisabled: true, // 是否禁用选项卡
      textArry: '', // 用于存储添加的标签id
      isTagTwo: false, // 控制添加标签的确定按钮显示（二级标签显示）
      changeTags: 0, // 控制tabs的移动
      requsestTageDate: {
        level: 0, // 级别 1为一级分类 2为二级分类 0为只获取一级分类id&名称 默认值: 0
        keywords: '', // 分类名称搜所字段
        cate_id: 0, // 一级分类id (获取二级分类列表时 传此参数)默认值: 0
        is_need_hindden:0,
        is_need_filter_no_son:1
      },
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      qiniuToken: '',
      gameId: null,
      buttonStatus: false, // 切换游戏的状态
      addTagVisble: false, // 控制添加弹窗
      // id/string
      // 游戏id
      // game_module/string
      // 游戏模块id(多选用,分割)
      formData: {
        version: '',
        ios_download_url: '',
        package_name_android: '',
        package_size_android: '',
        logo: '',
        name: '',
        one_introduce: '',
        detail_introduce: '',
        installation_package: '',
        background: '',
        images_introduce: [],
        video_introduce: '',
        thumbnail: '',
        download_url: '',
        applestore_id: '',
        video_introduce_type: 1,
        images_introduce_type: 1,
        // game_tag: '',
        viewpoint:'',
        cat_ids: '' // 二级分类ID列表(多个用,分割)例:12,45,123
      },
      // 路由菜单
      routesData: getTagNavListFromLocalstorage() || [],
      viewData: {
        view: ''
      },
      game_module: [],
      ruleInline: {
        name: [{ required: true, message: '请输入观点' }],
        logo: [{ required: true, message: '请上传游戏图标' }],
        name: [{ required: true, message: '请输入游戏名称' }],
        one_introduce: [{ required: true, message: '请输入游戏简介' }],
        detail_introduce: [{ required: true, message: '请输入游戏介绍' }],
        background: [{ required: true, message: '请上传游戏背景图片' }],
        thumbnail: [{ required: true, message: '请上传游戏缩略图' }],
        images_introduce: [{ required: true, message: '请上传游戏截图' }],
        cat_ids:[{required: true, message: '请填写标签'}]

        // video_introduce: [{ required: true, message: '请上传介绍视频' }]
      },
      // viewDataRuleInline: {
      //   view: [{ required: true, message: '请输入观点' }]
      // },
      uploadList: [],
      backgrounduploadList: [],
      thumbnailList: [],
      introduceList: [],
      introduceList2: [],
      defaultList: [],
      videoList: [],
      verticalVideoList: [],
      game_module_array: [],
      tagList: [],
      tableData: {
        follow_num: 0,
        view_num: 0,
        score: '',
        assess_num: 0,
        information_num: 0
      },
      isshielding: false,
      statusTag: [],
      viewMask: false,
      count: [],
      addVal: '',
      editOpinionModal: false,
      opinionCont: {
        title: '',
        agreeNum: ''
      }
    }
  },
  mounted () {
    this.routesData = getTagNavListFromLocalstorage ()
    this.getqinniuToken()
    const { query } = this.$route
    this.gameId = query.id
    if (query.id) {
      this.getDetailInfo({ id: query.id })
    }
  },
  methods: {
//     changeSelect (val) {
//       // iview form表单 valied验证属性
// console.log('qweq')
//       this.$refs.formData.fields.forEach( (e) =>{
//         if (e.prop == 'cat_ids') {
//             e.resetField()
//           }
//         })
//       },
    ...mapMutations(["closeTag"]),
    introducetypeClick () {
      if (this.formData.images_introduce_type === 1) {
        this.formData.images_introduce_type = 0
      } else {
        this.formData.images_introduce_type = 1
      }
    },
    cancel() {
      this.formData.level_id = 1
      this.requsestTageDate.cate_id = 0
      this.formDynamic.tageNameArray2 = []
      this.formDynamic.tageNameArray = []
      this.requsestTageDate.keywords = ''
      this.fruit = []
    },
    // 把标签添加到标签选项中
    commitTag () {
      if (this.fruit.length > 0) {
        this.fruit.forEach(item => {
          const newItem = item.split(',')
          this.tageName = newItem[0]
          this.tageNameId = newItem[1]
        })
      }
      this.addTagVisble = false
      const isTrue = this.isInArray(this.formDynamic.items, this.tageNameId)
      if (isTrue) {
        this.formData.level_id = 0
        this.formDynamic.tageNameArray2 = []
        this.formDynamic.tageNameArray = []
        this.fruit = []
        return this.$Message.error(`游戏分类名称${isTrue}已存在`)
      } else {
        if (this.fruit.length > 0) {
          this.fruit.forEach(item => {
            const newItem = item.split(',')
            this.formDynamic.items.push({
              cate_name: newItem[0],
              id: newItem[1]
            })
          })
          this.formDynamic.items =this.isInArray2(this.formDynamic.items)
        }
      }
      this.formData.level_id = 1
      this.requsestTageDate.cate_id = 0
      this.formDynamic.tageNameArray2 = []
      this.formDynamic.tageNameArray = []
      this.requsestTageDate.keywords = ''
      this.fruit = []
      // }
    },
    isInArray2 (arr) {
      let hash = {}
      let new_arr = arr.reduce((cur,next) =>{
        hash[next.id] ? '' : hash[next.id] = true && cur.push(next)
        return cur
      },
      []) 
      return new_arr
    },
    // 重复选择的标签
    isInArray (arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (value === arr[i].id) {
          return arr[i].value
        }
      }
      return false
    },
    // 点击1级标签
    indeTage (e) {
      // 获取一级标签的id
      this.formDynamic.tageNameArray2 = []
      this.requsestTageDate.cate_id = e
      this.requsestTageDate.level = 0
      this.requsestTageDate.keywords = ''
      this.getCategoryLists2()
    },
    // 获取二级分类
    getCategoryLists2 () {
      this.formDynamic.tageNameArray2 = []
      const data = {
        ...this.pageParams2,
        ...this.requsestTageDate
      }
      getCategoryLists(data).then(res => {
        if (res.data.code === 200) {
          this.formDynamic.tageNameArray2 = res.data.data
          this.isTagTwo = true
          this.changeTags = 1
          this.requsestTageDate.level = 0
        //   this.total2 = res.data.data.total
        //   res.data.data.data.forEach(item => {
        //     if (item.status !== 0) {
        //       this.formDynamic.tageNameArray2.push(item)
        //     }
        //   })
        //   if (this.formDynamic.tageNameArray2.length === 0) {
        //     this.formDynamic.tageNameArray2 = []
        //     this.$Message.error('游戏分类无可用的')
        //     this.addTagVisble = false
        //     this.isTagTwo = true
        //     this.changeTags = 1
        //     this.pageParams2.page = 1
        //     // this.requsestTageDate.level = 1
        //   }
        //   this.isTagTwo = true
        //   this.changeTags = 1
        //   // this.requsestTageDate.level = 1
        }
      })
    },
    // 添加标签
    handleAddTage () {
      this.formDynamic.tageNameArray = []
      this.formDynamic.tageNameArray2 = []
      this.requsestTageDate.level = 0
      this.isDisabled = true // 控制标签可不可以选中
      this.isTagTwo = false // 控制添加标签的确定按钮显示（二级标签显示）
      this.changeTags = 0 // 控制tabs的移动
      this.addTagVisble = true
      if (this.formDynamic.tageNameArray.length !== 0) {
        return false
      }
      this.getCategoryLists1()
    },
   // 获取一级分类时候调用
    getCategoryLists1 () {
      this.formDynamic.tageNameArray = []
      const data = {
        ...this.pageParams1,
        ...this.requsestTageDate
      }
      getCategoryLists(data).then(res => {
        if (res.data.code === 200) {
          this.formDynamic.tageNameArray = res.data.data
          // console.log(res)
          // this.total1 =res.data.data.total
          // res.data.data.data.forEach(item => {
          //   if (item.status !== 0) {
          //     this.formDynamic.tageNameArray.push(item)
          //   }
          // })
          // if (this.formDynamic.tageNameArray.length === 0) {
          //   this.$Message.error('游戏分类无可用的')
          //   this.formDynamic.tageNameArray = []
          //   this.addTagVisble = false
          //   this.isTagTwo = true
          //   this.changeTags = 1
          //   this.requsestTageDate.level = 1
          //   this.pageParams1.page = 1
          // }
        }
      })

    },
    // 删除标签
    delTag (event, name) {
      // const index = this.formDynamic.items.indexOf(name)
      this.formDynamic.items.splice(name, 1)
    },
     // 搜索标签
    serchTageName () {
      this.formDynamic.tageNameArray2 = []
      this.formDynamic.tageNameArray = []
      // const isFistTage = this.requsestTageDate.level !== 1 ? this.pageParams2:this.pageParams1
      // this.pageParams1.page = 1
      // this.pageParams2.page = 1
      const data = {
        // ...isFistTage,
        ...this.requsestTageDate
      }
     this.getCategoryListsSerch(data)
    },
    getCategoryListsSerch (data) {
      getCategoryLists(data).then(res => {
        if (res.data.code === 200) {
          this.isDisabled = true // 控制标签可不可以选中
          if (this.requsestTageDate.cate_id !== 0) {
            this.isTagTwo = true // 控制添加标签的确定按钮显示（二级标签显示）
            this.changeTags = 1 // 控制tabs的移动
            this.formDynamic.tageNameArray2 = res.data.data
            // this.total2 = res.data.data.total
          } else {
            this.changeTags = 0 // 控制tabs的移动
            this.formDynamic.tageNameArray = res.data.data
            this.isTagTwo = false
          }
        }
      })
    },
    // 视频图片横竖切换
    buttonClick () {
      if (this.buttonStatus === false) {
        this.buttonStatus = true
        this.formData.video_introduce_type = 2
        this.formData.images_introduce_type = 2
      } else {
        this.buttonStatus = false
        this.formData.video_introduce_type = 1
        this.formData.images_introduce_type = 1
      }
    },
     // 标签1级页码
    handlePageChangeTage1 (page) {
      this.pageParams1.page = page
      this.getCategoryLists1()
    },
    handlePageSizeChangeTage1 (size) {
      this.pageParams1.page = 1
      this.pageParams1.per_page = size
      this.getCategoryLists1()
    },
     // 标签2级页码
    handlePageChangeTage2 (page) {
      this.pageParams2.page = page
      this.getCategoryLists2()
    },
    handlePageSizeChangeTage2 (size) {
      this.pageParams2.page = 1
      this.pageParams2.per_page = size
      this.getCategoryLists2()
    },
    // 获取详情数据
    getDetailInfo (data) {
      this.uploadList = []
      this.backgrounduploadList = []
      this.thumbnailList = []
      this.introduceList = []
      this.introduceList2 = []
      this.videoList = []
      this.verticalVideoList=[]
      this.tagList = []
      getGameDetail(data).then(res => {
        if (res.data.code === 200) {
          var obj = res.data.data.game_info
        
          this.game_module_array = obj.game_module
          this.tagList = obj.viewpoint_list
          this.tableData.follow_num = obj.follow_num
          this.tableData.view_num = obj.view_num
          this.tableData.score = obj.score
          this.tableData.assess_num = obj.assess_num
          this.tableData.information_num = obj.information_num
          // 标签
          this.formDynamic.items = obj.game_category
          obj.game_module.forEach(item => {
            if (item.status === 1) {
              this.game_module.push(item.id)
            }
          })
          // 表单信息
          // 优化一下代码
          this.formData = {
            ios_download_url: obj.ios_download_url,
            download_url: obj.download_url,
            level_id: obj.level_id,
            logo: obj.logo,
            name: obj.name,
            one_introduce: obj.one_introduce,
            detail_introduce: obj.detail_introduce
          }
          this.formData.ios_download_url =obj.ios_download_url
          this.formData.download_url = obj.download_url
          this.formData.level_id = obj.level_id
          this.formData.logo = obj.logo
          this.formData.name = obj.name
          this.formData.one_introduce = obj.one_introduce
          this.formData.detail_introduce = obj.detail_introduce
          this.formData.download_url = obj.download_url
          this.formData.version = obj.version
          this.formData.package_name_android = obj.package_name_android
          this.formData.package_size_android = obj.package_size_android
          this.formData.applestore_id = obj.applestore_id


          // this.formData ={
          //   ...obj
          // }
          // 横竖屏
          this.formData.video_introduce_type = obj.video_introduce_type
          this.formData.images_introduce_type = obj.images_introduce_type
          // logo
          if(obj.logo){
              this.$refs.upload.fileList = [
              {
                percentage: 100,
                showProgress: false,
                status: 'finished',
                url: obj.logo
              }
            ]
            this.uploadList = this.$refs.upload.fileList
            this.formData.logo = obj.logo
          }
        
          // 背景图片
          if(obj.background){
             this.$refs.backupload.fileList = [
              {
                percentage: 100,
                showProgress: false,
                status: 'finished',
                url: obj.background
              }
            ]
            this.backgrounduploadList = this.$refs.backupload.fileList
            this.formData.background = obj.background
          }
         
          // 缩略图
          if (obj.thumbnail) {
            this.$refs.thumbnail.fileList = [
              {
                percentage: 100,
                showProgress: false,
                status: 'finished',
                url: obj.thumbnail
              }
            ]
            this.thumbnailList = this.$refs.thumbnail.fileList
            this.formData.thumbnail = obj.thumbnail
          }
          // 介绍视频
          // if(obj.video_introduce){
          //   this.$refs.video_introduce.fileList = [
          //     {
          //       percentage: 100,
          //       showProgress: false,
          //       status: 'finished',
          //       url: obj.video_introduce
          //     }
          //   ]
          //   this.videoList = this.$refs.video_introduce.fileList
          //   this.formData.video_introduce = obj.video_introduce
          // }
          if (obj.video_introduce_type === 1) {
            if (obj.video_introduce) {
              this.videoList = [
                {
                  percentage: 100,
                  showProgress: false,
                  status: "finished",
                  url: obj.video_introduce
                }
              ];
            }
            this.formData.video_introduce = obj.video_introduce
            
          }else{
            if (obj.video_introduce) {
              this.verticalVideoList.push({
                percentage: 100,
                showProgress: false,
                status: "finished",
                url: obj.video_introduce
              });
            }
            this.formData.video_introduce = obj.video_introduce
          }
          // 截图
          if (obj.images_introduce) {
            var img = JSON.parse(obj.images_introduce)
            img.forEach(itme => {
              var obj = {
                percentage: 100,
                showProgress: false,
                status: 'finished',
                url: itme
              }
              if (res.data.data.game_info.images_introduce_type !== 1) {
                this.buttonStatus=true
                this.formData.video_introduce_type = 2
                this.formData.images_introduce_type = 2
                this.introduceList2.push(obj)
              } else {
                this.buttonStatus=false
                this.formData.video_introduce_type = 1
                this.formData.images_introduce_type = 1
                this.introduceList.push(obj)
              }
            })
            this.$refs.images_introduce.fileList = !this.buttonStatus ? this.introduceList : this.introduceList2
            this.formData.images_introduce = img
          }
          // 观点
          if (obj.viewpoint_list.length) {
            let count = []
            obj.viewpoint_list.forEach(item => {
              count.push(item.name)
            })
            this.count = count
            console.log("count:::",count)
            this.formData.count = obj.viewpoint_list
          }
        }
        this.viewMask = false
      })
    },
    handleAdd () {
      this.addVal = ''
      this.$Modal.confirm({
        title: '提示',
        render: h => {
          return h('Input', {
            props: {
              type: 'text',
              value: this.addVal,
              placeholder: '输入新观点'
            },
            on: {
              'on-blur': event => {
                this.addVal = event.target.value
              }
            }
          })
        },
        onOk: () => {
          if (this.addVal) {
            this.count.push(this.addVal)
          } else {
            this.$Message.error('请输入新观点')
          }
        }
      })
    },
    handleClose2 (event, name) {
      const index = this.count.indexOf(name)
      this.count.splice(index, 1)
    },
    checkedOpinion(item){
      this.editOpinionModal = true
      this.opinionCont = {
        title: item,
        agreeNum: 2
      }
    },
    // 保存修改事件
    handleSubmit (name) {
      this.textArry = []
      // this.formData.background = this.backgrounduploadList[0].url
      // console.log('beijing',this.formData.background)
      // this.formData.thumbnail = this.thumbnailList[0].url
      // console.log('luolu',this.formData.thumbnail)
      const TagArryLength = this.formDynamic.items.length
      if (TagArryLength > 0) {
        this.formDynamic.items.forEach((item, index) => {
          if (index === TagArryLength-1) {
            this.textArry += `${item.id}`
          } else {
            this.textArry += `${item.id},`
          }
        })
        this.formData.cat_ids = this.textArry
      }
      this.$refs[name].validate(valid => {
        // const TagArryLength = this.formDynamic.items.length
          //  console.log('1111',this.formDynamic.items)

        // if (TagArryLength > 0) {
        //   this.formDynamic.items.forEach((item, index) => {
        //     this.textArry += `${item.name},`
        //   })
        //   this.formData.viewpoint = this.textArry
        // }
        this.$refs[name].validate((valid) => {
         
          if (!this.buttonStatus ? (this.introduceList.length < 2 || this.introduceList.length > 5) : (this.introduceList2.length < 2 || this.introduceList2.length > 5)) {
              this.$Modal.error({
                title: '请上传2-5张游戏截图'
              })
              return
            }
             if (typeof this.formData.images_introduce !== 'string') {
              this.formData.images_introduce = JSON.stringify(
                this.formData.images_introduce
              )
            }
            console.log('count',this.count)

            if (this.count.length) {
              let str = ''
              this.count.forEach(item => {
                str += item + ','
              })
              str = str.substring(0, str.length - 1)
              this.formData.viewpoint = str
            }else{
              this.formData.viewpoint = ''
            }
            //  else {
            //   this.$Modal.error({
            //     title: '请添加观点'
            //   })
            //   return
            // }
          if(this.formData.background){
            valid = true
          }
          if(this.formData.thumbnail){
            valid = true
          }
          if (valid) {
            var data = this.game_module.join(',')
            this.formData.game_module = data
            this.formData.id = this.gameId
            console.log('guandain',this.formData.viewpoint)
            geteditGame(this.formData).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('修改成功')
                this.closeTag(this.$route);
                this.$router.push({ path: `/game/gameList` })
              }
            })
          }
        })
      })
    },
    // 获取七牛云token
    getqinniuToken () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 图片上传相关
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
      this.formData.logo = file.url
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc:
          '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
      })
    },
    // handleBeforeUpload () {
    //   const check = this.uploadList.length < 1
    //   if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
    //   return check
    // },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formData.logo = ''
    },
    // eslint-disable-next-line handle-callback-err
    handleError (error, file) {
      this.$Modal.error({
        title: '上传失败',
        content: '文件 ' + file.name + ' 上传失败'
      })
    },
    // // 背景图
    // backhandleSuccess (res, file) {
    //   file.url = this.imageBaseUrl + res.key
    //   this.backgrounduploadList = this.$refs.backupload.fileList
    //   this.formData.background = file.url
    // },
    // backhandleBeforeUpload () {
    //   const check = this.backgrounduploadList.length < 1
    //   if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
    //   return check
    // },
    backhandleRemove (file) {
      const fileList = this.$refs.backupload.fileList
      this.$refs.backupload.fileList.splice(fileList.indexOf(file), 1)
      this.backgrounduploadList = this.$refs.backupload.fileList
      this.formData.background = ''
    },
    // 缩略图
    thumhandleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.thumbnailList = this.$refs.thumbnail.fileList
      this.formData.thumbnail = file.url
    },
    // thumhandleBeforeUpload () {
    //   const check = this.thumbnailList.length < 1
    //   if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
    //   return check
    // },
    thumhandleRemove (file) {
      const fileList = this.$refs.thumbnail.fileList
      this.$refs.thumbnail.fileList.splice(fileList.indexOf(file), 1)
      this.thumbnailList = this.$refs.thumbnail.fileList
      this.formData.thumbnail = ''
    },
    // 游戏截图
    // introducehandleBeforeUpload (file) {
    //   const check = this.introduceList.length < 5
    //   if (!check) {
    //     this.$Modal.error({
    //       title: '最多上传5张图片'
    //     })
    //   }
    //   return check
    // },
    // introducehandleSuccess (res, file) {
    //   file.url = this.imageBaseUrl + res.key
    //   this.introduceList = this.$refs.images_introduce.fileList
    //   this.formData.images_introduce.push(file.url)
    // },
    introducehandleRemove (file) {
      const fileList = this.$refs.images_introduce.fileList
      // this.$refs.images_introduce.fileList.splice(fileList.indexOf(file), 1)
      if (!this.buttonStatus) {
        this.introduceList.splice(this.introduceList.indexOf(file), 1)
        // this.$refs.images_introduce.fileList.splice(fileList.indexOf(file), 1)
        // this.introduceList = this.$refs.images_introduce.fileList
      } else {
        this.introduceList2.splice(this.introduceList2.indexOf(file), 1)
        // this.$refs.images_introduce.fileList.splice(fileList.indexOf(file), 1)
        // this.introduceList2 = this.$refs.images_introduce.fileList
        // this.introduceList2 = this.$refs.images_introduce.fileList
      }
      this.formData.images_introduce.splice(this.formData.images_introduce.indexOf(file.url), 1)
    },
    // 视频
    // videohandleSuccess (res, file) {
    //   file.url = this.imageBaseUrl + res.key
    //   this.videoList = this.$refs.video_introduce.fileList
    //   this.formData.video_introduce = file.url
    // },
    // videohandleRemove (file) {
    //   const fileList = this.$refs.images_introduce.fileList
    //   this.$refs.video_introduce.fileList.splice(fileList.indexOf(file), 1)
    //   this.videoList = this.$refs.video_introduce.fileList
    //   this.formData.video_introduce = ''
    // },
    // 视频
    videohandleSuccess(file) {
      if (this.buttonStatus) {
        this.verticalVideoList = [
          { status: "finished", url: this.imageBaseUrl + file.key }
        ];
        this.formData.video_introduce = this.imageBaseUrl + file.key;
      } else {
        this.videoList = [
          { status: "finished", url: this.imageBaseUrl + file.key }
        ];
        this.formData.video_introduce = this.imageBaseUrl + file.key;
      }
    },
    videohandleRemove(file) {
      if (this.buttonStatus) {
        this.verticalVideoList.splice(this.verticalVideoList.indexOf(file), 1);
      } else {
        this.videoList.splice(this.videoList.indexOf(file), 1);
      }
      this.$refs.video_introduce.clearFiles();
      this.formData.video_introduce = "";
    },
    handlePackageSuccess (file) {
      this.formData.download_url = this.imageBaseUrl + file.key
    },
    removePackage (file) {
      this.formData.download_url = ''
    },
    // handleMaxSize (file) {
    //   this.$Notice.warning({
    //     title: '超过文件大小限制',
    //     desc: '安装包' + file.name + '太大, 不能超过3G'
    //   })
    // }
    onCubeImg1 () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              if (this.option.type === 'cdfile') {
                this.formData.logo = this.baseUrl + res.data.key
                this.uploadList.push({
                  status: 'finished',
                  url: this.formData.logo
                })
              } else if (this.option.type === 'bgfile') {
                this.formData.background = this.baseUrl + res.data.key
                this.backgrounduploadList.push({
                  status: 'finished',
                  url: this.formData.background
                })
              } else if (this.option.type === 'd') {
                this.formData.thumbnail = this.baseUrl + res.data.key
                this.thumbnailList.push({
                  status: 'finished',
                  url: this.formData.thumbnail
                })
              } else if (this.option.type === 'ggfile') {
                if (this.buttonStatus) {
                  this.introduceList2.push({
                    status: 'finished',
                    url: this.baseUrl + res.data.key
                  })
                  this.formData.images_introduce = []
                  this.introduceList2.forEach(item => {
                    this.formData.images_introduce.push(item.url)
                  })
                } else {
                  this.introduceList.push({
                    status: 'finished',
                    url: this.baseUrl + res.data.key
                  })
                  this.formData.images_introduce = []
                  this.introduceList.forEach(item => {
                    this.formData.images_introduce.push(item.url)
                  })
                }
              } else {
                that.$Message.error('上传失败')
              }
            }else{
              this.$Message.error('图片编译失败请刷新界面重试')
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
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg/png 格式的图片。'
        })
        return false
      }
      const reader = new FileReader()
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
      if (type === 'c') {
        this.option.fixedNumber = [512, 512]
        this.$refs.cropper.refresh()
      } else if (type === 'background') {
        this.option.fixedNumber = [375, 210]
        this.$refs.cropper.refresh()
      } else if (type === 'background1') {
        this.option.fixedNumber = [325, 140]
        this.$refs.cropper.refresh()
      } else if (type === 'background2') {
        if (!this.buttonStatus) {
          this.option.fixedNumber = [309, 174]
        } else {
          this.option.fixedNumber = [160, 285]
        }
        this.$refs.cropper.refresh()
      } else {
        this.option.fixedNumber = [300, 534]
        this.$refs.cropper.refresh()
      }
      this.cropperFlag = true
    },
    //
    handleBeforeUpload (file) {
      this.logolist = []
      this.option.type = 'cdfile'
      this.getPic(file, 'c')
      return false
    },
    backhandleBeforeUpload (file) {
      this.backgroundList = []
      this.option.type = 'bgfile'
      this.getPic(file, 'background')
      return false
    },
    thumhandleBeforeUpload (file) {
      this.thumlist = []
      this.option.type = 'd'
      this.getPic(file, 'background1')
      return false
    },
    introducehandleBeforeUpload (file) {
      if (!this.buttonStatus) {
        if (this.introduceList.length === 0) {
          this.introduceList = []
        }
      } else {
        if (this.introduceList2.length === 0) {
          this.introduceList2 = []
        }
      }
      this.option.type = 'ggfile'
      this.getPic(file, 'background2')
      const check = !this.buttonStatus ? this.introduceList.length < 5 : this.introduceList2.length < 5
      if (!check) {
        this.$Modal.error({
          title: '最多上传5张图片'
        })
      }
      return false
    }

  }
}
</script>
<style scoped>
.cropper{
  width: 400px;
  height: 400px;
}
.page {
  margin-top: 20px;
  text-align: center;
}
table {
  margin-bottom: 30px;
}
table, tr, td, th{
    border: 1px solid #d7d7d7;
    border-collapse:collapse;
    background: #fff;
    text-align: center;
}
th,
td {
  width: 120px;
  height: 40px;
}
td:nth-child(odd) {
  background: rgb(242, 242, 242, 1);
}
.demo-upload-list {
  display: inline-block;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
.demoback-upload-list,
.demothum-upload-list,
.demointroduce-upload-list {
  display: inline-block;
  width: 250px;
  height: 125px;
  text-align: center;
  line-height: 125px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
.vertical {
  display: inline-block;
  width: 160px;
  height: 285px;
  text-align: center;
  line-height: 285px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
.demo-upload-list img,
.demo-upload-list video,
.demoback-upload-list img,
.demothum-upload-list img,
.demointroduce-upload-list img,
.vertical img,
.vertical video {
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
.demo-upload-list:hover .demo-upload-list-cover,
.demoback-upload-list:hover .demo-upload-list-cover,
.demothum-upload-list:hover .demo-upload-list-cover,
.demointroduce-upload-list:hover .demo-upload-list-cover,
.vertical:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i{
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
}
/* 标签 */
.tagCol {
  border: 1px solid rgb(242, 242, 242);
  height: 30px;
  line-height: 30px;
}
.tagCol:nth-child(odd) {
  margin-bottom: -1px;
  margin-left: -1px;
}
.tagCol:nth-child(even) {
  border-right: 1px solid rgb(242, 242, 242);
  margin-bottom: -1px;
  margin-left: -1px;
}
</style>