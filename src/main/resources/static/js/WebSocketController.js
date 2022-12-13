class WebSocketController {

  constructor() {
    this._onConnected = this._onConnected.bind(this);
    this.onload = this.onload.bind(this)
    this._clearTextAndFocus = this._clearTextAndFocus.bind(this)
    this.showMessage = this.showMessage.bind(this)
    this.showNotification = this.showNotification.bind(this)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.request = this.request.bind(this)
    this.request2 = this.request2.bind(this)
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

  async request() {
    const response = await fetch('http://localhost:8080/v1/public/long-running',
        {
          method: 'POST'
        })

    response.text().then(data => {
      this.showNotification({body: data})
    })
  }

  async request2() {
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

    response.text().then(data => {
      this.showNotification({body: data})
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
    const response = document.getElementById('response');
    const p = document.createElement('p');
    p.style.wordWrap = 'break-word';
    const data = JSON.parse(message.body)
    p.appendChild(document.createTextNode(data.from + ": " + data.message));
    response.appendChild(p);

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

    document.getElementById('username').addEventListener('keyup', e => {
      if (e.key !== 'Enter') {
        return
      }
      this.connect()
    })
  }
}

const webSocket = new WebSocketController();