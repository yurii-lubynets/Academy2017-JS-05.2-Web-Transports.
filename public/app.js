(() => {
    const sendButton = document.getElementById('sendButton');
    const field = document.getElementById('field');
    const messageHistory = document.querySelector('.messageHistory');
    const name = document.getElementById('nameInput');
    const nickName = document.getElementById('nickNameInput');
    const userBtn = document.querySelector('.userBtn');
    const nameFiled = document.querySelector('.nameFiled');
    const userIsTyping = document.querySelector('.userIsTyping');
    const modalWindow = document.getElementById('modal_login-window');
    const users = document.getElementById('users');

    const socket = io('http://localhost:8080');
    let user = {};

    userBtn.onclick = () => {
        user = {
            userName: name.value,
            userNickName: nickName.value,
            status: "just appeared",
        };
        socket.emit('new user', user);
        name.value = '';
        nickName.value = '';
        modalWindow.style.display = "none";
    };
    socket.on('messageHistory', (data) => {
        userIsTyping.innerText = '';
        messageHistory.innerText = '';
        data.map((element) => {
            let itemMessage = document.createElement("div");
            itemMessage.classList.add('well');
            itemMessage.innerText = element.sender.userNickName +": "+ element.message;
            messageHistory.appendChild(itemMessage);
        });
    });
    sendButton.onclick = (event) => {
        let text = field.value;
        event.preventDefault();
        socket.emit('send', {message: text, sender:user});
        field.value = '';
    };
    socket.on('get users', (data) => {
        users.innerText = '';
        data.map((el) => {
            let itemMessage = document.createElement("li");
            itemMessage.classList.add('list-group-item');
            if (JSON.stringify(el) === JSON.stringify(user)) {
                itemMessage.innerText = "[You] "+ el.userName +" (@"+ el.userNickName +") " + el.status;
            } else {
                itemMessage.innerText = el.userName +" (@"+ el.userNickName +") " + el.status;
            }
            users.appendChild(itemMessage);
        });
    });
    window.onbeforeunload = () => {
        socket.emit('change to offline', user);
    };
    field.addEventListener('keyup', (e) => {
        if (e.keyCode === 13)  {
            let text = field.value;
            console.log("111");
            socket.emit('send', {message: text, sender:user});
            field.value =''
        }
        else {
            if (e.keyCode === 111) {
                let text = field.value;
                console.log("+++");
            } else {
                socket.emit('is typing', user);
            }
        }
    });
    socket.on('typing', (data) => {
        userIsTyping.innerHTML = '';
        if (data) {
            userIsTyping.innerHTML = data.nickname + ' is typing...';
        } else {
            userIsTyping.innerHTML = '';
        }
    });
})();