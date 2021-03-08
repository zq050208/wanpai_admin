<template>
  <div class="moduleChoose">
    <!-- 一级tabs选择 -->
    <Tabs value="name1" v-model="oneLevel_tabs" name="oneLevel_tabs" @on-click="tabsClick">
      <TabPane
        :label="item.label"
        :name="item.key"
        v-for="(item, index) in oneTabs"
        :key="index"
        tab="oneLevel_tabs"
      ></TabPane>
    </Tabs>
    <!-- 动态组件 -->
    <component :is="current"></component>
  </div>
</template>

<script>
export default {
  name: "moduleChoose",
  components: {
    moduleSortList: () => import("./components/moduleSortList"), // 模块分类列表
    subModule: () => import("./components/subModule"), // 子模块
    subModuleCollocate: () => import("./components/subModuleCollocate") // 子模块配置
  },
  data() {
    return {
      oneTabs: [
        { key: "moduleSortList", label: "模块分类列表" },
        { key: "subModule", label: "子模块" },
        { key: "subModuleCollocate", label: "子模块配置" }
      ],
      oneLevel_tabs: "moduleSortList",
      current: "moduleSortList"
    };
  },
  methods: {
    tabsClick(name) {
      this.current = name;
      // 保存当前点击tabs到本地
      window.sessionStorage.setItem("oneLevel_tabs_", name);
    }
  },
  created() {
    const tabsName = window.sessionStorage.getItem("oneLevel_tabs_");
    if (tabsName != null) {
      this.current = this.oneLevel_tabs = tabsName;
    }
  },
 
};
</script>

<style>
</style>
