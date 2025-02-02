
export default function gallery(imageSrcList, width, height, row, column) {

  let scrollY = 0;
  let maxScrollY = 0;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);

  const itemWidth = canvas.width / column;
  const itemHeight = canvas.height / row;
  const itemMargin = 2;

  const imageList = imageSrcList.map((src,idx) => {
    const image = document.createElement('img');
    image.src = src;
    image.onload = () => {
      drawItem(image,idx);
    }
    return image;
  });

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

  function drawItem(item, idx) {
    const left = (idx % column) * itemWidth;
    const top = Math.trunc(idx / column) * itemHeight;
    const destLeft = left + itemMargin;
    const destTop = top + itemMargin + scrollY;
    const destWidth = itemWidth - itemMargin * 2;
    const destHeight = itemHeight - itemMargin * 2;

    ctx.save();
    drawClipPath(destLeft, destTop, destWidth, destHeight, 10);
    ctx.drawImage(item,destLeft,destTop,destWidth,destHeight);
    ctx.restore();
    
  }

  function drawCanvas() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    imageList.forEach((image,index) => {
      drawItem(image, index);
    });
  }

  function calcMaxScrollPos(itemCount) {
    const rowCount = Math.ceil(itemCount / column);
    const totalHeight = rowCount * itemHeight;
    maxScrollY = totalHeight - canvas.height;
  }

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    scrollY -= event.deltaY;
    scrollY = Math.min(scrollY, 0);
    scrollY = Math.max(scrollY, -maxScrollY);
    drawCanvas();
})

  return canvas;
}