// IDE írd be a saját Supabase projekted adatait:
const SUPABASE_URL = "https://vyfbtvcptwdwcqicrdew.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZmJ0dmNwdHdkd2NxaWNyZGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTU4NDYsImV4cCI6MjA3MjczMTg0Nn0.8WjEDy1EzIBqZMfX133EqNAE2tCAnWno4kn9mjAzyhk"; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Regisztráció ---
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Regisztráció hiba: " + error.message);
  } else {
    alert("Sikeres regisztráció! Ellenőrizd az emailedet a megerősítéshez.");
  }
});

// --- Bejelentkezés ---
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Login hiba: " + error.message);
  } else {
    alert("Sikeres belépés!");
    loadGallery(); // login után betöltjük a képeket
  }
});

// --- Kép feltöltése ---
document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("file-input").files[0];
  if (!file) return alert("Válassz ki egy képet!");

  const filePath = `uploads/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(filePath, file);

  if (error) {
    alert("Feltöltési hiba: " + error.message);
  } else {
    alert("Sikeres feltöltés!");
    loadGallery();
  }
});

// --- Képek betöltése ---
async function loadGallery() {
  const galleryDiv = document.getElementById("gallery");
  galleryDiv.innerHTML = "Betöltés...";

  const { data, error } = await supabase.storage.from("uploads").list("uploads", {
    limit: 50,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    galleryDiv.innerHTML = "Hiba: " + error.message;
    return;
  }

  galleryDiv.innerHTML = "";
  for (const file of data) {
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl("uploads/" + file.name);
    const img = document.createElement("img");
    img.src = urlData.publicUrl;
    img.width = 200;
    galleryDiv.appendChild(img);
  }
}

// ha már be van jelentkezve valaki, azonnal betöltjük a képeket
supabase.auth.getUser().then(({ data }) => {
  if (data.user) {
    loadGallery();
  }
});
