<template>
  <div>
    <Card>
      <Form ref="formData" :model="formData" :label-width="120">
        <FormItem label="游戏名称：">
          <Input v-model="formData.name" placeholder="请输入游戏名称" maxlength="10" style="width:300px" />
        </FormItem>

        <FormItem label="一句话简介：">
          <Input
            v-model="formData.one_introduce"
            placeholder="请输入游戏简介（10-50字）"
            maxlength="50"
            style="width:500px"
          />
        </FormItem>

        <FormItem label="游戏评分:">
          <Input v-model="formData.score" placeholder="请输入游戏评分" style="width:300px" />
        </FormItem>

        <FormItem label="游戏介绍：">
          <Input
            type="textarea"
            v-model="formData.detail_introduce"
            :rows="8"
            style="width:500px"
            maxlength="800"
            placeholder="请输入游戏介绍（800字内）"
          />
        </FormItem>

        <FormItem label="观点:">
          <Input
            type="textarea"
            v-model="formData.game_viewpoint"
            :rows="4"
            style="width:500px"
            placeholder="请输入运营设置的标签，标签与标签之间通过“，”隔开"
          />
        </FormItem>

        <!-- <FormItem label="游戏标签:">
          <Input
            type="textarea"
            v-model="formData.game_cate"
            :rows="4"
            style="width:500px"
            placeholder="请输入运营设置的标签，标签与标签之间通过“逗号符”隔开"
          />
        </FormItem> -->

        <!-- 新增的 -->
        <!-- 游戏分类 game_cate -->
        <FormItem label="游戏分类:">
          <Tag
            v-for="(item, index) in formDynamic.items"
            v-model="formData.items"
            :key="index"
            :name="index"
            closable
            @on-close="delTag"
          >{{ item.name }}</Tag>
          <Button icon="ios-add" type="dashed" size="small" @click="handleAddTage">添加游戏分类</Button>
        </FormItem>

        <FormItem label="游戏图片素材：">
          <Row type="flex">
            <Col style="width: 128px;height: 128px; margin-right: 10px">
              <FormItem prop="logo">
                <div
                  class="demoback-upload-list"
                  v-for="(item,index) in logolist"
                  style="width: 128px;height: 128px;"
                  :key="index"
                >
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url" style="width: 128px; height: 128px" />
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemoveLogo(item)"></Icon>
                    </div>
                  </template>
                </div>
                <!--  :on-success="handleLogoSuccess" -->
                <Upload
                  v-show="logolist.length < 1"
                  ref="logo"
                  type="drag"
                  action="//upload-z2.qiniu.com"
                  :data="{ token: qiniuToken }"
                  :format="['jpg','jpeg','png']"
                  :show-upload-list="false"
                  :before-upload="handleBeforeUpload"
                  :on-format-error="handleFormatError"
                >
                  <div style="padding: 5px; box-sizing: content-box">
                    <Icon type="md-add-circle" size="52" style="color: #3399ff" />
                    <p>上传游戏LOGO（正方形）</p>
                  </div>
                </Upload>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem prop="background">
                <div
                  class="demoback-upload-list"
                  v-for="(item,index) in backgroundList"
                  :key="index"
                >
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url" />
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemoveBackground(item)"></Icon>
                    </div>
                  </template>
                </div>
                <!--上传游戏背景图 :on-success="handleBackgroundSuccess" -->
                <Upload
                  v-show="backgroundList.length < 1"
                  ref="background"
                  type="drag"
                  action="//upload-z2.qiniu.com"
                  :data="{ token: qiniuToken }"
                  :format="['jpg','jpeg','png']"
                  :show-upload-list="false"
                  :before-upload="handleBeforeUpload_bg"
                  :on-format-error="handleFormatError"
                >
                  <div style="padding: 20px 0">
                    <Icon type="md-add-circle" size="52" style="color: #3399ff" />
                    <p>上传游戏背景图</p>
                  </div>
                </Upload>
              </FormItem>
            </Col>
          </Row>
          <div style="margin-top: 15px">
            <p>点击图片重新上传，支持上传jpg/png/jpeg格式，</p>
            <p>游戏图标宽高比512*512</p>
            <p>游戏背景图宽高比375*210</p>
            <p>游戏缩略图宽高比325*140</p>
          </div>
        </FormItem>
        <FormItem label="游戏截图：">
          <div
            :class="formData.images_introduce_type === 1? 'demo-upload-list' : 'vertical'"
            v-for="(item,index) in (buttonStatus ? verticalUploadList: uploadList)"
            :key="index"
          >
            <template v-if="item.status === 'finished'">
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click.native="handleRemoveImage(item)"></Icon>
              </div>
            </template>
          </div>
          <!-- :on-success="handleImagesSuccess" -->
          <Upload
            ref="images_introduce"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :format="['jpg', 'jpeg', 'png']"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :on-format-error="handleFormatError"
            :style="formData.images_introduce_type===1? 'width:250px' : 'width:160px'"
            v-show ='formData.images_introduce_type !==1?(verticalUploadList.length>4?false:true):(uploadList.length>4?false:true)'
          >
            <div
              :style="formData.images_introduce_type===1? 'padding: 20px 0': 'width:160px; height:285px; display:flex; flex-direction: column;justify-content: center; align-items: center'"
            >
              <Icon type="md-add-circle" size="52" style="color: #3399ff" />
              <p>上传游戏截图</p>
            </div>
          </Upload>
          <div style="margin-top: 6px">
            <p>请上传2-5张尺寸相同的截图，支持上传jpg/png/jpeg格式</p>
            <p>游戏背景图宽高比（横版：309*174；竖版：160*285）</p>
          </div>
        </FormItem>

        <FormItem label="介绍视频：">
          <div
            :class="formData.video_introduce_type === 1? 'demo-upload-list' : 'vertical'"
            v-for="(item,index) in (buttonStatus ? verticalVideoList: videoList)"
            :key="index"
          >
            <template v-if="item.status === 'finished'">
              <video id="video" :src="item.url" :autoplay="true"></video>
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView()"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemoveVideo(item)"></Icon>
              </div>
            </template>
          </div>
          <Upload
            v-show="(buttonStatus && verticalVideoList.length < 1 ) || (!buttonStatus && videoList.length < 1)"
            ref="video_introduce"
            type="drag"
            action="//upload-z2.qiniu.com"
            :format="['mp4']"
            :data="{ token: qiniuToken }"
            :on-format-error="handleFormatError"
            :on-success="handleVideosSuccess"
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
          <div style="margin-top: 6px">
            <p>点击介绍视频重新上传，支持上传mp4格式，</p>
            <p>游戏介绍视频宽高比（横版：309*174；竖版：160*285）</p>
          </div>
        </FormItem>
        <!-- 上传横竖屏按钮 -->
        <FormItem style="margin-top: 10px;margin-left:50px">
          <Button type="default" @click="buttonClick">{{buttonStatus === false? '上传竖版' : '上传横板'}}</Button>
        </FormItem>

        <FormItem label="游戏评级：">
          <Select v-model="formData.level_id" style="width: 400px">
            <Option :value="1">S</Option>
            <Option :value="2">A</Option>
            <Option :value="3">B</Option>
            <Option :value="4">C</Option>
          </Select>
        </FormItem>

        <FormItem
          style="margin-top: 60px; display: flex;justify-content: space-between;align-items: center"
        >
          <Button type="success" @click="handleSubmit()">保存</Button>
        </FormItem>
      </Form>
    </Card>
    <!-- 添加标签弹窗 -->
    <Modal v-model="addTagVisble" title="请选择游戏分类" width="800" @on-cancel="cancel">
      <div style="width:100%;display: flex;justify-content: left;">
        <!-- text-align:center;line-height:11px;height:22px -->
        <span style="margin-top:2.5px">已有分类:</span>
        <div style="display: flex;flex-wrap: wrap;">
          <Tag
            v-for="(item, index) in formDynamic.items"
            :key="index"
            :name="index"
            closable
            @on-close="delTag"
          >{{ item.name }}</Tag>
        </div>
            <!-- v-model="formData" -->
      </div>
      <Form ref="formDynamic" :model="formDynamic" inline>
        <FormItem prop="password">
          <Input type="text" v-model="requsestTageDate.keywords"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="serchTageName(requsestTageDate)">搜索</Button>
        </FormItem>
      </Form>
      <Tabs size="default" type="line" :value="changeTags" v-if="addTagVisble">
        <TabPane label="分类一" :disabled="isDisabled">
          <RadioGroup @on-change="indeTage">
            <Radio v-for="i in formDynamic.tageNameArray" :key="i.id" :label="i.id">{{i.cate_name}}</Radio>
          </RadioGroup>
        </TabPane>
        <TabPane label="分类二" disabled>
          <CheckboxGroup v-model="fruit">
            <Checkbox
              v-for="i in formDynamic.tageNameArray2"
              :key="i.id"
              :label="i.cate_name+`,`+i.id"
            >
              <span>{{i.cate_name}}</span>
            </Checkbox>
          </CheckboxGroup>
        </TabPane>
      </Tabs>
      <div slot="footer" style="display: flex;justify-content: center">
        <Button type="success" @click="commitTag" v-show="isTagTwo">确定</Button>
      </div>
    </Modal>
    <modal
      v-model="cropperFlag"
      :mask-closable="false"
      width="432"
      :closable="false"
      @on-ok="onCubeImg1"
    >
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
import { VueCropper } from "vue-cropper";
import axios from "axios";
import {
  getQiniuToken,
  getReviewGameDetail,
  editReviewGame,
  getCategoryLists
} from "@/api/data";
import { mapMutations } from "vuex";
export default {
  components: {
    VueCropper
  },
  data() {
    return {
      textArry: '', // 用于存储添加的标签id
      addTagVisble: false, // 控制添加弹窗
      total2: 1,
      isTagTwo: false, // 控制添加标签的确定按钮显示（二级标签显示）
      fruit: [],
      // 用于1分类
      pageParams1: {
        page: 1,
        per_page: 20
      },
      // 用于2分类
      pageParams2: {
        page: 1,
        per_page: 20
      },
      total1: 1,
      // 用于2分类
      isDisabled: true, // 是否禁用选项卡
      changeTags: 0, // 控制tabs的移动
      requsestTageDate: {
        level: 0, // 级别 1为一级分类 2为二级分类 0为只获取一级分类id&名称 默认值: 0
        keywords: '', // 分类名称搜所字段
        cate_id: 0, // 一级分类id (获取二级分类列表时 传此参数)默认值: 0
        is_need_hindden:0,
        is_need_filter_no_son:1
      },
      formDynamic: {
        items: [], // 标签分类数组
        tageNameArray: [], // 1级分类数据
        tageNameArray2: [], // 2级分类数据
        serchTage: "" // 添加标签里面的搜索标签
      },
      cropperFlag: false,
      option: {
        img: "", // 裁剪图片的地址
        type: "",
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: "jpeg|| png", // 裁剪生成图片的格式
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
      imageBaseUrl: "https://cdn.tinytiger.cn/",
      qiniuToken: "",
      buttonStatus: false,
      gameId: null,
      game_viewpoint: [],
      tag_list: [],
      formData: {
        // level_id:'',
        name: "",
        one_introduce: "",
        score: "",
        detail_introduce: "",
        game_viewpoint: "",
        game_cate:'',
        video_introduce_type: 1,
        images_introduce_type: 1,
        images_introduce: [],
        video_introduce: "",
        background: "",
        logo: "",
        id: null
      },
      logolist: [],
      backgroundList: [],
      uploadList: [],
      videoList: [],
      verticalUploadList: [],
      verticalVideoList: []
    };
  },
  mounted() {
    this.getqinniuToken();
    const { query } = this.$route;
    this.formData.id = query.id;
    if (query.id) {
      this.getDetailInfo(query.id);
    }
  },
  methods: {
    cancel() {
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
              name: newItem[0],
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
        hash[next.name] ? '' : hash[next.name] = true && cur.push(next)
        return cur
      },
      []) 
      return new_arr
    },
    // 重复选择的标签
    isInArray (arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (value === arr[i].name) {
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
    getCategoryListsSerch (data) {
      
      getCategoryLists(data).then(res => {
        if (res.data.code === 200) {
          // this.requsestTageDate.keywords = ''
          this.isDisabled = true // 控制标签可不可以选中
         
          if (this.requsestTageDate.cate_id !== 0) {
            this.isTagTwo = true // 控制添加标签的确定按钮显示（二级标签显示）
            this.changeTags = 1 // 控制tabs的移动
            this.formDynamic.tageNameArray2 = res.data.data
          } else {
            this.changeTags = 0 // 控制tabs的移动
            this.formDynamic.tageNameArray = res.data.data
            this.isTagTwo = false
          }
        }
      })
    },
    // 搜索标签
    serchTageName () {
      this.formDynamic.tageNameArray = []
      this.formDynamic.tageNameArray2 = []
      const data = {
        ...this.requsestTageDate
      }
     this.getCategoryListsSerch(data)
    },
    // 删除标签
    delTag(event, name) {
      // const index = this.formDynamic.items.indexOf(name)
      this.formDynamic.items.splice(name, 1);
    },
    
    // 标签1级页码
    handlePageChangeTage1(page) {
      this.pageParams1.page = page;
      this.getCategoryLists1();
    },
    handlePageSizeChangeTage1(size) {
      this.pageParams1.page = 1;
      this.pageParams1.per_page = size;
      this.getCategoryLists1();
    },
    // 标签2级页码
    handlePageChangeTage2(page) {
      this.pageParams2.page = page;
      this.getCategoryLists2();
    },
    handlePageSizeChangeTage2(size) {
      this.pageParams2.page = 1;
      this.pageParams2.per_page = size;
      this.getCategoryLists2();
    },
    ...mapMutations(["closeTag"]),
    // 获取七牛云token
    getqinniuToken() {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken;
        }
      });
    },
    playVideo(url) {
      let vdo = document.getElementById("playVideos");
      vdo.src = url;
      vdo.play();
    },
    // 获取游戏详情
    getDetailInfo(ids) {
      getReviewGameDetail({ id: ids }).then(res => {
        if (res.data.code === 200) {
          // 横竖
          if (
            res.data.data.images_introduce_type !== 1 &&
            res.data.data.video_introduce_type !== 1
          ) {
            this.buttonStatus = true;
          }
          this.formDynamic.items = res.data.data.cate_list
          // console.log('data:', res.data.data.cate_list, this.formDynamic.items)
          this.formData.level_id = res.data.data.level_id;
          this.formData.name = res.data.data.name;
          this.formData.one_introduce = res.data.data.one_introduce;
          this.formData.score = res.data.data.score;
          this.formData.detail_introduce = res.data.data.detail_introduce;
          this.formData.images_introduce_type =
            res.data.data.images_introduce_type;
          this.formData.video_introduce_type =
            res.data.data.video_introduce_type;
          // 观点
          res.data.data.viewpoint_list.forEach(item => {
            this.game_viewpoint.push(item.viewpoint);
          });
          this.formData.game_viewpoint = this.game_viewpoint.join(",");
          this.formDynamic.items = res.data.data.cate_list
          res.data.data.cate_list.forEach(item => {
            if (item.status === 1) {
              this.game_module.push(item.id)
            }
          })
          // 游戏标签
          if (res.data.data.cate_list.length) {
            res.data.data.cate_list.forEach(item => {
              // this.tag_list.push(item.name)
            })
            // this.formData.game_tag = this.tag_list.join(',')
          }
          // logo
          if (res.data.data.logo) {
            this.$refs.logo.fileList = [
              {
                percentage: 100,
                showProgress: false,
                status: "finished",
                url: res.data.data.logo
              }
            ];
            this.logolist = this.$refs.logo.fileList;
            this.formData.logo = res.data.data.logo;
          }
          // 游戏背景
          if (res.data.data.background) {
            this.$refs.background.fileList = [
              {
                percentage: 100,
                showProgress: false,
                status: "finished",
                url: res.data.data.background
              }
            ];
            this.backgroundList = this.$refs.background.fileList;
            this.formData.background = res.data.data.background;
          }
          // 游戏截图
          if (res.data.data.images_introduce) {
            var img = JSON.parse(res.data.data.images_introduce);
            if (img.length) {
              img.forEach(itme => {
                var obj = {
                  percentage: 100,
                  showProgress: false,
                  status: "finished",
                  url: itme
                };
                if (this.buttonStatus) {
                  this.verticalUploadList.push(obj);
                  this.uploadList = [];
                } else {
                  this.uploadList.push(obj);
                  this.verticalUploadList = [];
                }
              });
              if (this.buttonStatus) {
                this.$refs.images_introduce.fileList = this.verticalUploadList;
              }
              this.$refs.images_introduce.fileList = this.uploadList;
            }
          }
          // 视频
          if(res.data.data.video_introduce){
            if (this.buttonStatus) {
            if (this.verticalVideoList) {
              this.verticalVideoList = [
                {
                  percentage: 100,
                  showProgress: false,
                  status: "finished",
                  url: res.data.data.video_introduce
                }
              ];
              this.videoList = [];
            }
          } else {
            if (res.data.data.video_introduce) {
              this.videoList.push({
                percentage: 100,
                showProgress: false,
                status: "finished",
                url: res.data.data.video_introduce
              });
              this.verticalVideoList = [];
            }
          }
          }
        }
      });
    },

    // 视频横竖切换
    buttonClick() {
      if (this.buttonStatus === false) {
        this.buttonStatus = true;
        this.formData.video_introduce_type = 2;
        this.formData.images_introduce_type = 2;
      } else {
        this.buttonStatus = false;
        this.formData.video_introduce_type = 1;
        this.formData.images_introduce_type = 1;
      }
    },
    //  保存按钮
    handleSubmit() {
      this.textArry = []
      const TagArryLength = this.formDynamic.items.length
      if (TagArryLength > 0) {
        this.formDynamic.items.forEach((item, index) => {
          if (TagArryLength === 0) {
            this.textArry += `${item.name}`
          } else {
            if(TagArryLength.length > TagArryLength.length){
              this.textArry += `${item.name}`
            } else {
              this.textArry += `${item.name},`
            }
          }
        })
        // 去掉最后一个逗号
        const lastIndex = this.textArry.lastIndexOf(",");
        if (lastIndex > -1) {
          const string = this.textArry.substring(0, lastIndex) + this.textArry.substring(lastIndex + 1, this.textArry.length);
          this.formData.game_cate = string
        }
        
      }
      this.formData.images_introduce = [];
      this.formData.video_introduce = "";
      if (this.buttonStatus) {
        if (this.verticalUploadList.length) {
          if (this.verticalUploadList.length < 2) {
            this.$Message.error("请上传至少2张游戏截图");
            return;
          }
          this.verticalUploadList.forEach(item => {
            this.formData.images_introduce.push(item.url);
          });
        } else {
          this.$Message.error("请上传游戏截图");
          return;
        }
        if (this.verticalVideoList.length) {
          this.verticalVideoList.forEach(item => {
            this.formData.video_introduce = item.url;
          });
        }
        //  else {
        //   this.$Message.error("请上传视频");
        //   return;
        // }
      } else {
        if (this.uploadList.length) {
          if (this.uploadList.length < 2) {
            this.$Message.error("请上传至少2张游戏截图");
            return;
          }
          this.uploadList.forEach(item => {
            this.formData.images_introduce.push(item.url);
          });
        } else {
          this.$Message.error("请上传游戏截图");
          return;
        }
        if (this.videoList.length) {
          this.videoList.forEach(item => {
            this.formData.video_introduce = item.url;
          });
        }
        // else {
        //   this.$Message.error("请上传视频");
        //   return;
        // }
      }
      if (typeof this.formData.images_introduce !== "string") {
        this.formData.images_introduce = JSON.stringify(
          this.formData.images_introduce
        );
      }
      editReviewGame(this.formData).then(res => {
        // console.log('会一直书法')
        if (res.data.code === 200) {
          this.$Message.success("保存成功");
          this.$store.state.user.gameCheckPage = +this.$route.query.page
          this.closeTag(this.$route);
          this.$router.push({ path: `/game/gameCheck` });
        }
      });
    },
    // 图片上传相关
    // logo
    // handleLogoSuccess(file) {
    //   this.logolist = [
    //     { status: "finished", url: this.imageBaseUrl + file.key }
    //   ];
    //   this.formData.logo = this.imageBaseUrl + file.key;
    // },
    logoSuccess(file) {
      this.logolist.push({
        status: "finished",
        url: this.imageBaseUrl + file.key
      });
      this.formData.logolist = this.imageBaseUrl + file.key;
    },

    onCubeImg1() {
      // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this;
      this.$refs.cropper.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data);
        var formData = new FormData();
        formData.append("file", file);
        formData.append("token", this.qiniuToken);
        const url = "http://upload-z2.qiniu.com/";
        axios
          .post(url, formData, {
            contentType: false,
            processData: false,
            headers: { "Content-Type": "application/octet-stream" }
          })
          .then(res => {
            if (res.status === 200) {
              if (this.option.type === "cdfile") {
                this.formData.logo = this.imageBaseUrl + res.data.key;
                this.logolist.push({
                  status: "finished",
                  url: this.formData.logo
                });
              } else if (this.option.type === "bgfile") {
                this.formData.background = this.imageBaseUrl + res.data.key;
                this.backgroundList.push({
                  status: "finished",
                  url: this.formData.background
                });
              } else if (this.option.type === "d") {
                this.formData.thumbnail = this.imageBaseUrl + res.data.key;
                this.thumlist.push({
                  status: "finished",
                  url: this.formData.thumbnail
                });
              } else if (this.option.type === "ggfile") {
                if (this.buttonStatus) {
                  this.verticalUploadList.push({
                    status: "finished",
                    url: this.imageBaseUrl + res.data.key
                  });
                  this.formData.images_introduce = [];
                  this.verticalUploadList.forEach(item => {
                    this.formData.images_introduce.push(item.url);
                  });
                } else {
                  this.uploadList.push({
                    status: "finished",
                    url: this.imageBaseUrl + res.data.key
                  });
                  this.formData.images_introduce = [];
                  this.uploadList.forEach(item => {
                    this.formData.images_introduce.push(item.url);
                  });
                }
              } else {
                that.$Message.error("上传失败");
              }
            }
          });
      });
      this.option.img = "";
      this.cropperFlag = false;
    },
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob(urlData) {
      let bytes = window.atob(urlData.split(",")[1]); // 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length);
      let ia = new Uint8Array(ab);
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], { type: "image/jpeg" });
    },
    // 拿到需要截图图片
    getPic (file, type) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.$Modal.error({
          title: "文件格式不正确",
          desc: "文件 " + file.name + " 格式不正确，请上传 jpg 格式的图片。"
        });
        return false;
      }
      const reader = new FileReader();
      reader.onload = e => {
        let data;
        if (typeof e.target.result === "object") {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]));
        } else {
          data = e.target.result;
        }
        this.option.img = data;
      };
      reader.readAsDataURL(file);
      if (type === "c") {
        this.option.fixedNumber = [512, 512];
        this.$refs.cropper.refresh();
      } else if (type === "background") {
        this.option.fixedNumber = [375, 210];
        this.$refs.cropper.refresh();
      } else if (type === "background1") {
        this.option.fixedNumber = [325, 140];
        this.$refs.cropper.refresh();
      } else if (type === "background2") {
        if (!this.buttonStatus) {
          this.option.fixedNumber = [309, 174];
        } else {
          this.option.fixedNumber = [160, 285];
        }
        this.$refs.cropper.refresh();
      } else {
        this.option.fixedNumber = [300, 534];
        this.$refs.cropper.refresh();
      }
      this.cropperFlag = true;
    },
    // 上传游戏logo
    handleBeforeUpload(file) {
      this.logolist = [];
      this.option.type = "cdfile";
      this.getPic(file, "c");
      return false;
    },
    // 上传游戏背景图
    handleBeforeUpload_bg(file) {
      this.backgroundList = [];
      this.option.type = "bgfile";
      this.getPic(file, "background");
      return false;
    },
    handleRemoveLogo(file) {
      this.logolist.splice(this.logolist.indexOf(file), 1);
      this.formData.logo = "";
    },
    // 背景图
    // handleBackgroundSuccess(file) {
    //   this.backgroundList = [
    //     { status: "finished", url: this.imageBaseUrl + file.key }
    //   ];
    //   this.formData.background = this.imageBaseUrl + file.key;
    // },
    handleRemoveBackground(file) {
      this.backgroundList.splice(this.logolist.indexOf(file), 1);
      this.formData.background = "";
    },
    handleFormatError(file) {
      this.$Modal.error({
        title: "文件格式不正确",
        content: "文件 " + file.name + " 格式不正确,请按要求上传"
      });
    },
    // 游戏截图
    // beforeUpload(file) {
    //   var check = false;
    //   if (this.buttonStatus) {
    //     check = this.verticalUploadList.length < 5;
    //   } else {
    //     check = this.uploadList.length < 5;
    //   }
    //   if (!check) {
    //     this.$Modal.error({
    //       title: "最多上传5张图片"
    //     });
    //   }
    //   return check;
    // },
    beforeUpload(file) {
      // this.thumlist = [];
      // this.option.type = "ggfile";
      // this.getPic(file, "background2");
      // const check = this.uploadList.length < 5;
      // if (!check) {
      //   this.$Modal.error({
      //     title: "最多上传5张图片"
      //   });
      // }
      // return false
      // if (this.buttonStatus) {
      //   if (this.introduceList.length === 0) {
      //     this.verticalUploadList = []
      //   }
      // } else {
      //   if (this.uploadList.length === 0) {
      //     this.uploadList = []
      //   }
      // }
      // if (!this.buttonStatus) {
      //   if (this.introduceList.length === 0) {
      //     this.introduceList = []
      //   }
      // } else {
      //   if (this.uploadList.length === 0) {
      //     this.uploadList = []
      //   }
      // }
      this.option.type = 'ggfile'
      this.getPic(file, 'background2')
      const check = this.buttonStatus ? this.verticalUploadList.length < 5 : this.uploadList.length < 5
      if (!check) {
        this.$Modal.error({
          title: '最多上传5张图片'
        })
      }
      return false
    },
    // handleRemoveImage
    handleImagesSuccess(file) {
      if (this.buttonStatus) {
        this.verticalUploadList.push({
          status: "finished",
          url: this.imageBaseUrl + file.key
        });
        this.formData.images_introduce = [];
        this.verticalUploadList.forEach(item => {
          this.formData.images_introduce.push(item.url);
        });
      } else {
        if (
          this.uploadList[this.uploadList.length - 1] &&
          this.uploadList[this.uploadList.length - 1].uid
        ) {
          this.uploadList.splice(this.uploadList.indexOf(file), 1);
        }
        this.uploadList.push({
          status: "finished",
          url: this.imageBaseUrl + file.key
        });
        this.formData.images_introduce = [];
        this.uploadList.forEach(item => {
          this.formData.images_introduce.push(item.url);
        });
      }
    },
    handleRemoveImage(file) {
      if (this.buttonStatus) {
        this.verticalUploadList.splice(
          this.verticalUploadList.indexOf(file),
          1
        );
        this.formData.images_introduce = "";
      } else {
        this.uploadList.splice(this.uploadList.indexOf(file), 1);
        this.formData.images_introduce = "";
      }
    },
    // 视频
    handleVideosSuccess(file) {
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
    handleRemoveVideo(file) {
      if (this.buttonStatus) {
        this.verticalVideoList.splice(this.verticalVideoList.indexOf(file), 1);
      } else {
        this.videoList.splice(this.videoList.indexOf(file), 1);
      }
      this.$refs.video_introduce.clearFiles();
      this.formData.video_introduce = "";
    },
    handleView() {
      let dom = document.getElementById("video");
      if (dom.paused) {
        dom.play();
      } else {
        dom.pause();
      }
    },
    handleError(error, file) {
      this.$Modal.error({
        title: "上传失败",
        content: "文件 " + file.name + " 上传失败"
      });
    }
  }
};
</script>
<style scoped>
.demo-upload-list {
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
.demoback-upload-list {
  overflow: hidden;
  background: #fff;
  position: relative;
  line-height: 128px;
  height: 128px;
  text-align: center;
}
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
.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
.cropper {
  width: 400px;
  height: 400px;
}
</style>
