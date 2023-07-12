import express from 'express'
import { main } from './src'
import { register } from './src/login'

const app = express();

// 解决跨域问题
app.all("*",function(req,res,next){
    // 设置允许跨域的域名,*代表允许任意域名跨域
    res.header('Access-Control-Allow-Origin','*');
    // 允许的header类型
    res.header('Access-Control-Allow-Headers','content-type');
    // 跨域允许的请求方式
    res.header('Access-Control-Allow-Methods','DELETE,PUT,POST,GET,OPTIONS');
    if(req.method.toLowerCase() == 'options')
        res.send(200); // 让options 尝试请求快速结束
    else
        next();
})



app.get("/room", (req, res) => {
    console.log(req.query.data)
    let data;
    try {
        data = JSON.parse(req.query.data as string);
        main(data).then(response => {
            if (response.status) {
                res.status(200).send(response.info)
            } else {
                res.status(400).send(response.info)
            }
        })
    } catch (err) {
        res.status(400).send("发送的字符串解析错误");
    }

})


app.get("/register", (req, res) => {
    console.log(req.query.data)
    let data;
    try {
        data = JSON.parse(req.query.data as string).persons;
        register(data).then(response => {
            console.log(response)
            res.send("ok")
        })
    } catch (err) {
        res.status(400).send("发送的字符串解析错误");
    }
})


app.listen(3000, () => {
    console.log("http://localhost:3000")
})