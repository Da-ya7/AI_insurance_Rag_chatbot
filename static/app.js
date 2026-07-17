const USER_ID = 1; // demo user
const form = document.getElementById("chat-form");
const input = document.getElementById("question");
const chatWindow = document.getElementById("chat-window");

function addMsg(text, cls) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  if (cls === "bot") {
    div.innerHTML = marked.parse(text);
  } else {
    div.textContent = text;
  }
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  addMsg(question, "user");
  input.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID, question }),
    });
    const data = await res.json();
    addMsg(data.answer, "bot");
  } catch (err) {
    addMsg("Error reaching server.", "bot");
  }
});