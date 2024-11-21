const puppeteer = require('puppeteer');
const gotoPage = require('./gotoPage');

// Function to wait for a specified time
const waitHere = (seconds) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("done");
        }, seconds * 1000); // Convert seconds to milliseconds
    });
};

async function scrapePerplexity(inputText) {
    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();

    // await page.goto('https://www.perplexity.ai/search/ullekhy-gt-budhbaar-9-aktteaab-i59mLVY2RJSZ0a70bRatWg', { waitUntil: 'networkidle2' });
    const { page, browser } = await gotoPage('https://www.perplexity.ai/search/ullekhy-gt-budhbaar-9-aktteaab-i59mLVY2RJSZ0a70bRatWg')

    const inputFieldId = 'textarea[data-1p-ignore="true"]';
    const submitButtonId = 'button[aria-label="Submit"]';

    const inputValue = `Modify or rewrite this article, don't change its original language:- (${inputText})`

    await page.waitForSelector(inputFieldId, { timeout: 60000 })
    await page.type(inputFieldId, inputValue);

    await waitHere(3);
    await page.click(submitButtonId);

    await page.waitForSelector('div.prose');
    await waitHere(30);

    // Extract the last output text
    const outputText = await page.evaluate(() => {
        const proseElements = document.querySelectorAll('div.prose');
        const lastProseElement = proseElements[proseElements.length - 1]; // Get the last div with class prose
        const firstSpan = lastProseElement.querySelector('span'); // Get the first span within that div
        return firstSpan ? firstSpan.innerText : 'No span found'; // Return the text or a message if no span is found
    });


    // await browser.close(); // Close the browser
    return outputText;
}

// Example usage
// scrapePerplexity( ট্রলারসহ অন্য মাঝিদের ছেড়ে দেয় মিয়ানমার।').catch(console.error);

module.exports = scrapePerplexity