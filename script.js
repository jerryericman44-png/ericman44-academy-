
const SCHOOL_EMAIL = "jerryericman44@gmail.com";
const SCHOOL_WHATSAPP = "256 741465403"; /* country code + number, no + sign */

document.getElementById("mailLink").href = "mailto:" + SCHOOL_EMAIL;
document.getElementById("mailLink").textContent = SCHOOL_EMAIL;
document.getElementById("waLink").href = "https://wa.me/" + SCHOOL_WHATSAPP;
document.getElementById("waLink").textContent = "+" + SCHOOL_WHATSAPP;

/* Menu */
const burger = document.getElementById("burger"), menu = document.getElementById("menu");
burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
menu.querySelectorAll("a").forEach(a => a.onclick = () => menu.classList.remove("open"));

/* Slider */
const track = document.getElementById("track"), dots = document.getElementById("dots"), box = document.getElementById("slider");
const n = track.children.length; let i = 0, timer;
for (let k = 0; k < n; k++) { const b = document.createElement("button"); b.setAttribute("aria-label", "Picture " + (k + 1)); b.onclick = () => { go(k); restart(); }; dots.appendChild(b); }
function go(k) { i = (k + n) % n; track.style.transform = "translateX(-" + i * 100 + "%)"; [...dots.children].forEach((d, j) => d.classList.toggle("on", j === i)); }
function restart() { clearInterval(timer); if (!matchMedia("(prefers-reduced-motion:reduce)").matches) timer = setInterval(() => go(i + 1), 4000); }
let x0 = null;
box.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
box.addEventListener("touchend", e => { if (x0 !== null) { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); x0 = null; } restart(); });
go(0); restart();

/* Registration opens the email app */
document.getElementById("regForm").onsubmit = e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const body = "Student: " + v("name") + "\nEmail: " + v("email") + "\nPhone: " + v("phone") + "\nCourse: " + v("course") + "\nMessage: " + v("msg");
  location.href = "mailto:" + SCHOOL_EMAIL + "?subject=" + encodeURIComponent("Registration: " + v("course")) + "&body=" + encodeURIComponent(body);
};


/* ---------- Accounts (Firebase) ----------
   To switch accounts on: create a free project at console.firebase.google.com,
   turn on Authentication > Email/Password (and Google), then paste your config here.
   Example: const FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." }; */
const FIREBASE_CONFIG = null;

const $ = id => document.getElementById(id);
let mode = "up", fb = null;
function setMode(m) {
  mode = m;
  $("tabUp").classList.toggle("on", m === "up"); $("tabIn").classList.toggle("on", m === "in");
  $("authBtn").textContent = m === "up" ? "Create account" : "Sign in";
  $("aPass").autocomplete = m === "up" ? "new-password" : "current-password";
}
$("tabUp").onclick = () => setMode("up"); $("tabIn").onclick = () => setMode("in");

function firebase() {
  if (!FIREBASE_CONFIG) return Promise.reject({ code: "not-setup" });
  if (!fb) fb = Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
  ]).then(([app, au]) => ({ au, auth: au.getAuth(app.initializeApp(FIREBASE_CONFIG)) }));
  return fb;
}
const errors = {
  "not-setup": "Accounts are not switched on yet. The school must connect Firebase first.",
  "auth/email-already-in-use": "This email already has an account. Tap Sign in.",
  "auth/invalid-credential": "Wrong email or password. Check and try again.",
  "auth/weak-password": "Use a password with at least 6 characters.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/popup-closed-by-user": "Google sign-in was closed. Try again."
};
const say = t => $("authMsg").textContent = t;

$("authForm").onsubmit = async e => {
  e.preventDefault(); say("Please wait...");
  try {
    const { au, auth } = await firebase();
    const f = mode === "up" ? au.createUserWithEmailAndPassword : au.signInWithEmailAndPassword;
    await f(auth, $("aEmail").value.trim(), $("aPass").value);
  } catch (err) { say(errors[err.code] || "Something went wrong. Try again."); }
};
$("googleBtn").onclick = async () => {
  try { const { au, auth } = await firebase(); await au.signInWithPopup(auth, new au.GoogleAuthProvider()); }
  catch (err) { say(errors[err.code] || "Google sign-in failed. Try again."); }
};
$("outBtn").onclick = async () => { const { au, auth } = await firebase(); await au.signOut(auth); };
if (FIREBASE_CONFIG) firebase().then(({ au, auth }) => au.onAuthStateChanged(auth, u => {
  say(u ? "Signed in as " + u.email : ""); $("outBtn").hidden = !u;
}));
