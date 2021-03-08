<template>
  <div class="UEditor">
    <vue-ueditor-wrap
      v-model="content"
      :config="myConfig"
      :destroy="true"
      @input="content_input"
    ></vue-ueditor-wrap>
  </div>
</template>

<script>
import "_p/ueditor/ueditor.config";
import "_p/ueditor/ueditor.all.js";
import "_p/ueditor/lang/zh-cn/zh-cn.js";
// 秀米
import "_p/xiumi/xiumi-ue-v5.css";
import "_p/xiumi/xiumi-ue-dialog-v5.js";

import VueUeditorWrap from "vue-ueditor-wrap";

export default {
  name: "UEditor",
  components: {
    VueUeditorWrap
  },
  props: {
    value: {
      default: () => []
    }
  },
  data() {
    return {
      content: '',
      myConfig: {
        // 编辑器是否自动被内容撑高
        autoHeightEnabled: true,
        // 初始容器高度
        initialFrameHeight: 380,
        // 初始容器高度
        initialFrameWidth: "100%",
        enableAutoSave: false, // 关闭自动保存
        // 上传功能的后端服务器接口地址
        serverUrl: `${server.BASE_URL}Ueditor/doAction`,
        // "http://192.168.1.241/wanpai_admin/public/index.php/Ueditor/doAction",
        // 需要令此处的URL等于对应 ueditor.config.js 中的配置。
        UEDITOR_HOME_URL: server.BASE_URL.includes('192.168.1.241')  ? "/wanpai_h5_package/dist/ueditor/" : "/ueditor/"
      }
    };
  },
  methods: {
    content_input(e) {
      this.$emit("input", e);
    }
  },
  watch: {
    // 保存编辑时父组件传递的内容数据 [数据回显]
    value: {
      immediate: true,
      handler() {
        this.content = this.value;
      }
    }
  }
};
</script>

<style>
</style>