export function formateDate (date) {
  let time = new Date(date)
  let year = time.getFullYear()
  let month = time.getMonth() + 1
  let day = time.getDate()
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day
  let hour = time.getHours()
  let minute = time.getMinutes()
  let second = time.getSeconds()
  if (hour < 10) hour = '0' + hour
  if (minute < 10) minute = '0' + minute
  if (second < 10) second = '0' + second
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
}
