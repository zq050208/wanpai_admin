<template>
  <div class="subModuleCollocate">
    <template v-if="templateList.length>0">
      <Card>
        <!-- 二级tabs -->
        <Tabs v-model="twoLevel_tabs" name="towLevel_tabs" @on-click="two_tabsClick">
          <TabPane
            tab="towLevel_tabs"
            :label="item.category_name"
            :name="''+item.id"
            v-for="item  in templateList"
            :key="item.id"
          ></TabPane>
        </Tabs>
        <!-- 动态组件 -->
        <component :is="current" :current_template_id="current_template_id" :submod_id="submod_id"></component>
      </Card>
    </template>
    <template v-else>
      <Col class="demo-spin-col" span="10">
        <Spin fix>{{spinTxt}}</Spin>
      </Col>
    </template>
  </div>
</template>

<script>
import {
  getSubmodular,
  TemContentIndexContent,
  BannerTempIndexContent,
  getSubModularList
} from "@/api/data";
import { arrSort } from "@/libs/util";

export default {
  name: "subModuleCollocate",
  components: {
    pic_banner: () => import("./components/pic_banner"),
    txt_banner: () => import("./components/txt_banner")
  },
  data() {
    return {
      current: "",
      templateList: [],
      twoLevel_tabs: "",
      current_template_id: null,
      submod_id: null,
      spinTxt:'加载中...'
    };
  },
  methods: {
    async getSubModularList() {
      // 获取保存在本地的tabs
      const tabsName = window.sessionStorage.getItem("towLevel_tabs_");
      // 获取子模块列表
      let { data } = await getSubModularList({
        game_id: this.$route.query.id,
        per_page: 999
      });
      // 根据id排序子模块,并且切割管理员模块
      data.data.data.sort(arrSort("template_id")).forEach((item, index) => {
        item.template_id === 6 && data.data.data.splice(index, 1);
      });
      this.templateList = data.data.data;
      this.$nextTick(()=>{ data.data.data.length<=0 && (this.spinTxt = '暂无子模块,请添加子模块')})
      // 判断本地有没有保存tabsName template_id id , 没有则取第0个
      if (data.data.data.length > 0) {
        this.current_template_id = tabsName
          ? tabsName.split(",")[2]
          : data.data.data[0].template_id;
        this.submod_id = tabsName
          ? tabsName.split(",")[0]
          : data.data.data[0].id;

        if (tabsName != null) {
          this.twoLevel_tabs = tabsName.split(",")[0];
          this.current = tabsName.split(",")[1];
        } else {
          this.current =
            data.data.data[0].template_id < 3 ? "pic_banner" : "txt_banner";
        }
      }
    },
    two_tabsClick(name) {
      this.templateList.find(item => {
        if (item.id == name) {
          this.current = item.template_id < 3 ? "pic_banner" : "txt_banner";
          this.current_template_id = item.template_id;
          this.submod_id = item.id;
          // 保存当前点击tabs到本地
          window.sessionStorage.setItem("towLevel_tabs_", [
            name,
            this.current,
            this.current_template_id
          ]);
          return;
        }
      });
    }
  },
  created() {
    this.getSubModularList();
  }
};
</script>

<style>
.demo-spin-col {
  margin-top: 20px;
}
</style>
