const { BrowserRouter, Route, Switch } = window.ReactRouterDOM

const firebaseConfig = {
  apiKey: "AIzaSyCl5YJ26-YKii_c7HK31kuZQRvr2y-IoWQ",
  authDomain: "chatrobot-2000.firebaseapp.com",
  databaseURL: "https://chatrobot-2000.firebaseio.com",
  projectId: "chatrobot-2000",
  storageBucket: "chatrobot-2000.appspot.com",
  messagingSenderId: "830846027124",
  appId: "1:830846027124:web:0e975b81e5defeb5"
};

firebase.initializeApp(firebaseConfig)

const Auth = firebase.auth()

function ScreenReducer(screen=0,action) {
  switch(action.type) {
    case 'WELCOME':
      screen=0
      return screen
      
    case 'INIT':
      screen=1
      return screen
      
    case 'HOME':
      screen=2
      return screen
      
    case 'CHATROOM':
      screen=3
      return screen
      
    default:
      return screen
  }
}

function RecipientReducer(recipient=null, action) {
  switch(action.type) {
    case 'SET':
      recipient=action.data
      return recipient
      
    default:
      return recipient
  }
}

let Reducer = Redux.combineReducers({
  Screen: ScreenReducer, 
  Recipient: RecipientReducer
})

let store = Redux.createStore(Reducer)


function App() {
  
  const [screen, setScreen] = React.useState(store.getState().Screen)
  
  React.useEffect(()=>{
    // Check Auth
    setTimeout(()=>{
    Auth.onAuthStateChanged((user) => {
      if (user) {
        store.dispatch({ type: 'HOME' })
      } else {
        store.dispatch({ type: 'INIT' })
      }
    })
    }, 2000)
    // Set Screen on subscribe
    store.subscribe(()=>{
      setScreen(store.getState().Screen)
    })
  }, [])
  
  return(
    <>
      {screen==0?<WelcomeScreen />:screen==1?<InitScreen />:screen==2?<Home />:screen==3?<ChatRoom />:null}
    </>
  )
}


ReactDOM.render(<App />, document.getElementById('root'))