/* eslint-disable import/extensions */
import {
  databaseApi,
  getData,
  putData
} from "./api-comm.js";

import {
  LoadingComponent
} from "./components/loading.component.js";

let previouslyShortened = [];

function saveToLocalStorage(linksArray) {
  localStorage.setItem('linksArray', JSON.stringify(linksArray))
}

function getFromLocalStorage() {
  return JSON.parse(localStorage.getItem('linksArray'))
}

function generateLinkGroups(shortenedLinks) {
  let shortenedLinksHTMLCode = ``

  shortenedLinks.forEach(link => {
    const linkGroupHTML = `<div class='row  m-0 p-0 linkGroup'>
    <div class="row col-lg-2 m-0 p-0">
    <button class='col-6 m-0 px-1 copyBTN btn btn-secondary'
        onclick="copyShortLink('${link.slug}')"><img src="./assets/svg/copy.svg" alt="copy"></button>
    <button class='col-6 m-0 px-1  qrBTN btn btn-secondary'
        onclick="toggleQrCodeOverlay(event,'${link.slug}')"><img src="./assets/svg/qr.svg" alt="qr"></button>
        </div>
    <div class="col-lg-auto m-0 px-1 linksDiv">
        <p class="m-0 p-0  shortLink">https://${window.location.host}/${link.slug}</p>
    </div>
    <div class="col-lg m-0 px-1 linksDiv">
        <p class="m-0 p-0 longLink">${link.domain}</p>
    </div>
</div>`
    shortenedLinksHTMLCode = `${linkGroupHTML} ${shortenedLinksHTMLCode}`
  });

  return `<h2 id='shortenedLinksHeadline' class=""><span>آخر الروابط المُقصّرة</span></h2> ${shortenedLinksHTMLCode}`

}

function showNotification(notificationMessage) {
  console.log('ho');
  const notification = document.getElementById('notification')
  notification.innerText = notificationMessage;
  // console.log(x);
  notification.style.opacity = '0.9';
  notification.style.top = '5%'
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.top = '7%';
    }, 80)
  }, 2000)

}


function updateShortenedLinksElement(shortenedLinksHTMLCode) {
  document.querySelector('#shortenedLinks div').innerHTML = shortenedLinksHTMLCode;
}

function fetchLocalStorage() {
  const linksArray = getFromLocalStorage()
  if (linksArray) {
    // eslint-disable-next-line no-unused-vars
    previouslyShortened = [...linksArray]
    updateShortenedLinksElement(generateLinkGroups(previouslyShortened))

  }
}

window.addEventListener('load', fetchLocalStorage)


function validateURL(url) {

  const pattern = new RegExp(
    "^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,7}(:[0-9]{1,5})?(\\/.*)?$",
    "i"
  );

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
let shortLinkParagraph;
let urlValidity;
let submitBTN;

function defineVariable() {
  link = document.querySelector("#link");
  shortLinkParagraph = document.querySelector(".shortLink");
  urlValidity = document.querySelector("#urlValidity");
  submitBTN = document.querySelector('#submitBTN')
}

function disableForm(booleanValue) {
  submitBTN.disabled = booleanValue;
  link.disabled = booleanValue;
  submitBTN.innerHTML = booleanValue ? LoadingComponent.render('primary-text-color') : 'قصّر الرابط'

}

window.createNewShortLink = () => {
  if (!link) {
    defineVariable();
  }
  disableForm(true)

  let randomSlug;
  const domain = link.value;
  if (validateURL(domain)) {
    urlValidity.innerText = "";
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
        console.log(shortLinkParagraph);
        previouslyShortened.push({
          slug: randomSlug,
          domain
        })
        saveToLocalStorage(previouslyShortened)
        updateShortenedLinksElement(generateLinkGroups(previouslyShortened))
        console.log(previouslyShortened);
      })
      .then(() => {
        console.log(submitBTN);
        disableForm(false)


      })
      .catch((err) => {
        // TODO show error msg
        console.error(err)
        disableForm(false)
        urlValidity.innerText = "تأكد من الاتصال بشبكة انترنت صالحة";
      });
  } else {
    console.log("invalid");
    disableForm(false)
    urlValidity.innerText = "الرابط غير صالح، تأكد من وجود http:// أو https:// قبل الرابط";
  }
};

window.copyShortLink = (slug) => {
  // copy link to clipboard
  const temporaryInput = document.createElement("input");
  temporaryInput.setAttribute("value", `https://${window.location.host}/${slug}`);
  document.body.appendChild(temporaryInput);
  temporaryInput.select();
  try {
    document.execCommand("copy"); // Security exception may be thrown by some browsers.
  } catch (error) {
    console.warn("Copy to clipboard failed.", error);
  }
  document.body.removeChild(temporaryInput);
  showNotification('تم النسخ')
  // window.navigator.vibrate(1000)
}

// create QR code for links

const fetchQR = async (slug) => {
  const url = `https://${window.location.host}/${slug}`

  const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?data=${url}&size=200x200&color=DC143C&bgcolor=255-255-255`);
  const imgBlob = await response.blob();
  return URL.createObjectURL(imgBlob);
};

function loadingQR() {
  return LoadingComponent.render('secondary-text-color');

}

window.toggleQrCodeOverlay = (event, slug = undefined) => {

  // console.log(element.target.id);

  let qrCodeOverlay = document.querySelector('#qrCodeOverlay')

  if (!qrCodeOverlay && slug) {
    // create
    qrCodeOverlay = document.createElement('section')
    qrCodeOverlay.setAttribute('id', 'qrCodeOverlay')
    qrCodeOverlay.setAttribute('onClick', 'toggleQrCodeOverlay(event)')
    const qrBox = document.createElement('div')
    qrBox.setAttribute('id', 'qrBox')
    qrBox.innerHTML = loadingQR();
    qrBox.classList.add('p-3')
    qrCodeOverlay.appendChild(qrBox)

    document.querySelector('main').appendChild(qrCodeOverlay)

    fetchQR(slug)
      .then(url => {
        qrBox.style.minWidth = '300px';
        qrBox.classList.remove('p-3')
        qrBox.innerHTML = `
   
      <div  id='closeOverlay' class="pl-2 pt-2"> <img id='closeImg' src="../../assets/svg/close.svg"  onClick='toggleQrCodeOverlay(event)'  width="16px"
              alt="close">
      </div>
      <div id="qrImg" class='d-block mt-2'><img
              src="" />
      </div>
      <div id='downloadQRImg' class='d-block mt-2'>
          <a href="" class="btn btn-secondary py-2" download="qr-code-${slug}.png"> <img
                  src="../../assets/svg/download.svg" width="16px" alt="download" /> تحميل</a>
      </div>
     
     `
        return url
      })
      .then(url => {
        const qrImg = document.querySelector("#qrImg img");
        const downloadQRBtn = document.querySelector("#downloadQRImg a");
        qrImg.setAttribute(
          "src",
          url
        );
        downloadQRBtn.setAttribute(
          "href",
          url
        );

      }).catch(error => {
        console.error(error)
        qrCodeOverlay.remove()
        showNotification('حدثت مشكلة أثناء استخراج الكود!')
      })
  } else if (qrCodeOverlay && (event.target.id === 'closeImg' || event.target.id === 'qrCodeOverlay')) {
    // remove
    console.log(event.target.id);
    qrCodeOverlay.remove()
  }

}