import express from 'express'
import { main } from './src'
import { register } from './src/login'

const app = express();


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