<template>
  <div class="subModuleCollocate">
    <Card>
      <!-- 头部tabs标签区域 -->
      <Tabs :animated="false" v-model="currentTabIndex" @on-click="handleClick">
        <TabPane
          :label="item.category_name"
          :name="''+item.index"
          v-for="item in templateList"
          :key="item.id"
        ></TabPane>
      </Tabs>

      <!-- 动态切换组件 -->
      <component
        :is="current"
        :ids="params.submod_id"
        :template_id="template_id"
        :currentTabIndex="currentTabIndex"
        :id="id"
        :key="id"
        ref="img_text_content"
      ></component>
    </Card>
  </div>
</template>

<script>
import {
  getSubmodular,
  TemContentIndexContent,
  BannerTempIndexContent
} from "@/api/data";
import { arrSort } from "@/libs/util";
export default {
  name: "subModuleCollocate",
  components: {
    Img_banner(resolve) {
      require(["./subModuleCollocate/img_bannerModule"], resolve);
    },
    AboveAndBelow(resolve) {
      require(["./subModuleCollocate/aboveAndBelow_Module"], resolve);
    }
  },
  data() {
    return {
      id: "", //当前激活的tabs的id
      current: "",
      templateList: [], // 子模块模板列表
      subModuleData: [], // 子模块下的内容
      currentTabIndex: "0",
      game_id: "", // 游戏id
      params: {
        page: 1,
        per_page: 10,
        submod_id: ""
      },
      total: "",
      subModuleId: "",
      template_id: "",
      tableTitle: {
        nameText: "",
        imgText: ""
      }
    };
  },
  methods: {
    // tabs切换事件
    handleClick(index) {
      this.template_id = this.templateList[index].template_id;
      this.currentTabIndex = index;
      this.$nextTick(() => {
        // 根据当前激活的tabs下标,取得对应的子模块template_id ,根据temalate_id渲染不同组件
        if (this.template_id < 3) {
          this.current = "Img_banner";
        } else {
          this.current = "AboveAndBelow";
        }
        // 保存二级Tbas到本地
        window.sessionStorage.setItem("towLeve_Tbas", [
          index,
          this.current,
          this.templateList[this.currentTabIndex].id,
          this.template_id
        ]);
      });
    },
    // 获取子模块模板列表
    getSubmodular() {
      getSubmodular(this.game_id).then(({ data }) => {
        let count = 0;
        if (data.code === 200) {
          // 这里的代码解决tabs切换和数据重新请求渲染的问题
          let list = data.data.sort(arrSort("template_id"));
          list.forEach((item,index) => {
            item.index = count++;
            if (item.template_id == 6) {
              list.splice(index, 1);
            }
          });
          this.templateList = list;
          let tabsName = window.sessionStorage.getItem("towLeve_Tbas");
          if (this.templateList.length > 0 && tabsName == undefined) {
            // 拿到当前激活的tabs的template_id 与 submod_id 默认激活第0个tabs
            this.template_id = this.templateList[0].template_id;
            this.params.submod_id = this.templateList[0].id;
            this.getSubModularData();
          }
        }
      });
    },
    // 获取模块下的内容列表
    getSubModularData() {
      // 根据template_id 请求不同的接口,渲染不同组件
      if (this.template_id >= 3) {
        this.current = "AboveAndBelow";
        TemContentIndexContent(this.params).then(res => {
          this.saveData(res.data);
        });
      } else {
        this.current = "Img_banner";
        BannerTempIndexContent(this.params).then(res => {
          this.saveData(res.data);
        });
      }
    },
    saveData(data) {
      let arr = data.data.data.sort(arrSort("is_show"));
      if (data.code === 200) {
        this.subModuleData = data.data.data;
        this.total = data.data.total;
      }
    }
  },
  mounted() {
    let tabsName = window.sessionStorage.getItem("towLeve_Tbas");
    if (tabsName != undefined) {
      this.current = tabsName.split(",")[1];
      this.currentTabIndex = tabsName.split(",")[0];
      this.params.submod_id = tabsName.split(",")[2];
      this.template_id = tabsName.split(",")[3];
    }
    this.game_id = this.$route.query.id;
    this.getSubmodular();
  },

  watch: {
    // 检测当前tabs变化 ,切换渲染不同的组件,或者请求不同的数据
    currentTabIndex: {
      handler: function() {
        this.$nextTick(() => {
          if (this.templateList.length > 0) {
            this.params.submod_id = this.templateList[this.currentTabIndex].id;
            this.template_id = this.templateList[
              this.currentTabIndex
            ].template_id;

            this.getSubModularData();
          }
        });
      }
      // immediate: true
    }
  }
};
</script>

<style lang='less' scoped>
.subModuleCollocate {
  .addOrEdit {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
}
</style>
