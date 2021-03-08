<template>
  <div>
    <Card>
      <SearchForm :searchForm="searchForm" :searchData="searchData" />
      <Button @click="addGameClick" style="margin-bottom: 20px" class="add">添加游戏</Button>
      <Table ref="table" border stripe :data="tableData" :columns="columns" />
      <Page
        class="page"
        show-elevator
        show-sizer
        show-total
        :page-size-opts="[10, 20, 30, 50]"
        :total="total"
        :current="pageParams.page"
        :page-size="pageParams.per_page"
        @on-change="handlePageChange"
        @on-page-size-change="handlePageSizeChange"
      />
    </Card>

    <!-- 新增、 编辑弹框 -->
    <Modal
      v-model="editVisible"
      title="添加游戏"
      :mask-closable="false"
      @on-visible-change="visibleChange"
      width="1000"
    >
      <Form ref="formData" :model="formData" :label-width="120" :rules="ruleInline">
        <FormItem label="游戏名称：" prop="name">
          <Input v-model="formData.name" placeholder="请输入游戏名称" maxlength="10" />
        </FormItem>

        <FormItem label="一句话简介：" prop="one_introduce" style="margin-top:20px">
          <Input v-model="formData.one_introduce" placeholder="请输入游戏简介（10-50字）" maxlength="50" />
        </FormItem>

        <FormItem label="游戏模块：" style="margin-top:20px">
          <CheckboxGroup v-model="game_module">
            <Checkbox v-for="i in game_module_array" :key="i.id" :label="i.id">{{i.name}}</Checkbox>
          </CheckboxGroup>
        </FormItem>

        <FormItem label="游戏介绍：" prop="detail_introduce">
          <Input
            type="textarea"
            v-model="formData.detail_introduce"
            :rows="8"
            maxlength="800"
            placeholder="请输入游戏介绍（800字内）"
          />
        </FormItem>
        <!-- 改动了 -->
        <FormItem label="观点:" prop="viewpoint">
          <Input
            type="textarea"
            v-model="formData.viewpoint"
            placeholder="请输入运营设置的标签，标签与标签之间通过“，”隔开"
          />
        </FormItem>
        <FormItem label="游戏分类:" prop="cat_ids">
          <Tag
            v-for="(item,index) in formDynamic.items"
            v-model="formDynamic.items"
            :key="index"
            :name="index"
            closable
            @on-close="handleClose2"
          >{{ item.value }}</Tag>
          <Button icon="ios-add" type="dashed" size="small" @click="handleAdd">添加游戏分类</Button>
        </FormItem>
        <FormItem label="游戏图片素材：" required>
          <Row type="flex" justify="space-between">
            <Col span="7">
              <FormItem prop="logo">
                <div
                  class="demo-upload-list"
                  style="display: inline-block;width:125px;"
                  v-for="(item,index) in logolist"
                  :key="index"
                >
                  <template v-if="item.status === 'finished'">
                    <img style="width:125px" :src="item.url" />
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemoveLogo(item)"></Icon>
                    </div>
                  </template>
                </div>
                <Upload
                  v-show="logolist.length < 1"
                  ref="logo"
                  type="drag"
                  action="//upload-z2.qiniu.com"
                  :data="{ token: qiniuToken }"
                  :format="['jpg','jpeg']"
                  :show-upload-list="false"
                  :on-format-error="handleFormatError"
                  :before-upload="handleBeforeUpload"
                  style="display: inline-block;width:170px;"
                >
                  <div style="padding: 20px 0">
                    <Icon type="md-add-circle" size="52" style="color: #3399ff" />
                    <p>上传游戏LOGO（正方形）</p>
                  </div>
                </Upload>
              </FormItem>
            </Col>
            <Col span="7">
              <FormItem prop="background">
                <div class="demo-upload-list" v-for="(item,index) in backgroundList" :key="index">
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url" />
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemoveBackground(item)"></Icon>
                    </div>
                  </template>
                </div>
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
            <Col span="7">
              <FormItem prop="thumbnail">
                <div class="demo-upload-list" v-for="(item,index) in thumlist" :key="index">
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url" />
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemovethum(item)"></Icon>
                    </div>
                  </template>
                </div>
                <Upload
                  v-show="thumlist.length < 1"
                  ref="thumbnail"
                  type="drag"
                  action="//upload-z2.qiniu.com"
                  :data="{ token: qiniuToken }"
                  :format="['jpg','jpeg','png']"
                  :show-upload-list="false"
                  :before-upload="handleBeforeUpload_bg2"
                  :on-format-error="handleFormatError"
                >
                  <div style="padding: 20px 0">
                    <Icon type="md-add-circle" size="52" style="color: #3399ff" />
                    <p>上传游戏缩略图</p>
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
        <FormItem label="游戏截图：" prop="images_introduce" required>
          <div
            :class="formData.images_introduce_type === 1? 'demo-upload-list' : 'vertical'"
            v-for="(item,index) in (buttonStatus ? verticalUploadList: uploadList)"
            :key="item.id"
          >
            <template v-if="item.status === 'finished'">
              <img :src="item.url" />
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click.native="handleRemoveImage(item)"></Icon>
              </div>
            </template>
          </div>
          <Upload
            ref="images_introduce"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :format="['jpg','jpeg','png']"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :on-format-error="handleFormatError"
            :style="formData.images_introduce_type===1? 'width:250px' : 'width:160px'"
            v-show="verticalUploadList.length>4||uploadList.length>4?false:true"
          >
            <div
              :style="formData.images_introduce_type===1? 'padding: 20px 0': 'width:160px; height:285px; display:flex; flex-direction: column;justify-content: center; align-items: center'"
            >
              <Icon type="md-add-circle" size="52" style="color: #3399ff" />
              <p>上传游戏截图</p>
            </div>
          </Upload>
          <!-- :on-success="handleImagesSuccess" -->
          <!-- <Button style="margin-top: 10px" type="default" @click="introducetypeClick">{{formData.images_introduce_type === 1? '切换竖版' : '切换横板'}}</Button> -->
          <div style="margin-top: 6px">
            <p>请上传2-5张尺寸相同的截图，支持上传jpg/jpeg格式</p>
            <p>游戏背景图宽高比（横版：309*174；竖版：160*285）</p>
          </div>
        </FormItem>
        <FormItem label="介绍视频：">
          <div
            :class="formData.video_introduce_type === 1? 'demo-upload-list' : 'vertical'"
            v-for="(item,index) in (buttonStatus ? verticalVideoList: videoList)"
            :key="item.id"
          >
            <template v-if="item.status === 'finished'">
              <video :src="item.url"></video>
              <div class="demo-upload-list-cover">
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
          <!-- <Button style="margin-top: 10px; display:block" type="default" @click="videotypeClick">{{formData.video_introduce_type === 1? '切换竖版' : '切换横板'}}</Button> -->
          <div style="margin-top: 6px">
            <p>点击介绍视频重新上传，支持上传mp4格式，</p>
            <p>游戏介绍视频宽高比（横版：309*174；竖版：160*285）</p>
          </div>
        </FormItem>
        <!-- 上传横竖屏按钮 -->
        <FormItem style="margin-top: 10px;margin-left:50px">
          <Button type="default" @click="buttonClick">{{buttonStatus === false? '上传竖版' : '上传横板'}}</Button>
        </FormItem>
        <!-- <FormItem label="游戏安装包"> -->
        <!-- <div class="demo-upload-list" v-for="item in videoList">
              <template v-if="item.status === 'finished'">
                <video :src="item.url"></video>
                <div class="demo-upload-list-cover">
                  <Icon type="ios-trash-outline" @click.native="handleRemoveVideo(item)"></Icon>
                </div>
              </template>
        </div>-->
        <!-- <Upload
            ref="package"
            type="drag"
            action="//upload-z2.qiniu.com"
            :format="['apk']"
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
        </FormItem>-->
        <FormItem label="安装包名称：" prop="package_name_android">
          <Input v-model="formData.package_name_android" placeholder="请输入安装包名称" />
        </FormItem>
        <FormItem label="版本号：" prop="version">
          <Input v-model="formData.version" placeholder="请输入版本号" />
        </FormItem>
        <FormItem label="安卓下载链接：" prop="download_url">
          <Input v-model="formData.download_url" placeholder="请输入安卓下载链接" />
        </FormItem>
        <FormItem label="安卓安装包大小：" prop="package_size_android">
          <Input v-model="formData.package_size_android" placeholder="请输入安装包大小" />
        </FormItem>
        <FormItem label="IOS下载链接：" prop="ios_download_url">
          <Input
            v-model="formData.ios_download_url"
            placeholder="请输入IOS下载链接或苹果id"
            :disabled="isInputValue"
            @on-focus="getInput(0,formData.applestore_id)"
          />
          <!-- <p> 如果此处输入了链接 优先跳链接 如果输入了id就调app store 如果为空则隐藏下载按钮</p> -->
        </FormItem>
        <FormItem label="苹果id：" prop="applestore_id">
          <Input
            v-model="formData.applestore_id"
            placeholder="请输入IOS苹果id"
            :disabled="isInputValue2"
            @on-focus="getInput(1,formData.ios_download_url)"
          />
          <!-- applestore_id -->
          <p>如果输入了链接 优先跳链接 如果输入了id就调app store 如果为空则隐藏下载按钮</p>
        </FormItem>
        <!-- <FormItem label="热度值：" prop="hots" style="width:170px">
          <Input v-model="formData.hots" />
        </FormItem>-->
        <FormItem label="游戏评级：" prop="level_id" style="width:170px">
          <Select
            v-model="formData.level_id"
            size="small"
            style="width:100px"
            @on-change="serchGameGrade"
          >
            <Option v-for="item in game_level" :value="item.id" :key="item.id">{{ item.level_name }}</Option>
          </Select>
        </FormItem>
      </Form>
      <!-- <div slot="footer">
        <Button type="default" @click="editVisible = false">取消</Button>
        <Button type="primary" @click="handleSubmit('formData')">确定</Button>
      </div>-->
      <div slot="footer">
        <div style="display: flex;justify-content: center;align-items: center">
          <Button type="success" @click="handleSubmit('formData')">发布</Button>
        </div>
      </div>
    </Modal>
    <!-- 评论弹框 -->
    <Modal
      v-model="commentVisible"
      title="评价配置"
      :mask-closable="false"
      width="600"
      @on-visible-change="commentVisibleChange"
    >
      <Tabs :value="String(tabIndex)" @on-click="tabClick">
        <TabPane label="自动评价" name="0"></TabPane>
        <TabPane label="手动评价" name="1"></TabPane>
      </Tabs>
      <!-- 自动评论 -->
      <div v-show="tabIndex === 0">
        <Form
          :label-width="100"
          ref="commentData"
          :model="commentData"
          :rules="commentDataRuleInline"
        >
          <FormItem label="选择用户组:" prop="user_group_id" style="magin-bottom: 10px">
            <div>
              <Select
                style="width:300px"
                filterable
                v-model="commentData.user_group_id"
                prefix="ios-search"
              >
                <Option
                  v-for="item in groupData"
                  :key="item.id"
                  :value="item.id"
                  @click.native="groupDataChange(item)"
                  :label="item.name"
                ></Option>
              </Select>
              <div style="color:#bebebe">{{user_num}}位用户</div>
            </div>
          </FormItem>
          <FormItem label="选择评价组:" prop="assess_group_id">
            <div>
              <Select
                style="width:300px"
                filterable
                v-model="commentData.assess_group_id"
                prefix="ios-search"
              >
                <Option
                  v-for="item in assessGroupData"
                  :key="item.id"
                  @click.native="assessGroupDataChange(item)"
                  :value="item.id"
                >{{item.name}}</Option>
              </Select>
              <div style="color:#bebebe">{{assess_num}}条评价</div>
            </div>
          </FormItem>
          <FormItem label="完成时间:" required>
            <div style="display: flex">
              <FormItem prop="start_time">
                <DatePicker
                  @on-change="startTimeChange"
                  :options="startTimeOption"
                  type="datetime"
                  v-model="commentData.start_time"
                  format="yyyy-MM-dd HH:mm:ss"
                  placeholder="请选择开始时间"
                  style="width: 180px"
                ></DatePicker>
              </FormItem>
              <div style="margin: 0 10px">——</div>
              <FormItem prop="end_time">
                <DatePicker
                  @on-change="endTimeChange"
                  :options="endTimeOption"
                  type="datetime"
                  v-model="commentData.end_time"
                  format="yyyy-MM-dd HH:mm:ss"
                  placeholder="请选择完成时间"
                  style="width: 180px"
                ></DatePicker>
              </FormItem>
            </div>
          </FormItem>
          <FormItem label="评价间隔:" required>
            <div style="display: flex">
              <FormItem prop="start">
                <InputNumber v-model="commentData.start" style="margin-right:5px; width: 100px"></InputNumber>s
              </FormItem>
              <div style="margin: 0 10px">——</div>
              <FormItem prop="end">
                <InputNumber v-model="commentData.end" style="margin-right:5px; width: 100px"></InputNumber>s
              </FormItem>
            </div>
          </FormItem>
          <!-- <FormItem label="同步参与:">
              <InputNumber v-model="commentData.like_num" :max="100" :min="1" style="margin-right:5px; width: 100px"></InputNumber>%
          </FormItem>-->
          <div
            style="font-size:12px; color:#bebebe"
          >提示：当用户组数量=评论组数量时，评论会一对一匹配；当用户组数量＞评论组数量时，评论将会一对一匹配用户，剩余用户挂空不评论；当用户组数量＜评论组数量时，用户组将会随机一对多条评论</div>
        </Form>
      </div>
      <!-- 手动评论 -->
      <div v-show="tabIndex === 1">
        <Form
          :label-width="100"
          ref="handCommentData"
          :model="handCommentData"
          :rules="handCommentRuleInline"
        >
          <FormItem label="选择用户:" prop="user_id" style="margin-bottom: 20px">
            <Select
              style="width:300px"
              filterable
              v-model="handCommentData.user_id"
              prefix="ios-search"
            >
              <Option
                v-for="item in userData"
                :key="item.user_id"
                :value="item.user_id"
              >{{item.nickname}}</Option>
            </Select>
          </FormItem>
          <FormItem label="评价标题:" prop="title" style="margin-bottom: 20px">
            <Input
              placeholder="请输入评价标题"
              v-model="handCommentData.title"
              style="width: 300px"
              maxlength="20"
            />
          </FormItem>
          <FormItem label="游戏评分:" prop="score">
            <InputNumber
              placeholder="请输入游戏评分"
              style="width: 200px"
              v-model="handCommentData.score"
              :max="5"
              :min="1"
            ></InputNumber>
          </FormItem>
          <FormItem label="评价内容:" prop="content">
            <Input
              type="textarea"
              maxlength="1000"
              v-model="handCommentData.content"
              :autosize="{minRows: 5,maxRows: 8}"
              show-word-limit
              placeholder="请输入评价内容！"
              style="width: 300px"
            />
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="display: flex;justify-content: center">
        <Button type="success" @click="addCommentClick()">发布评价</Button>
      </div>
    </Modal>
    <!-- 添加标签弹窗 -->
    <!--  -->
    <Modal v-model="addTagVisble" title="请选择分类" :scrollable="true" width="800" @on-cancel="cancel">
      <Form ref="formDynamic" :model="formDynamic" :rules="ruleInline" inline>
        <FormItem prop="password">
          <Input type="text" v-model="requsestTageDate.keywords"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="serchTageName">搜索</Button>
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
    <!-- 新增热度值弹窗 -->
    <Modal v-model="addHotModal" width="400" title="修改热度值" footer-hide>
      <Form :model="hotFormData" ref="hotFormData" label-position="left" :label-width="120">
        <FormItem label="游戏名称：">{{hotFormData.game_name}}</FormItem>
        <FormItem label="热度值：">
          <span style="color:red">{{hotFormData.extra_hots}}</span>
          + {{hotFormData.true_hots}} = {{Number(hotFormData.extra_hots) + Number(hotFormData.true_hots)}}
        </FormItem>
        <FormItem label="修改热度值：" prop="hots">
          <input
            type="text"
            v-model="hotFormData.extra_hots"
            name="tel"
            oninput="value=value.replace(/[^\d]/g,'')"
            maxlength="9"
            style="width: 180px;border:1px solid #dcdee2;border-radius:4px;padding:4px 7px;height: 32px;color:#515a6e;"
          />
        </FormItem>
      </Form>
      <Button
        type="primary"
        style="margin-left: 104px;"
        @click="handleHotSubmit('hotFormData')"
        :loading="submitLoadingStatus"
      >提交</Button>
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
import SearchForm from "@/components/searchForm";
import { VueCropper } from "vue-cropper";
import axios from "axios";
import {
  getQiniuToken,
  getGameList,
  updateGameStatus,
  getAddGameViewData,
  addGame,
  delGame,
  getUserGroupData,
  getAssessGroupData,
  getUserData,
  autoAddAssess,
  addAssess,
  getCategoryLists,
  updateGameHots
} from "@/api/data";
import { getTagNavListFromLocalstorage } from "@/libs/util";
export default {
  components: {
    VueCropper,
    SearchForm
  },
  data() {
    const titleValidator = (rule, value, callback) => {
      if (this.formData.application_id === 2) {
        if (!value) callback(new Error("请输入名称"));
        if (value.length > 10) callback(new Error("名称长度不能大于10"));
        callback();
      }
      callback();
    };
    const imgValidator = (rule, value, callback) => {
      if (this.buttonStatus) {
        if (this.verticalUploadList.length) {
          if (
            this.verticalUploadList.length < 2 ||
            this.verticalUploadList.length > 5
          ) {
            callback(new Error("请上传2-5张游戏截图"));
          }
        } else {
          callback(new Error("请上传游戏截图"));
        }
        callback();
      } else {
        if (this.uploadList.length) {
          if (this.uploadList.length < 2 || this.uploadList.length > 5) {
            callback(new Error("请上传2-5张游戏截图"));
          }
        } else {
          callback(new Error("请上传游戏截图"));
        }
        callback();
      }
    };
    const commenttimeValidator = (rule, value, callback) => {
      if (!value) callback(new Error("请输入评论间隔结束时间"));
      if (this.commentData.end < this.commentData.start) {
        callback(new Error("完成间隔时间需大于开始时间"));
      }
      callback();
    };
    const timeValidator = (rule, value, callback) => {
      if (!value) callback(new Error("请输入完成时间"));
      var start = this.getUnixTime(this.commentData.start_time);
      var end = this.getUnixTime(this.commentData.end_time);
      if (end <= start) callback(new Error("完成时间需大于开始时间"));
      callback();
    };
    // const videoValidator = (rule, value, callback) => {
    //   if (this.buttonStatus) {
    //     if (!this.verticalVideoList.length) callback(new Error('请上传介绍视频'))
    //     callback()
    //   } else {
    //     if (!this.videoList.length) callback(new Error('请上传介绍视频'))
    //     callback()
    //   }
    // }
    return {
      isInputValue: false,
      isInputValue2: false,
      fruit: [], // 二级可以多选时的数组
      baseUrl: "https://cdn.tinytiger.cn/",
      party_img: "",
      party_backgroud: "",
      addHotModal: false, // 新增热度值弹窗
      cropperFlag: false,
      submitLoadingStatus: false, // 新增热度值提交按钮状态
      hotFormData: {
        id: 0,
        game_name: 0,
        hots: "",
        extra_hots: 1,
        hotsVal: 1,
        true_hots: 1
      },
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
      textArry2: [],
      isDisabled: true,
      textArry: "", // 用于存储添加的标签id
      isTagTwo: false, // 控制添加标签的确定按钮显示（二级标签显示）
      changeTags: 0, // 控制tabs的移动
      formDynamic: {
        items: [],
        tageNameArray: [], // 1级分类数据
        tageNameArray2: [], // 2级分类数据
        serchTage: "" // 添加标签里面的搜索标签
      },
      tageName: "", // 添加的标签名
      tageNameId: "", // 标签id
      requsestTageDate: {
        level: 0, // 级别 1为一级分类 2为二级分类 0为只获取一级分类id&名称 默认值: 0
        keywords: "", // 分类名称搜所字段
        cate_id: 0, // 一级分类id (获取二级分类列表时 传此参数)默认值: 0
        is_need_hindden: 0,
        is_need_filter_no_son: 1
      },
      single: false,
      addTagVisble: false, // 控制添加弹窗
      tabIndex: 0,
      groupData: [], // 用户组
      assessGroupData: [], // 评价组
      userData: [], // 用户
      user_num: null, // 用户数量
      assess_num: null, // 评价数量
      commentData: {
        game_id: null,
        user_group_id: null,
        assess_group_id: null,
        start_time: "",
        end_time: "",
        start: null,
        end: null
      },
      handCommentData: {
        game_id: null,
        user_id: null,
        score: null,
        title: "",
        content: ""
      },
      commentVisible: false,
      qiniuToken: "",
      buttonStatus: false,
      game_module_array: [],
      game_level: [], // 游戏评级
      uploadList: [],
      logolist: [],
      backgroundList: [],
      thumlist: [],
      videoList: [],
      verticalUploadList: [],
      verticalVideoList: [],
      pageParams: {
        page: 1,
        per_page: 10
      },
      total: 1,
      tableData: [],
      mode: "",
      editVisible: false,
      // // 用于1分类
      // pageParams1: {
      //   page: 1,
      //   per_page: 20
      // },
      // total1: 1,
      //  // 用于2分类
      // pageParams2: {
      //   page: 1,
      //   per_page: 20
      // },
      // total2: 1,
      // partyData: {
      //   checkcode: null, // 校验码
      //   name: '', // 派对名称
      //   circle_type: 1, // 圈子分类
      //   party_no: null, // 派对编号
      //   tag_name: '', // 派对标签
      //   party_img: '', // 派对封面
      //   party_backgroud: '', // 派对背景
      //   party_backgroud1: '',
      //   party_backgroud2: []
      // },
      formData: {
        name: "",
        one_introduce: "",
        detail_introduce: "",
        cat_ids: "", // 二级标签id
        viewpoint: "", // 观点
        logo: "",
        background: "",
        thumbnail: "",
        video_introduce: "",
        download_url: "",
        package_name_android: "", // 安卓游戏包名
        package_size_android: "", // 安卓游戏包大小
        images_introduce: "",
        video_introduce_type: 1,
        images_introduce_type: 1,
        applestore_id: "",
        // hots: 0, // 添加游戏里面的热度值
        level_id: "",
        version: "",
        ios_download_url: ""
      },
      game_module: [],

      searchData: {
        keywords: "",
        hots_sort: 0, // 热度值
        // hot_value: 0,
        is_recommend: -1,
        status: -1
      },
      searchParams: {
        keywords: ""
      },
      searchForm: {
        actions: [
          {
            text: "查询",
            type: "default",
            handle: () => {
              this.pageParams.page = 1;
              this.searchParams = {
                ...this.searchData
              };
              this.getDataList();
            }
          }
        ],
        components: [
          {
            name: "Input",
            label: "关键词查询：",
            prop: "keywords",
            placeholder: "请输入游戏名称或游戏id",
            style: "width:250px"
          },
          {
            name: "Select",
            prop: "hots_sort",
            label: "热度值:",
            style: "width: 100px",
            options: [
              {
                label: "全部",
                value: 0
              },  
              {
                label: "正序排列",
                value: 1
              },
              {
                label: "倒序排列",
                value: 2
              }
            ]
          },
          {
            name: 'Select',
            prop: 'status',
            label: '显示/隐藏:',
            style: 'width: 100px',
            options: [
              {
                label: '全部',
                value: -1
              },
              {
                label: '显示',
                value: 1
              },
              {
                label: '隐藏',
                value: 0
              }
            ]
          },
          // 这个2.2版本这个搜素条件暂时不显示
          // {
          //   name: 'Select',
          //   prop: 'is_recommend',
          //   label: '是否推荐:',
          //   style: 'width: 100px',
          //   options: [
          //     {
          //       label: '全部',
          //       value: -1
          //     },
          //     {
          //       label: '已推荐',
          //       value: 1
          //     },
          //     {
          //       label: '未推荐',
          //       value: 0
          //     }
          //   ]
          // }
        ]
      },
      store_list: [],
      columns: [
        {
          align: "center",
          title: "游戏ID",
          key: "id"
        },
        {
          align: "center",
          title: "logo",
          key: "logo",
          render: (h, params) => {
            return h("div", [
              h("img", {
                attrs: { src: params.row.logo },
                style: { width: "50px", height: "50px", margin: "auto" }
              })
            ]);
          }
        },
        {
          align: "center",
          title: "游戏名称",
          key: "name"
        },
        {
          align: "center",
          title: "游戏评分",
          key: "score"
        },
        {
          align: "center",
          title: "观点",
          // key: "viewpoint",
          render: (h, params) => {
            return h('div', {}, params.row.viewpoint.length > 30 ? params.row.viewpoint.substr(0,30) + '...' : params.row.viewpoint)
          }
        },
        {
          align: "center",
          title: "游戏二级分类",
          key: "game_category"
        },
        {
          align: "center",
          title: "游戏模块",
          key: "game_module"
        },
        {
          align: "center",
          title: "热度值",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    color: "#D9001B"
                  }
                },
                params.row.extra_hots + "+"
              ), // 运营增加的热度值
              h(
                "span",
                {
                  // style: {
                  //   color: '#D9001B'
                  // }
                },
                params.row.true_hots + "="
              ), // 真实的热度值
              h(
                "span",
                {
                  // style: {
                  //   color: '#D9001B'
                  // }
                },
                params.row.hots
              ), // 综合热度值
              h("div", [
                h(
                  "span",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      color: "#2D8CF0",
                      "margin-right": "8px",
                      cursor: "pointer"
                    },
                    on: {
                      click: () => {
                        this.addHotModal = true;
                        let hotData = params.row;
                        this.hotFormData.id = hotData.id;
                        this.hotFormData.game_name = hotData.name;
                        this.hotFormData.hots = hotData.hots;
                        this.hotFormData.extra_hots = hotData.extra_hots;
                        this.hotFormData.true_hots = hotData.true_hots;
                        // this.hotFormData.hotsVal = 1

                        this.hotFormData.hotsVal = hotData.extra_hots;

                        this.submitLoadingStatus = false;
                      }
                    }
                  },
                  "修改热度值"
                ),
                +params.row.extra_hots !== 0
                  ? h(
                      "span",
                      {
                        style: {
                          color: "#ED4014",
                          cursor: "pointer"
                        },
                        on: {
                          click: () => {
                            this.$Modal.confirm({
                              title: "确认清空热度值吗？",
                              onOk: () => {
                                updateGameHots({
                                  id: params.row.id,
                                  extra_hots: 0
                                }).then(res => {
                                  if (res.data.code === 200) {
                                    this.$Message.success("已清空热度值");
                                    this.getDataList();
                                  }
                                });
                              }
                            });
                          }
                        }
                      },
                      "清空新增"
                    )
                  : ""
              ])
            ]);
          }
        },
        {
          align: "center",
          title: "显示/隐藏",
          key: "status",
          render: (h, params) => {
            return h("i-switch", {
              props: {
                "true-color": "rgb(26,188,156)",
                value: params.row.status === 1,
                "before-change": () => this.handleSwitchChange(params.row)
              }
            });
          }
        },
        {
          align: "center",
          title: "游戏评级",
          key: "level"
        },
        {
          title: "操作",
          align: "center",
          width: 200,
          render: (h, params) => {
            return h("div", [
              // "wiki_status": 1, #百科模块状态 0关闭 1开启
              //   "information_status": 1, #资讯模块状态 0关闭 1开启
              //   "community_status": 1, #社区模块状态 0关闭 1开启
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: {
                    marginRight: "10px",
                    color: "#70B603",
                    display:
                      params.row.wiki_status === 1 ? "inline-block" : "none"
                  },
                  on: {
                    click: () => {
                      // this.$router.push({
                      //   path: `/game/encyclopedia?id=${params.row.id}`
                      // })
                      let tagLisg = getTagNavListFromLocalstorage() || [];
                      let flag = true;
                      if (tagLisg.length) {
                        tagLisg.forEach(item => {
                          if (item.name === "encyclopedia") flag = false;
                        });
                      }
                      if (flag) {
                        window.sessionStorage.removeItem("towLevel_tabs_");
                        window.sessionStorage.removeItem("oneLevel_tabs_");
                        window.sessionStorage.removeItem("modular_id");
                        this.$router.push({
                          path: `/game/encyclopedia?id=${params.row.id}`
                        });
                      } else {
                        this.$Modal.error({
                          content: "已开启百科界面,请关闭后再打开",
                          title: "提示"
                        });
                      }
                    }
                  }
                },
                "百科"
              ),
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px", color: "#70B603" },
                  on: {
                    click: () => {
                      this.checkIsOpenRoute('gameDetail', '游戏', params.row.id)
                    }
                  }
                },
                "查看"
              ),
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px", color: "#70B603" },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "提示",
                        content: "确认删除该游戏？",
                        onOk: () => {
                          this.delGame(params.row.id);
                        }
                      });
                    }
                  }
                },
                "删除"
              ),
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px", color: "#70B603" },
                  on: {
                    click: () => {
                      this.commentData.game_id = params.row.id;
                      this.handCommentData.game_id = params.row.id;
                      this.commentVisible = true;
                      this.getUserGroup();
                      this.getAssessGroup();
                      this.getUser();
                    }
                  }
                },
                "评价"
              ),
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  style: { marginRight: "10px", color: "#70B603" },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: `gameCommentList?id=${params.row.id}`
                      });
                    }
                  }
                },
                '评论'
              ),
              +params.row.circle_status === 1 && h(
                'Button',
                {
                  props: { type: 'text', size: 'small' },
                  style: { marginRight: '10px', color: '#70B603' },
                  on: {
                    click: () => {
                      this.checkIsOpenRoute('editCircle', '圈子', params.row.circle_id)
                    }
                  }
                },
                '圈子'
              )
            ]);
          }
        }
      ],
      ruleInline: {
        title: [{ validator: titleValidator }],
        name: [{ required: true, message: "请输入游戏名称" }],
        one_introduce: [{ required: true, message: "请输入游戏简介" }],
        // game_module: [{ required: true, message: '请选择游戏模块' }],
        detail_introduce: [{ required: true, message: "请输入游戏介绍" }],
        viewpoint: [{ required: false, message: "请输入观点" }],
        cat_ids: [{ required: true, message: "请输入游戏分类" }],
        logo: [{ required: true, message: "请上传LOGO图片" }],
        background: [{ required: true, message: "请上传背景图片" }],
        thumbnail: [{ required: true, message: "请上传游戏截图" }],
        // video_introduce: [{ required: true, message: '请上传介绍视频' }],
        // video_introduce: [{ validator: videoValidator }],
        // images_introduce: [{ required: true, message: '请上传游戏截图' }]
        images_introduce: [{ validator: imgValidator }],
        level_id: [{ required: true, message: "请选择游戏评级" }]
      },
      handCommentRuleInline: {
        title: [{ required: true, message: "请输入标题" }],
        score: [{ required: true, message: "请输入评分" }],
        content: [{ required: true, message: "请输入内容" }],
        user_id: [{ required: true, message: "请选择用户" }]
      },
      commentDataRuleInline: {
        user_group_id: [{ required: true, message: "请选择用户组" }],
        assess_group_id: [{ required: true, message: "请选择评价组" }],
        start_time: [{ required: true, message: "请选择开始时间" }],
        end_time: [{ validator: timeValidator }],
        start: [{ required: true, message: "请输入评价间隔" }],
        end: [{ validator: commenttimeValidator }]
      },
      startTimeOption: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        }
      },
      endTimeOption: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        }
      }
    };
  },
  mounted() {
    this.getDataList();
    this.getAddGameViewData();
    this.getQiniuToken();
  },
  methods: {
    checkIsOpenRoute (routeName, name, id) {
      let tagList = getTagNavListFromLocalstorage() || []
      let flag = true
      if (tagList.length) {
        tagList.forEach(item => {
          if (item.name === routeName) {
            flag = false
          }
        })
      }
      if (flag) {
        this.$router.push({
          path: `/game/${routeName}?id=${id}`
        })
      } else {
        this.$Modal.error({
          content: `已有${name}正在编辑，请关闭后在编辑当前${name}`,
          title: '提示'
        })
      }
    },
    // 控制输入ios 链接、id哪个可用
    getInput(number, value) {
      if (number === 0) {
        if (!value) {
          this.isInputValue = false;
        } else {
          this.isInputValue = true;
        }
      } else {
        if (!value) {
          this.isInputValue2 = false;
        } else {
          this.isInputValue2 = true;
        }
      }
      if (!value) {
        (this.isInputValue = false), (this.isInputValue2 = false);
      }
    },
    cancel() {
      // this.formData.level_id = 1
      this.requsestTageDate.cate_id = 0
      this.formDynamic.tageNameArray2 = []
      this.formDynamic.tageNameArray = []
      this.requsestTageDate.keywords = ''
      this.fruit = []
    },
    // 提交新增或编辑热度值
    handleHotSubmit(name) {
      if (!this.hotFormData.extra_hots)
        return this.$Message.error("请完善信息");
      this.submitLoadingStatus = true;
      let paramsData = { ...this.hotFormData };
      updateGameHots({
        id: paramsData.id,
        extra_hots: paramsData.extra_hots
      }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("编辑成功");
          this.addHotModal = false;
          this.getDataList();
        } else {
          this.submitLoadingStatus = false;
        }
      });
    },
    // 游戏评级
    serchGameGrade(e) {
      this.formData.level_id = e;
    },
    // 把标签添加到标签选项中
    commitTag() {
      if (this.fruit.length > 0) {
        this.fruit.forEach(item => {
          const newItem = item.split(",");
          this.tageName = newItem[0];
          this.tageNameId = newItem[1];
        });
      }
      this.addTagVisble = false;
      const isTrue = this.isInArray(this.formDynamic.items, this.tageNameId);
      if (isTrue) {
        // this.formData.level_id = 0
        this.formDynamic.tageNameArray2 = []
        this.formDynamic.tageNameArray = []
        this.fruit = []
        return this.$Message.error(`游戏分类名称${isTrue}已存在`)
      } else {
        if (this.fruit.length > 0) {
          this.fruit.forEach(item => {
            const newItem = item.split(",");
            this.formDynamic.items.push({
              value: newItem[0],
              status: newItem[1]
            });
          });
          this.formDynamic.items = this.isInArray2(this.formDynamic.items);
        }
      }
      // this.formData.level_id = 1
      this.requsestTageDate.cate_id = 0
      this.formDynamic.tageNameArray2 = []
      this.formDynamic.tageNameArray = []
      this.requsestTageDate.keywords = ''
      this.fruit = []
      // }
    },
    isInArray2(arr) {
      let hash = {};
      let new_arr = arr.reduce((cur, next) => {
        hash[next.status] ? "" : (hash[next.status] = true && cur.push(next));
        return cur;
      }, []);
      return new_arr;
    },
    // 重复选择的标签
    isInArray(arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (value === arr[i].status) {
          return arr[i].value;
        }
      }
      return false;
    },
    // 点击1级标签
    indeTage(e) {
      // 获取一级标签的id
      this.formDynamic.tageNameArray2 = [];
      this.requsestTageDate.cate_id = e;
      this.requsestTageDate.level = 0;
      this.requsestTageDate.keywords = "";
      this.getCategoryLists2();
    },
    // 获取二级分类
    getCategoryLists2() {
      this.formDynamic.tageNameArray2 = [];
      const data = {
        ...this.pageParams2,
        ...this.requsestTageDate
      };
      getCategoryLists(data).then(res => {
        if (res.data.code === 200) {
          this.formDynamic.tageNameArray2 = res.data.data;
          this.isTagTwo = true;
          this.changeTags = 1;
          this.requsestTageDate.level = 0;
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
      });
    },
    // 添加标签
    handleAdd() {
      this.formDynamic.tageNameArray = [];
      this.requsestTageDate.level = 0;
      this.isDisabled = true; // 控制标签可不可以选中
      this.isTagTwo = false; // 控制添加标签的确定按钮显示（二级标签显示）
      this.changeTags = 0; // 控制tabs的移动
      this.addTagVisble = true;
      if (this.formDynamic.tageNameArray.length !== 0) {
        return false;
      }
      this.getCategoryLists1();
    },
    // 获取一级分类时候调用
    getCategoryLists1() {
      console.log('asdasdsa',this.formDynamic.tageNameArray)
      this.formDynamic.tageNameArray = [];
      this.formDynamic.tageNameArray2 = [];
      const data = {
        ...this.pageParams1,
        ...this.requsestTageDate
      };
      getCategoryLists(data).then(res => {
        if (res.data.code === 200) {
          this.formDynamic.tageNameArray = res.data.data;
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
      });
    },

    // 删除标签
    handleClose2(event, name) {
      // const index = this.formDynamic.items[name]
      // console.log('222',index)
      this.formDynamic.items.splice(name, 1);
    },
    // 搜索标签
    serchTageName() {
      this.formDynamic.tageNameArray = [];
      this.formDynamic.tageNameArray2 = [];
      // const isFistTage = this.requsestTageDate.level !== 1 ? this.pageParams2:this.pageParams1
      // this.pageParams1.page = 1
      // this.pageParams2.page = 1
      const data = {
        // ...isFistTage,
        ...this.requsestTageDate
      };
      this.getCategoryListsSerch(data);
    },
    getCategoryListsSerch(data) {
      getCategoryLists(data).then(res => {
        if (res.data.code === 200) {
          this.isDisabled = true; // 控制标签可不可以选中
          if (this.requsestTageDate.cate_id !== 0) {
            this.isTagTwo = true; // 控制添加标签的确定按钮显示（二级标签显示）
            this.changeTags = 1; // 控制tabs的移动
            this.formDynamic.tageNameArray2 = res.data.data;
            // console.log('搜索返回1',res.data.data)
          } else {
            this.changeTags = 0; // 控制tabs的移动
            this.formDynamic.tageNameArray = res.data.data;
            // console.log('搜索返回2',res.data.data)
            this.isTagTwo = false; // 控制添加标签的确定按钮显示（二级标签显示）
          }
        }
      });
    },

    // 获取token
    getQiniuToken() {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken;
        }
      });
    },
    // 日期格式转时间戳
    getUnixTime(dateStr) {
      var newstr = dateStr.replace(/-/g, "/");
      var date = new Date(newstr);
      var time_str = date.getTime().toString();
      return time_str.substr(0, 10);
    },
    // 获取用户组
    getUserGroup() {
      getUserGroupData().then(res => {
        if (res.data.code === 200) {
          this.groupData = res.data.data;
          this.user_num = this.groupData[0].user_num;
        }
      });
    },
    // 获取游戏评价组
    getAssessGroup() {
      getAssessGroupData().then(res => {
        if (res.data.code === 200) {
          this.assessGroupData = res.data.data;
          if (this.assessGroupData.length !== 0) {
            this.assess_num = this.assessGroupData[0].assess_num;
          }
        }
      });
    },
    // 选择用户
    getUser() {
      getUserData().then(res => {
        if (res.data.code === 200) {
          this.userData = res.data.data;
        }
      });
    },
    // 评论点击
    tabClick(name) {
      this.tabIndex = Number(name);
      // console.log(name)
      if (this.tabIndex === 0) {
        // console.log(this.$refs)
        this.$refs.commentData.resetFields();
        this.commentData.like_num = null;
      } else {
        this.$refs.handCommentData.resetFields();
      }
    },
    // 开始时间
    startTimeChange(date) {
      this.commentData.start_time = date;
    },
    endTimeChange(date) {
      this.commentData.end_time = date;
    },
    // 用户组值改变
    groupDataChange(item) {
      this.user_num = item.user_num;
    },
    // 用户评价数量改变
    assessGroupDataChange(item) {
      this.assess_num = item.assess_num;
    },
    // 发布评论
    addCommentClick() {
      if (this.tabIndex === 0) {
        // 自动评论
        this.$refs.commentData.validate(valid => {
          if (valid) {
            autoAddAssess(this.commentData).then(res => {
              if (res.data.code === 200) {
                this.$Message.success(res.data.msg);
                this.commentVisible = false;
                this.commentData.like_num = null;
              }
            });
          }
        });
      } else {
        // 手动评论
        this.$refs.handCommentData.validate(valid => {
          if (valid) {
            addAssess(this.handCommentData).then(res => {
              if (res.data.code === 200) {
                this.tabIndex = 0;
                this.$Message.success(res.data.msg);
                this.commentVisible = false;
              }
            });
          }
        });
      }
    },
    // 获取游戏列表
    getDataList() {
      const data = {
        ...this.pageParams,
        ...this.searchParams
      };
      getGameList(data).then(res => {
        if (res.data.code === 200) {
          this.total = res.data.data.total;
          this.tableData = res.data.data.data;
        }
      });
    },
    getAddGameViewData() {
      getAddGameViewData().then(res => {
        if (res.data.code === 200) {
          this.game_module_array = res.data.data.game_module_list;
          this.game_level = res.data.data.game_level;
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
    // 删除游戏
    delGame(id) {
      delGame({ id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("删除成功");
          this.getDataList();
        }
      });
    },
    updateGameStatus(item) {
      const data = {
        id: item.id,
        type: item.status === 1 ? 1 : 2
      };
      updateGameStatus(data).then(res => {
        if (res.data.code === 200) {
          this.$Message.success("修改成功");
          this.getDataList();
        }
      });
    },
    // 弹框确定事件
    handleSubmit(name) {
      // 把获取过来的标签id进行拼接
      const TagArryLength = this.formDynamic.items.length;
      if (TagArryLength > 0) {
        this.formDynamic.items.forEach((item, index) => {
          if(index === TagArryLength-1 ){
            this.textArry += `${item.status}`
          }else{
            this.textArry += `${item.status},`
          }
        })
        this.formData.cat_ids = this.textArry
      }
      this.$refs[name].validate(valid => {
        if (valid) {
          this.formData.images_introduce = [];
          this.formData.video_introduce = "";
          if (this.buttonStatus) {
            this.verticalUploadList.forEach(item => {
              this.formData.images_introduce.push(item.url);
            });
            this.verticalVideoList.forEach(item => {
              this.formData.video_introduce = item.url;
            });
          } else {
            this.uploadList.forEach(item => {
              this.formData.images_introduce.push(item.url);
            });
            this.videoList.forEach(item => {
              this.formData.video_introduce = item.url;
            });
          }
          if (typeof this.formData.images_introduce !== "string") {
            this.formData.images_introduce = JSON.stringify(
              this.formData.images_introduce
            );
          }
          var data = this.game_module.join(",");
          this.formData.game_module = data;
          addGame(this.formData).then(res => {
            if (res.data.code === 200) {
              this.formDynamic.tageNameArray = [];
              this.formDynamic.tageNameArray2 = [];
              this.formDynamic.items = [];
              this.formData.cat_ids = "";
              this.textArry = "";
              this.$Message.success("添加成功");
              this.editVisible = false;
              this.buttonStatus = false;
              this.formData.video_introduce_type = 1;
              this.formData.images_introduce_type = 1;
              this.getDataList();
              this.$refs.formData.resetFields();
              this.videoList = [];
              this.backgroundList = [];
              this.uploadList = [];
              this.thumlist = [];
              this.logolist = [];
              this.game_module = [];
              this.verticalUploadList = [];
              this.verticalUploadList = [];
              this.$refs.video_introduce.clearFiles();
              // this.$refs.package.clearFiles()
            }
          });
        }
      });
    },
    // 游戏截图
    // handleImagesSuccess (file) {
    //   if (this.buttonStatus) {
    //     this.verticalUploadList.push({ status: 'finished', url: this.baseUrl + file.key })
    //     this.formData.images_introduce = []
    //     this.verticalUploadList.forEach(item => {
    //       this.formData.images_introduce.push(item.url)
    //     })
    //   } else {
    //     this.uploadList.push({ status: 'finished', url: this.baseUrl + file.key })
    //     this.formData.images_introduce = []
    //     this.uploadList.forEach(item => {
    //       this.formData.images_introduce.push(item.url)
    //     })
    //   }
    // },
    // eslint-disable-next-line handle-callback-err
    handleError(error, file) {
      this.$Modal.error({
        title: "上传失败",
        content: "文件 " + file.name + " 上传失败"
      });
    },
    handleRemoveImage(file) {
      if (this.buttonStatus) {
        this.verticalUploadList.splice(
          this.verticalUploadList.indexOf(file),
          1
        );
      } else {
        this.uploadList.splice(this.uploadList.indexOf(file), 1);
      }
      this.formData.images_introduce.splice(
        this.formData.images_introduce.indexOf(this.baseUrl + file.key),
        1
      );
    },
    logoSuccess(file) {
      this.logolist.push({
        status: "finished",
        url: this.baseUrl + file.key
      });
      this.formData.logolist = this.baseUrl + file.key;
    },
    // logo
    handleRemoveLogo(file) {
      this.logolist.splice(this.logolist.indexOf(file), 1);
      this.formData.logo = "";
    },
    // 背景图
    handleBackgroundSuccess(file) {
      this.backgroundList.push({
        status: "finished",
        url: this.baseUrl + file.key
      });
      this.formData.background = this.baseUrl + file.key;
    },
    handleRemoveBackground(file) {
      this.backgroundList.splice(this.logolist.indexOf(file), 1);
      this.formData.background = "";
    },
    // 缩略图
    handleThumSuccess(file) {
      this.thumlist.push({
        status: "finished",
        url: this.baseUrl + file.key
      });
      this.formData.thumbnail = this.baseUrl + file.key;
    },
    handleRemovethum(file) {
      this.thumlist.splice(this.thumlist.indexOf(file), 1);
      this.formData.thumbnail = "";
    },
    // 视频
    handleVideosSuccess(file) {
      // this.videoList.push({
      //   status: 'finished',
      //   url: baseUrl + file.key
      // })
      // this.formData.video_introduce = baseUrl + file.key
      if (this.buttonStatus) {
        this.verticalVideoList.push({
          status: "finished",
          url: this.baseUrl + file.key
        });
        if (this.verticalVideoList.length) {
          this.formData.video_introduce = "";
          this.verticalVideoList.forEach(item => {
            this.formData.video_introduce = item.url;
          });
        }
      } else {
        this.videoList.push({
          status: "finished",
          url: this.baseUrl + file.key
        });
        if (this.videoList.length) {
          this.formData.video_introduce = "";
          this.videoList.forEach(item => {
            this.formData.video_introduce = item.url;
          });
        }
      }
      this.$refs.video_introduce.clearFiles();
    },
    handleRemoveVideo(file) {
      if (this.buttonStatus) {
        this.verticalVideoList.splice(this.verticalVideoList.indexOf(file), 1);
      } else {
        this.videoList.splice(this.videoList.indexOf(file), 1);
      }
      this.formData.video_introduce = "";
    },
    handleFormatError(file) {
      this.$Modal.error({
        title: "文件格式不正确",
        content: "文件 " + file.name + " 格式不正确,请按要求上传"
      });
    },
    // 游戏安装包
    handlePackageSuccess(file) {
      this.formData.download_url = this.baseUrl + file.key;
    },
    removePackage(file) {
      this.formData.download_url = "";
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "超过文件大小限制",
        desc: "安装包" + file.name + "太大, 不能超过3G"
      });
    },
    // 弹框显示
    addGameClick() {
      this.editVisible = true;
    },
    handleSwitchChange(data) {
      this.updateGameStatus(data);
    },
    // 页码
    handlePageChange(page) {
      this.pageParams.page = page;
      this.getDataList();
    },
    handlePageSizeChange(size) {
      this.pageParams.page = 1;
      this.pageParams.per_page = size;
      this.getDataList();
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
    visibleChange(visible) {
      if (visible) {
        this.getQiniuToken();
      } else {
        this.editVisible = false;
        this.buttonStatus = false;
        this.$refs.formData.resetFields();
        this.formData.video_introduce_type = 1;
        this.formData.images_introduce_type = 1;
        this.videoList = [];
        this.backgroundList = [];
        this.uploadList = [];
        this.thumlist = [];
        this.logolist = [];
        this.game_module = [];
        this.verticalUploadList = [];
        this.verticalUploadList = [];
        this.$refs.video_introduce.clearFiles();
        // this.$refs.package.clearFiles()
        this.formDynamic.items = [];
      }
    },
    commentVisibleChange(visible) {
      if (!visible) {
        this.tabIndex = 0;
        this.$refs.commentData.resetFields();
        this.$refs.handCommentData.resetFields();
        this.commentData.like_num = null;
      }
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
                this.formData.logo = this.baseUrl + res.data.key;
                this.logolist.push({
                  status: "finished",
                  url: this.formData.logo
                });
              } else if (this.option.type === "bgfile") {
                this.formData.background = this.baseUrl + res.data.key;
                this.backgroundList.push({
                  status: "finished",
                  url: this.formData.background
                });
              } else if (this.option.type === "d") {
                this.formData.thumbnail = this.baseUrl + res.data.key;
                this.thumlist.push({
                  status: "finished",
                  url: this.formData.thumbnail
                });
              } else if (this.option.type === "ggfile") {
                // console.log('aushdaud1111', res)
                if (this.buttonStatus) {
                  // this.formData.images_introduce = this.baseUrl + res.data.key
                  this.verticalUploadList.push({
                    status: "finished",
                    url: this.baseUrl + res.data.key
                  });
                  this.formData.images_introduce = [];
                  // console.log(this.verticalUploadList)
                  this.verticalUploadList.forEach(item => {
                    this.formData.images_introduce.push(item.url);
                  });
                } else {
                  // console.log('dsadads222',this.verticalUploadList)
                  // this.formData.images_introduce = this.baseUrl + res.data.key
                  this.uploadList.push({
                    status: "finished",
                    url: this.baseUrl + res.data.key
                  });
                  this.formData.images_introduce = [];
                  this.uploadList.forEach(item => {
                    this.formData.images_introduce.push(item.url);
                  });
                }
              } else {
                that.$Message.error("上传失败");
              }
            } else {
              this.$Message.error("图片编译失败请刷新界面重试");
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
    getPic(file, type) {
      if (
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/png"
      ) {
        this.$Modal.error({
          title: "文件格式不正确",
          desc: "文件 " + file.name + " 格式不正确，请上传 jpg/png 格式的图片。"
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
    //
    handleBeforeUpload(file) {
      this.logolist = [];
      this.option.type = "cdfile";
      this.getPic(file, "c");
      return false;
    },
    handleBeforeUpload_bg(file) {
      this.backgroundList = [];
      this.option.type = "bgfile";
      this.getPic(file, "background");
      return false;
    },
    handleBeforeUpload_bg2(file) {
      this.thumlist = [];
      this.option.type = "d";
      this.getPic(file, "background1");
      return false;
    },
    beforeUpload(file) {
      this.option.type = "ggfile";
      this.getPic(file, "background2");
      const check = this.uploadList.length < 5;
      if (!check) {
        this.$Modal.error({
          title: "最多上传5张图片"
        });
      }
      return false;
    }
    // handleBeforeUpload_bg2 (file) {
    //   this.thumlist = []
    //   this.option.type = 'd'
    //   this.getPic(file, 'background1')
    //   return false
    // }
    // handleImagesSuccess (file) {
    //   if (this.buttonStatus) {
    //     this.verticalUploadList.push({ status: 'finished', url: this.baseUrl + file.key })
    //     this.formData.images_introduce = []
    //     this.verticalUploadList.forEach(item => {
    //       this.formData.images_introduce.push(item.url)
    //     })
    //   } else {
    //     this.uploadList.push({ status: 'finished', url: this.baseUrl + file.key })
    //     this.formData.images_introduce = []
    //     this.uploadList.forEach(item => {
    //       this.formData.images_introduce.push(item.url)
    //     })
    //   }
    // },
  }
};
</script>

<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
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
.vertical:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
.ivu-form-item:nth-child(1),
.ivu-form-item:nth-child(2) {
  margin-bottom: 5px;
}
.addTage {
  color: green;
  width: 100%;
  max-height: 300px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  padding-top: 10px;
  padding-left: 10px;
  padding-bottom: 10px;
}
.addaddTageC {
  margin-left: 10px;
}
.add{
  background-color: #2d8cf0;
  border-color: #2d8cf0;
  color: #fff;
}
.cropper {
  width: 400px;
  height: 400px;
}
.imgss {
  width: 125px;
  height: 125px;
}
</style>