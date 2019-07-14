/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated() {
    if (browser.runtime.lastError) {
        console.log(`Error: ${browser.runtime.lastError}`);
    } else {
        console.log("Item created successfully");
    }
}

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
    console.log(`Error: ${error}`);
}

/*
Create all the context menu items.
*/

browser.menus.create({
    id: "translate-comment",
    title: "Translate this comment",
    contexts: ["selection", "all"]
}, onCreated);

browser.menus.create({
    id: "translate-top-level",
    title: "Translate top level comments",
    contexts: ["all"]
}, onCreated);

var gtranslateUrl = 'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='
var selectedText = '';
var topLevelCommentSelector = "div.sitetable.nestedlisting > div.comment > div.entry > form.usertext > div.usertext-body.md-container > div.md > p";

function logTabs(tabs) {
    var existingTranslate = false;
    var existingTranslateId = 0;
    for (let tab of tabs) {
      // tab.url requires the `tabs` permission
        let u = tab.url.toString();
        if (u.includes('translate.google.com')){
            existingTranslate = true;
            existingTranslateId = tab.id;
            break;
        }
    }
    if (existingTranslate) {
        browser.tabs.update(
            existingTranslateId,
            {
                active: true,
                url: gtranslateUrl + selectedText
            }
        ).then(() => {console.log("Updated existings tab")}, onError);
    } else {
        browser.tabs.create(
            {
                url: gtranslateUrl + selectedText
            }
        ).then(() => {console.log("Created new tab")}, onError);
    }
}

function translateComment(selectionText) {
    selectedText = encodeURIComponent(selectionText);
    var queryTabs = browser.tabs.query({currentWindow: true});
    queryTabs.then(logTabs, onError);
}

function translateAllTopLevelComments(tabId) {
    browser.tabs.sendMessage(
        tabId,
        {greeting: "Get top level comments", selector: topLevelCommentSelector}
    ).then(response => {
        selectedText = response.commentList.join("%0A%0A");
        var queryTabs = browser.tabs.query({currentWindow: true});
        queryTabs.then(logTabs, onError);
    }).catch(onError);
}

/*
The click event listener, where we perform the appropriate action given the
ID of the menu item that was clicked.
*/
browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "translate-comment":
            if (info.selectionText.length == 0){
                break;
            }
            translateComment(info.selectionText);
            break;
        case "translate-top-level":
            translateAllTopLevelComments(tab.id);
            break;
    }
});
