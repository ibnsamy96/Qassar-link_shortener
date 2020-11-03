const databaseApi = "https://ibn-samy-short-links.firebaseio.com/links";

const getData = async (url = "") => {
  const request = await fetch(url, { mode: "cors", method: "GET" });

  return request.json();
};

// Components
const HomeComponent = {
  render: () => {
    return `
        <section>
          <h1>Home</h1>
          <p>This is just a test</p>
        </section>
      `;
  },
};

const ShortLinkComponent = {
  get: (slug) => {
    console.log(
      `${databaseApi}.json?orderBy="$key"&equalTo="${slug}"&print=pretty`
    );

    return getData(
      `${databaseApi}.json?orderBy="$key"&equalTo="${slug}"&print=pretty`
    )
      .then((data) => {
        console.log(data);
        console.log(data[`${slug}`].domain);
        return data[`${slug}`].domain;
      })
      .then((URL) => {
        console.log(this);
        ShortLinkComponent.open(URL);
        // return URL;
      })
      .catch((data) => console.log(data));
  },
  open: (URL) => {
    window.open(URL, "_self"); // open link in new tab
  },
};

const ErrorComponent = {
  render: () => {
    return `
        <section>
          <h1>Error</h1>
          <p>This is just a test</p>
        </section>
      `;
  },
};

// Routes
const routes = [
  { path: "/", component: HomeComponent },
  { path: "/error", component: ErrorComponent },
];

const router = () => {
  // TODO: Get the current path
  //   const currentPath = window.location.pathname;
  const currentPath = window.location.hash.slice(1) || "/"; // way of tutorial
  console.log(currentPath);

  // TODO: Find the component based on the current path
  const { component = ShortLinkComponent } =
    routes.find((route) => {
      return route.path === currentPath;
    }) || {};

  // TODO: Render the component in the "app" placeholder
  if (component === ShortLinkComponent) {
    const slug = currentPath.split("/")[1];
    console.log(slug);
    if (slug !== "" && slug !== " ") {
      component.get(slug);
    }
    // component.open("http://facebook.com");
  } else {
    const appDiv = document.querySelector("#app");
    appDiv.innerHTML = component.render();
  }
};

const test = () => {
  console.log(window.location.hash);
  router();
};

window.addEventListener("load", router);
window.addEventListener("hashchange", test);