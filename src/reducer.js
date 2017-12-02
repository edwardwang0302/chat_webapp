// 合并所有reducer并返回
import { combineReducers } from 'redux'
import { user } from './redux/user.redux'
import { chatuser } from './redux/chat.user.redux'
import { chat } from './redux/chat.redux'

export default combineReducers({user, chatuser, chat})
