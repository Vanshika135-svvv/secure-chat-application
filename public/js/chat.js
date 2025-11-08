const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");

// ✅ Get Username & Room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// ✅ Socket
const socket = io();

// ✅ Join chatroom
socket.emit("joinRoom", { username, room });

// ✅ Get room + users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// ✅ Message from server
socket.on("message", (message) => {
  outputMessage(message);

  // Auto scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// ✅ Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// ✅ Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>
  `;
  document.querySelector(".chat-messages").appendChild(div);
}

// ✅ Add room name to DOM
function outputRoomName(room) {
  document.getElementById("room-name").innerText = room;
}

// ✅ Add users to DOM
function outputUsers(users) {
  document.getElementById("users").innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}
