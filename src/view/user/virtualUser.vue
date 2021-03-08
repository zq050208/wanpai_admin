<template>
  <div>
    <p style="margin-bottom:20px">
      <Button type="primary" @click="addVirtualUser">添加虚拟用户</Button>
    </p>
    <Card>
       <SearchForm title="筛选数据" :searchForm="searchForm" :searchData="searchData" />
    </Card>
    <!-- 列表 -->
    <Card class="card">
      <p slot="title">数据列表</p>
      <div slot="extra">
        <Button style="margin-right: 20px" icon="md-cloud-upload" type="primary" @click="exportData">导出数据</Button>
      </div>
      <Table border :columns="columns" :data="data" ref="table"></Table>
       <Page class="page" show-elevator show-sizer show-total :total="total" :current="current" :page-size="per_page" @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange" />
    </Card>
    <!-- 添加虚拟用户 -->
    <Modal v-model="isShowModal" title="添加虚拟用户" :mask-closable="false">
      <Form :label-width="120" ref='userData' :model="userData" :rules="rules">
        <FormItem label="账号数量：" prop="user_num">
          <Input style="width:250px" v-model="userData.user_num" type="number"/>
        </FormItem>
        <FormItem label="关联管理员：" prop="relation_admin">
          <Select style="width:250px" v-model='userData.relation_admin'>
            <Option :value="String(item.id)" v-for="item in addUserData" :key="item.id" :label="item.nickname"></Option>
          </Select>
        </FormItem>
      </Form>
       <div slot="footer">
            <Button type="primary" size="default" :loading="submitLoading" @click="confirmAdd('userData')">确认新增</Button>
        </div>
    </Modal>
    <!-- 编辑虚拟用户 -->
    <Modal v-model="editModal" title="编辑虚拟用户" :mask-closable="false" @on-cancel="cancelEditor">
        <Form :label-width="125" :model="formInline" ref="formInline" :rules="ruleInline">
        <FormItem label="昵称：" prop="nickname">
          <Input style="width: 230px" v-model="formInline.nickname" />
        </FormItem>
        <div v-if="form.password">
          <FormItem label="设置登录密码：" prop="password">
          <Input style="width: 200px" v-model="formInline.password" type="password" />
        </FormItem>
        <FormItem label="再次输入密码：" prop="confirm_password">
          <Input style="width: 200px" v-model="formInline.confirm_password" type="password" />
        </FormItem>
        </div>
        <div v-else>
          <FormItem label="设置登录密码：" prop="password" required>
          <Input style="width: 200px" v-model="formInline.password" type="password" autocomplete="new-password" />
        </FormItem>
        <FormItem label="再次输入密码：" prop="confirm_password" required>
          <Input style="width: 200px" v-model="formInline.confirm_password" type="password" autocomplete="new-password" />
        </FormItem>
        </div>
        <FormItem label="关联管理员：" prop="relation_admin">
          <Select style="width: 200px" v-model="formInline.relation_admin">
            <Option :value="String(item.id)" v-for="item in adminList" :key="item.id" :label="item.nickname"></Option>
          </Select>
        </FormItem>
        <FormItem label="性别：" prop="gender">
          <Select style="width: 100px" v-model="formInline.gender" >
            <Option :value="String(1)" :key="1" label="男"></Option>
            <Option :value="String(2)" :key="2" label="女"></Option>
          </Select>
        </FormItem>
         <FormItem label="头像:" prop="avatar">
          <div>(请上传375*213派对头像，支持扩展名：jpg，png，大小不超过2M)</div>
          <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" >
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="upload"
            :show-upload-list="false"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-success="handleSuccess"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        </Form>
        <div slot="footer">
            <Button type="primary" size="default"  @click="confirmRevision('formInline')">保存修改</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import SearchForm from '@/components/searchForm'
import { getVirtualList, getAddUserData, getAddVirtualUser, getEditUserData, getQiniuToken, editUser, exportVirtualUserList } from '@/api/data.js'
export default {
  components: { SearchForm },
  data () {
    const pwdCheckValidate = (rule, value, callback) => {
      if (!this.form.password) {
        if (!value) {
          callback(new Error('请输入密码'))
        } else if (this.formInline.password !== this.formInline.confirm_password) {
          callback(new Error('两次密码输入不一致'))
        } else if (this.formInline.password === '' || this.formInline.password.length < 8) {
          callback(new Error('请输入至少8位数密码'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!this.form.password) {
        if (this.formInline.password === '' || this.formInline.password.length < 8) {
          callback(new Error('请输入至少8位数密码'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      submitLoading: false,
      isShowModal: false, // 添加虚拟用户弹框显示隐藏
      editModal: false, // 编辑虚拟用户弹框显示隐藏
      total: 1,
      current: 1,
      per_page: 10,
      uploadList: [], // 图片上传列表
      qiniuToken: '', // 七牛云token
      data: [],
      addUserData: [], // 添加虚拟用户数据
      adminList: [],
      userData: {}, // 添加虚拟用户data
      form: {
        password: ''
      },
      formInline: {
        nickname: '',
        password: '',
        confirm_password: '',
        relation_admin: '',
        gender: '',
        avatar: ''
      },
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      searchParams: {
        date: ''
      },
      searchData: {
        date: ''
      },
      searchForm: {
        actions: [
          {
            text: '查询',
            type: 'primary',
            handle: () => {
              this.searchParams = {...this.searchData}
              this.current = 1
              this.getuserList()
            }
          }
        ],
        components: [
          {
            name: 'Input',
            prop: 'content',
            label: '查询内容',
            placeholder: '输入ID/昵称/手机号查询'
          },
          {
            name: 'SelectDate',
            prop: 'date',
            label: '添加时间：'
          }
        ]
      },
      columns: [
        {
          title: '用户ID',
          key: 'user_id',
          align: 'center'
        },
        {
          title: '用户昵称',
          key: 'nickname',
          align: 'center'
        },
        {
          title: '用户账号',
          key: 'username',
          align: 'center'
        },
        {
          title: '头像',
          key: 'avatar',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.avatar },
                style: { width: '50px', height: '50px', margin: '0 auto' }
              })
            ])
          }
        },
        {
          title: '性别',
          key: 'gender',
          align: 'center',
          render: (h, params) => {
            if (params.row.gender === 1) {
              return h('div', {}, '男')
            } else if (params.row.gender === 2) {
              return h('div', {}, '女')
            }
          }
        },
        {
          title: '添加时间',
          key: 'create_time',
          align: 'center'
        },
        {
          title: '所属管理员',
          key: 'relation_admin',
          align: 'center'
        },
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.editorUser(params.row.user_id)
                  }
                }
              }, '编辑')
            ])
          }
        }
      ],
      ruleInline: {
        password: [{ validator: validatePassword }, { trigger: 'blur change' }],
        confirm_password: [{ validator: pwdCheckValidate }, { trigger: 'blur change' }],
        avatar: [{ required: true, message: '请上传头像' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        relation_admin: [{ required: true, message: '请选择关联管理员', trigger: 'change' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
      },
      rules: {
        user_num: [{ required: true, message: '请输入账号数量', trigger: 'blur' }],
        relation_admin: [{ required: true, message: '请选择关联管理员' }]
      }
    }
  },
  mounted () {
    this.getuserList()
    this.getQiniu()
  },
  methods: {
    getuserList () {
      const params = { ...this.searchParams }
      const { date } = this.searchParams
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      var data = {
        page: this.current,
        per_page: this.per_page,
        ...params
      }
      getVirtualList(data).then(res => {
        this.data = res.data.data.data
        this.total = res.data.data.total
        this.per_page = res.data.data.per_page
      })
    },
    getAddUserData () {
      getAddUserData().then(res => {
        if (res.data.code === 200) {
          this.addUserData = res.data.data.admin_list
        }
      })
    },
    addVirtualUser () {
      this.isShowModal = true
      this.getAddUserData()
    },
    // 确定添加
    confirmAdd (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.submitLoading = true
          getAddVirtualUser(this.userData)
            .then(res => {
              if (res.data.code === 200) {
                this.$Message.success('成功')
                this.isShowModal = false
                this.resetAddVirtualUser()
                this.current = 1
                this.getuserList()
              }
              this.submitLoading = false
            })
            .catch(() => {
              this.submitLoading = false
            })
        }
      })
    },
    // 编辑用户
    editorUser (id) {
      this.editModal = true
      getEditUserData({ user_id: id }).then(res => {
        if (res.data.code === 200) {
          this.adminList = res.data.data.admin_list
          this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: res.data.data.user_info.avatar }]
          this.uploadList = this.$refs.upload.fileList
          this.formInline.user_id = String(id)
          this.formInline.avatar = this.uploadList[0].url
          this.formInline.nickname = res.data.data.user_info.nickname
          this.formInline.gender = String(res.data.data.user_info.gender)
          this.formInline.relation_admin = String(res.data.data.user_info.relation_admin)
          if (res.data.data.user_info.password) this.form.password = res.data.data.user_info.password
        }
      })
    },
    // 保存修改
    confirmRevision (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          editUser(this.formInline).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('提交成功')
              this.editModal = false
              this.resetEditorUser()
              this.current = 1
              this.getuserList()
            }
          })
        }
      })
    },
    // 获取七牛云token
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    // 图片上传
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
      this.formInline.avatar = file.url
    },
    // 删除图片
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.formInline.avatar = ''
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
      })
    },
    handleBeforeUpload () {
      const check = this.uploadList.length < 1
      if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
      return check
    },
    // 分页
    handlePageChange (page) {
      this.current = page
      this.getuserList()
    },
    handlePageSizeChange (size) {
      this.per_page = size
      this.getuserList()
    },
    // 关闭编辑
    cancelEditor () {
      this.resetEditorUser()
      this.form.password = ''
    },
    // 重置添加虚拟用户
    resetAddVirtualUser () {
      this.$refs.userData.resetFields()
    },
    resetEditorUser () {
      this.$refs.formInline.resetFields()
    },
    // 导出数据
    exportData () {
      const params = { ...this.searchParams }
      const { date } = this.searchParams
      delete params.date
      if (date) {
        params.start_time = date[0]
        params.end_time = date[1]
      }
      var data = {
        ...params
      }
      exportVirtualUserList(data).then(res => {
        console.log(res)
        if (res.data.code === 200) {
          this.$refs.table.exportCsv({
            filename: '虚拟用户表',
            columns: this.columns,
            data: res.data.data.user_list
          })
        }
      })
    }
  }
}
</script>
<style scoped>
.page {
  margin-top: 20px;
  text-align: center;
}
  .demo-upload-list{
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin-right: 4px;
  }
  .demo-upload-list img{
    width: 100%;
    height: 100%;
  }
  .demo-upload-list-cover{
      display: none;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,.6);
  }
  .demo-upload-list:hover .demo-upload-list-cover{
      display: block;
  }
  .demo-upload-list-cover i{
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      margin: 0 2px;
  }
</style>
