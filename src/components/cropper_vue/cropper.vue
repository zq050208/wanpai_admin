<template>
  <div class="cropper">
    <div class="demo-upload-list">
      <template v-if="banner_img">
        <img :src="banner_img" :style="`width:${imgWidth}px;height:${imgHeight}px`" />
        <div class="demo-upload-list-cover">
          <Icon type="ios-trash-outline" @click="handleRemove"></Icon>
        </div>
      </template>
    </div>
    <Upload
      ref="upload"
      type="drag"
      action="//upload-z2.qiniu.com"
      :data="{ token: qiniuToken }"
      :show-upload-list="false"
      :format="['jpg','jpeg']"
      :before-upload="handleBeforeUpload"
      style="display: inline-block;width:58px;"
    >
      <div style="width: 58px;height:58px;line-height: 58px;">
        <Icon type="ios-cloud-upload-outline" size="20"></Icon>
      </div>
    </Upload>
    <slot name="bottom_text"></slot>

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
import { VueCropper } from "vue-cropper";
import axios from "axios";
import { getQiniuToken_ } from "@/libs/util";

export default {
  name: "cropper",
  props: {
    fixedNumber: {
      //  fixedNumber: 截图框的宽高比例
      type: Array,
      default: () => [1, 1]
    },
    autoCropWidth: {
      // 默认生成截图框宽度
      default: () => "50"
    },
    autoCropHeight: {
      // 默认生成截图框高度
      default: () => "50"
    },
    banner_img_url: {
      // 编辑时 图片的URL数据回显
      default: ""
    },
    imgWidth: {
      // 展示的图片宽度
      default: () => "100"
    },
    imgHeight: {
      // 展示的图片高度
      default: () => "100"
    }
  },
  components: {
    VueCropper
  },
  data() {
    return {
      // 图片
      imageBaseUrl: "https://cdn.tinytiger.cn/",
      qiniuToken: "",
      banner_img: "",
      cropperFlag: false,
      uploadList: [],
      option: {
        img: "", // 裁剪图片的地址
        type: "",
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: "jpeg || png", // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true, //是否输出原图比例的截图
        fixed: true, //是否开启截图框宽高固定比例
        fixedNumber: this.fixedNumber, //截图框的宽高比例
        autoCropWidth: this.autoCropWidth, // 默认生成截图框宽度
        autoCropHeight: this.autoCropHeight, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        centerBox: true // 截图框是否被限制在图片里面
      },
      // 图片
      img_url: "" // 截图完成后传给父组件的img_url
    };
  },
  methods: {
    // 图片
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
    onCubeImg() {
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
              this.img_url = this.banner_img = this.imageBaseUrl + res.data.key;
              // 截图完成后将URL传给父组件
              this.$emit("img_url", this.img_url);
            }
          });
      });
      // this.option.img = "";
      this.cropperFlag = false;
    },

    getPic(file, type) {
      if (
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg" &&
        file.type !== "image/png"
      ) {
        this.$Modal.error({
          title: "文件格式不正确",
          desc: "文件 " + file.name + " 格式不正确，请上传 jpg 格式的图片。"
        });
        return false;
      }
      var reader = new FileReader();
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
      this.$refs.cropper.refresh();
      // this.cropperFlag = true;
      // this.option.img!=='' &&(this.cropperFlag = true)
      this.$nextTick(()=>{
        this.cropperFlag = true;
      })
    },
    handleRemove(file) {
      // 从 upload 实例删除数据
      this.$emit("img_url", "");
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      this.uploadList = this.$refs.upload.fileList;
      this.banner_img = "";
    },
    handleBeforeUpload(file) {
      this.uploadList = [];
      this.option.type = "hdfile";
      this.getPic(file, "cover");
      return false;
    }
    // 图片
  },
  created() {
    getQiniuToken_().then(res => {
      this.qiniuToken = res;
    });
  },
  watch: {
    // 编辑时 图片的URL数据回显
    banner_img_url: {
      immediate: true,
      handler() {
        this.banner_img = this.banner_img_url;
      }
    }
  }
};
</script>

<style lang='less'>
.demo-upload-list {
  display: inline-block;
  text-align: center;
  line-height: 0px;
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
  //   margin: 0 2px;
  margin-top: 25%;
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
  width: 100%;
}

.vue-cropper[data-v-6dae58fd] {
  height: 400px;
}
</style>