document.addEventListener('DOMContentLoaded', function () {
    var metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    } else {
      metaViewport = document.createElement('meta');
      metaViewport.name = 'viewport';
      metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(metaViewport);
    }
  });

  let mask = document.querySelector('.mask');

  window.addEventListener("load", () => {
    mask.remove();
  
  });
  

/* if(window.innerWidth > 768){
  window.location.href = "../pages/error.html"
} */