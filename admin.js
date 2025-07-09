import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ✅ Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBYIyN8Wnao-QcoiQ898rJQfnZX-c4Q97Y",
  authDomain: "radiant-aura-photography.firebaseapp.com",
  projectId: "radiant-aura-photography",
  storageBucket: "radiant-aura-photography.firebasestorage.app",
  messagingSenderId: "84953777428",
  appId: "1:84953777428:web:6b216b4664b9175c292e01"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// 📌 Select page elements
const loginSection = document.getElementById("login-section");
const uploadSection = document.getElementById("upload-section");

const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const previewContainer = document.getElementById("previewContainer");

const toggleUploadedGalleryBtn = document.getElementById("toggleUploadedGalleryBtn");
const uploadedGallery = document.getElementById("uploadedGallery");

const gallerySelect = document.getElementById("gallerySelect");
const uploadStatus = document.getElementById("uploadStatus");

// Modals
const cancelUploadBtn = document.getElementById("cancelUploadBtn");
const cancelModal = document.getElementById("cancelModal");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const cancelCancelBtn = document.getElementById("cancelCancelBtn");

const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

// Variables for upload & delete tracking
let uploadCanceled = false;
let uploadTasks = [];

let deleteTargetElement = null;  // For delete modal: which image wrapper is targeted
let deleteTargetPath = null;     // Path of image to delete

// Track selected files in preview for upload and removal
let selectedPreviewFiles = [];

// 🖼️ Show preview thumbnails styled like uploaded images, with matching delete button
fileInput.addEventListener("change", () => {
  previewContainer.innerHTML = ""; // Clear previous previews
  selectedPreviewFiles = Array.from(fileInput.files); // Track files

  selectedPreviewFiles.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("uploaded-image");  // Same styling as uploaded images

        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Preview";

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.classList.add("delete-btn");  // Same delete button style
        deleteBtn.onclick = () => {
          wrapper.remove();
          selectedPreviewFiles = selectedPreviewFiles.filter(f => f !== file);

          if (selectedPreviewFiles.length === 0) {
            fileInput.value = "";
          }
        };

        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        previewContainer.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    }
  });
});

// Toggle uploaded images display minimizable
toggleUploadedGalleryBtn.addEventListener("click", () => {
  if (uploadedGallery.style.display === "none") {
    uploadedGallery.style.display = "flex";
    toggleUploadedGalleryBtn.textContent = "Hide Uploaded Images ▲";
  } else {
    uploadedGallery.style.display = "none";
    toggleUploadedGalleryBtn.textContent = "Show Uploaded Images ▼";
  }
});

// 🔐 Handle Login
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginError.textContent = "";
    })
    .catch((error) => {
      loginError.textContent = "Login failed: " + error.message;
    });
});

let inactivityTimer;
const AUTO_LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    auth.signOut().then(() => {
      alert("Logged out due to inactivity.");
      window.location.reload(); // or redirect to login
    });
  }, AUTO_LOGOUT_TIME);
}

// Reset timer on any user activity
["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
  window.addEventListener(event, resetInactivityTimer);
});

// Start tracking after admin logs in
onAuthStateChanged(auth, user => {
  if (user) {
    resetInactivityTimer();
  }
});

function loadUploadedImages(folder) {
  uploadedGallery.innerHTML = "";

  const folderRef = ref(storage, `Gallery/highlights/${folder}/`);

  listAll(folderRef)
    .then((res) => {
      if (res.items.length === 0) {
        uploadedGallery.innerHTML = "<p>No images uploaded yet.</p>";
        return;
      }

      res.items.forEach((itemRef) => {
        getDownloadURL(itemRef)
          .then((url) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("uploaded-image");

            const img = document.createElement("img");
            img.src = url;
            img.alt = "Uploaded image";

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.dataset.path = itemRef.fullPath;

            wrapper.appendChild(img);
            wrapper.appendChild(deleteBtn);
            uploadedGallery.appendChild(wrapper);
          })
          .catch((error) => {
            console.warn("Skipping image, failed to get URL:", error);
          });
      });
    })
    .catch((error) => {
      console.error("Error loading images:", error);
      uploadedGallery.innerHTML = "<p>Failed to load images.</p>";
    });
}

// 👀 Show upload UI only if admin is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email === "radiantauraphotography@gmail.com") {
      loginSection.style.display = "none";
      uploadSection.style.display = "block";

      // Load uploaded images for the selected folder
      const defaultFolder = gallerySelect.value;
      loadUploadedImages(defaultFolder);

      // Reload images when gallery folder changes
      gallerySelect.addEventListener("change", (e) => {
        loadUploadedImages(e.target.value);
      });
    } else {
      loginError.textContent = "You are not authorized.";
      signOut(auth);
    }
  } else {
    loginSection.style.display = "block";
    uploadSection.style.display = "none";
  }
});

// ⬆️ Handle Image Upload
uploadBtn.addEventListener("click", () => {
  const files = selectedPreviewFiles; // Use filtered preview files
  const folder = gallerySelect.value;

  if (!files.length) {
    uploadStatus.textContent = "Please select at least one file.";
    return;
  }

  // Clear previous previews before starting upload
  previewContainer.innerHTML = "";
  selectedPreviewFiles = [];

  uploadStatus.textContent = `Uploading 0 / ${files.length}`;
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  cancelUploadBtn.style.display = "inline-block";

  let uploadedCount = 0;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const bytesTransferredArray = new Array(files.length).fill(0);
  uploadCanceled = false;
  uploadTasks = [];

  cancelUploadBtn.onclick = () => {
    cancelModal.style.display = "block";
  };

  confirmCancelBtn.onclick = () => {
    uploadCanceled = true;
    uploadTasks.forEach(task => {
      if (task) task.cancel();
    });
    uploadStatus.textContent = "Upload canceled.";
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";
    cancelUploadBtn.style.display = "none";
    fileInput.value = "";
    previewContainer.innerHTML = "";
    cancelModal.style.display = "none";
  };

  cancelCancelBtn.onclick = () => {
    cancelModal.style.display = "none";
  };

  window.addEventListener("click", (event) => {
    if (event.target === cancelModal) {
      cancelModal.style.display = "none";
    }
  });

  files.forEach((file, index) => {
    const storagePath = `Gallery/highlights/${folder}/${file.name}`;
    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
    uploadTasks.push(uploadTask);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (uploadCanceled) return;

        bytesTransferredArray[index] = snapshot.bytesTransferred;
        const totalTransferred = bytesTransferredArray.reduce((a, b) => a + b, 0);
        const percent = (totalTransferred / totalBytes) * 100;
        progressBar.style.width = percent + "%";
      },
      (error) => {
        if (uploadCanceled) return;

        if (error.code === 'storage/canceled') {
          console.log("Upload canceled by user.");
          return;
        }
        console.error("Upload error:", error);
        uploadStatus.textContent = "One or more uploads failed.";
        progressContainer.style.display = "none";
        progressBar.style.width = "0%";
        cancelUploadBtn.style.display = "none";
      },
      () => {
        if (uploadCanceled) return;

        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          const wrapper = document.createElement("div");
          wrapper.classList.add("uploaded-image");

          const img = document.createElement("img");
          img.src = url;
          img.alt = "Uploaded image";

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "×";
          deleteBtn.classList.add("delete-btn");
          deleteBtn.dataset.path = storagePath;

          wrapper.appendChild(img);
          wrapper.appendChild(deleteBtn);
          uploadedGallery.appendChild(wrapper);

          uploadedCount++;
          uploadStatus.textContent = `Uploading ${uploadedCount} / ${files.length}`;

          if (uploadedCount === files.length) {
            uploadStatus.textContent = "All uploads complete!";
            progressContainer.style.display = "none";
            progressBar.style.width = "0%";
            cancelUploadBtn.style.display = "none";
            fileInput.value = "";
          }
        });
      }
    );
  });
});

// Delegated event listener for delete buttons - show custom modal
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    deleteTargetElement = e.target.closest(".uploaded-image");
    deleteTargetPath = e.target.getAttribute("data-path");

    if (!deleteTargetPath) return;

    deleteConfirmModal.style.display = "flex";
  }
});

// Confirm delete action
confirmDeleteBtn.addEventListener("click", () => {
  if (!deleteTargetPath || !deleteTargetElement) return;

  const fileRef = ref(storage, deleteTargetPath);
  deleteObject(fileRef)
    .then(() => {
      deleteTargetElement.remove();
      console.log("Image deleted:", deleteTargetPath);

      deleteConfirmModal.style.display = "none";
      deleteTargetElement = null;
      deleteTargetPath = null;
    })
    .catch((error) => {
      console.error("Failed to delete image:", error);
      alert("Error deleting image.");

      deleteConfirmModal.style.display = "none";
      deleteTargetElement = null;
      deleteTargetPath = null;
    });
});

// Cancel delete action
cancelDeleteBtn.addEventListener("click", () => {
  deleteConfirmModal.style.display = "none";
  deleteTargetElement = null;
  deleteTargetPath = null;
});

// Close delete modal if click outside modal content
window.addEventListener("click", (event) => {
  if (event.target === deleteConfirmModal) {
    deleteConfirmModal.style.display = "none";
    deleteTargetElement = null;
    deleteTargetPath = null;
  }
});

// Logout modal handling
logoutBtn.addEventListener("click", () => {
  logoutModal.style.display = "block";
});

confirmLogoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out.");
      logoutModal.style.display = "none";
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
});

cancelLogoutBtn.addEventListener("click", () => {
  logoutModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === logoutModal) {
    logoutModal.style.display = "none";
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    logoutModal.style.display = "none";
  }
});
