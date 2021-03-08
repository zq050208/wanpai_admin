<template>
  <Card>
    <p slot="title">派对管理</p>
    <Tabs type="line" v-model="tabs_value" @on-click="tabsChange">
      <TabPane label="官方派对" :name="official">
        <Row :gutter="32">
          <Col span="4" class="demo-tabs-style1" style="padding:16px;">
            <Button type="primary" @click="partyShow(true,null)">+新建派对</Button>
          </Col>
          <Col span="8" class="demo-tabs-style1" style="padding:16px;">
            <Input :value="key_word" :search="true" type="text" placeholder="搜索派对ID或名称" @on-search="partySearch" />
          </Col>
        </Row>
        <Table border :columns="columns" :data="data"></Table>
        <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
      </TabPane>
      <TabPane label="用户派对" :name="user">
        <Row :gutter="32">
          <Col span="8" class="demo-tabs-style1" style="padding:16px;">
          <Input :value="key_word1" :search="true" type="text" placeholder="搜索派对ID或名称" @on-search="partySearch" />
          </Col>
        </ROW>
        <Table border :columns="columns1" :data="data1"></Table>
        <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />
      </TabPane>
    </Tabs>

    <Modal :title="(demo_status ? '创建派对' : '修改派对')" v-model="add_visible" width="625" :mask-closable="false">
      <Form :label-width="120" ref="partyData" :model="partyData" :rules="ruleInline">
        <FormItem label="选择圈子:" prop="circle_type">
          <Select v-model="partyData.circle_type" @on-change="selectChange">
            <Option v-for="item in circle_type_list" :key="item.id" :value="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>

        <FormItem label="派对名称:" prop="name">
          <Input type="text" v-model="partyData.name" />
        </FormItem>

        <FormItem label="派对ID:" prop="party_no">
          <Input type="number" v-model="partyData.party_no"/>
        </FormItem>

        <FormItem label="派对标签:" prop="tag_name">
        <div>(请以空格为间隔,最多创建6个标签)</div>
          <Input type="text" v-model="partyData.tag_name"/>
        </FormItem>
        <FormItem label="设置派对封面:" prop="party_img">
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
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            :format="['jpg','jpeg']"
            :before-upload="handleBeforeUpload"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
          <div>只支持.jpg格式</div>
        </FormItem>

        <FormItem label="设置派对背景:" prop="party_backgroud">
          <div class="demo-upload-list" v-for="(item, index) in uploadList_bg" :key="index">
            <template v-if="item.status === 'finished'">
              <img :src="item.url" >
              <div class="demo-upload-list-cover">
                <Icon type="ios-trash-outline" @click="handleRemove_bg(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="upload_bg"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            :show-upload-list="false"
            :format="['jpg','jpeg']"
            :before-upload="handleBeforeUpload_bg"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
          <div>只支持.jpg格式</div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="submitLoading" @click="handleSubmit('partyData')" v-if="demo_status">确定</Button>
        <Button type="primary" size="large" :loading="submitLoading" @click="handleSubmit('partyData')" v-else>修改</Button>
      </div>
    </Modal>

    <Modal title="图片" v-model="visible">
      <Form :label-width="120" :model="viewPartyData" :disabled="true">
        <FormItem label="圈子:" prop="circle_type">
          <Select v-model="viewPartyData.circle_type" @on-change="selectChange">
            <Option v-for="item in circle_type_list" :key="item.id" :value="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>

        <FormItem label="派对名称:" prop="name">
          <Input type="text" v-model="viewPartyData.name" />
        </FormItem>

        <FormItem label="派对ID:" prop="party_no">
          <Input type="number" v-model="viewPartyData.party_no"/>
        </FormItem>

        <FormItem label="派对标签:" prop="tags">
          <Input type="text" v-model="viewPartyData.tags.map(i => i.tag_name).join(' ')"/>
        </FormItem>
        <FormItem label="派对封面图:">
          <img :src="party_img" style="width: 171.5px;height: 63px" >
        </FormItem>
        <FormItem label="派对背景图:">
        <img :src="party_backgroud" style="width: 187.5px;height: 106.5px" >
        </FormItem>
      </Form>
    </Modal>

    <modal v-model="cropperFlag" :mask-closable="false" width='432' :closable="false" @on-ok='onCubeImg'>
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

    <Modal footer-hide title="封禁" v-model="checkPartyVisible" @on-visible-change="blockPartyVisibleChange">
      <Form ref="prohibitForm" :model="prohibitFormData" :rules="prohibitFormRule" :label-width="120">
        <FormItem label="封禁原因：" prop="reason">
          <Select v-model="prohibitFormData.reason">
            <Option v-for="item in prohibitReason" :key="item.id" :value="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem prop="prohibit_hour" label="封禁时长：">
          <Input v-model="prohibitFormData.prohibit_hour" style="width:160px" type="number" number />  小时
        </FormItem>
        <FormItem prop="desc" label="请输入备注（非必填）：">
          <Input v-model="prohibitFormData.desc" type="textarea" :rows="5" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleProhibit">提交</Button>
        </FormItem>
      </Form>
    </Modal>
    <EditModal
      :visible="editVisible"
      :party_id="currentParty.id || -1"
      @hideModal="editVisible = false"
    />
  </Card>
</template>

<script>
import { VueCropper } from 'vue-cropper'
import axios from 'axios'
import { addPartyCode, addParty, getPartyList, getQiniuToken, setAdmin, delController, setNameplate, getPartyDetails, updateParty, joinOfficial, blockParty, getProhibitReason } from '@/api/data'
import EditModal from './editModal'

export default {
  name: 'party',
  components: {
    VueCropper,
    EditModal
  },
  data () {
    const reasonValidator = (rule, value, callback) => {
      if(!value) {
        callback(new Error('请选择封禁原因'))
      }
      callback()
    }
    const hourValidator = (rule, value, callback) => {
      if(!value) {
        callback(new Error('请输入封禁时长'))
      }
      if(!Number.isInteger(value)) {
        callback(new Error('请输入整数'))
      }
      callback()
    }
    return {
      editVisible: false,
      submitLoading: false,

      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      demo_status: true,
      cropperFlag: false,
      tabs_value: '1',
      official: '1',
      user: '0',
      key_word: '', // 关键字
      key_word1: '',
      circle_type_list: {},
      uploadList: [],
      uploadList_bg: [],
      tags: [],
      qiniuToken: '',
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      administrator_id: null,
      add_visible: false,
      visible: false,
      party_img: '',
      party_backgroud: '',
      controller_id: 0,

      currentParty: {},
      checkPartyVisible: false,
      prohibitReason: [],
      prohibitFormData: {
        checkcode: '',
        reason: null,
        prohibit_hour	: '',
        desc: ''
      },
      prohibitFormRule: {
        reason: [
          { validator: reasonValidator }
        ],
        prohibit_hour: [
          { validator: hourValidator }
        ]
      },
      viewPartyData: {
        tags: []
      },

      partyData: {
        checkcode: null, // 校验码
        name: '', // 派对名称
        circle_type: 1, // 圈子分类
        party_no: null, // 派对编号
        tag_name: '', // 派对标签
        party_img: '', // 派对封面
        party_backgroud: '' // 派对背景
      },
      option: {
        img: '', // 裁剪图片的地址
        type: '',
        info: true, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        full: true,     //是否输出原图比例的截图	
        fixed: true,    //是否开启截图框宽高固定比例	
        fixedNumber: [1, 1],  //截图框的宽高比例	
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: false,  // 固定截图框大小 不允许改变
        centerBox: true,  // 截图框是否被限制在图片里面
      },
      ruleInline: {
        name: [{ required: true, message: '请填写派对名称', trigger: 'blur' }, {max: 15, message: '最多输入15个字符'}],
        circle_type: [{ type: 'number', required: true, message: '请选择派对分类', trigger: 'blur' }],
        party_no: [{ required: true, message: '请填写派对编号', trigger: 'blur' }],
        // party_no: [{ required: true, message: '请填写派对编号', trigger: 'blur', pattern: /^[1-9][0-9]{0,5}$/ }],
        tag_name: [{ required: true, message: '请填写派对标签', trigger: 'blur', pattern: /(\s[\u4e00-\u9fa5_a-zA-Z0-9]+){0,5}/ }]
      },
      data: [],
      columns: [
        {
          align: 'center',
          title: '派对封面',
          key: 'party_img',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.party_img },
                style: { width: '50px', height: '50px', margin: '0 auto', display: params.row.party_img ? 'block' : 'none' }
              })
            ])
          }
        },
        {
          align: 'center',
          title: '派对名称',
          key: 'name'
        },
        {
          align: 'center',
          title: '派对ID',
          key: 'party_no'
        },
        {
          align: 'center',
          title: '创建时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '管理员',
          className: 'amend',
          render: (h, params) => {
            return h('div', [
              h('div', {}, params.row.controller_name ? params.row.controller_name : ''),
              h('div', {}, params.row.controller_id ? params.row.controller_id : '')
            ])
          }
        },
        {
          align: 'center',
          title: '派对详情',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.party_id = params.row.id
                    this.partyShow(false, params)
                  }
                }
              }, '修改')
            ])
          }
        },
        {
          align: 'center',
          title: '铭牌详情',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.editVisible = true
                    this.currentParty = {...params.row}
                  }
                }
              }, '查看铭牌')
            ])
          }
        },
        {
          align: 'center',
          title: '铭牌权限',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: params.row.nameplate_permission ? 'error' : 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.setNameplate(params)
                  }
                }
              }, params.row.nameplate_permission === 0 ? '开启' : '取消')
            ])
          }
        },
        {
          align: 'center',
          title: '操作',
          width: 260,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                style: { marginRight: '12px'},
                props: { type: params.row.controller_id ? 'error' : 'primary', size: 'small' },
                on: {
                  click: () => {
                    if(params.row.controller_id) {
                      this.$Modal.confirm({
                        title: '提示',
                        title: '删除后将不可复原，确认删除该管理吗？',
                        onOk: () => {
                          this.delController({id: params.row.id})
                        }
                      })
                    } else {
                      this.isShow(params)
                    }
                  }
                }
              }, params.row.controller_id ? '删除管理' : '新增管理'),
              h('Button', {
                style: { marginRight: '12px'},
                props: { type: 'default', size: 'small', disabled: params.row.party_type === 1 },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                        title: '确定要踢出官方吗？',
                        onOk: () => {
                          this.joinOfficial({
                            join_official: 0,
                            id: params.row.id
                          })
                        }
                      })
                  }
                }
              }, '踢出官方'),
              h('Button', {
                props: { type: params.row.status === 1 ? 'error' : 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.currentParty = {...params.row}
                    if(params.row.status === 2) {
                      this.$Modal.confirm({
                        title: `确定要${params.row.status === 1 ? '封禁' : '解封'}派对吗？`,
                        onOk: () => {
                          this.getProhibitReason().then(res => {
                            this.prohibitFormData.checkcode = res.checkcode
                            this.blockParty()
                          })
                        }
                      })
                    } else {
                      this.checkPartyVisible = true
                    }
                  }
                }
              }, params.row.status === 1 ? '封禁' : '解封')
            ])
          }
        }
      ],
      data1: [],
      columns1: [
        {
          align: 'center',
          title: '派对封面',
          key: 'party_img',
          render: (h, params) => {
            return h('div', [
              h('img', {
                attrs: { src: params.row.party_img },
                style: { width: '50px', height: '50px', margin: '0 auto', display: params.row.party_img ? 'block' : 'none' }
              })
            ])
          }
        },
        {
          align: 'center',
          title: '派对名称',
          key: 'name'
        },
        {
          align: 'center',
          title: '派对ID',
          key: 'party_no'
        },
        {
          align: 'center',
          title: '创建时间',
          key: 'create_time'
        },
        {
          align: 'center',
          title: '派对管理',
          className: 'amend',
          render: (h, params) => {
            return h('div', [
              h('div', {}, params.row.controller_name ? params.row.controller_name : ''),
              h('div', {}, params.row.controller_id ? params.row.controller_id : '')
            ])
          }
        },
        {
          align: 'center',
          title: '派对详情',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.viewPartyData = {...params.row}

                    this.visible = true
                    this.tags = params.row.tags
                    this.party_img = params.row.party_img
                    this.party_backgroud = params.row.party_backgroud
                  }
                }
              }, '查看详情')
            ])
          }
        },
        {
          title: '铭牌权限',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: params.row.nameplate_permission ? 'error' : 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.setNameplate(params)
                   }
                }
              }, params.row.nameplate_permission === 0 ? '开启' : '取消')
            ])
          }
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: 'primary', size: 'small', disabled: params.row.join_official === 1 || params.row.status !== 1 },
                on: {
                  click: () => {
                    this.joinOfficial({
                      join_official: 1,
                      id: params.row.id
                    })
                  }
                }
              }, '加入官方'),
              h('Button', {
                props: { type: params.row.status === 1 ? 'primary' : 'error', size: 'small' },
                style: { marginLeft: '12px'},
                on: {
                  click: () => {
                    this.currentParty = {...params.row}
                    if(params.row.status === 1) {
                      this.checkPartyVisible = true
                    } else {
                      this.$Modal.confirm({
                        title: `确定要解封此派对吗？`,
                        onOk: () => {
                          this.getProhibitReason().then(res => {
                            this.prohibitFormData.checkcode = res.checkcode
                            this.blockParty()
                          })
                        }
                      })
                    }
                  }
                }
              }, params.row.status === 1 ? '封禁' : '解封')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getQiniu()
    this.getPartyList(this.tabs_value)
    addPartyCode().then(res => {
      if (res.data.code === 200) {
        this.circle_type_list = res.data.data.circle_type
      }
    })
  },
  methods: {
    handleProhibit() {
      this.$refs.prohibitForm.validate(valid => {
        if(valid) {
          this.blockParty()
        }
      })
    },
    blockPartyVisibleChange(visible) {
      if(visible) {
        this.getProhibitReason().then(res => {
          this.prohibitReason = res.prohibit_reason
          this.prohibitFormData.checkcode = res.checkcode
        })
      } else {
        this.$refs.prohibitForm.resetFields()
      }
    },
    getProhibitReason() {
      return new Promise((resolve, rejevce) => {
        getProhibitReason()
          .then(res => {
            if(res.data.code === 200) {
              resolve(res.data.data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    delController(data) {
      delController(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('删除成功')
          this.getPartyList(this.tabs_value)
        }
      })
    },
    tabsChange (name) { // tabs切换
      this.tabs_value = name
      this.getPartyList(this.tabs_value)
    },
    selectChange(value) {
      this.partyData.circle_type = value
    },
    pageChange (e) { // 分页切换
      this.current = e
      this.getPartyList(this.tabs_value)
    },
    partySearch (e) { // 搜索
      this.current = 1
      if (this.tabs_value === '1') this.key_word = e
      else this.key_word1 = e
      this.getPartyList(this.tabs_value)
    },
    getPartyList (type) { // 获取派对列表
      var obj = { join_official: type, page: this.current, per_page: this.per_page }
      if (type === '1') obj.key_word = this.key_word
      else obj.key_word = this.key_word1
      getPartyList(obj).then(res => {
        if (res.data.code === 200) {
          if (this.tabs_value === '1') this.data = res.data.data.data
          else this.data1 = res.data.data.data
          this.total = res.data.data.total
          this.last_page = res.data.data.last_page
        }
      })
    },
    addParty () { // 创建派对
      this.submitLoading = true
      const data = {...this.partyData}
      data.tag_name = JSON.stringify(data.tag_name.trim().split(/\s+/))
      addParty(data)
        .then(res => {
          if (res.data.code === 200) {
            this.cancel()
            this.$Message.success('创建成功')
            this.getPartyList(this.tabs_value)
          }
          this.submitLoading = false
        })
        .catch(err => {
          this.submitLoading = false
        })
    },
    joinOfficial(data) { // 用户派对加入/取消加入 官方
      joinOfficial(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('操作成功')
          this.getPartyList(this.tabs_value)
        }
      })
    },
    updateParty () { // 修改派对
      this.submitLoading = true
      const data = {...this.partyData}
      data.tag_name = JSON.stringify(data.tag_name.trim().split(/\s+/))
      data.params = this.party_id
      updateParty(data)
        .then(res => {
          if (res.data.code === 200) {
            this.cancel()
            this.$Message.success('修改成功')
            this.getPartyList(this.tabs_value)
          }
          this.submitLoading = false
        })
        .catch(err => {
          this.submitLoading = false
        })
    },
    partyShow (type, params) {
      this.$refs['partyData'].resetFields()
      this.party_img = ''
      this.party_backgroud = ''
      this.uploadList = this.$refs.upload.fileList = []
      this.uploadList_bg = this.$refs.upload_bg.fileList = []
      if (type) {
        this.demo_status = true
        addPartyCode().then(res => {
          if (res.data.code === 200) {
            this.add_visible = true
            this.partyData.checkcode = res.data.data.checkcode
            this.circle_type_list = res.data.data.circle_type
          }
        })
      } else {
        this.demo_status = false
        addPartyCode().then(res => {
          if (res.data.code === 200) {
            this.add_visible = true
            this.partyData.checkcode = res.data.data.checkcode
            this.circle_type_list = res.data.data.circle_type
          }
        }).then(() => {
          getPartyDetails(params.row.id).then(res => {
            if (res.data.code === 200) {
              var tags = res.data.data.tags
              var str = ''
              if (tags.length >= 1) tags.forEach(item => { str += item.tag_name + ' ' })
              this.partyData = {
                checkcode: this.partyData.checkcode,
                circle_type: res.data.data.circle_type,
                name: res.data.data.name,
                party_no: res.data.data.party_no + '',
                tag_name: str.trim(),
                party_img: res.data.data.party_img,
                party_backgroud: res.data.data.party_backgroud
              }
              this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: res.data.data.party_img }]
              this.$refs.upload_bg.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: res.data.data.party_backgroud }]
              this.uploadList = this.$refs.upload.fileList
              this.uploadList_bg = this.$refs.upload_bg.fileList
            }
          })
        })
      }
    },
    cancel () {
      this.visible = false
      this.add_visible = false
    },
    isShow (params) {
      this.administrator_id = null
      this.$Modal.confirm({
        render: (h) => {
          return h('Input', {
            props: { value: this.administrator_id, autofocus: true, placeholder: '请输入管理员ID' },
            on: { input: (val) => { this.administrator_id = val.trim() } }
          })
        },
        onOk: () => {
          if (this.administrator_id || this.administrator_id === 0) {
            setAdmin({ id: params.row.id, controller_id: this.administrator_id }).then(res => {
              if (res.data.code === 200) {
                this.$Message.success('添加管理员成功!')
                this.getPartyList(this.tabs_value)
              }
            })
          } else {
            this.$Message.error('请填写管理员ID')
          }
        }
      })
    },
    setNameplate (params) {
      this.$Modal.confirm({
        title: '确定' + (params.row.nameplate_permission === 0 ? '开启' : '关闭') + '名牌权限？',
        onOk: () => {
          setNameplate({ id: params.row.id, nameplate_permission: params.row.nameplate_permission === 0 ? 1 : 0 }).then(res => {
            if (res.data.code === 200) {
              this.$Message.success('设置成功!')
              this.getPartyList(this.tabs_value)
            }
          })
        }
      })
    },
    blockParty() {
      const data = {
        id: this.currentParty.id,
        status: this.currentParty.status === 1 ? 2 : 1,
        ...this.prohibitFormData
      }
      blockParty(data).then(res => {
        if(res.data.code === 200) {
          this.$Message.success('操作成功')
          this.checkPartyVisible = false
          this.getPartyList(this.tabs_value)
        }
      })
    },
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (!this.partyData.party_img) {
            this.$Message.error('请上传派对封面!')
            return
          } else if (!this.partyData.party_backgroud) {
            this.$Message.error('请上传派对背景图!')
            return
          }
          if (this.demo_status) this.addParty()
          else this.updateParty()
        }
      })
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.partyData.party_img = ''
    },
    onCubeImg () { // 确定裁剪图片
      // 获取cropper的截图的base64 数据
      var that = this
      this.$refs.cropper.getCropData(data => {
        let file = this.convertBase64UrlToBlob(data)
        var formData = new FormData()
        formData.append('file', file)
        formData.append('token', this.qiniuToken)
        const url = 'http://upload-z2.qiniu.com/'
        axios.post(url, formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/octet-stream' } })
          .then(res => {
            if (res.status === 200) {
              if (this.option.type === 'hdfile') {
                this.partyData.party_img = this.imageBaseUrl + res.data.key
                this.uploadList.push({
                  status: 'finished',
                  url: this.partyData.party_img
                })
              } else if (this.option.type === 'bgfile') {
                this.partyData.party_backgroud = this.imageBaseUrl + res.data.key
                this.uploadList_bg.push({
                  status: 'finished',
                  url: this.partyData.party_backgroud
                })
              }
            } else {
              that.$Message.error('上传失败')
            }
          })
      })
      this.option.img = ''
      this.cropperFlag = false
    },
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob (urlData) {
      let bytes = window.atob(urlData.split(',')[1])// 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length)
      let ia = new Uint8Array(ab)
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/jpeg' })
    },
    // 拿到需要截图图片
    getPic (file, type) {
      if(file.type !== 'image/jpg' && file.type !== 'image/jpeg') {
        this.$Modal.error({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 格式的图片。'
        })
        return false
      }
      var reader = new FileReader()
      reader.onload = e => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
      }
      reader.readAsDataURL(file)
      if(type === 'cover') {
        // this.option.autoCropWidth = 232
        // this.option.autoCropHeight = 232
        this.option.fixedNumber = [1, 1]
        this.$refs.cropper.refresh()
      } else {
        // this.option.autoCropWidth = 300
        // this.option.autoCropHeight = 534
        this.option.fixedNumber = [300, 534]
        this.$refs.cropper.refresh()
      }
      this.cropperFlag = true
    },
    handleBeforeUpload (file) {
      this.uploadList = []
      this.option.type = 'hdfile'
      this.getPic(file, 'cover')
      return false
    },
    handleRemove_bg (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload_bg.fileList
      this.$refs.upload_bg.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList_bg = this.$refs.upload_bg.fileList
      this.partyData.party_backgroud = ''
    },
    handleBeforeUpload_bg (file) {
      this.uploadList_bg = []
      this.option.type = 'bgfile'
      this.getPic(file, 'background')
      return false
    }
  }
}
</script>

<style lang="less">
  .page{
    margin-top: 20px;
    text-align: center;
  }
  .amend div{
    text-align: center !important;
  }
  .demo-upload-list{
    display: inline-block;
    width: 105px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin: 0px 4px;
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
    .info {
    width: 720px;
    margin: 0 auto;
    .oper-dv {
      height:20px;
      text-align:right;
      margin-right:100px;
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
  .cropper{
    width: 400px;
    height: 400px;
  }
</style>
