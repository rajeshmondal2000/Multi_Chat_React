const timeStamp = (time) => {
  let d = new Date(time).toLocaleDateString()
  let dt = d.slice(0, 2)
  let mo = d.slice(3, 5)
  let t = new Date(time).toLocaleTimeString()
  let h = t.slice(0, 2)
  let m = t.slice(3, 5)
  if(dt == new Date().getDate() && mo == (new Date().getMonth()+1)) {
    return "Today"+"\n\b"+h+"."+m
  } else if(dt == (new Date().getDate()-1) && mo == (new Date().getMonth()+1)) {
    return "Yesterday"+"\n\b"+h+"."+m
  } else {
    return dt+"/"+mo+"\n\b"+h+"."+m
  }
}

function WelcomeScreen() {
  return(
    <div className="welcome-screen">
      <img src="images/preview.jpg" alt="" />
    </div>
  )
}

function InitScreen() {
  
  const [dname, setDname] = React.useState(null)
  
  const SignIn = ()=>{
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(function() {
        firebase.auth().signInAnonymously().then(()=>{
          let user = firebase.auth().currentUser
          firebase.database().ref("Users/" + user.uid).set({
            name: dname,
            uid: user.uid
          })
        }).catch(function(error) {
          console.log(error.code, error.message);
        });
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
  }
  
  const getName = (name)=>{
    setDname(name)
  }
  
  
  return(
    <div className="init-screen">
      <img src="images/avatar.png" alt="" />
      <p className="lead">Create Account</p>
      <div className="form-group">
        <input type="text" placeholder="Your Name" className="form-control" id="displayName" onKeyUp={(event)=>getName(event.target.value)} />
      </div>
      
      <div>
        <button className="btn btn-warning btn-block" onClick={()=>SignIn()}>Create</button>
      </div>
    </div>
  )
}

function Home() {
  const [recipient, setRecipient] = React.useState(null)
  
  React.useEffect(()=>{
    var user = firebase.auth().currentUser;
    firebase.database().ref("Users").on('value', (snapshot)=>{
      let Users = []
      snapshot.forEach((child)=>{
        if(child.val().uid != user.uid) {
          Users.unshift(child.val())
        }
      })
      setRecipient(Users)
    })
    // Set Last Seen
    setInterval(()=>{
      firebase.database().ref("Users/"+user.uid+"/lastSeen").set(new Date().getTime())
    }, 1000)
  }, [])
  
  const Status = (lastSeen)=>{
    let t = new Date().getTime()
    if(t-2000 < new Date(lastSeen).getTime() || new Date(lastSeen).getTime() > t+2000) {
      return 'Online'
    } else {
      let rt = timeStamp(lastSeen)
      return rt
    }
  }
  
  return(
    <div>
      {recipient?recipient.map((item)=>
        <div className="card" key={item.uid} onClick={()=>{
          store.dispatch({ type: 'CHATROOM' })
          store.dispatch({ 
            type: 'SET', 
            data: item
          })
        }}>
          <img src="images/avatar.png" alt="avatar" />
          <div>
            <p className="lead">{item.name}</p>
            <div>{Status(item.lastSeen)=='Online'?<p className="text-success">Online</p>:<p className="text-danger">Last Seen: {Status(item.lastSeen)}</p>}</div>
          </div>
        </div>
      ):<p className="loading">Loading... </p>}
    </div>
  )
}


function ChatRoom() {
  
  const [receiver, setReceiver] = React.useState(store.getState().Recipient.uid)
  
  const [sender, setSender] = React.useState(firebase.auth().currentUser.uid)
  
  const [channel, setChannel] = React.useState(()=>{
    if (sender < receiver) {
      return sender + receiver
    } else {
      return receiver + sender
    }
  })
  
  const [message, setMessage] = React.useState(null)
  
  React.useEffect(()=>{
    firebase.database().ref(channel).on('value', (snapshot)=>{
      let msg = []
      snapshot.forEach((child)=>{
        msg.unshift(child.val())
      })
      setMessage(msg)
    })
    document.getElementById("text-send").addEventListener('keyup', (event)=>{
      if(event.key == 'Enter') {
        Send()
      }
    })
  }, [])
  
  const Send = ()=>{
    let txt = document.getElementById("text-send").value
    firebase.database().ref(channel).push({
      senderId: sender, 
      receiveId: receiver, 
      timeStamp: new Date().getTime(),
      message: txt
    })
    document.getElementById("text-send").value = ""
  }
  
  
  return(
   <div className="chat-room">
   
   <div className="col-1-4">
    <img src="images/avatar.png" alt="" />
    <p className="lead top-0">{store.getState().Recipient.name}</p>
    <p className="lead danger" onClick={()=>store.dispatch({ type: 'HOME' })}>
      <ion-icon name="exit-outline"></ion-icon>
    </p>
   </div>
   
   <div className="scroll">
   {message?message.map((item)=>
     <div key={item.timeStamp}>
      {item.senderId==sender?<SendMsg msg={item.message} time={item.timeStamp} />:<ReceiveMsg msg={item.message} time={item.timeStamp} />}
     </div>
   ):null}
   </div>
   
   <div className="form-group bottom">
    <input type="text" placeholder="Type Your Messages" className="form-control" id="text-send" />
    <label onClick={()=>Send()}><ion-icon name="send-sharp"></ion-icon></label>
    </div>
   </div>
  )
}

function ReceiveMsg({ msg, time }) {
  
  return(
    <div className="left">
      <div className="card">
        <div>{msg}</div>
        <div className="timestamp danger">{timeStamp(time)}</div>
      </div>
    </div>
  )
}

function SendMsg({ msg, time }) {
  
  return(
    <div className="right">
      <div className="card">
        <div>{msg}</div>
        <div className="timestamp">{timeStamp(time)}</div>
      </div>
    </div>
  )
}

