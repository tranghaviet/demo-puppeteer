const imageHelper = {};

/**
 * Parse image data from browser.
 * Read more at https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * @param {string} dataUrl data in format data:<image format>;base64,<image data>.
 */
imageHelper.parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (matches.length !== 3) {
    throw new Error('Could not parse data URL.');
  }
  return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') };
};

imageHelper.getDataUrlThroughCanvas = async (selector) => {
  // Create a new image element with unconstrained size.
  const originalImage = document.querySelector(selector);
  const image = document.createElement('img');
  image.src = originalImage.src;

  // Create a canvas and context to draw onto.
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;

  // Ensure the image is loaded.
  await new Promise((resolve) => {
    if (image.complete || (image.width) > 0) resolve();
    image.addEventListener('load', () => resolve());
  });

  context.drawImage(image, 0, 0);
  return canvas.toDataURL(); // default image/png, others: image/jpeg
};

imageHelper.getDataUrlThroughFetch = async (selector, options = {}) => {
  const image = document.querySelector(selector);
  console.log(this);
  // can not use getDataUrlByUrl()
  this.getDataUrlByUrl(image.src, options)
    .then(dataUrl => Promise.resolve(dataUrl));
};

imageHelper.getDataUrlByUrl = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Fetch image fail: URL ${url}, (status ${response.status}`);
  }

  const data = await response.blob();
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.addEventListener('loadend', () => resolve(reader.result));
    reader.readAsDataURL(data);
  });
};

module.exports = imageHelper;
