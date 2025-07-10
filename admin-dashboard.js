import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
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
const storage = getStorage(app);

const uploadSection = document.getElementById("upload-section");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const gallerySelect = document.getElementById("gallerySelect");
const uploadStatus = document.getElementById("uploadStatus");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const cancelUploadBtn = document.getElementById("cancelUploadBtn");
const uploadedGallery = document.getElementById("uploadedGallery");
const toggleUploadedGalleryBtn = document.getElementById("toggleUploadedGalleryBtn");
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const toggleToClientUploadBtn = document.getElementById("toggleToClientUploadBtn");
const clientUploadSection = document.getElementById("client-upload-section");
const mainUploadSection = document.getElementById("main-upload-section");

let selectedPreviewFiles = [];
let uploadTasks = [];
let uploadCanceled = false;
let deleteTargetElement = null;
let deleteTargetPath = null;

onAuthStateChanged(auth, user => {
  if (user?.email === "radiantauraphotography@gmail.com") {
    uploadSection.style.display = "block";
    loadUploadedImages(gallerySelect.value);
  } else {
    window.location.href = "admin-login.html";
  }
});

fileInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  selectedPreviewFiles = Array.from(fileInput.files);

  selectedPreviewFiles.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("uploaded-image");
        const img = document.createElement("img");
        img.src = e.target.result;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.onclick = () => {
          wrapper.remove();
          selectedPreviewFiles = selectedPreviewFiles.filter(f => f !== file);
          if (selectedPreviewFiles.length === 0) fileInput.value = "";
        };
        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        previewContainer.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    }
  });
});

toggleUploadedGalleryBtn.addEventListener("click", () => {
  uploadedGallery.style.display = uploadedGallery.style.display === "none" ? "flex" : "none";
  toggleUploadedGalleryBtn.textContent = uploadedGallery.style.display === "none"
    ? "Show Uploaded Images ▼"
    : "Hide Uploaded Images ▲";
});

uploadBtn.addEventListener("click", () => {
  const files = selectedPreviewFiles;
  const folder = gallerySelect.value;
  if (!files.length) {
    uploadStatus.textContent = "Please select at least one file.";
    return;
  }

  previewContainer.innerHTML = "";
  selectedPreviewFiles = [];

  uploadStatus.textContent = `Uploading 0 / ${files.length}`;
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  cancelUploadBtn.style.display = "inline-block";

  let uploadedCount = 0;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const bytesTransferredArray = new Array(files.length).fill(0);
  uploadCanceled = false;
  uploadTasks = [];

  cancelUploadBtn.onclick = () => {
    uploadCanceled = true;
    uploadTasks.forEach(task => task?.cancel());
    uploadStatus.textContent = "Upload canceled.";
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";
    cancelUploadBtn.style.display = "none";
    fileInput.value = "";
  };

  files.forEach((file, index) => {
    const path = `Gallery/highlights/${folder}/${file.name}`;
    const fileRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);
    uploadTasks.push(uploadTask);

    uploadTask.on("state_changed",
      snapshot => {
        if (uploadCanceled) return;
        bytesTransferredArray[index] = snapshot.bytesTransferred;
        const totalTransferred = bytesTransferredArray.reduce((a, b) => a + b, 0);
        const percent = (totalTransferred / totalBytes) * 100;
        progressBar.style.width = `${percent}%`;
      },
      error => {
        if (error.code === 'storage/canceled') return;
        console.error("Upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          const wrapper = document.createElement("div");
          wrapper.classList.add("uploaded-image");
          const img = document.createElement("img");
          img.src = url;
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "×";
          deleteBtn.classList.add("delete-btn");
          deleteBtn.dataset.path = path;
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

function loadUploadedImages(folder) {
  uploadedGallery.innerHTML = "";
  const folderRef = ref(storage, `Gallery/highlights/${folder}/`);
  listAll(folderRef).then(res => {
    if (res.items.length === 0) {
      uploadedGallery.innerHTML = "<p>No images uploaded yet.</p>";
      return;
    }
    res.items.forEach(itemRef => {
      getDownloadURL(itemRef).then(url => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("uploaded-image");
        const img = document.createElement("img");
        img.src = url;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.dataset.path = itemRef.fullPath;
        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        uploadedGallery.appendChild(wrapper);
      });
    });
  });
}

gallerySelect.addEventListener("change", (e) => loadUploadedImages(e.target.value));
onAuthStateChanged(auth, (user) => {
  if (user?.email === "radiantauraphotography@gmail.com") {
    loadUploadedImages(gallerySelect.value);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const path = e.target.dataset.path;
    if (path) {
      deleteTargetElement = e.target.closest(".uploaded-image");
      deleteTargetPath = path;
      deleteConfirmModal.style.display = "flex";
    }
  }
});

confirmDeleteBtn.addEventListener("click", () => {
  if (!deleteTargetPath || !deleteTargetElement) return;
  const fileRef = ref(storage, deleteTargetPath);
  deleteObject(fileRef).then(() => {
    deleteTargetElement.remove();
    deleteConfirmModal.style.display = "none";
  });
});

cancelDeleteBtn.addEventListener("click", () => {
  deleteConfirmModal.style.display = "none";
});

logoutBtn.addEventListener("click", () => {
  logoutModal.style.display = "block";
});

confirmLogoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    logoutModal.style.display = "none";
    window.location.href = "admin-login.html";
  });
});

cancelLogoutBtn.addEventListener("click", () => {
  logoutModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === logoutModal) logoutModal.style.display = "none";
  if (event.target === deleteConfirmModal) deleteConfirmModal.style.display = "none";
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    logoutModal.style.display = "none";
    deleteConfirmModal.style.display = "none";
  }
});

// Toggle between main gallery upload and client gallery upload
if (toggleToClientUploadBtn && clientUploadSection && mainUploadSection) {
  toggleToClientUploadBtn.addEventListener("click", () => {
    const isMainVisible = mainUploadSection.style.display !== "none";
    mainUploadSection.style.display = isMainVisible ? "none" : "block";
    clientUploadSection.style.display = isMainVisible ? "block" : "none";
    toggleToClientUploadBtn.textContent = isMainVisible ? "Back to Admin Upload" : "Send to Client Gallery";
  });
}


const mainGalleryBtn = document.getElementById("mainGalleryBtn");
const clientGalleryBtn = document.getElementById("clientGalleryBtn");

const mainUploadForm = document.getElementById("mainUploadForm");
const clientUploadForm = document.getElementById("clientUploadForm");

mainGalleryBtn.addEventListener("click", () => {
  mainUploadForm.style.display = "block";
  clientUploadForm.style.display = "none";
  mainGalleryBtn.classList.add("active");
  clientGalleryBtn.classList.remove("active");
});

clientGalleryBtn.addEventListener("click", () => {
  mainUploadForm.style.display = "none";
  clientUploadForm.style.display = "block";
  clientGalleryBtn.classList.add("active");
  mainGalleryBtn.classList.remove("active");
});


const clientFileInput = document.getElementById("clientFileInput");
const clientPreviewContainer = document.getElementById("clientPreviewContainer");

let selectedClientFiles = [];

clientFileInput.addEventListener("change", () => {
  clientPreviewContainer.innerHTML = "";  // clear previous previews
  selectedClientFiles = Array.from(clientFileInput.files);

  selectedClientFiles.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("uploaded-image"); // use same styles if you want
        const img = document.createElement("img");
        img.src = e.target.result;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.classList.add("delete-btn");

        // When clicking delete, remove the preview and file from selectedClientFiles
        deleteBtn.onclick = () => {
          wrapper.remove();
          selectedClientFiles = selectedClientFiles.filter(f => f !== file);
          if (selectedClientFiles.length === 0) clientFileInput.value = "";
        };

        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        clientPreviewContainer.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    }
  });
});

const uploadClientBtn = document.getElementById("uploadClientBtn");
const clientUploadStatus = document.getElementById("clientUploadStatus");

uploadClientBtn.addEventListener("click", () => {
  const files = selectedClientFiles;
  const clientEmail = document.getElementById("clientEmail").value.trim();

  if (!clientEmail) {
    clientUploadStatus.textContent = "Please enter a client email.";
    return;
  }

  if (!files.length) {
    clientUploadStatus.textContent = "Please select at least one file.";
    return;
  }

  clientUploadStatus.textContent = `Uploading 0 / ${files.length}`;
  let uploadedCount = 0;

  // Clear previews and input to avoid duplicates while uploading
  clientPreviewContainer.innerHTML = "";
  selectedClientFiles = [];
  clientFileInput.value = "";

files.forEach((file, index) => {
  const safeEmail = clientEmail.replace(/\./g, "_").replace(/@/g, "_at_");
  const path = `client-gallery/${safeEmail}/${file.name}`;

  const fileRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(fileRef, file);
  clientUploadTasks.push(uploadTask);


    uploadTask.on("state_changed",
      (snapshot) => {
       // Calculate progress percentage
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    clientProgressBar.style.width = progress + "%";
    clientUploadStatus.textContent = `Uploading ${uploadedCount} / ${files.length} (${progress.toFixed(0)}%)`;
  },
      (error) => {
        console.error("Client upload error:", error);
        clientUploadStatus.textContent = "Error uploading some files.";
      },
      () => {
        uploadedCount++;
        clientUploadStatus.textContent = `Uploading ${uploadedCount} / ${files.length}`;

        if (uploadedCount === files.length) {
          clientUploadStatus.textContent = "All client uploads complete!";
        }
      }
    );
  });
});

const clientProgressContainer = document.getElementById("clientProgressContainer");
const clientProgressBar = document.getElementById("clientProgressBar");
const cancelClientUploadBtn = document.getElementById("cancelClientUploadBtn");

let clientUploadTasks = [];
let clientUploadCanceled = false;

uploadClientBtn.addEventListener("click", () => {
  const files = selectedClientFiles;
  const clientEmail = document.getElementById("clientEmail").value.trim();

  if (!clientEmail) {
    clientUploadStatus.textContent = "Please enter a client email.";
    return;
  }

  if (!files.length) {
    clientUploadStatus.textContent = "Please select at least one file.";
    return;
  }

  clientUploadStatus.textContent = `Uploading 0 / ${files.length}`;
  clientProgressContainer.style.display = "block";
  clientProgressBar.style.width = "0%";
  cancelClientUploadBtn.style.display = "inline-block";

  let uploadedCount = 0;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const bytesTransferredArray = new Array(files.length).fill(0);
  clientUploadCanceled = false;
  clientUploadTasks = [];

  // Clear previews and inputs
  clientPreviewContainer.innerHTML = "";
  selectedClientFiles = [];
  clientFileInput.value = "";

  cancelClientUploadBtn.onclick = () => {
    clientUploadCanceled = true;
    clientUploadTasks.forEach(task => task?.cancel());
    clientUploadStatus.textContent = "Upload canceled.";
    clientProgressContainer.style.display = "none";
    clientProgressBar.style.width = "0%";
    cancelClientUploadBtn.style.display = "none";
    clientFileInput.value = "";
  };

  files.forEach((file, index) => {
    const path = `client-gallery/${clientEmail}/${file.name}`;
    const fileRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);
    clientUploadTasks.push(uploadTask);

    uploadTask.on("state_changed",
      (snapshot) => {
        if (clientUploadCanceled) return;
        bytesTransferredArray[index] = snapshot.bytesTransferred;
        const totalTransferred = bytesTransferredArray.reduce((a, b) => a + b, 0);
        const percent = (totalTransferred / totalBytes) * 100;
        clientProgressBar.style.width = `${percent}%`;
      },
      (error) => {
        if (error.code === 'storage/canceled') return;
        console.error("Client upload error:", error);
        clientUploadStatus.textContent = "Error uploading some files.";
      },
      () => {
        uploadedCount++;
        clientUploadStatus.textContent = `Uploading ${uploadedCount} / ${files.length}`;
        if (uploadedCount === files.length) {
          clientUploadStatus.textContent = "All client uploads complete!";
          clientProgressContainer.style.display = "none";
          clientProgressBar.style.width = "0%";
          cancelClientUploadBtn.style.display = "none";
          clientFileInput.value = "";
        }
      }
    );
  });
});

