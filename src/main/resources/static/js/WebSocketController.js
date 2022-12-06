class WebSocketController {

  constructor() {
    this._onConnected = this._onConnected.bind(this);
    this.onload = this.onload.bind(this)
  }

  _onConnected(frame) {
    this.setConnected(true);
    console.log('Connected: ' + frame);
    this.stompClient.subscribe('/topic/mural', this.showMessage);
    this.stompClient.subscribe('/user/queue/notification', message => {
      console.log("NOTIFICATION:::", message)
    })
  }

  setConnected(connected) {
    document.getElementById('connect').disabled = connected;
    document.getElementById('disconnect').disabled = !connected;
    document.getElementById('mural').style.visibility = connected ? 'visible'
        : 'hidden';
    document.getElementById('response').innerHTML = '';
    document.getElementById("username").disabled =
        connected && document.getElementById("username").value !== '';
  }

  connect() {
    const username = document.getElementById("username").value

    const socket = new SockJS('/chat-app');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({'__TOKEN__': username}, this._onConnected);
  }

  disconnect() {
    if (this.stompClient != null) {
      this.stompClient.disconnect();
    }
    this.setConnected(false);
    document.getElementById("username").value = ''
    document.getElementById("username").focus()
    console.log("Disconnected");
  }

  sendMessage() {
    const message = document.getElementById('text').value;
    this.stompClient.send("/app/message", {}, message);
    this.stompClient.send('/app/notification', {}, message);
  }

  showMessage(message) {
    const response = document.getElementById('response');
    const p = document.createElement('p');
    p.style.wordWrap = 'break-word';
    p.appendChild(document.createTextNode(message.body));
    response.appendChild(p);

    document.getElementById("text").value = ''
    document.getElementById("text").focus()
  }

  onload() {
    this.disconnect()
    document.getElementById("text").addEventListener('keyup', e => {
      if (e.key !== 'Enter') {
        return
      }

      this.sendMessage(e.target.value)
    })
  }
}

const webSocket = new WebSocketController();