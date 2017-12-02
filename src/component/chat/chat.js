import React from 'react'
import { List, InputItem, NavBar, Icon, Grid } from 'antd-mobile'
import io from 'socket.io-client'
import { connect } from 'react-redux'
import { getMsgList, sendMsg, recvMsg, readMsg } from '../../redux/chat.redux'
import { getChatId } from '../../util'
import QueueAnim from 'rc-queue-anim'

// 这里因为跨域所以要先连接
const socket = io('ws://localhost:9093')

@connect(
    state=>state,
    {getMsgList, sendMsg, recvMsg, readMsg}
)
class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text:'',
            msg:[],
            showEmoji: false
        }
    }
    componentDidMount() {
        if (!this.props.chat.chatmsg.length) {
            this.props.getMsgList()
            this.props.recvMsg()
        }
    }
    componentWillUnmount() {
        // 目标用户id
        const to = this.props.match.params.user
        this.props.readMsg(to)
    }
    fixCarousel() {
        // 修正grid一开始显示不全的问题
        setTimeout(function() {
            window.dispatchEvent(new Event('resize'))
        }, 0)
    }
    handleSubmit() {
        // socket.emit('sendmsg', {text:this.state.text})
        const from = this.props.user._id
        const to = this.props.match.params.user
        const msg = this.state.text
        this.props.sendMsg({from, to, msg})
        this.setState({text:''})
    }
    render() {
        const emoji = '😊 😃 😏 😍 😘 😚 😳 😌 😆 😁 😉 😜 😝 😀 😙 😛 😴 😟 😦 😧 😮 😬 😕 😯 😑 😒 😅 😓😥 😩 😔 😞 😖 😨 😰 😣 😢 😭 😂 😲 😱 😫 😠 😡'
                        .split(' ')
                        .filter(v=>v)
                        .map(v=>({text:v}))

        const userid = this.props.match.params.user
        const Item = List.Item
        const users = this.props.chat.users
        if(!users[userid]) {
            return null;
        }
        const chatid = getChatId(userid, this.props.user._id)
        const chatmsgs = this.props.chat.chatmsg.filter(v=>v.chatid===chatid)
        return (
            <div id='chat-page'>
                <NavBar
                    icon={<Icon type='left'/>}
                    mode='dark' onLeftClick={()=>{
                        this.props.history.goBack()
                    }}
                >
                    {users[userid].name}
                </NavBar>

                <QueueAnim delay={100}>
                    {chatmsgs.map(v=>{
                        const avator = require(`../img/${users[v.from].avator}.png`)
                        return v.from === userid ? (
                            <List key={v._id}>
                                <Item
                                    thumb={avator}
                                >{v.content}</Item>
                            </List>
                        ):(
                            <List key={v._id}>
                                <Item className='chat-me'
                                    extra={<img src={avator} alt=''/>}
                                >{v.content}</Item>
                            </List>
                        )
                        // return <p key={v._id}>{v.content}</p>
                    })}
                </QueueAnim>

                <div className='stick-footer'>
                    <List>
                        <InputItem
                            placeholder='请输入'
                            value={this.state.text}
                            onChange={v=>{
                                this.setState({text:v})
                            }}
                            extra={
                                <div>
                                    <span
                                        onClick={()=>{
                                            this.setState({
                                                showEmoji:!this.state.showEmoji
                                            })
                                            this.fixCarousel()
                                        }}
                                        style={{marginRight:15}}
                                    >😃</span>
                                    <span onClick={()=>this.handleSubmit()}>发送</span>
                                </div>
                            }
                        ></InputItem>
                    </List>
                    {
                        this.state.showEmoji?
                        <Grid
                            data={emoji}
                            columnNum={9}
                            carouselMaxRow={4}
                            isCarousel={true}
                            onClick={el=>{
                                this.setState({
                                    text: this.state.text+el.text
                                })
                            }}
                        />:null
                    }
                </div>
            </div>
        )
    }
}

export default Chat
