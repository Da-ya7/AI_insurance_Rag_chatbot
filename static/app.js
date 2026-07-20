const USER_ID = 1; // demo user

const form = document.getElementById("chat-form");
const input = document.getElementById("question");
const chatWindow = document.getElementById("chat-window");
const newChatBtn = document.getElementById("new-chat");
const uploadInput = document.getElementById("doc-upload");
const uploadStatus = document.getElementById("upload-status");

const WELCOME_HTML = chatWindow.innerHTML;

function clearWelcome() {
  const welcome = chatWindow.querySelector(".welcome");
  if (welcome) welcome.remove();
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addUserMsg(text) {
  clearWelcome();
  const row = document.createElement("div");
  row.className = "msg-row user";
  row.innerHTML = `<div class="msg user"></div>`;
  row.querySelector(".msg").textContent = text;
  chatWindow.appendChild(row);
  scrollToBottom();
  return row;
}

function addPendingBotMsg() {
  const row = document.createElement("div");
  row.className = "msg-row bot";
  row.innerHTML = `<div class="msg bot pending">Reading the policy documents…</div>`;
  chatWindow.appendChild(row);
  scrollToBottom();
  return row;
}

function renderClauses(sources) {
  if (!sources || !sources.length) return "";
  const tabs = sources
    .map((s, i) => {
      const label = s.page ? `${s.source} · p.${s.page}` : s.source;
      return `<button type="button" class="clause-tab" data-idx="${i}">
        <span class="clause-num">${i + 1}</span><span>${escapeHtml(label)}</span>
      </button>`;
    })
    .join("");
  const details = sources
    .map((s, i) => {
      const label = s.page ? `${s.source} · page ${s.page}` : s.source;
      return `<div class="clause-detail" data-idx="${i}">
        <span class="clause-source">${escapeHtml(label)}</span>${escapeHtml(s.text)}
      </div>`;
    })
    .join("");
  return `<div class="clauses">${tabs}</div>${details}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderFeedbackRow(chatId) {
  if (!chatId) return "";
  return `<div class="feedback-row" data-chat-id="${chatId}">
    <button type="button" class="fb-btn" data-rating="up" aria-label="Helpful">
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M7 9v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4-7a2 2 0 0 1 2 2v3h4.5a1.5 1.5 0 0 1 1.46 1.83l-1.3 6A2 2 0 0 1 15.7 18H7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
    </button>
    <button type="button" class="fb-btn" data-rating="down" aria-label="Not helpful">
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M13 11v-9h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Zm0 0-4 7a2 2 0 0 1-2-2v-3H2.5a1.5 1.5 0 0 1-1.46-1.83l1.3-6A2 2 0 0 1 4.3 2H13" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
    </button>
  </div>`;
}

function addBotMsg(row, { answer, sources, chat_id }) {
  const block = document.createElement("div");
  block.className = "bot-block";
  block.innerHTML = `
    <div class="msg bot">${marked.parse(answer || "")}</div>
    ${renderClauses(sources)}
    ${renderFeedbackRow(chat_id)}
  `;
  row.innerHTML = "";
  row.appendChild(block);
  scrollToBottom();
}

function addErrorMsg(row, text) {
  row.innerHTML = `<div class="msg bot">${escapeHtml(text)}</div>`;
}

chatWindow.addEventListener("click", (e) => {
  const tab = e.target.closest(".clause-tab");
  if (tab) {
    const idx = tab.dataset.idx;
    const detail = tab.closest(".bot-block").querySelector(`.clause-detail[data-idx="${idx}"]`);
    if (detail) detail.classList.toggle("is-open");
    return;
  }

  const fb = e.target.closest(".fb-btn");
  if (fb) {
    const row = fb.closest(".feedback-row");
    const chatId = Number(row.dataset.chatId);
    const rating = fb.dataset.rating;
    row.querySelectorAll(".fb-btn").forEach((b) => b.classList.remove("is-active-up", "is-active-down"));
    fb.classList.add(rating === "up" ? "is-active-up" : "is-active-down");
    submitFeedback(chatId, rating);
    return;
  }

  const suggestion = e.target.closest(".suggestion");
  if (suggestion) {
    input.value = suggestion.textContent.trim();
    form.requestSubmit();
  }
});

async function submitFeedback(chatId, rating) {
  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, rating }),
    });
  } catch (err) {
    // best-effort, ignore
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  addUserMsg(question);
  input.value = "";
  const botRow = addPendingBotMsg();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID, question }),
    });
    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();
    addBotMsg(botRow, data);
  } catch (err) {
    addErrorMsg(botRow, "Couldn't reach the assistant. Please try again.");
  }
});

newChatBtn.addEventListener("click", () => {
  chatWindow.innerHTML = WELCOME_HTML;
});

uploadInput.addEventListener("change", async () => {
  const file = uploadInput.files[0];
  if (!file) return;
  uploadStatus.textContent = `Indexing ${file.name}…`;
  uploadStatus.className = "upload-status";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload-document", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Upload failed");
    }
    const data = await res.json();
    uploadStatus.textContent = `Indexed ${data.filename} · ${data.pages} pages · ${data.chunks_indexed} chunks`;
    uploadStatus.className = "upload-status is-success";
  } catch (err) {
    uploadStatus.textContent = err.message || "Upload failed";
    uploadStatus.className = "upload-status is-error";
  } finally {
    uploadInput.value = "";
  }
});