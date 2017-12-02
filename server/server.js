import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import models from './model'
import path from 'path'

import csshook from 'css-modules-require-hook/preset'
import assethook from 'asset-require-hook'
assethook({
    extensions:['png', 'jpg']
})

import React from 'react'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import App from '../src/app'
import reducers from '../src/reducer'
import { renderToString, renderToNodeStream } from 'react-dom/server'
import staticPath from '../build/asset-manifest.json'

const Chat = models.getModel('chat')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

io.on('connection', function(socket) {
    // console.log('user login')
    socket.on('sendmsg', function(data) {
        const {from, to, msg} = data
        const chatid = [from, to].sort().join('_')
        Chat.create({chatid, from, to, content:msg}, function(err, doc) {
            // 发送全局时间
            io.emit('recvmsg', Object.assign({}, doc._doc))
        })
    })
})


const userRouter = require('./user')

// 使用cookie parser可以使用cookie
app.use(cookieParser())
// 可以解析body json
app.use(bodyParser.json())
// app.use开启一个中间件 子路由是userRouter
app.use('/user', userRouter)
app.use(function(req, res, next) {
    if(req.url.startsWith('/user/') || req.url.startsWith('/static/')) {
        return next()
    }
    const store = createStore(reducers, compose(
        applyMiddleware(thunk)
    ))

    // let context = {}
    // const markup = renderToString(
    //     (<Provider store={store}>
    //         <StaticRouter
    //             location={req.url}
    //             context={context}
    //         >
    //             <App></App>
    //         </StaticRouter>
    //     </Provider>)
    // )

    let context = {}
    const obj = {
        '/msg':'React聊天消息列表',
        '/boss':'boss查看牛人列表页面',
    }

    res.write(`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta name="theme-color" content="#000000">
            <meta name='keywords' content='React,Redux,Imooc,聊天,SSR'>
            <meta name='description' content='${obj[req.url]}'>
            <meta name='author' content='moke'>
            <title>React App</title>
            <link rel="stylesheet" href="/${staticPath['main.css']}">
          </head>
          <body>
            <noscript>
              You need to enable JavaScript to run this app.
            </noscript>
            <div id="root">`)

    const markupStream = renderToNodeStream(
        (<Provider store={store}>
            <StaticRouter
                location={req.url}
                context={context}
            >
                <App></App>
            </StaticRouter>
        </Provider>)
    )

    markupStream.pipe(res, {end: false})
    markupStream.on('end', ()=> {
        res.write(`</div>
            <script src="/${staticPath['main.js']}"></script>
          </body>
        </html>`)
        res.end()
    })
    // const pageHtml = `<!DOCTYPE html>
    //     <html lang="en">
    //       <head>
    //         <meta charset="utf-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    //         <meta name="theme-color" content="#000000">
    //         <meta name='keywords' content='React,Redux,Imooc,聊天,SSR'>
    //         <meta name='description' content='${obj[req.url]}'>
    //         <meta name='author' content='moke'>
    //         <title>React App</title>
    //         <link rel="stylesheet" href="/${staticPath['main.css']}">
    //       </head>
    //       <body>
    //         <noscript>
    //           You need to enable JavaScript to run this app.
    //         </noscript>
    //         <div id="root">${markup}</div>
    //
    //         <script src="/${staticPath['main.js']}"></script>
    //       </body>
    //     </html>
    // `

    // res.send(pageHtml)
})
app.use('/', express.static(path.resolve('build')))

server.listen(9093, function() {
    console.log('Node app start at port 9093');
})
