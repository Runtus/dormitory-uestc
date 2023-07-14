import got from 'got'
import { BedInfo, BedId } from './type'
import config from '../room.config'
import { headers as HEADERS } from './header'
import { register } from './login'

const CHECK_ROOM = "https://hq.uestc.edu.cn/dormitory/dormitoryOnlineChooseRoom/getNewBedList"
const POST_URL_CHOOSEROOM = "https://hq.uestc.edu.cn/dormitory/dormitoryOnlineChooseRoom/studentChooseBed"

const cookies = config.persons.map(item => {
    const cookies = []
    for (const [key, value] of Object.entries(item.cookie)) {
        cookies.push(`${key}=${value}`)
    }
    return {
        name: item.name,
        cookie: cookies.join("; ")
    }
})

const checkRoom = async (roomId: number): Promise<{
  isNull: boolean,
  bed: Array<BedId>
}> => {
  const promises = config.persons.map((item) => got(CHECK_ROOM, {
      method: 'post',
      headers: {
        ...HEADERS,
        Cookie: cookies.find((cookie) => cookie.name === item.name).cookie
      },
      form: {
        "room_id": roomId    
      }
    }).json<{
        flag: boolean,
        data: Array<BedInfo>,
        sex: string
      }>().then((res) => {
        console.log(res)
        return {
          ...res,
          name: item.name
        }
      })
  )

  const results = await Promise.all(promises)
  // 保证多个人都能抢到
  console.log(results)
  if (results.length === config.persons.length && results[0].data) {
    // 判断房间是否为空
    const isNull = results.reduce((last, item) => last && item.data.reduce((l, i) => l && (!i.student_id), true), true)
    if (isNull) {
      return {
        isNull,
        bed: results.map((item, index) => ({
          name: item.name,
          // 第一个人一号床，第二个人二号床，一次顺序下去
          bed_id: item.data[index].bed_id,
          choose_bed_auth_counsellor_id: item.data[index].choose_bed_auth_counsellor_id
        }))
      }
    } else {
      return {
        isNull,
        bed: []
      }
    }
  } else {
    console.log('Cookie已过期或出现异常，请更换一个新的Cookie')
    return {
      isNull: false,
      bed: []
    }
  }
}


const main = async () => {
  let isBooked = false; // 添加一个标志，表示是否已经抢房成功
  let loopCount = 0; // 添加一个计数器，表示循环的次数
  while(!isBooked){
    loopCount++; // 每次循环，计数器加一
    console.log(`这是第${loopCount}次尝试抢房`); // 在终端打印出循环的次数
    const res = await register()
    if (res.hasRegister) {
      for (let house of config.houses) {
        console.log(`正在抢房 ${house.name} 号`)
        const data = await checkRoom(house.id)
        if (data.isNull) { // 空的，进行选房请求
          console.log('房源为空，开始抢房')
          const promises = data.bed.map(item => (
            got(POST_URL_CHOOSEROOM, {
              method: 'post',
              headers: {
                ...HEADERS,
                Cookie: cookies.find(cookie => cookie.name === item.name).cookie
              },
              form: {
                "bed_id": item.bed_id,
                "choose_bed_auth_counsellor_id": (() => {
                  console.log(item)
                  return item.choose_bed_auth_counsellor_id
                })()
              }
            }).json<{flag: boolean, type: number, data: number, message: string}>()
          ))
          const result = await Promise.all(promises)
          console.log(result)
          if (result.every(item => item.type === 0)) {
            console.log(`恭喜！抢房成功，房号为:${house.name}`)
            isBooked = true;
          } else if (result.every(item => item.type === 1)){
            console.log(`你们貌似抢过房了`)
            isBooked = true;
          } else {
            console.log(`疑似撞车，请登录检查`)
          }
          break;
        } else {
          console.log(`${house.name}房间已有人入驻，开始对下一房间进行抢房操作`)
          continue
        }
      }
      if (!isBooked) {
        console.log('你预定的房间已经没有空位了，请重新进行配置');
      }
    } else {
      console.log('loginID没有注册成功，请重复尝试')
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }
}

const scheduleStart = () => {
  const targetTime = config.start_time.hour * 60 * 60 + config.start_time.minute * 60 + config.start_time.second; // 11:30:20 in seconds
  console.log(`目标时间: ${config.start_time.hour}:${config.start_time.minute}:${config.start_time.second}`);

  const printIntervalId = setInterval(() => {
    const now = new Date();
    console.log(`现在时间: ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
  }, 10000); // Print every 30 seconds

  const intervalId = setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();
      if (currentTime >= targetTime) {
          clearInterval(printIntervalId);
          clearInterval(intervalId);
          console.log(`开始抢房时间: ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
          main();
      }
  }, 1000);
}

scheduleStart();