/**
 * @Author: 王宇 <moke>
 * @Date:   2017-12-02T20:39:21+08:00
 * @Email:  edwardwang0302@me.com
 * @Last modified by:   moke
 * @Last modified time: 2017-12-02T21:53:27+08:00
 */
import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Login from './container/login/login'
import Register from './container/register/register'
import BossInfo from './container/bossinfo/bossinfo'
import GeniusInfo from './container/geniusinfo/geniusinfo'
import Dashboard from './component/dashboard/dashboard'
import AuthRoute from './component/authroute/authroute'
import Chat from './component/chat/chat'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError:false
        }
    }
    componentDidCatch(err, info) {
        console.log(err, info)
        this.setState({
            hasError:true
        })
    }
    render() {
        return (this.state.hasError
            ? <img className='error-container' alt='oops' src={require('./error.jpg')}/>
            :(
            <div>
                <AuthRoute></AuthRoute>
                <Switch>
                    <Route path='/bossinfo' component={BossInfo}></Route>
                    <Route path='/geniusinfo' component={GeniusInfo}></Route>
                    <Route path='/login' component={Login}></Route>
                    <Route path='/register' component={Register}></Route>
                    <Route path='/chat/:user' component={Chat}></Route>
                    <Route component={Dashboard}></Route>
                </Switch>
            </div>
            )
        )
    }
}

export default App
