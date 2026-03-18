const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'web/index.html'), 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => { console.error("PAGE_ERROR:", ...arguments); });
virtualConsole.on("log", () => { console.log("PAGE_LOG:", ...arguments); });
virtualConsole.on("jsdomError", (error) => { console.error("JSDOM_ERROR:", error.message); });

const dom = new JSDOM(html, {
  url: "http://localhost:8080/web/index.html",
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});
setTimeout(() => { console.log('Done wait'); }, 4000);
