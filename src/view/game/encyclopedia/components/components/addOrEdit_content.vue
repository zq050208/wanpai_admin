<template>
  <div class="addOrEdit_content">
    <Card>
      <Form
        ref="formInline"
        :model="content_form"
        :rules="content_rules"
        label-colon
        :label-width="320"
      >
        <!-- 文本名称 -->
        <FormItem prop="name" label="文本名称" style="width:1000px">
          <Input type="text" v-model="content_form.name" placeholder="请输入文本名称" maxlength="6" />
        </FormItem>

        <!-- 文本图片 -->
        <template v-if="template_id!=4">
          <FormItem label="文本图片" prop="img_url">
            <Cropper
              @img_url="img_url"
              :autoCropWidth="autoCropWidth"
              :autoCropHeight="autoCropHeight"
              :imgWidth="imgWidth"
              :imgHeight="imgHeight"
              :banner_img_url="content_form.img_url"
            >
              <template #bottom_text>
                <p>只能上传jpg/png格式文件</p>
                <p>上图下文图片尺寸：60*60pt</p>
                <p>左图右文图片尺寸：18*18pt</p>
              </template> 
            </Cropper>
          </FormItem>
        </template>

        <!-- 所属一级分类 -->
        <FormItem label="所属一级分类" prop="selectOneLevel">
          <Select
            style="width:200px"
            @on-change="selectOneLevel"
            :transfer="true"
            v-model="content_form.one_level"
          >
            <template v-if="selectOneLevel_data.length>0">
              <Option
                v-for="item  in selectOneLevel_data"
                :key="item.id"
                :value="item.id"
              >{{item.name}}</Option>
            </template>
            <template></template>
          </Select>
        </FormItem>

        <!-- 所属二级分类 -->
        <FormItem label="所属二级分类" prop="selectTwoLevel">
          <Select
            v-model="content_form.cate_id"
            style="width:200px;"
            @on-change="selectOneLeve2"
            :transfer="true"
          >
            <Option
              v-for="item  in selectTwoLevel_data"
              :key="item.id"
              :value="item.id"
            >{{item.name}}</Option>
          </Select>
        </FormItem>

        <!-- 排序值 -->
        <FormItem label="排序值" prop="order" style="width:1068px" placeholder="请输入排序值">
          <InputNumber :min="1" v-model="content_form.order" style="width:30%"></InputNumber>
          <Button type="primary" @click="getSortVal" style="margin-left:5px">获取排序值</Button>
        </FormItem>

        <!-- 富文本内容 -->
        <FormItem label="内容" style="width:990px">
          <div>
            <UEditor v-model="content_form.content" :value="content_form.content" />
          </div>
        </FormItem>

        <!-- 是否显示 -->
        <FormItem label="是否显示" prop="is_show">
          <i-switch @on-change="switchChange" :value="true" />
        </FormItem>
      </Form>
      <div class="publishBtn">
        <Button type="primary" @click="issuance">发布</Button>
      </div>
    </Card>
  </div>
</template>

<script>
import UEditor from "_c/ueditor/ueditor";
import Cropper from "_c/cropper_vue/cropper";

import {
  getQiniuToken,
  temContentAddView,
  TemCategoryIndexCategory,
  temContentAddContent,
  getEeitView,
  getEditConten,
  temContentGetSort
} from "@/api/data";
import { mapMutations } from "vuex";

export default {
  name: "addOrEdit_content",
  components: {
    // VueCropper,
    UEditor,
    Cropper
  },
  data() {
    return {
      submod_id: this.$route.query.submod_id,
      template_id: this.$route.query.template_id,
      content_id: this.$route.query.content_id,
      autoCropWidth: null,
      autoCropHeight: null,
      imgWidth: 0,
      imgHeight: 0,
      // 内容数据
      content_form: {
        order: null,
        name: "",
        submod_id: this.$route.query.submod_id,
        checkcode: "",
        img_url: "",
        is_show: 1,
        content: "",
        cate_id: "",
        one_level: ""
      },
      // 内容规则
      content_rules: {
        name: [
          {
            required: true,
            message: "请输入文本名称",
            trigger: "change"
          }
        ],
        img_url: [
          {
            required: true,
            message: "请选择上传图片",
            validator: (rule, value, callback) => {
              if (!this.content_form.img_url) {
                return callback(new Error("文本图片不能为空"));
              } else {
                callback();
              }
            }
          }
        ],
        order: [
          {
            required: true,
            message: "请输入排序值数字",
            trigger: "change",
            type: "number",
            min: 1,
            transform(value) {
              return Number(value);
            }
          }
        ],
        selectOneLevel: [
          {
            required: true,
            message: "请选择所属分类",
            trigger: "change",
            type: "string",
            validator: (rule, value, callback) => {
              if (!this.content_form.one_level) {
                return callback(new Error("请选择所属一级分类"));
              } else {
                callback();
              }
            }
          }
        ],
        selectTwoLevel: [
          {
            required: true,
            message: "请选择所属分类",
            trigger: "change",
            type: "string",
            validator: (rule, value, callback) => {
              if (!this.content_form.cate_id) {
                return callback(new Error("请选择所属二级分类"));
              } else {
                callback();
              }
            }
          }
        ],
        is_show: [
          {
            required: true,
            message: "请选择显示或隐藏",
            trigger: "change",
            validator: (rule, value, callback) => {
              callback();
            }
          }
        ]
      },
      selectOneLevel_data: [],
      selectTwoLevel_data: [],
      handleType: "", // 操作类型(编辑内容&添加内容)
      ueditorContent: ""
    };
  },
  methods: {
    ...mapMutations(["closeTag"]),
    // 获取添加内容验证码
    async temContentAddView() {
      let { data } = await temContentAddView({
        submod_id: this.$route.query.submod_id
      });
      // 如果是添加 在保存校验码
      if (this.$route.query.type === "add") {
        this.content_form.checkcode = data.data.checkcode;
      }
      this.selectOneLevel_data = data.data.data;
    },
    // 获取编辑内容验证码与当前被编辑的内容数据
    async getEeitView() {
      let { data } = await getEeitView({
        content_id: this.content_id,
        submod_id: this.submod_id
      });
      // 防止重复获取数据后覆盖
      if (this.content_form.cate_id == "") {
        this.content_form = {
          ...data.data.data,
          one_level: data.data.data.parent_cate_info.id,
          cate_id: data.data.data.cate_info.id,
          content_id: this.$route.query.content_id,
          submod_id: this.submod_id
        };
        this.banner_img = data.data.data.img_url;
      }
      this.content_form.checkcode = data.data.checkcode; // 编辑校验码
      // 获取二级分类数据
      this.TemCategoryIndexCategory(data.data.data.cate_info.pid);
    },
    // 获取二级分类
    async TemCategoryIndexCategory(pid) {
      let { data } = await TemCategoryIndexCategory({
        is_one_level: 2,
        pid,
        submod_id: this.submod_id,
        per_page: 999
      });
      this.selectTwoLevel_data = data.data.data;
    },
    // 获取排序值
    async getSortVal() {
      if (this.content_form.cate_id) {
        let { data } = await temContentGetSort({
          submod_id: this.submod_id,
          cate_id: this.content_form.cate_id
        });
        data.code === 200 && (this.content_form.order = data.data.order);
      } else {
        this.$Message.error("请选择二级分类");
      }
    },
    // 是否显示
    switchChange(status) {
      this.content_form.is_show = status ? 1 : 0;
    },
    // 发布
    issuance() {
      this.$refs.formInline.validate(v => {
        if (v) {
          // 根据类型判断发送添加或编辑请求
          this.$route.query.type === "add"
            ? this.temContentAddContent()
            : this.getEditConten();
        } else {
          // 验证失败重新获取校验码
          this.$route.query.type === "add"
            ? this.temContentAddView()
            : this.getEeitView();
        }
      });
    },
    // 添加内容
    async temContentAddContent() {
      let { data } = await temContentAddContent(this.content_form);
      this.handlerSuccess(data);
    },
    // 编辑内容
    async getEditConten() {
      let { data } = await getEditConten(this.content_form);
      this.handlerSuccess(data);
    },
    // 选定一级分类
    selectOneLevel(pid) {
      this.content_form.cate_id = "";
      this.TemCategoryIndexCategory(pid);
    },
    // 选定二级分类
    selectOneLeve2(cate_id) {
      this.content_form.cate_id = cate_id;
    },
    // 处理成功
    handlerSuccess(data) {
      if (data.code === 200) {
        // 保存当前点击tabs到本地
        window.sessionStorage.setItem("three_tabs_", "content_list");
        this.$Message.success("添加成功");
        this.closeTag(this.$route);
      } else {
        this.$route.query.type === "add"
          ? this.temContentAddView()
          : this.getEeitView();
      }
    },

    // 编辑器内容输入事件
    content_input(data) {
      this.content_form.content = data;
    },
    img_url(data) {
      this.content_form.img_url = data;
      this.$refs.formInline.validateField("img_url");
    }
  },
  created() {
    // 获取七牛云token
    getQiniuToken().then(res => {
      if (res.data.code === 200) {
        this.qiniuToken = res.data.data.uptoken;
      }
    });
    // 如果是编辑的话发送请求获取编辑的内容数据
    this.content_id && this.getEeitView();
    this.temContentAddView(); // 获取一级分类
  },
  watch: {
    template_id: {
      immediate: true,
      handler() {
        this.imgWidth = this.autoCropWidth =
          this.template_id == "3" ? 60 * 2 : 18 * 2;
        this.imgHeight = this.autoCropHeight =
          this.template_id == "3" ? 60 * 2 : 18 * 2;
      }
    }
  }
};
</script>

<style lang='less'>
.publishBtn {
  margin-left: 940px;
}
</style>
