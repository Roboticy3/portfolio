const targets = await (await fetch("http://127.0.0.1:9223/json")).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("No page target found");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const resolve = pending.get(message.id);
  if (resolve) {
    pending.delete(message.id);
    resolve(message);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url: "http://127.0.0.1:4321/embed%20styling/" });
await new Promise((resolve) => setTimeout(resolve, 1200));
await send("Emulation.setDeviceMetricsOverride", {
  width: 1400,
  height: 2400,
  deviceScaleFactor: 1,
  mobile: false,
});
await new Promise((resolve) => setTimeout(resolve, 400));

const expression = `JSON.stringify((() => {
  const info = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const p = el.closest("p")?.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      width: Math.round(r.width * 10) / 10,
      height: Math.round(r.height * 10) / 10,
      topOffsetInP: p ? Math.round(r.top - p.top) : null,
      class: el.className || null,
    };
  };
  const article = document.querySelector("article");
  const sidebar = document.querySelector(".about-sidebar");
  if (!article) return { error: "no article", readyState: document.readyState, url: location.href, body: document.body?.innerText?.slice(0, 200) };
  const imgs = Array.from(article.querySelectorAll("img"));
  return {
    lineHeightPx: getComputedStyle(article).lineHeight,
    mainInlinePlain: info(imgs.find((i) => i.alt === "inline svg" && !i.style.width)),
    mainInlineStyled: info(imgs.find((i) => i.alt === "inline svg" && i.style.width === "1.5em")),
    mainStandaloneLarge: info(imgs.find((i) => i.alt === "Large image")),
    sidebarInline: info(sidebar?.querySelector('img[alt="inline icon"]')),
    sidebarStandalone: info(sidebar?.querySelector('img[alt="Large sidebar image"]')),
  };
})())`;

const response = await send("Runtime.evaluate", { expression, returnByValue: true });
console.log(JSON.stringify(response.result, null, 2));
ws.close();
