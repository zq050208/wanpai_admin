<template>
  <div>
    <Row style="background:#eee;padding:20px">
      <Col span="11">
      <Card>
        <cardHeader title="未使用头像" leftContent="删除头像" rightContent="导入头像" @on-left-click="leftBtnClick" @on-right-click="rightBtnClick"/>
        <Tabs :value="tabs_value1" type="card" style="margin-top: 16px" @on-click="handleTabs">
          <TabPane label="男性头像" name="name1">
            <Table :show-header="true" :columns="columns" :data="data" @on-selection-change="selectionChange"></Table>
            <Page class="page"
                  show-elevator
                  show-total
                  border="true"
                  :current="current"
                  :total="total"
                  :page-size="per_page"
                  @on-change="pageChange"
            />
          </TabPane>
          <TabPane label="女性头像" name="name2">
            <Table :show-header="true" :columns="columns1" :data="data1" @on-selection-change="selectionChange"></Table>
            <Page class="page"
                  show-elevator
                  show-total
                  border="true"
                  :current="current1"
                  :total="total1"
                  :page-size="per_page"
                  @on-change="pageChange1"
            />
          </TabPane>
        </Tabs>
      </Card>
      </Col>
      <Col span="11" offset="2">
      <Card>
        <cardHeader title="已使用头像" rightContent="导出头像" :loading="loading" @on-right-click="exportNickName"/>
        <Tabs :value="tabs_value2" type="card" style="margin-top: 16px" @on-click="handleTabs">
          <TabPane label="男性头像" name="name3">
            <Table :show-header="false" :columns="columns2" :data="data2" ref="table3"></Table>
            <Page class="page"
                  show-elevator
                  show-total
                  border="true"
                  :current="current2"
                  :total="total2"
                  :page-size="per_page"
                  @on-change="pageChange2"
            />
          </TabPane>
          <TabPane label="女性头像" name="name4">
            <Table :show-header="false" :columns="columns3" :data="data3" ref="table4"></Table>
            <Page class="page"
                  show-elevator
                  show-total
                  border="true"
                  :current="current3"
                  :total="total3"
                  :page-size-opts="sizer_page"
                  @on-change="pageChange3"
            />
          </TabPane>
        </Tabs>
      </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
import cardHeader from '@/components/waterSystem/card-header'
import { getQiniuToken, getAvatarList, delAvatar, addAvater } from '@/api/data'
const baseImgUrl = 'https://cdn.tinytiger.cn/'
const arr1 = [{ type: 'selection', width: 60, align: 'center' }]
const arr2 = [
  {
    title: '头像详情',
    width: 100,
    render: (h, params) => {
      return h('img', {
        style: { display: 'block' },
        attrs: { src: params.row.avatar, width: 80, height: 80 }
      })
    }
  },
  {
    title: '头像地址',
    key: 'avatar'
  }
]
export default {
  components: { cardHeader },
  data () {
    return {
      qiniuToken: '', // 七牛云token
      uploadList: [], // 上传文件列表
      imageBaseUrl: baseImgUrl, // 图片域名
      sizer_page: [10, 20, 30, 50],
      per_page: 10, // 每页条数
      loading: false, // card2 右边按钮状态
      selection: [], // 当前选中数据
      str: '', // 展示提示
      tabs_value1: 'name1',
      tabs_value2: 'name3',
      current: 1, // 当前页
      current1: 1,
      current2: 1,
      current3: 1,
      total: 1, // 总页数
      total1: 1,
      total2: 1,
      total3: 1,
      columns: [...arr1, ...arr2],
      columns1: [...arr1, ...arr2],
      columns2: arr2,
      columns3: arr2,
      data: [],
      data1: [],
      data2: [],
      data3: []
    }
  },
  mounted () {
    this.getQiniu()
    this.getAvatarList(0)
    this.getAvatarList(2)
  },
  methods: {
    getQiniu () {
      getQiniuToken().then(res => {
        if (res.data.code === 200) {
          this.qiniuToken = res.data.data.uptoken
        }
      })
    },
    /**
     * 获取虚拟头像列表
     * @param type 0：男性未使用头像  1：女性未使用头像  2：男性已使用头像  3：女性未使用头像
     */
    getAvatarList (type) {
      let data = {}
      switch (type) {
        case 0:
          data = {
            page: this.current,
            per_page: this.per_page,
            gender: 1,
            is_use: 1
          }
          break
        case 1:
          data = {
            page: this.current1,
            per_page: this.per_page,
            gender: 2,
            is_use: 1
          }
          break
        case 2:
          data = {
            page: this.current2,
            per_page: this.per_page,
            gender: 1,
            is_use: 2
          }
          break
        case 3:
          data = {
            page: this.current3,
            per_page: this.per_page,
            gender: 2,
            is_use: 2
          }
          break
      }
      getAvatarList(data).then(res => {
        if (res.data.code === 200) {
          let data = res.data.data.data
          let total = res.data.data.total
          switch (type) {
            case 0:
              this.data = data
              this.total = total
              break
            case 1:
              this.data1 = data
              this.total1 = total
              break
            case 2:
              this.data2 = data
              this.total2 = total
              break
            case 3:
              this.data3 = data
              this.total3 = total
              break
          }
        }
      })
    },
    /**
     * 删除头像
     **/
    delNickName () {
      if (this.selection.length) {
        let ids = []
        this.selection.forEach(item => { ids.push(item.id) })
        delAvatar({ avatar_id: ids, is_use: 1 }).then(res => {
          if (res.data.code === 200) {
            this.$Message.success({ content: '删除成功' })
            if (this.tabs_value1 === 'name1') {
              if (this.selection.length === this.data.length && this.current !== 1) this.current--
              this.selection = []
              this.getAvatarList(0)
            } else if (this.tabs_value1 === 'name2') {
              if (this.selection.length === this.data1.length && this.current1 !== 1) this.current1--
              this.selection = []
              this.getAvatarList(1)
            }
          }
        })
      } else {
        this.$Message.error({ content: '请选择需要删除的头像' })
      }
    },
    /**
     * card1 左边按钮
     **/
    leftBtnClick () {
      this.$Modal.confirm({
        title: '提示',
        content: '确定删除吗？',
        onOk: () => {
          this.delNickName()
        }
      })
    },
    /**
     * card1 右边按钮
     **/
    rightBtnClick () {
      this.$Modal.confirm({
        render: (h) => {
          return h('div', [
            h('upload', {
              style: { textAlign: 'center', height: '100px', lineHeight: '100px', cursor: 'pointer' },
              props: {
                action: '//upload-z2.qiniu.com',
                ref: 'upload',
                type: 'drag',
                multiple: true,
                data: { token: this.qiniuToken },
                format: ['jpg', 'jpeg', 'png'],
                'show-upload-list': false,
                'on-success': this.handleSuccessUpload
              }
            }, '上传图片'),
            h('div', {
              style: { marginTop: '10px' }
            }, this.str)
          ])
        },
        onOk: () => {
          if (this.uploadList.length) {
            let data = {
              avatar_list: JSON.stringify(this.uploadList),
              gender: this.tabs_value1 === 'name1' ? 1 : 2
            }
            addAvater(data).then(res => {
              if (res.data.code === 200) {
                this.uploadList = []
                this.str = ''
                this.$Message.success({ content: '成功' })
                if (this.tabs_value1 === 'name1') {
                  this.getAvatarList(0)
                } else if (this.tabs_value1 === 'name2') {
                  this.getAvatarList(1)
                }
              } else {
                this.$Message.error({ content: res.msg })
              }
            })
          } else {
            this.$Message.error({ content: '请先上传需要导入的头像' })
          }
        },
        onCancel: () => {
          this.uploadList = []
          this.str = ''
        }
      })
    },
    /**
     * card2 右边按钮
     **/
    exportNickName () {
      let stu = this.tabs_value2 === 'name3'
      let data = {
        gender: stu ? 1 : 2,
        is_use: 2,
        is_excel: 1
      }
      this.loading = true
      getAvatarList(data).then(res => {
        this.loading = false
        if (res.data.code === 200) {
          this.$refs.table3.exportCsv({
            quoted: true,
            separator: ',=',
            filename: `已使用头像-${stu ? '男' : '女'}`,
            columns: this.columns2,
            data: res.data.data
          })
        }
      })
    },
    /**
     * 上传文件成功回调
     * @param res
     * @param file
     **/
    handleSuccessUpload (res, file) {
      file.url = this.imageBaseUrl + res.key
      this.uploadList.push(file.url)
      this.str = `已选择${this.uploadList.length}张图片`
    },
    /**
     * table选中项发生变化时就会触发
     * @param selection 已选项数据
     **/
    selectionChange (selection) {
      this.selection = selection
    },
    /**
     * 切换页数触发
     * @param e 当前页数
     */
    pageChange (e) {
      this.current = e
      this.getAvatarList(0)
    },
    pageChange1 (e) {
      this.current1 = e
      this.getAvatarList(1)
    },
    pageChange2 (e) {
      this.current2 = e
      this.getAvatarList(2)
    },
    pageChange3 (e) {
      this.current3 = e
      this.getAvatarList(3)
    },
    /**
     * tabs 选择
     * @param name
     */
    handleTabs (name) {
      if (name === 'name1' && this.tabs_value1 !== 'name1') {
        this.current = 1
        this.tabs_value1 = 'name1'
        this.getAvatarList(0)
      } else if (name === 'name2' && this.tabs_value1 !== 'name2') {
        this.current1 = 1
        this.tabs_value1 = 'name2'
        this.getAvatarList(1)
      } else if (name === 'name3' && this.tabs_value1 !== 'name3') {
        this.current2 = 1
        this.tabs_value2 = 'name3'
        this.getAvatarList(2)
      } else if (name === 'name4' && this.tabs_value1 !== 'name4') {
        this.current3 = 1
        this.tabs_value2 = 'name4'
        this.getAvatarList(3)
      }
    }
  }
}
</script>
<style>
  .page{
    margin-top: 20px;
    text-align: center;
  }
  .ivu-modal-confirm-body{
    padding-left: 0 !important;
  }
</style>
