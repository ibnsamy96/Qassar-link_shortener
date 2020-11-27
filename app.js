// eslint-disable-next-line import/extensions
import {
  databaseApi,
  getData
} from "./api-comm.js";

console.log("medo");

const putData = async (url = "", data = {}) => {
  const request = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
    mode: "cors",
    credentials: "same-origin",
  });

  return request.json();
};

function validateURL(url) {

  const pattern = new RegExp(
    "^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$",
    "i"
  ); // fragment locator

  return pattern.test(url);
}

async function checkSlug(slug) {
  console.log(slug);

  try {
    const data = await getData(
      `${databaseApi}.json?orderBy="$key"&equalTo="${slug}"&print=pretty`
    );
    // console.log(data);
    const slugDomain = data[`${slug}`].domain;
    console.log(data);
    console.log(slugDomain);
    console.log(false);
    return false;
  } catch (error) {
    console.log(error);

    return true;
  }
}

// eslint-disable-next-line consistent-return
async function generateSlug(length) {
  console.log(length);
  let slug = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    slug += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (await checkSlug(slug)) {
    console.log("slug true");
    // true - slug is valid
    return slug;
  }
  console.log("slug false");

  // false - slug isn't valid
  return generateSlug(length + 1);
}

let link;
let result;
let urlValidity;
let copyBTN;
let qrBTN;

function defineVariable() {
  link = document.querySelector("#link");
  result = document.querySelector("#result");
  urlValidity = document.querySelector("#urlValidity");
  copyBTN = document.querySelector('button[onclick="copyShortLink()"]');
  qrBTN = document.querySelector('button[onclick="createQR()"]');
}

window.createNewShortLink = () => {
  if (!link) {
    defineVariable();
  }
  let randomSlug;
  const domain = link.value;
  if (validateURL(domain)) {
    console.log("domain is valid!");
    generateSlug(5)
      .then((slug) => {
        randomSlug = slug;
        console.log(randomSlug);
      })
      .then(() => {
        return putData(`${databaseApi}/${randomSlug}.json`, {
          domain
        });
      })
      .then((res) => {
        console.log(res);
        result.innerText = `${window.location.host}/${randomSlug}`;
      })
      .then(() => {
        copyBTN.className = '';
        copyBTN.style.display = "inline";
        qrBTN.className = '';
        qrBTN.style.display = "inline";

      })
      .catch((err) => console.log(err));
  } else {
    console.log("invalid");
    urlValidity.innerText = "URL isn't valid!";
  }
};

window.copyShortLink = () => {
  // copy link to clipboard
  const temporaryInput = document.createElement("input");
  temporaryInput.setAttribute("value", result.innerText);
  document.body.appendChild(temporaryInput);
  temporaryInput.select();
  try {
    document.execCommand("copy"); // Security exception may be thrown by some browsers.
  } catch (error) {
    console.warn("Copy to clipboard failed.", error);
  }
  document.body.removeChild(temporaryInput);
};

// create QR code for links

window.createQR = () => {
  const url = `https://${result.innerText}`;
  const qrImg = document.querySelector("#qrImg");
  qrImg.setAttribute(
    "src",
    `https://api.qrserver.com/v1/create-qr-code/?data=${url}&size=100x100&color=DC143C&bgcolor=255-255-255`
  );
  qrImg.className = '';
  qrImg.style.display = "block";
  console.log(url);
  // const request = await fetch(

  // );
  // console.log(response.json);
};