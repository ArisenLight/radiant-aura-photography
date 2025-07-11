import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

// Show login error modal with message
function showLoginError(message = "Incorrect email or password. Please try again.") {
  document.getElementById('loginErrorMsg').textContent = message;
  loginErrorModal.style.display = 'flex';
}

// Close modal handlers
closeLoginErrorBtn.addEventListener('click', () => {
  loginErrorModal.style.display = 'none';
});
loginErrorModal.addEventListener('click', e => {
  if (e.target === loginErrorModal) {
    loginErrorModal.style.display = 'none';
  }
});

// Login form submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect after successful login
    window.location.href = "client-gallery.html";
  } catch (error) {
    // Show modal on error instead of alert
    showLoginError("Login failed: " + "invalid email or password");
  }
});

// Hamburger menu toggle (optional, if you have a hamburger menu)
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
