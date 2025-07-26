// Tombol Import Wallet (Landing → Import)
document.getElementById('importBtn').onclick = function(e) {
  e.preventDefault();
  document.querySelector('.page-landing').classList.remove('active');
  document.querySelector('.page-import').classList.add('active');
  stopLogoVideo(); // <-- Hentikan logo video, ganti ke fallback
};

// Tombol Kembali dari Import Wallet ke Landing
document.getElementById('backBtn').onclick = function(e) {
  e.preventDefault();
  document.querySelector('.page-import').classList.remove('active');
  document.querySelector('.page-landing').classList.add('active');
  stopLogoVideo(); // <-- Hentikan logo video, ganti ke fallback
};

// Tombol Create a Wallet (Landing → Create)
document.getElementById('createBtn').onclick = function(e) {
  e.preventDefault();
  document.querySelector('.page-landing').classList.remove('active');
  document.querySelector('.page-createwallet').classList.add('active');
  stopLogoVideo(); // <-- Hentikan logo video, ganti ke fallback
};

// Tombol Kembali dari Create Wallet ke Landing
document.getElementById('backCreateBtn').onclick = function(e) {
  e.preventDefault();
  document.querySelector('.page-createwallet').classList.remove('active');
  document.querySelector('.page-landing').classList.add('active');
  stopLogoVideo(); // <-- Hentikan logo video, ganti ke fallback
};

// Fungsi untuk memastikan video logo hanya main sekali
function stopLogoVideo() {
  const video = document.getElementById('logoVideo');
  const fallback = document.getElementById('logoFallback');
  if (video && fallback) {
    video.pause();
    video.currentTime = 0;
    video.style.display = 'none';
    fallback.style.display = 'block';
  }
}

// Animasi/fallback logo video landing page
(function() {
  const video = document.getElementById('logoVideo');
  const fallback = document.getElementById('logoFallback');
  let playedOnce = false;

  if (!video || !fallback) return;

  // Fallback jika video error/tidak support
  video.onerror = function() {
    video.style.display = 'none';
    fallback.style.display = 'block';
  };
  if (!video.canPlayType) {
    video.style.display = 'none';
    fallback.style.display = 'block';
  }

  // Setelah video selesai play, ganti ke PNG statis
  video.addEventListener('ended', function() {
    video.style.display = 'none';
    fallback.style.display = 'block';
  });

  video.addEventListener('play', function() {
    playedOnce = true;
  });

  // Pastikan jika video gagal main (misal: browser block, dsb), fallback ke PNG
  setTimeout(function() {
    if (!playedOnce) {
      video.style.display = 'none';
      fallback.style.display = 'block';
    }
  }, 2500); 
})();

// Splash screen hide logic
window.addEventListener('DOMContentLoaded', function() {
  const splash = document.getElementById('splash');
  const container = document.querySelector('.container');
  setTimeout(function() {
    splash.style.opacity = 0;
    setTimeout(function() {
      splash.style.display = 'none';
      container.style.display = '';
    }, 350);
  }, 1600); // Waktu splash (ms)
});