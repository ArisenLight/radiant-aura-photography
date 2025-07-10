import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    // Your Firebase config
    const firebaseConfig = {
  apiKey: "AIzaSyBYIyN8Wnao-QcoiQ898rJQfnZX-c4Q97Y",
  authDomain: "radiant-aura-photography.firebaseapp.com",
  projectId: "radiant-aura-photography",
  storageBucket: "radiant-aura-photography.firebasestorage.app",
  messagingSenderId: "84953777428",
  appId: "1:84953777428:web:6b216b4664b9175c292e01"
};

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully! You can now log in.");
        window.location.href = "client-login.html";
      } catch (error) {
        alert("Error: " + error.message);
      }
    });