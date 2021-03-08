<template>
  <div>
    <Row style="background:#eee;padding:20px">
      <Col span="11">
      <Card>
        <cardHeader title="未使用昵称" leftContent="删除昵称" rightContent="导入昵称" @on-left-click="leftBtnClick" @on-right-click="rightBtnClick"/>
        <Tabs :value="tabs_value1" type="card" style="margin-top: 16px" @on-click="handleTabs">
          <TabPane label="男性昵称" name="name1">
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
          <TabPane label="女性昵称" name="name2">
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
        <cardHeader title="已使用昵称" rightContent="导出昵称" :loading="loading" @on-right-click="exportNickName"/>
        <Tabs :value="tabs_value2" type="card" style="margin-top: 16px" @on-click="handleTabs">
          <TabPane label="男性昵称" name="name3">
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
          <TabPane label="女性昵称" name="name4">
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
import { getNicknameList, delNickname } from '@/api/data'
import { getToken } from '@/libs/util'
const baseImgUrl = 'https://cdn.tinytiger.cn/'
const arr1 = [{ type: 'selection', width: 60, align: 'center' }]
const arr2 = [{ title: '昵称详情', key: 'nickname' }]
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
    this.getNicknameList(0)
    this.getNicknameList(2)
  },
  methods: {
    /**
     * 获取虚拟昵称列表
     * @param type 0：男性未使用昵称  1：女性未使用昵称  2：男性已使用昵称  3：女性未使用昵称
     */
    getNicknameList (type) {
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
      getNicknameList(data).then(res => {
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
     * 删除昵称
     **/
    delNickName () {
      if (this.selection.length) {
        let ids = []
        this.selection.forEach(item => { ids.push(item.id) })
        delNickname({ nickname_id: ids, is_use: 1 }).then(res => {
          if (res.data.code === 200) {
            this.$Message.success({ content: '删除成功' })
            if (this.tabs_value1 === 'name1') {
              if (this.selection.length === this.data.length && this.current !== 1) this.current--
              this.selection = []
              this.getNicknameList(0)
            } else if (this.tabs_value1 === 'name2') {
              if (this.selection.length === this.data1.length && this.current1 !== 1) this.current1--
              this.selection = []
              this.getNicknameList(1)
            }
          }
        })
      } else {
        this.$Message.error({ content: '请选择需要删除的昵称' })
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
      let action = server.BASE_URL + 'InventedUser/importNicknameExcel'
      let token = getToken()
      this.$Modal.info({
        okText: '关闭',
        render: (h) => {
          return h('div', [
            h('upload', {
              style: { textAlign: 'center', height: '100px', lineHeight: '100px', cursor: 'pointer' },
              props: {
                action: action,
                ref: 'upload',
                type: 'drag',
                name: 'excel_data',
                headers: { token: token },
                format: ['xls', 'xlsx', 'csv'],
                'show-upload-list': false,
                'on-success': this.handleSuccessUpload
              }
            }, '上传文件,支持xls、xlsx、csv格式。'),
            h('div', { style: { marginTop: '10px' } }, '备注： 一次最多5000条数据')
          ])
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
      getNicknameList(data).then(res => {
        this.loading = false
        if (res.data.code === 200) {
          this.$refs.table3.exportCsv({
            quoted: true,
            separator: ',=',
            filename: `已使用昵称-${stu ? '男' : '女'}`,
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
      if (res.code === 200) {
        this.$Modal.remove()
        this.$Message.success({ content: res.msg })
        if (this.tabs_value1 === 'name1') {
          this.getNicknameList(0)
        } else if (this.tabs_value1 === 'name2') {
          this.getNicknameList(1)
        }
      } else {
        this.$Message.error({ content: res.msg })
      }
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
      this.getNicknameList(0)
    },
    pageChange1 (e) {
      this.current1 = e
      this.getNicknameList(1)
    },
    pageChange2 (e) {
      this.current2 = e
      this.getNicknameList(2)
    },
    pageChange3 (e) {
      this.current3 = e
      this.getNicknameList(3)
    },
    /**
     * tabs 选择
     * @param name
     */
    handleTabs (name) {
      if (name === 'name1' && this.tabs_value1 !== 'name1') {
        this.current = 1
        this.tabs_value1 = 'name1'
        this.getNicknameList(0)
      } else if (name === 'name2' && this.tabs_value1 !== 'name2') {
        this.current1 = 1
        this.tabs_value1 = 'name2'
        this.getNicknameList(1)
      } else if (name === 'name3' && this.tabs_value1 !== 'name3') {
        this.current2 = 1
        this.tabs_value2 = 'name3'
        this.getNicknameList(2)
      } else if (name === 'name4' && this.tabs_value1 !== 'name4') {
        this.current3 = 1
        this.tabs_value2 = 'name4'
        this.getNicknameList(3)
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
