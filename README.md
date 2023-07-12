# 电子科大新生抢寝室脚本
> 只适用于在[电子科大后勤保障部宿舍服务](https://hq.uestc.edu.cn/dormitory/dormitoryOnlineChooseRoom/index)处进行的寝室选择。

* 因为泥电的宿舍选择机制很诡异，既不能取消选择（一次性的），也没有个几分钟的锁寝室的机制，所以经常出现**撞车的情况**，即你和室友在选择宿舍的时候，被其他同学选择了其中的一个床位。
* 所以在此情况下，开发了该脚本，为了能够最大程度地保证室友能够选择到同一个寝室，防止撞车。

⚠️**特别说明**: 此脚本也**不能完全保证**你们能够选择到一个寝室，本地发送请求时，如果有人也同时在浏览器上选择了对应的床位（或者有其他的脚本用户在抢床位），那么也有可能发生撞车。**只是说它相对人手动去操作，提高了几人选择寝室的同步率，即大大提高成功的概率。（当然，如果你是独狼用户，那么此脚本基本没有风险）**

## 怎么使用?
#### 你需要做一些前置准备:
1. 泥电在开始抢寝室前一天会开放系统进行寝室试选（选择不起作用，晚上会清数据），**你需要进入系统内浏览你心仪的房间，然后鼠标移到该房间的可点击区域并右键，点击`检查`按钮，打开浏览器开发界面**。
2. 在浏览器开发界面里，已经有一行代码的底色被自动加深，找到这行代码，获取到`dormitoryChooseBed(xxxx)`中的xxxx这一串数字ID，这串数字即为你想选房间的唯一ID。

---
![宿舍页面](https://lao-lan-go.oss-cn-beijing.aliyuncs.com/blog/CA0D2CB1-8ECC-4F52-AD93-398B24592877.png)
---

![右键](https://lao-lan-go.oss-cn-beijing.aliyuncs.com/blog/9F368D3A-9A52-4946-9B78-3CB06EEDEDC9.png)
---
- 打🐎处就是数字id，copy一下
![开发界面](https://lao-lan-go.oss-cn-beijing.aliyuncs.com/blog/D38661C5-736D-465A-B352-B6D790FFC3D0.png)

#### 配置文件📃 room.config.ts
```ts
// room.config.ts
export default {
    persons: [{
        "name": "xxx1", // 名称
        "act": "abcdefg", // 账号
        "psw": "114514", // 密码
        "cookie": {
            "JSESSIONID": "67BA5A3AA28F701F31C7AAF3A12096F1", 
            // sessionid的获得请参考下文的「其余说明」
        }
    }, {
        "name": "xxx2",
        "act": "abcdefffff",
        "psw": "1919810",
        "cookie": {
            "JSESSIONID": "C281CAAEF220C15F892E6EBDAC9DFF53"
        }
        }],
    houses: [
        {
            id: 114514, // 在前置准备中获取到的数字ID
            name: "先辈" // 数字ID对应的房间号
        }
    ]
}
```
* 配置文件的各项属性如上所示，需要补充以下说明:
  * persons内的配置数量**自己的意愿而定**，比如你们是三个人想抢一个三人间，那就写三个人的配置，你若想一个人抢某间寝室，写一个人的配置即可。 需要注意的是，**每个人的sessionid必须不同（原理在下面其余说明部分会说到），并且要从尼电的选寝室登录界面去获取，而不是随便输一个字符串**。
  * houses里也可以配置**多个房间号**，并且**优先级为从上到下**。

#### 如何运行🏃
> 注： 需要你的电脑上有nodejs环境以及yarn，如何安装 [NodeJs安装相关](https://nodejs.org/en/) [yarn安装相关](https://yarnpkg.com/)

* 打开命令行，并在项目根路径依次运行以下指令。
```shell
yarn # 安装依赖
yarn go # 运行脚本
```


#### 其余说明📖: 关于配置文件的JSESSIONID
* 因为泥电的鉴权是在本地生成session后，在登录的时候一起发送给后端服务器，后端服务器把你的账号信息和该session进行绑定后再发送回来，后续的一些选房操作都是通过该绑定的session来完成的，所以你需要提前在**登录界面**获取到一个**新session**然后复制到上述的配置文件中，具体操作看参考下面的截图。
* **建议不要直接用配置文件的session，因为你的session有可能会被别人注册而覆盖掉。**
![session获取](https://lao-lan-go.oss-cn-beijing.aliyuncs.com/blog/597A1AB6-7B71-4052-8410-631DAAEE949C.png)
