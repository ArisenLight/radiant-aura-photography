import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBYIyN8Wnao-QcoiQ898rJQfnZX-c4Q97Y",
  authDomain: "radiant-aura-photography.firebaseapp.com",
  projectId: "radiant-aura-photography",
  storageBucket: "radiant-aura-photography.firebasestorage.app",
  messagingSenderId: "84953777428",
  appId: "1:84953777428:web:6b216b4664b9175c292e01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elements
const loginForm = document.getElementById('login-form');
const loginErrorModal = document.getElementById('loginErrorModal');
const closeLoginErrorBtn = document.getElementById('closeLoginErrorBtn');

// Show login error modal
function showLoginError(message = "Incorrect email or password. Please try again.") {
  const msgBox = document.getElementById('loginErrorMsg');
  if (msgBox) msgBox.textContent = message;
  if (loginErrorModal) loginErrorModal.style.display = 'flex';
}

// Close error modal
if (closeLoginErrorBtn) {
  closeLoginErrorBtn.addEventListener('click', () => {
    loginErrorModal.style.display = 'none';
  });
}

if (loginErrorModal) {
  loginErrorModal.addEventListener('click', (e) => {
    if (e.target === loginErrorModal) {
      loginErrorModal.style.display = 'none';
    }
  });
}

// Submit login form
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "client-gallery.html";
    } catch (error) {
      showLoginError("Login failed: Invalid email or password.");
    }
  });
}

// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    const icon = hamburger.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });
}

// Logout modal (only if present)
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

if (logoutBtn && logoutModal && confirmLogoutBtn && cancelLogoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logoutModal.classList.add("show");
  });

  cancelLogoutBtn.addEventListener("click", () => {
    logoutModal.classList.remove("show");
  });

  confirmLogoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "/admin-login.html";
    });
  });

  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) {
      logoutModal.classList.remove("show");
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && logoutModal.classList.contains("show")) {
      logoutModal.classList.remove("show");
    }
  });
}
