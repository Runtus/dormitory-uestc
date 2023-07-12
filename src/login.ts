import got from 'got'
import config from '../room.config'
import { headers } from './header'
import type { NessInfo } from './type'

const LOGIN_HOST = "https://hq.uestc.edu.cn/dormitory/dormitoryOnlineChooseRoom/dormitoryWebLogin"

// TODO vite-test文件设置

const login = async (act: string, psw: string, cookie: string, randomCode?: string): Promise<{
    type: number,
    login: boolean,
    ca: boolean,
    randomCode ?: string
}> => {
    const password = Buffer.from(psw).toString('base64');
    console.log(act, psw, cookie)
    return got(LOGIN_HOST, {
        method: 'POST',
        form: {
            username: act,
            password,
            randomCode // 貌似没有验证码
        },
        headers: {
            "Content-Type": headers["Content-Type"],
            "Refer": "https://hq.uestc.edu.cn/dormitory/dormitoryOnlineChooseRoom/index",
            "Origin": headers.Origin,
            "Host": headers.Host,
            Cookie: "JSESSIONID=" + cookie
        }
    }).json<{
        type: number,
        login: boolean,
        ca: boolean,
        // randomCode ?: string
    }>().then(res => {
        // if (res.randomCode) {
        //     return login(act, psw, cookie, res.randomCode)
        // } else 
            return res
        
    })
}

export const register = async (persons: NessInfo["persons"]) => {
    const logins_promises = persons.map(item => login(item.act, item.psw, item.cookie.JSESSIONID))
    return Promise.all(logins_promises).then(res => {
        console.log("已经完成", res)
        if (res.every(item => item.login) && res.every(item => item.type === 1)) {
            return {
                hasRegister: true
            }
        } else {
            return {
                hasRegister: false
            }
        }
    })
}
