class WebSocketController {

  constructor() {
    this._onConnected = this._onConnected.bind(this);
    this.onload = this.onload.bind(this)
    this._clearTextAndFocus = this._clearTextAndFocus.bind(this)
    this.showMessage = this.showMessage.bind(this)
    this.showNotification = this.showNotification.bind(this)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.requestSync = this.requestSync.bind(this)
    this.requestAsync = this.requestAsync.bind(this)
  }

  _onConnected(frame) {
    this.setConnected(true);
    console.log('Connected: ' + frame);
    this.stompClient.subscribe('/topic/broadcasted-message', this.showMessage);
    this.stompClient.subscribe('/user/queue/notification',
        this.showNotification)

    this._clearTextAndFocus()
  }

  setConnected(connected) {
    document.querySelectorAll(".pre-connected").forEach(
        elem => elem.disabled = connected);
    document.querySelectorAll(".post-connected").forEach(
        elem => elem.disabled = !connected);

    document.getElementById('mural').style.visibility = connected ? 'visible'
        : 'hidden';
    document.getElementById('response').innerHTML = '';

    document.querySelector(".connection-icon").classList.add(
        connected ? "connected" : "unconnected");
    document.querySelector(".connection-icon").classList.remove(
        connected ? "unconnected" : "connected");

    if (connected) {
      document.querySelector(".header").classList.add("connected")
    } else {
      document.querySelector(".header").classList.remove("connected")
    }
  }

  async login() {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    const response = await fetch('http://localhost:8080/v1/public/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"username": username, "password": password})
    })

    response.json().then(data => {
      sessionStorage.setItem("__LOGIN_TOKEN__", data.token)
      this.connect()
    })
  }

  async requestSync() {
    const response = await fetch('http://localhost:8080/v1/public/long-running',
        {
          method: 'POST'
        })

    response.text().then(data => {
      this.showNotification({body: data})
    })
  }

  async requestAsync() {
    const token = sessionStorage.getItem("__LOGIN_TOKEN__")

    const response = await fetch(
        'http://localhost:8080/v1/public/long-running/async',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"token": token})
        })

    response.json().then(data => {
      const subscription = this.stompClient.subscribe(
          "/user" + data.subscription,
          (message) => {
            this.showNotification(message)
            this.stompClient.unsubscribe(subscription.id)
          })
      this.showNotification({body: JSON.stringify(data)})
    })
  }

  logout() {
    sessionStorage.removeItem("__LOGIN_TOKEN__")
    this.disconnect()
  }

  connect() {
    const token = sessionStorage.getItem("__LOGIN_TOKEN__")
    const socket = new SockJS('/chat-app');
    this.stompClient = Stomp.over(socket);
    this.stompClient.heartbeat.outgoing = 20000;
    this.stompClient.heartbeat.incoming = 0;
    this.stompClient.connect({'__TOKEN__': token},
        this._onConnected,
        (e) => {
          this.disconnect()
        }
    );
  }

  disconnect() {
    if (this.stompClient != null) {
      this.stompClient.disconnect();
    }
    this.setConnected(false);
    document.getElementById("username").value = ''
    document.getElementById("username").focus()
    document.getElementById("password").value = ''
    console.log("Disconnected");
  }

  sendMessage() {
    const message = document.getElementById('text').value;
    if (message === '') {
      return
    }

    this.stompClient.send("/app/message", {}, message);
    this.stompClient.send('/app/notification', {}, message);
  }

  showMessage(message) {
    const data = JSON.parse(message.body)

    const token = sessionStorage.getItem("__LOGIN_TOKEN__")
    const messagePositionClass = token.indexOf(data.from) > -1
        ? "right"
        : "left"

    const response = document.getElementById('response');
    const messageRowDiv = document.createElement('div');
    messageRowDiv.classList.add('message-row')
    messageRowDiv.classList.add(`message-row-${messagePositionClass}`)

    const messageDiv = document.createElement('div')

    const messageP = document.createElement('p')
    messageP.appendChild(document.createTextNode(data.message))
    messageP.classList.add('message-item')
    messageP.classList.add(`message-item-${messagePositionClass}`)
    messageDiv.appendChild(messageP);

    if (messagePositionClass === "left") {
      const fromP = document.createElement('p')
      fromP.appendChild(document.createTextNode(data.from))
      fromP.classList.add('message-from')
      fromP.classList.add(`message-from-${messagePositionClass}`)
      messageDiv.appendChild(fromP)
    }

    messageRowDiv.appendChild(messageDiv);
    response.appendChild(messageRowDiv);

    response.scrollTop = response.scrollHeight

    this._clearTextAndFocus()
  }

  showNotification(message) {
    const divNotification = document.querySelector('.notification');
    divNotification.classList.add("visible")
    divNotification.classList.remove("invisible")

    const divNotificationBody = document.querySelector('.notification--body');
    const data = JSON.parse(message.body)
    divNotificationBody.innerHTML = `<p>${data.from ? data.from + ": "
        : ""}${data.message}</p>`;

    setTimeout(() => {
      divNotification.classList.add("invisible")
      divNotification.classList.remove("visible")
    }, 2000)
  }

  _clearTextAndFocus() {
    document.getElementById("text").value = ''
    document.getElementById("text").focus()
  }

  onload() {
    this.logout()
    document.getElementById("text").addEventListener('keyup', e => {
      if (e.key !== 'Enter') {
        return
      }

      this.sendMessage(e.target.value)
    })

    document.getElementById('password').addEventListener('keyup', e => {
      if (e.key !== 'Enter') {
        return
      }
      this.connect()
    })
  }
}

const webSocket = new WebSocketController();