"use strict";

browser.runtime.onMessage.addListener(request => {
    // We are in a comments section
    var comments = document.querySelectorAll(request.selector);
    var totNumChars = 0
    var topLevelCommentList = [];
    comments.forEach(pComment => {
        let com = pComment.textContent;
        if ((totNumChars + com.length) < 5000){
            topLevelCommentList.push(com);
            totNumChars = totNumChars + com.length;
        }
    });
    return Promise.resolve({response: "Extracted Top Level Comments", commentList: topLevelCommentList});
});