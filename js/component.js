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
          firebase.database().ref("Users/" +user.uid).set({
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
            <p className="text-danger">Last Seen: {new Date(item.lastSeen).getHours()+":"+new Date(item.lastSeen).getMinutes()}</p>
          </div>
        </div>
      ):null}
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
   <div className="scroll">
   {message?message.map((item)=>
     <>
      {item.senderId==sender?<SendMsg msg={item.message} time={item.timeStamp} key={item.timeStamp} />:<ReceiveMsg msg={item.message} time={item.timeStamp} key={item.timeStamp} />}
     </>
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
        <div className="timestamp">{new Date(time).toLocaleTimeString()}</div>
      </div>
    </div>
  )
}

function SendMsg({ msg, time }) {
  return(
    <div className="right">
      <div className="card">
        <div>{msg}</div>
        <div className="timestamp">{new Date(time).toLocaleTimeString()}</div>
      </div>
    </div>
  )
}

