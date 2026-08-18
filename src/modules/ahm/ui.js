
/* ============================================================================
   AHM AUDIT — UI
   ============================================================================ */
/* The application keeps its own sign-in page, so this screen opens it rather
   than authenticating: a browser page cannot post to another origin's login
   form. The action is a real anchor, not window.open(), which browsers block
   as a pop-up. */
function ahmUrl(){
  var raw = ($("ahmUrl").value || "").trim();
  if(!raw) return null;
  if(/^[a-zA-Z]:[\\/]/.test(raw) || raw.charAt(0) === "/"){
    return "file:///" + raw.replace(/\\/g, "/").replace(/^\//, "");
  }
  if(/^file:\/\//i.test(raw)) return raw;
  if(!/^https?:\/\//i.test(raw)) raw = "http://" + raw;
  try { return new URL(raw).href; } catch(e){ return null; }
}
function ahmSay(text, tone){
  var st = $("ahmStatus");
  st.style.color = "var(--" + (tone || "dim") + ")";
  st.textContent = text;
}
function ahmSync(){
  var href = ahmUrl(), a = $("btnAhmLogin");
  if(href){
    a.setAttribute("href", href);
    a.style.pointerEvents = ""; a.style.opacity = "";
    ahmSay("Opens " + href, "dim");
  } else {
    a.removeAttribute("href");
    a.style.pointerEvents = "none"; a.style.opacity = ".45";
    ahmSay("Enter the address where AHM Audit runs.", "amber");
  }
}
$("ahmUrl").addEventListener("input", ahmSync);
$("btnAhmLogin").addEventListener("click", function(){
  ahmSay("Opened — sign in on the AHM Audit page.", "green");
});
$("ahmUrl").addEventListener("keydown", function(e){
  if(e.key === "Enter"){ var a = $("btnAhmLogin"); if(a.getAttribute("href")) a.click(); }
});
ahmSync();
