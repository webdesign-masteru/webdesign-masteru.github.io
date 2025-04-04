function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function createGIF(width, height) {
  const header = 'GIF89a';
  const widthBytes = String.fromCharCode(width & 0xFF, (width >> 8) & 0xFF);
  const heightBytes = String.fromCharCode(height & 0xFF, (height >> 8) & 0xFF);
  const logicalScreen = widthBytes + heightBytes + '\xF0\x00\x00';
  const globalColorTable = '\x00\x00\x00\xFF\xFF\xFF';
  const graphicControl = '\x21\xF9\x04\x00\x00\x00\x00\x00';
  const imageDesc = '\x2C\x00\x00\x00\x00' + widthBytes + heightBytes + '\x00';
  const pixelCount = width * height;
  const imageData = String.fromCharCode(2) + String.fromCharCode(2) + '\x04' + '\x05' + '\x00';
  const trailer = '\x3B';
  const gifString = header + logicalScreen + globalColorTable + graphicControl + imageDesc + imageData + trailer;
  return 'data:image/gif;base64,' + btoa(gifString);
}

async function mathWithRatio() {
  const w = parseInt(document.getElementById('lazy-source-width').value, 10) || 1;
  const h = parseInt(document.getElementById('lazy-source-height').value, 10) || 1;

  const r = gcd(w, h);
  const tWi = w / r;
  const tHe = h / r;
  const tAs = 100 / (tWi / tHe);

  document.querySelector('.lazy-aspect').textContent = `${tWi} / ${tHe}`;
  document.querySelectorAll('.css-lazy-hack span, .head-lazy-hack').forEach(el => { 
    el.textContent = tAs.toFixed(2); 
  });

  try {
    const base64 = await createGIF(tWi, tHe);
    const resultElement = document.querySelector('.lazy-dummy-result');
    if (resultElement) {
      resultElement.textContent = base64;
    } else {

    }
  } catch (error) {
    console.error('Error generating GIF:', error);
  }
}

async function mathNoRatio() {
  const w = parseInt(document.getElementById('lazy-source-width').value, 10) || 1;
  const h = parseInt(document.getElementById('lazy-source-height').value, 10) || 1;
  const rAs = 100 / (w / h);

  document.querySelector('.lazy-aspect').textContent = `${w} / ${h}`;
  document.querySelectorAll('.css-lazy-hack span, .head-lazy-hack').forEach(el => {
    el.textContent = rAs.toFixed(2);
  });

  try {
    const base64 = await createGIF(w, h);
    const resultElement = document.querySelector('.lazy-dummy-result');
    if (resultElement) {
      resultElement.textContent = base64;
    } else {

    }
  } catch (error) {
    console.error('Error generating GIF:', error);
  }
}

const handleInputEvent = () => {
  if (document.querySelector('.disable-aspect').classList.contains('active')) {
    mathNoRatio();
  } else {
    mathWithRatio();
  }
};

document.querySelectorAll('input[id^="lazy-source"]').forEach(input => {
  input.addEventListener('keyup', handleInputEvent);
  input.addEventListener('change', handleInputEvent);
});

function previewFile() {
  const preview = document.getElementById('lazy-page-image');
  const file = document.querySelector('input[class="lazy-select-file"]').files[0];
  const reader = new FileReader();
  const el = document.getElementById('lazy-pattern-base');

  reader.readAsDataURL(file);

  reader.onloadend = function (e) {
    preview.src = reader.result;
    preview.classList.remove('d-none');
    document.querySelector('.lazy-pattern-result').style.backgroundImage = `url(${e.target.result})`;
    el.textContent = e.target.result;
  };
}

function clickToggle(element, func1, func2) {
  let toggleClicked = 0;
  element.addEventListener('click', () => {
    if (toggleClicked === 0) {
      func1();
      toggleClicked = 1;
    } else {
      func2();
      toggleClicked = 0;
    }
  });
}

const disableAspect = document.querySelector('.disable-aspect');
clickToggle(disableAspect, () => {
  disableAspect.classList.add('active');
  mathNoRatio();
}, () => {
  disableAspect.classList.remove('active');
  mathWithRatio();
});

document.querySelector('.lazy-select-file').addEventListener('change', previewFile);

document.querySelector('.save-base').addEventListener('click', () => {
  const base64 = document.querySelector('.lazy-dummy-result').textContent;
  const download = document.createElement('a');
  download.href = base64;
  download.download = `dummy-image-${document.querySelector('.lazy-aspect').textContent.replace(' / ', 'x')}.gif`;
  download.click();
});

document.addEventListener('DOMContentLoaded', () => {
  handleInputEvent();
});
