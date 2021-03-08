<template>
  <div>
    <Card>
      <Tabs type="card"  @on-click="changeTab">
        <TabPane label="安卓"></TabPane>
        <TabPane label="IOS"></TabPane>
      </Tabs>
      <Button type="primary" @click="addNewVersion('add')">添加新版本</Button>
      <Table border :columns="columns" :data="list" ref="table"></Table>
      <Page class="page" show-elevator show-sizer show-total :total="pageParams.total" :current="pageParams.current" :page-size="pageParams.per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- 添加/修改新版本 -->
  <Modal v-model="NewVersionModal" :title="versionTitle" width="500" height="500">
    <Form ref='formData' :model="formData" :rules="rules" :label-width="120">
      <FormItem label="版本号：" prop="name">
        <Input v-model="formData.name" type="text" style="width: 200px;"/>
      </FormItem>
      <FormItem label="安装包:" v-if="currentTab === 0">
        <Upload
            ref="package"
            type="drag"
            action="//upload-z2.qiniu.com"
            :format="['apk']"
            :data="{ token: qiniuToken }"
            :on-format-error="handleFormatError"
            :on-success="handlePackageSuccess"
            :on-error="handleError"
            :on-remove="removePackage"
            style="width:120px"
          >
          <div>
            <Icon type="md-add-circle" size="20" style="color: #3399ff" />
            <p>上传安装包</p>
          </div>
        </Upload>
      </FormItem>
      <FormItem label="更新类型：" prop="updateType">
        <Select v-model="formData.updateType" style="width:200px">
            <Option v-for="item in updateTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </FormItem>
      <FormItem label="版本更新内容：" prop="content">
        <Input v-model="formData.content" type="textarea" style="width: 200px;"/>
      </FormItem>
    </Form>
  </Modal>
  
  </div>
</template>
<script>
import {  } from '@/api/data'
export default {
  data(){
    return {
      formData: {
        name: '',
        updateType: 0,
        content: '',
        download_url: ''
      },
      updateTypeList: [
        {label: '正常更新',value: 0},
        {label: '强制更新',value: 1}
      ],
      rules: {
        name: [{ required: true, message: '请输入版本名称' }],
        content: [{ required: true, message: '请输入更新内容' }],
      },
      pageParams: {
        total: 1,
        current: 1,
        per_page: 10
      },
      qiniuToken: '',
      currentTab: 0,
      NewVersionModal: false,
      versionTitle: '添加新版本（安卓）',
      list: [
        {
          id: '2',
          version: 'v2.1.0',
          content: '更新内容',
          type: '正常更新',
          update_time: '2019-12-30 20:32:12',
          upload_time: '2019-12-30 20:32:12',
        }
      ],
      columns: [
        {
          title: '序号',
          key: 'id',
          align: 'center',
          width: '80px'
        },
        {
          title: '版本号',
          key: 'name',
          align: 'center'
        },
        {
          title: '更新内容',
          key: 'content',
          align: 'center',
        },
        {
          title: '更新类型',
          key: 'type',
          align: 'center',
        },
        {
          title: '更新时间',
          key: 'update_time',
          align: 'center'
        },
        {
          title: '上传时间',
          key: 'upload_time',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'default'
                },
                on: {
                  click: () => {
                    this.addNewVersion("edit")
                  }
                },
                style: {
                  'margin-right': '20px'
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'default'
                },
                on: {
                  click: () => {
                    
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
    }
  },
  mounted(){

  },
  methods: {
    getDataList(){

    },
    addNewVersion(type){
      this.NewVersionModal = true
      if(this.currentTab === 0) {
        if(type === 'add'){
          this.versionTitle = '添加新版本（安卓）'
        }else{
          this.versionTitle = '修改新版本（安卓）'
        }
      } else {
        if(type === 'add'){
          this.versionTitle = '添加新版本（IOS）'
        }else{
          this.versionTitle = '修改新版本（IOS）'
        }
      }
    },
    changeTab(name){
      this.currentTab = name
      console.log('11',name)
    },
    // 页码
    handlePageChange(page) {
      this.pageParams.current = page;
      this.getDataList();
    },
    handlePageSizeChange(size) {
      this.pageParams.current = 1;
      this.pageParams.per_page = size;
      this.getDataList();
    },
    // 上传安装包
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
    handleError(error, file) {
      this.$Modal.error({
        title: "上传失败",
        content: "文件 " + file.name + " 上传失败"
      });
    },
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
</style>


