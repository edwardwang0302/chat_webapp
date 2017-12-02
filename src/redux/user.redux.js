import axios from 'axios'
import {getRedirectPath} from '../util'
const AUTH_SUCCESS = 'AUTH_SUCCESS'
const ERROR_MSG = 'ERROR_MSG'
const LOAD_DATA = 'LOAD_DATA'
const LOGOUT = 'LOGOUT'

const initState = {
    redirectTo:'',
    msg: '',
    user: '',
    type: ''
}

// reducer
export function user(state = initState, action) {
    switch(action.type) {
        // 修改 注册 登录 三个action统一
        case AUTH_SUCCESS:
            return {...state, msg: '', redirectTo:getRedirectPath(action.payload), ...action.payload}
        case LOAD_DATA:
            return {...state, ...action.payload}
        case ERROR_MSG:
            return {...state, ...initState, msg:action.msg}
        case LOGOUT:
            return {...initState, redirectTo: '/login'}
        default:
            return state
    }
}

function errorMsg(msg) {
    // 这里msg使用了简写要放在对象前面
    return {
        msg,
        type: ERROR_MSG
    }
}

function authSuccess(obj) {
    // 完善成功 这里要提出pwd
    const { pwd, ...data } = obj
    return {
        type:AUTH_SUCCESS,
        payload:data
    }
}

export function loadData(userinfo) {
    return {
        type: LOAD_DATA,
        payload: userinfo
    }
}

export function logoutSubmit() {
    return {
        type: LOGOUT
    }
}

export function update(data) {
    return dispatch=> {
        axios.post('/user/update', data)
            .then(res=>{
                if(res.status === 200 && res.data.code === 0) {
                    dispatch(authSuccess(res.data.data))
                } else {
                    dispatch(errorMsg(res.data.msg))
                }
            })
    }
}

export function login({user, pwd}) {
    if (!user || !pwd) {
        return errorMsg('用户名密码必须输入')
    }
    return dispatch=> {
        axios.post('/user/login', {user, pwd})
            .then(res=>{
                if(res.status === 200 && res.data.code === 0) {
                    // 登陆成功把后台的数据的data字段返回
                    dispatch(authSuccess(res.data.data))
                } else {
                    // 错误信息后端来定
                    dispatch(errorMsg(res.data.msg))
                }
            })
    }
}

// 参数这样写可以解耦
export function register({user, pwd, repeatpwd, type}) {
    if (!user || !pwd || !type) {
        return errorMsg('用户名密码必须输入')
    }
    if (pwd !== repeatpwd) {
        return errorMsg('密码和确认密码不一致')
    }
    // 使用redux thunk可以返回函数
    return dispatch=> {
        axios.post('/user/register', {user, pwd, type})
            .then(res=>{
                if(res.status === 200 && res.data.code === 0) {
                    dispatch(authSuccess({user, pwd, type}))
                } else {
                    // 错误信息后端来定
                    dispatch(errorMsg(res.data.msg))
                }
            })
    }
}
