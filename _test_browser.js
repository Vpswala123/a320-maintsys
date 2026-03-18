const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    page.on('requestfailed', request => {
        console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    try {
        await page.goto('http://localhost:8080/web/', { waitUntil: 'networkidle2', timeout: 10000 });
        console.log('Page loaded');
    } catch (e) {
        console.error('GOTO ERROR:', e.message);
    }
    
    await browser.close();
})();
