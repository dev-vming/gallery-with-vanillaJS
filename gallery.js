const defaultAudioImg = document.createElement("img");
defaultAudioImg.src = "./images/mp3.png";
defaultAudioImg.onload = () => {
  console.log("audio image onloaded");
};

export default function gallery(imageSrcList, width, height, row, column) {
  let scrollY = 0;
  let maxScrollY = 0;
  let hoverIndex = null;
  let selectedIndex = null;
  let currentScale = 1;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  const itemWidth = canvas.width / column;
  const itemHeight = canvas.height / row;
  const itemMargin = 2;

  const imageList = imageSrcList.map((src, idx) =>
    src.endsWith(".mp4") || src.endsWith(".mp3")
      ? createVideoItem(src, idx)
      : createImageItem(src, idx)
  );

  function createImageItem(src, idx) {
    const image = document.createElement("img");
    image.src = src;
    image.onload = () => {
      drawItem(image, idx);
    };
    return image;
  }

  function createVideoItem(src, index) {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.onloadeddata = () => {
      video.play();
    };
    video.ontimeupdate = () => {
      drawItem(video, index);
    };
    return video;
  }

  calcMaxScrollPos(imageList.length);

  function drawClipPath(left, top, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(left + radius, top);
    ctx.arcTo(left + width, top, left + width, top + height, radius);
    ctx.arcTo(left + width, top + height, left, top + height, radius);
    ctx.arcTo(left, top + height, left, top, radius);
    ctx.arcTo(left, top, left + width, top, radius);
    ctx.closePath();
    ctx.clip();
  }

  function isDrawableItem(item) {
    return (
      item instanceof HTMLImageElement ||
      (item instanceof HTMLVideoElement &&
        item.videoWidth > 0 &&
        item.videoHeight > 0)
    );
  }

  function drawItem(item, idx, scale = 1) {
    const left = (idx % column) * itemWidth;
    const top = Math.trunc(idx / column) * itemHeight;
    const tempWidth = itemWidth - itemMargin * 2;
    const tempHeight = itemHeight - itemMargin * 2;
    const destWidth = tempWidth * scale;
    const destHeight = tempHeight * scale;
    const destLeft = left + itemMargin + (tempWidth - destWidth) / 2;
    const destTop = top + itemMargin + scrollY + (tempHeight - destHeight) / 2;

    ctx.save();
    drawClipPath(destLeft, destTop, destWidth, destHeight, 10);
    ctx.drawImage(isDrawableItem(item) ? item : defaultAudioImg, destLeft, destTop, destWidth, destHeight);
    ctx.restore();
  }

  function getOrgSize(item) {
    if (item instanceof HTMLVideoElement) {
      return { width: item.videoWidth, height: item.videoHeight };
    } else {
      return { width: item.width, height: item.height };
    }
  }

  function drawSelectedItem(item) {
    const { width, height } = getOrgSize(item);
    const imgAspectRatio = width / height;
    const canvasAspectRatio = canvas.width / canvas.height;
    let renderWidth, renderHeight, offsetX, offsetY;
    if (imgAspectRatio > canvasAspectRatio) {
      renderWidth = canvas.width;
      renderHeight = canvas.width / imgAspectRatio;
      offsetX = 0;
      offsetY = (canvas.height - renderHeight) / 2;
    } else {
      renderWidth = canvas.height * imgAspectRatio;
      renderHeight = canvas.height;
      offsetX = (canvas.width - renderWidth) / 2;
      offsetY = 0;
    }
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(item, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();
  }

  function drawCanvas() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    imageList.forEach((image, index) => {
      if (hoverIndex === index) return;
      drawItem(image, index);
    });

    hoverIndex !== null &&
      drawItem(imageList[hoverIndex], hoverIndex, currentScale);
    selectedIndex !== null && drawSelectedItem(imageList[hoverIndex]);
  }

  function calcMaxScrollPos(itemCount) {
    const rowCount = Math.ceil(itemCount / column);
    const totalHeight = rowCount * itemHeight;
    maxScrollY = totalHeight - canvas.height;
  }

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    scrollY -= event.deltaY;
    scrollY = Math.min(scrollY, 0);
    scrollY = Math.max(scrollY, -maxScrollY);
    drawCanvas();
  });

  function getItemIndex(x, y) {
    const columnIndex = Math.floor(x / itemWidth);
    const rowIndex = Math.floor(y / itemHeight);
    return rowIndex * column + columnIndex;
  }

  function animateScale(target, duration = 250) {
    const startTime = Date.now();
    const initialScale = 1;
    const diff = target - initialScale;

    function step() {
      const timePassed = Date.now() - startTime;
      const progress = timePassed / duration;
      currentScale = initialScale + diff * progress;
      drawCanvas();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    step();
  }

  canvas.addEventListener("mousemove", (event) => {
    if (selectedIndex !== null) return;
    const newIndex = getItemIndex(event.offsetX, event.offsetY - scrollY);
    if (hoverIndex !== newIndex) {
      hoverIndex = newIndex;
      animateScale(1.2);
      drawCanvas();
    }
  });

  canvas.addEventListener("click", (event) => {
    if (selectedIndex !== null) {
      selectedIndex = null;
      hoverIndex = null;
      drawCanvas();
    } else {
      const newIndex = getItemIndex(event.offsetX, event.offsetY - scrollY);
      if (selectedIndex !== newIndex) {
        selectedIndex = newIndex;
        drawCanvas();
      }
    }
  });

  function startRender() {
    requestAnimationFrame(startRender);
    drawCanvas();
  }

  startRender();

  return canvas;
}
