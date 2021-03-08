<template>
    <div style="margin-left: 100px">
      <div>短信发送模板：</div>
      <div class="box">昵称为“XXXXX”、ID为XXXXXX的用户触发了货币安全警报警报范围：每日充值额度安全值。查看地址：http://wanpai_admin.titipa.cn/?#/setting/operating</div>
      <div style="margin-top: 150px">
          <div>短信发送模板：</div>
          <div style="margin-left: 100px">
              <div>收件人：已开启消息通知的管理员邮箱</div>
              <div>邮件主题：小虎货币系统警报提醒</div>
              <div class="email">
                <span>邮件正文：</span>
                <div class="email_detail">
                    <span style="width: 80px;">100156</span>
                    <span style="width: 100px;">朝花夕拾</span>
                    <span style="width: 100px;">15631545468</span>
                    <span style="width: 100px;">小虎Hoo</span>
                    <span style="width: 100px;">充值</span>
                    <span style="width: 100px;">充值货币</span>
                    <span style="width: 100px;">500</span>
                    <span style="width: 150px;">2019-11-06 12:05:23</span>
                    <span style="width: 200px;">当天充值额度已超过安全值</span>
                </div>
              </div>
              <div>昵称为“XXXXX”、ID为XXXXXX的用户触发了货币安全警报</div>
              <div>警报范围：每日充值额度安全值。</div>
              <div>数据截图</div>
              <div>查看地址：http://wanpai_admin.titipa.cn/?#/setting/operating </div>
          </div>
      </div>
    </div>
</template>
<style scoped>
    .box{
        width: 300px;
        margin-left: 100px;
        margin-top: 10px
    }
    .email{
        display: flex;
        align-items: center
    }
    .email_detail{
        background-color: #fff;
        display: flex;
    }
    .email_detail span {
        border-right: 1px solid #e4e4e4;
        text-align: center;
        padding: 8px 0
    }
    .email_detail span:last-child {
        border-right: 0
    }
</style>
