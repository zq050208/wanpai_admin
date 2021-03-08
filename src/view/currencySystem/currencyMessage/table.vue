<template>
  <table width="100%" align="center" >
    <thead>
      <tr align="center">
        <th>充值金额</th>
        <th>充值用户数</th>
        <th>充值货币消耗总额</th>
        <th>充值货币消耗用户数</th>
        <th>已提现总额</th>
        <th>已提现用户数</th>
        <th>获取积分用户数</th>
        <th>积分消耗</th>
        <th>积分消耗用户数</th>
        <th>可提现总额</th>
      </tr>
    </thead>
    <tbody>
      <tr align="center">
        <td>{{ data.rechargeIncomeMoney }}</td>
        <td>{{ data.rechargeIncomeUsers }}</td>
        <td>{{ data.rechargeConsumeMoney }}</td>
        <td>{{ data.rechargeConsumeUsers }}</td>
        <td>{{ data.withdrawMoney }}</td>
        <td>{{ data.withdrawUsers }}</td>
        <td>{{ data.pointIncomeUsers }}</td>
        <td>{{ data.pointConsumeMoney }}</td>
        <td>{{ data.pointConsumeUsers }}</td>
        <td>{{ data.shouldWithdrawMoney }}</td>
      </tr>
    </tbody>

    <thead>
      <tr align="center">
        <th>可提现用户数</th>
        <th>历史充值总额</th>
        <th>历史消耗总额</th>
        <th>历史提现获取总额</th>
        <th>历史提现总额</th>
        <th>历史积分发放总额</th>
        <th>历史积分消耗总额</th>
      </tr>
    </thead>
    <tbody>
      <tr align="center">
        <td>{{ data.shouldWithdrawUsers }}</td>
        <td>{{ data.historyRechargeIncomeMoney }}</td>
        <td>{{ data.historyRechargeConsumeMoney }}</td>
        <td>{{ data.historyWithdrawIncomeMoney }}</td>
        <td>{{ data.historyWithdrawConsumeMoney }}</td>
        <td>{{ data.historyPointIncomeMoney }}</td>
        <td>{{ data.historyPointConsumeMoney }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
  table {
    border: 1px #dcdee2 solid;
    border-collapse: collapse;
    margin-bottom: 24px;
  }
  th {
    border: 1px #dcdee2 solid;
    width: 10%;
    font-weight: normal;
    padding: 12px 0;
  }
  td {
    border: 1px #dcdee2 solid;
    height: 48px;
  }
</style>