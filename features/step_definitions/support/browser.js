

// Scheme and authority of the URL of the website we're testing.
let baseUrl = "http://localhost:3000"; // would be best to grab the --ddp parameter. How?


/**
 * Get the current browser and fail when not available.
 * @see http://webdriver.io/api.html for what the browser can do
 * @returns object
 */
export const getBrowser = () => {
    if ( ! browser) throw new Error('Browser is unavailable, for some reason.');

    if (browser.getUrl() == 'data:,') { // not the best design, this
        browser.url(`${baseUrl}/`); // make sure Meteor and consorts are defined
    }

    return browser;
};


/**
 * Get the current browser's current route, which is the URL's path + query + fragment.
 * @returns string
 */
export const getRoute = () => {
    return getBrowser().getUrl().substring(baseUrl.length);
};


/**
 * Send the current browser to the provided route, which is the URL's path + query + fragment.
 * @param route
 */
export const visit = (route) => {
    browser.url(`${baseUrl}${route}`);
};
