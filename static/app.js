const AUTH_STORAGE_KEY = "insurance-ai-user";

const form = document.getElementById("chat-form");
const input = document.getElementById("question");
const chatWindow = document.getElementById("chat-window");
const chatApp = document.getElementById("chat-app");
const authPanel = document.getElementById("auth-panel");
const newChatBtn = document.getElementById("new-chat");
const uploadInput = document.getElementById("doc-upload");
const uploadStatus = document.getElementById("upload-status");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const authStatus = document.getElementById("auth-status");
const logoutBtn = document.getElementById("logout-btn");
const userPanelLabel = document.getElementById("user-panel-label");
const userName = document.getElementById("user-name");

const WELCOME_HTML = chatWindow.innerHTML;

let currentUser = loadStoredUser();

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function storeUser(user) {
  currentUser = user;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  currentUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function setAuthStatus(message, kind = "") {
  authStatus.textContent = message;
  authStatus.className = kind ? `auth-status ${kind}` : "auth-status";
}

function setAuthMode(mode) {
  const isLogin = mode === "login";
  loginTab.classList.toggle("is-active", isLogin);
  signupTab.classList.toggle("is-active", !isLogin);
  loginTab.setAttribute("aria-selected", String(isLogin));
  signupTab.setAttribute("aria-selected", String(!isLogin));
  loginForm.classList.toggle("is-active", isLogin);
  signupForm.classList.toggle("is-active", !isLogin);
  setAuthStatus("");
}

function setUserPanel() {
  const isSignedIn = Boolean(currentUser);
  newChatBtn.disabled = !isSignedIn;
  logoutBtn.hidden = !isSignedIn;
  userPanelLabel.textContent = isSignedIn ? "Signed in" : "Guest mode";
  userName.textContent = isSignedIn
    ? `${currentUser.name} · ${currentUser.email}`
    : "Log in or sign up to keep your chat history tied to an account.";
}

function showAuthView() {
  authPanel.classList.remove("is-hidden");
  chatApp.classList.add("is-hidden");
  chatWindow.innerHTML = WELCOME_HTML;
  input.value = "";
  setUserPanel();
}

function showChatView() {
  authPanel.classList.add("is-hidden");
  chatApp.classList.remove("is-hidden");
  setUserPanel();
}

function applyAuthState() {
  if (currentUser) {
    showChatView();
  } else {
    showAuthView();
  }
}

async function submitAuth(endpoint, payload, submitButton, successMessage) {
  submitButton.disabled = true;
  setAuthStatus("Signing in...", "");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || "Authentication failed");
    }

    storeUser(data);
    setUserPanel();
    showChatView();
    setAuthStatus(successMessage, "is-success");
  } catch (err) {
    setAuthStatus(err.message || "Authentication failed", "is-error");
  } finally {
    submitButton.disabled = false;
  }
}

applyAuthState();
setAuthMode("login");
setUserPanel();

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

loginTab.addEventListener("click", () => setAuthMode("login"));
signupTab.addEventListener("click", () => setAuthMode("signup"));

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await submitAuth(
    "/api/login",
    { email: loginEmail.value.trim(), password: loginPassword.value },
    loginForm.querySelector(".auth-submit"),
    `Welcome back, ${loginEmail.value.trim()}.`
  );
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await submitAuth(
    "/api/signup",
    {
      name: signupName.value.trim(),
      email: signupEmail.value.trim(),
      password: signupPassword.value,
    },
    signupForm.querySelector(".auth-submit"),
    `Account created for ${signupName.value.trim()}.`
  );
});

logoutBtn.addEventListener("click", () => {
  clearStoredUser();
  setAuthMode("login");
  applyAuthState();
  setAuthStatus("Signed out.", "is-success");
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
  if (!currentUser) {
    setAuthMode("login");
    setAuthStatus("Please log in to send a message.", "is-error");
    showAuthView();
    return;
  }
  const question = input.value.trim();
  if (!question) return;
  addUserMsg(question);
  input.value = "";
  const botRow = addPendingBotMsg();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.id, question }),
    });
    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();
    addBotMsg(botRow, data);
  } catch (err) {
    addErrorMsg(botRow, "Couldn't reach the assistant. Please try again.");
  }
});

newChatBtn.addEventListener("click", () => {
  if (!currentUser) {
    setAuthMode("login");
    setAuthStatus("Please log in to start a conversation.", "is-error");
    showAuthView();
    return;
  }
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