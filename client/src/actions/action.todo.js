import axios from 'axios';
import { batch } from 'react-redux';
import {SERVER_ADDRESS} from "../config/app.conf"
import {setMessage} from "./message.action"

export const SET_TODOS = 'SET_TODOS'
export const setTodos = arr => ({type: SET_TODOS, payload: arr})

export const SET_TEMP_TODOS = 'SET_TEMP_TODOS'
export const setTempTodos = arr => ({type: SET_TEMP_TODOS, payload: arr})

export const handleTodoChange = (value, field) => {
  return (dispatch, getState) => {
    let todo = getState().todos.todo;
    todo[field] = value
    dispatch(setTodo(todo))
  }
}

export const SET_TODO = 'SET_TODO'
export const setTodo = todo => ({type: SET_TODO, payload: todo})

export const SHOW_TODO = 'SHOW_TODO'
export const showTodo = id => {
  return (dispatch, getState) => {
    let todo = getState().todos.todos.find(todo => todo.id === +id)
    const clearTodo = {
      id      : null,
      title   : "",
      content : "",
      deadline: "",
      status  : false,
    }
    batch(() => {
      dispatch(setTodo(clearTodo))
      dispatch(closeEditTodo())
      dispatch(setTodo(todo))
    })
  }
}

export const EDIT_TODO = 'EDIT_TODO'
export const editTodo = () => ({type: EDIT_TODO})

export const dropTodo = () => {
  return dispatch => {
    const clearTodo = {
      id      : null,
      title   : "",
      content : "",
      deadline: "",
      status  : false,
    }
    dispatch(setTodo(clearTodo))
  }
}

export const ADD_TODO_FORM = 'ADD_TODO_FORM'
export const addTodoForm = () => {
  return dispatch => {
    batch(() => {
      dispatch(dropTodo())
      dispatch({type: ADD_TODO_FORM})
    })
  }
}

export const CLOSE_EDIT = 'CLOSE_EDIT'
export const closeEditTodo = () => ({type: CLOSE_EDIT})

export const completeTodo = () => {
  return (dispatch, getState) => {
    const
      id    = getState().todos.todo.id,
      todos = getState().todos.todos,
      todo  = todos.find(todo => todo.id === id);

    todo.status = !todo.status
    batch(() => {
      dispatch(setTodo(todo))
      dispatch(updateTodo())
    })
  }
}

// TODO: изменить структуру запроса данных из стора
export const searchTodo = subStr => {
  return (dispatch, getState) => {
    let tempTodos = getState().todos.tempTodos
    if(subStr === ""){
      dispatch(setTempTodos([]))
      dispatch(setTodos(tempTodos))
    }
    else{
      const todos = getState().todos.todos
      let newTodos = todos.filter(todo => todo.title.toLowerCase().includes(subStr))
      if(tempTodos.length === 0)
        dispatch(setTempTodos(todos))

      dispatch(setTodos(newTodos))
    }
  }
}

export const filterTodo = type => {
  return (dispatch, getState) => {
    const todos = [...getState().todos.todos]
    //filter todos by value(type) of option
    let filteredTodos = todos.sort((a, b) => a[type] > b[type]? 1 : -1)

    dispatch(setTodos(filteredTodos))
  }
}

export function getTodos(userId){
  return dispatch => {
    axios
      .get(`${SERVER_ADDRESS}/todos`,{
        params: {userId}
      })
      .then(res => {
        dispatch(setTodos(res.data))
      })
      .catch(err => {
        window.alert(err)
      })
    }
}

export function deleteTodo(){
  return (dispatch, getState) => {
    const id = getState().todos.todo.id
    axios.delete(`${SERVER_ADDRESS}/todos/:${id}`)
      .then(res => {
        const todos = getState().todos.todos
        let newTodos = todos.filter(todo => todo.id !== id)
        batch(() => {
          dispatch(setTodos(newTodos))
          dispatch(dropTodo())
        })
      })
      .catch(err => {
        window.alert(err)
      })
  }
}

export function updateTodo(){
  return (dispatch, getState) => {
    let todo = {
      userId  : getState().user.user.id,
      ...getState().todos.todo
    }

    axios
      .put(`${SERVER_ADDRESS}/todos/:${todo.id}`, {todo})
      .then(res => {
        let resultOfReq = res.data[0]
        if(resultOfReq){
          const todos = [...getState().todos.todos]
          let id = todos.findIndex(elem => elem.id === todo.id)
          todos.splice(id, 1, todo)
          
          let message = {
            text: "success updated",
            type: "success"
          }
          batch(() => {
            dispatch(setMessage(message))
            dispatch(setTodos(todos))
            dispatch(closeEditTodo())
          })
        }
      })
      .catch(err => {
        window.alert(err)
      })    
  }
}


export function addTodo(){
  return (dispatch, getState) => {
    const todos = [...getState().todos.todos]
    let todo = {
      userId  : getState().user.user.id,
      ...getState().todos.todo
    }

    if(todo.title === ""){
      window.alert("Empty title")
    }
    else if(todos.find(elem => elem.title === todo.title)){
      window.alert("Todo with this title already exist")
    }
    else if(new Date(todo.deadline) - new Date() < -86400000){
      window.alert("Incorrect Date")
    }
    else{
      axios
        .post(`${SERVER_ADDRESS}/todos`, {todo})
        .then(res => {
          todo.id = res.data.id
          todos.push(todo)
          batch(() => {
            window.alert("success added")
            dispatch(setTodos(todos))
            dispatch(dropTodo())
          })
        })
        .catch(err => {
          window.alert(err)
        })
    }
  }
}