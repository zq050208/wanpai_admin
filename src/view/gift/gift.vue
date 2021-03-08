<template>
  <Card>
    <div class="box" :class="(special_zIndex ? 'special_show' : 'special_hide')" >
      <div id="demoCanvas" ref="demoCanvas"></div>
    </div>
    <Form inline :label-width="80">
      <FormItem label="礼物所属：">
        <Select v-model="giftData.belong_module" @on-change="giftQuery">
          <Option :value="0" :key="0" label="全部"></Option>
          <Option :value="1" :key="1" label="直播"></Option>
          <Option :value="2" :key="2" label="玩派"></Option>
        </Select>
      </FormItem>
      <FormItem label="礼物类别：">
        <Select v-model="giftData.category" @on-change="giftQuery">
          <Option :value="0" :key="0" label="全部"></Option>
          <Option :value="1" :key="1" label="铜钱"></Option>
          <Option :value="2" :key="2" label="积分"></Option>
        </Select>
      </FormItem>
      <FormItem label="上架状态：">
        <Select v-model="giftData.is_show" @on-change="giftQuery">
          <Option :value="0" :key="0" label="全部"></Option>
          <Option :value="1" :key="1" label="上架"></Option>
          <Option :value="2" :key="2" label="下架"></Option>
        </Select>
      </FormItem>
      <FormItem label="礼物类型：">
        <Select v-model="giftData.type" @on-change="giftQuery">
          <Option :value="0" :key="0" label="全部"></Option>
          <Option :value="1" :key="1" label="普通礼物"></Option>
          <Option :value="2" :key="2" label="轨迹礼物"></Option>
          <Option :value="3" :key="3" label="特效礼物"></Option>
        </Select>
      </FormItem>
      <FormItem label="关键字：">
        <Input :search="true" type="text" v-model="giftData.key_word" @on-search="partySearch" />
      </FormItem>

      <Button type="primary" @click="giftQuery">查询</Button>

      <FormItem label="" >
        <Button type="primary" @click="modelShow(true)">上传新礼物</Button>
      </FormItem>
    </Form>

    <Table border :columns="columns" :data="data"></Table>
    <Page class="page" :total="total" :current="current" :page-size="per_page" @on-change="pageChange" />

    <Modal :title="(demo_status ? '新增礼物' : '编辑礼物')" v-model="visible" width="625" :mask-closable="false">
      <Form :label-width="100" ref="giftAddData" :model="giftAddData" :rules="ruleInline">
        <FormItem label="礼物名称:" prop="name">
          <Input type="text" v-model="giftAddData.name" />
        </FormItem>
        <FormItem label="排序:" prop="sort">
          <Input number v-model="giftAddData.sort" placeholder="值越大越靠前" />
        </FormItem>
        <FormItem label="礼物价格:" prop="price">
          <Input number v-model="giftAddData.price"/>
        </FormItem>
        <FormItem label="礼物类别:" prop="category">
          <Select v-model="giftAddData.category">
            <Option :value="1" :key="1" label="铜钱"></Option>
            <Option :value="2" :key="2" label="积分"></Option>
          </Select>
        </FormItem>
        <FormItem label="礼物所属:" prop="belong_module">
          <Select v-model="giftAddData.belong_module">
            <Option :value="1" :key="1" label="直播"></Option>
            <Option :value="2" :key="2" label="玩派"></Option>
          </Select>
        </FormItem>
        <FormItem label="礼物类型:" prop="type">
          <Select v-model="giftAddData.type">
            <Option :value="1" :key="1" label="普通礼物"></Option>
            <Option :value="2" :key="2" label="轨迹礼物"></Option>
            <Option :value="3" :key="3" label="特效礼物"></Option>
          </Select>
        </FormItem>
        <FormItem label="是否上架:" prop="is_show">
          <Select v-model="giftAddData.is_show">
            <Option :value="1" :key="1" label="上架"></Option>
            <Option :value="2" :key="2" label="下架"></Option>
          </Select>
        </FormItem>

        <FormItem label="礼物缩略图:" prop="image" style="margin-bottom: 0">
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
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
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

        <FormItem label="礼物图片:" prop="thumb_image" style="margin-bottom: 0">
          <div>(请上传375*213派对背景图，支持扩展名：jpg，png，大小不超过2M)</div>
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
            :show-upload-list="false"
            :on-success="handleSuccess_bg"
            :format="['jpg','jpeg','png']"
            :max-size="2048"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload_bg"
            type="drag"
            action="//upload-z2.qiniu.com"
            :data="{ token: qiniuToken }"
            style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-cloud-upload-outline" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>

        <FormItem label="特效礼物图:" prop="thumb_image" style="margin-bottom: 0" v-if="giftAddData.type === 3">
          <div>(请上传375*213派对背景图，支持扩展名：svg，svga，大小不超过2M)</div>
          <div class="demo-upload-list" v-for="(item, index) in uploadList_svg" :key="index">
            <template v-if="item.status === 'finished'">
              <div>{{item.name}}</div>
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView(item)"></Icon>
                <Icon type="ios-trash-outline" @click="handleRemove_svg(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="upload_svg"
            :show-upload-list="false"
            :on-success="handleSuccess_svg"
            :format="['svg','svga']"
            :max-size="2048"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload_svg"
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
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit('giftAddData')" v-if="demo_status">确定</Button>
        <Button type="primary" size="large" @click="handleSubmit('giftAddData')" v-else>编辑</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import { getQiniuToken, getGiftList, deleteGift, shelfGift, getGiftCode, addGift, updateGift } from '@/api/data'
import SVGA from 'svgaplayerweb'
export default {
  name: 'gift',
  data () {
    return {
      demo_status: true,
      uploadList: [],
      uploadList_bg: [],
      uploadList_svg: [],
      qiniuToken: '',
      special_zIndex: false,
      imageBaseUrl: 'https://cdn.tinytiger.cn/',
      visible: false,
      ruleInline: {
        name: [{ required: true, message: '请填写礼物名称', trigger: 'blur' }],
        sort: [{ required: true, message: '礼物排序不能为空且必须为数字', trigger: 'blur', type: 'number' }],
        price: [{ required: true, message: '礼物价格不能为空且必须为数字', trigger: 'blur', type: 'number' }]
      },
      giftAddData: {
        checkcode: null,
        name: null,
        belong_module: 1,
        sort: null,
        category: 1,
        price: null,
        type: 1,
        is_show: 1,
        image: '',
        thumb_image: '',
        special_image: ''
      },

      total: 0,
      current: 1,
      per_page: 10,
      last_page: 0,
      giftData: {
        belong_module: 0,
        category: 0,
        is_show: 0,
        type: 0,
        key_word: null
      },
      data: [],
      columns: [
        {
          title: '礼物ID',
          key: 'id',
          width: '80px'
        },
        {
          title: '排序',
          key: 'sort',
          width: '80px'
        },
        {
          title: '礼物所属',
          width: '100px',
          render: (h, params) => {
            return h('div', {}, params.row.belong_module === 1 ? '直播' : '玩派')
          }
        },
        {
          title: '礼物名称',
          key: 'name',
          width: '100px'
        },
        {
          title: '礼物缩略图',
          width: '100px',
          className: 'giftImg',
          render: (h, params) => {
            return h('img', { attrs: { src: params.row.thumb_image }, style: { width: '50px', height: '50px' } })
          }
        },
        {
          title: '礼物图片',
          width: '100px',
          render: (h, params) => {
            return h('img', { attrs: { src: params.row.image }, style: { width: '50px', height: '50px' } })
          }
        },
        {
          title: '礼物类型',
          key: 'type',
          width: '100px',
          render: (h, params) => {
            if (params.row.type === 1) return h('div', {}, '普通礼物')
            else if (params.row.type === 2) return h('div', {}, '轨迹礼物')
            else if (params.row.type === 3) return h('div', {}, '特效礼物')
          }
        },
        {
          title: '礼物特效图',
          width: '100px',
          render: (h, params) => {
            if (params.row.type === 3) {
              return h('Button', {
                props: { type: 'primary', size: 'small' },
                on: { click: () => { this.SVGA(params.row.special_image) } }
              }, '点击播放')
            }
          }
        },
        {
          title: '礼物上架时间',
          key: 'show_time'
        },
        {
          title: '价格',
          key: 'price',
          width: '100px'
        },
        {
          title: '礼物类别',
          width: '100px',
          render: (h, params) => {
            return h('div', {}, params.row.category === 1 ? '铜钱' : '积分')
          }
        },
        {
          title: '上架状态',
          width: '100px',
          render: (h, params) => {
            return h('div', {}, params.row.is_show === 1 ? '上架' : '下架')
          }
        },
        {
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: { type: params.row.is_show === 1 ? 'error' : 'primary', size: 'small' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '确认' + (params.row.is_show === 1 ? '下架' : '上架') + '该礼物',
                      onOk: () => { this.shelfGift(params.row) }
                    })
                  }
                }
              }, params.row.is_show === 1 ? '下架' : '上架'),
              h('Button', {
                props: { type: 'primary', size: 'small' },
                style: { marginLeft: '15px' },
                on: {
                  click: () => {
                    this.modelShow(false)
                    this.giftAddData = {
                      checkcode: this.giftAddData.checkcode,
                      name: params.row.name,
                      belong_module: params.row.belong_module,
                      sort: Number(params.row.sort),
                      category: params.row.category,
                      price: Number(params.row.price),
                      type: params.row.type,
                      is_show: params.row.is_show,
                      image: params.row.image,
                      thumb_image: params.row.thumb_image,
                      special_image: params.row.special_image,
                      params: params.row.id
                    }
                    this.$refs.upload.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: params.row.image }]
                    this.$refs.upload_bg.fileList = [{ percentage: 100, showProgress: false, status: 'finished', url: params.row.thumb_image }]
                    this.uploadList = this.$refs.upload.fileList
                    this.uploadList_bg = this.$refs.upload_bg.fileList
                    setTimeout(() => {
                      if (params.row.type === 3) {
                        this.$refs.upload_svg.fileList = [{ name: params.row.name, percentage: 100, showProgress: false, status: 'finished', url: params.row.special_image }]
                        this.uploadList_svg = this.$refs.upload_svg.fileList
                      }
                    }, 500)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: { type: 'error', size: 'small' },
                style: { marginLeft: '15px' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '确认删除该礼物',
                      onOk: () => { this.deleteGift(params.row) }
                    })
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    this.getQiniu()
    this.getGiftList()
  },
  methods: {
    getGiftList () {
      let obj = {
        page: this.current,
        per_page: this.per_page,
        belong_module: this.giftData.belong_module,
        category: this.giftData.category,
        is_show: this.giftData.is_show,
        type: this.giftData.type,
        key_word: this.giftData.key_word
      }
      getGiftList(obj).then(res => {
        if (res.data.code === 200) {
          this.data = res.data.data.data
          this.total = res.data.data.total
          this.last_page = res.data.data.last_page
        }
      })
    },
    pageChange (e) { // 分页切换
      this.current = e
      this.getGiftList()
    },
    partySearch (e) { // 搜索
      this.giftData.key_word = e
      this.getGiftList()
    },
    giftQuery () { // 选择&查询
      this.current = 1
      this.getGiftList()
    },
    deleteGift (row) { // 删除礼物
      deleteGift({ id: row.id }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('删除成功!')
          if (this.data.length === 1) this.current--
          this.getGiftList()
        }
      })
    },
    shelfGift (row) { // 上下架礼物
      shelfGift({ id: row.id, is_show: row.is_show === 1 ? 2 : 1 }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.cancel()
          this.getGiftList()
        }
      })
    },
    getQiniu () { // 获取七牛云token
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    addGift () { // 新增礼物
      addGift(this.giftAddData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.cancel()
          this.getGiftList()
        }
      })
    },
    updateGift () { // 编辑礼物
      updateGift(this.giftAddData).then(res => {
        if (res.data.code === 200) {
          this.$Message.success('成功!')
          this.cancel()
          this.getGiftList()
        }
      })
    },
    modelShow (flag) {
      this.$refs['giftAddData'].resetFields()
      this.$refs.upload.fileList = []
      this.$refs.upload_bg.fileList = []
      this.uploadList = []
      this.uploadList_bg = []
      if (this.$refs.upload_svg) {
        this.$refs.upload_svg.fileList = []
        this.uploadList_svg = []
      }
      this.demo_status = flag
      getGiftCode().then(res => {
        if (res.data.code === 200) {
          this.giftAddData.checkcode = res.data.data.checkcode
          this.visible = true
        }
      })
    },
    cancel () {
      this.visible = false
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (!this.giftAddData.image) {
            this.$Message.error('请上传礼物图片!')
            return
          } else if (!this.giftAddData.thumb_image) {
            this.$Message.error('请上传礼物缩略图!')
            return
          } else if (this.giftAddData === 3 && !this.giftAddData.special_image) {
            this.$Message.error('请上传礼物特效图!')
            return
          }
          if (this.demo_status) this.addGift()
          else this.updateGift()
        } else {
          this.$Message.error('Fail!')
        }
      })
    },
    handleRemove (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList = this.$refs.upload.fileList
      this.giftAddData.image = ''
    },
    handleSuccess (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList = this.$refs.upload.fileList
      this.giftAddData.image = file.url
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
    handleRemove_bg (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload_bg.fileList
      this.$refs.upload_bg.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList_bg = this.$refs.upload_bg.fileList
      this.giftAddData.thumb_image = ''
    },
    handleSuccess_bg (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList_bg = this.$refs.upload_bg.fileList
      this.giftAddData.thumb_image = file.url
    },
    handleBeforeUpload_bg () {
      const check = this.uploadList_bg.length < 1
      if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
      return check
    },
    handleRemove_svg (file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload_svg.fileList
      this.$refs.upload_svg.fileList.splice(fileList.indexOf(file), 1)
      this.uploadList_svg = this.$refs.upload_svg.fileList
      this.giftAddData.special_image = ''
    },
    handleSuccess_svg (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList_svg = this.$refs.upload_svg.fileList
      this.giftAddData.special_image = file.url
    },
    handleBeforeUpload_svg () {
      const check = this.uploadList_svg.length < 1
      if (!check) this.$Notice.warning({ title: '最多只能上传 1 张图片。' })
      return check
    },
    handleView (res) {
      this.SVGA(res.url)
    },
    SVGA (msg) {
      let player = new SVGA.Player('#demoCanvas')
      let parser = new SVGA.Parser('#demoCanvas')
      let that = this
      that.special_zIndex = true
      parser.load(msg, function (videoItem) {
        player.loops = 1 // 设置循环播放次数是 1
        player.setVideoItem(videoItem)
        player.stepToFrame(0, true) // 从指定帧开始播放动画
        setTimeout(() => { that.special_zIndex = false }, 3500)
      })
    }
  }
}
</script>

<style scoped>
  .page{
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
  .box {
    position: fixed;
    overflow: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.4)
  }
  #demoCanvas {
    width: 500px;
    height: 500px;
    margin: 0 auto;
    position: relative;
    outline: none;
    top: 200px;
  }
  .special_show {
    z-index: 9999;
  }
  .special_hide {
    z-index: -1;
  }
</style>
