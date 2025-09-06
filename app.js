// --- Supabase kliens létrehozása ---
const SUPABASE_URL = "https://vyfbtvcptwdwcqicrdew.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZmJ0dmNwdHdkd2NxaWNyZGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTU4NDYsImV4cCI6MjA3MjczMTg0Nn0.8WjEDy1EzIBqZMfX133EqNAE2tCAnWno4kn9mjAzyhk"; 

// supabase objektum létrehozása
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Regisztráció ---
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    console.log("SignUp data:", data, "error:", error);
    if (error) {
      alert("Regisztráció hiba: " + error.message);
    } else {
      alert("Sikeres regisztráció! Ellenőrizd az emailedet a megerősítéshez.");
    }
  } catch (err) {
    console.error("SignUp exception:", err);
  }
});

// --- Bejelentkezés ---
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("SignIn data:", data, "error:", error);
    if (error) {
      alert("Bejelentkezési hiba: " + error.message);
    } else {
      alert("Sikeres belépés!");
      loadGallery(); // login után betöltjük a képeket
    }
  } catch (err) {
    console.error("SignIn exception:", err);
  }
});

// --- Kép feltöltése ---
document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("file-input").files[0];
  if (!file) return alert("Válassz ki egy képet!");

  // Fix: Remove "uploads/" prefix from filePath, just use filename (folder is handled by bucket)
  const filePath = `${Date.now()}-${file.name}`;

  try {
    // Fix: Upload directly to root of "uploads" bucket
    const { data, error } = await supabase.storage.from("uploads").upload(filePath, file, {
      upsert: false
    });
    console.log("Upload data:", data, "error:", error);
    if (error) {
      alert("Feltöltési hiba: " + error.message);
    } else {
      alert("Sikeres feltöltés!");
      loadGallery();
    }
  } catch (err) {
    console.error("Upload exception:", err);
  }
});

// --- Képek betöltése ---
async function loadGallery() {
  const galleryDiv = document.getElementById("gallery");
  galleryDiv.innerHTML = "Betöltés...";

  try {
    // Fix: List files from root of "uploads" bucket, not "uploads" folder
    const { data, error } = await supabase.storage.from("uploads").list("", {
      limit: 50,
      sortBy: { column: "created_at", order: "desc" },
    });
    console.log("List data:", data, "error:", error);
    if (error) {
      galleryDiv.innerHTML = "Hiba: " + error.message;
      return;
    }

    galleryDiv.innerHTML = "";
    for (const file of data) {
      // Fix: Use file.name directly, not "uploads/" + file.name
      const { data: urlData, error: urlError } = supabase.storage.from("uploads").getPublicUrl(file.name);
      if (urlError) {
        console.error("Public URL error:", urlError);
        continue;
      }
      const img = document.createElement("img");
      img.src = urlData.publicUrl;
      img.width = 200;
      img.style.margin = "5px";
      galleryDiv.appendChild(img);
    }
  } catch (err) {
    console.error("Load gallery exception:", err);
    galleryDiv.innerHTML = "Hiba történt a galéria betöltésekor";
  }
}

// --- Automatikus galéria betöltés, ha a user már be van jelentkezve ---
supabase.auth.getUser().then(({ data }) => {
  if (data.user) {
    console.log("User already logged in:", data.user);
    loadGallery();
  }
});
