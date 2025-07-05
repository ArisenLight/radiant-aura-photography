// Import Firebase SDK modules (browser-compatible ES modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBYIyN8Wnao-QcoiQ898rJQfnZX-c4Q97Y",
  authDomain: "radiant-aura-photography.firebaseapp.com",
  projectId: "radiant-aura-photography",
  storageBucket: "radiant-aura-photography.firebasestorage.app",  // <-- change here
  messagingSenderId: "84953777428",
  appId: "1:84953777428:web:6b216b4664b9175c292e01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Check current page by URL path or specific element
const path = window.location.pathname;

// ------------------------
// Login page logic
if (path.endsWith("index.html") || path === "/" || path.endsWith("login.html")) {
  window.adminLogin = function () {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(({ user }) => {
        if (user.email === "radiantauraphotography@gmail.com") {
          alert("Welcome, Sarah!");
          window.location.href = "admin.html"; // Redirect to admin page
        } else {
          alert("You are not authorized.");
          signOut(auth);
        }
      })
      .catch(error => {
        alert("Login failed: " + error.message);
      });
  };
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    const adminPanel = document.getElementById("adminPanel");
    const welcomeHeading = adminPanel.querySelector("h2");
    const email = user.email || "";
    const username = email.split("@")[0];  // get the part before '@'
    welcomeHeading.textContent = `Welcome, ${username}`;
  }
});


// ------------------------
// Admin page logic
if (path.endsWith("admin.html")) {
  onAuthStateChanged(auth, user => {
    if (!user || user.email !== "radiantauraphotography@gmail.com") {
      alert("Please log in as admin.");
      window.location.href = "index.html";
    } else {
      document.getElementById("adminEmailDisplay").textContent = user.email || "Admin";
    }
  });

  window.logout = function () {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  };

window.uploadImage = async function () {
  const fileInput = document.getElementById("fileInput");
  const gallerySelect = document.getElementById("gallerySelect");

  const file = fileInput.files[0];
  const selectedGallery = gallerySelect.value;

  if (!file) {
    alert("Please select a file.");
    return;
  }

  const user = getAuth().currentUser;
const email = user?.email?.toLowerCase();
console.log("Logged in user email:", email);
if (email !== "radiantauraphotography@gmail.com") {
  alert("Not logged in as admin!");
  return;
}



  const timestamp = Date.now();
  let storagePath, firestoreData;

  if (email === "radiantauraphotography@gmail.com") {
    // Admin upload → public gallery path
    storagePath = `Gallery/highlights/${selectedGallery}/${timestamp}-${file.name}`;
    firestoreData = {
      imageUrl: "", // placeholder
      gallery: selectedGallery,
      timestamp: timestamp
      // no owner field
    };
  } else {
    // Client upload → private gallery path
    storagePath = `client-gallery/${selectedGallery}/${email}/${timestamp}-${file.name}`;
    firestoreData = {
      imageUrl: "", // placeholder
      gallery: selectedGallery,
      timestamp: timestamp,
      owner: email
    };
  }

  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    firestoreData.imageUrl = downloadURL;
    await addDoc(collection(db, "images"), firestoreData);

    alert("Upload complete!");
    fileInput.value = "";
  } catch (error) {
    console.error(error);
    alert("Upload failed: " + error.message);
  }
};


  document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("galleryContainer");
    if (!container) return;

    const galleryType = container.dataset.gallery;
    if (!galleryType) return;

    try {
      const q = query(collection(db, "images"), where("gallery", "==", galleryType));
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const data = doc.data();
        const img = document.createElement("img");
        img.src = data.imageUrl;
        img.alt = "Gallery Image";
        img.classList.add("gallery-image");
        container.appendChild(img);
      });
    } catch (error) {
      console.error("Error loading images:", error);
    }
  });
}

// ------------------------
// Common code (for all pages)
// Example: carousel and hamburger menu

document.addEventListener("DOMContentLoaded", () => {
  // Carousel images
  const images = [
    "Gallery/highlights/maternity/Image8.jpeg",
    "Gallery/highlights/formal/Image28.jpeg",
    "Gallery/highlights/family/Image18.jpg",
    "Gallery/highlights/family/Image13.jpg",
    "Gallery/highlights/maternity/Image21.jpg",
    "Gallery/highlights/formal/Image26.jpeg",
    "Gallery/highlights/maternity/Image2.jpeg"
  ];

  let index = 0;
  const imageElement = document.getElementById("carousel-image");
  if (imageElement) {
    imageElement.src = images[0];
    setInterval(() => {
      index = (index + 1) % images.length;
      imageElement.src = images[index];
    }, 3000);
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

  // Static image slideshow rotators
  const rotators = [
    { selector: ".maternity-image", images: [
      "Gallery/highlights/maternity/Image2.jpeg",
      "Gallery/highlights/maternity/Image3.jpeg",
      "Gallery/highlights/maternity/Image4.jpeg",
      "Gallery/highlights/maternity/Image5.jpeg",
      "Gallery/highlights/maternity/Image8.jpeg",
      "Gallery/highlights/maternity/Image10.jpg",
      "Gallery/highlights/maternity/Image1.jpeg",
      "Gallery/highlights/maternity/Image11.jpg",
      "Gallery/highlights/maternity/Image14.jpg",
      "Gallery/highlights/maternity/Image15.jpg",
      "Gallery/highlights/maternity/Image16.jpg",
      "Gallery/highlights/maternity/Image17.jpg",
      "Gallery/highlights/maternity/Image21.jpg",
      "Gallery/highlights/maternity/Image27.jpeg"
    ]},
    { selector: ".family-image", images: [
      "Gallery/highlights/family/Image7.jpg",
      "Gallery/highlights/family/Image9.jpeg",
      "Gallery/highlights/family/Image13.jpg",
      "Gallery/highlights/family/Image18.jpg",
      "Gallery/highlights/family/Image19.jpg",
      "Gallery/highlights/family/Image20.jpg",
      "Gallery/highlights/family/Image22.jpg",
      "Gallery/highlights/family/Image6.jpg",
      "Gallery/highlights/family/Image23.jpg",
      "Gallery/highlights/family/Image24.jpg",
      "Gallery/highlights/family/Image25.jpg",
      "Gallery/highlights/family/Image12.jpg"
    ]},
    { selector: ".formal-image", images: [
      "Gallery/highlights/formal/Image28.jpeg",
      "Gallery/highlights/formal/Image29.jpeg",
      "Gallery/highlights/formal/Image30.jpeg",
      "Gallery/highlights/formal/Image26.jpeg"
    ]}
  ];

  rotators.forEach(({ selector, images }) => {
    const el = document.querySelector(selector);
    if (el) {
      let i = 0;
      setInterval(() => {
        i = (i + 1) % images.length;
        el.src = images[i];
      }, 3000);
    }
  });
});
  
    //Back to top button for galleries
 const backToTopButton = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });