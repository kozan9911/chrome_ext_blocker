var CONTEXT_MENU_ITEMS = {
    windowed: [
        {title: 'Block current page', id: "block_page"}
    ],
    selection: [
        {title: 'Block current page', id: "block_page"}
    ],
    link: [
        {title: 'Block link url', id: "block_link"}
    ],
};

function setupContextMenus() {
    chrome.contextMenus.removeAll(function() {
        CONTEXT_MENU_ITEMS.windowed.forEach(function(cmd) {
            chrome.contextMenus.create({
                title: cmd.title,
                id: cmd.id,
                contexts: ['page']
            });
        });
        CONTEXT_MENU_ITEMS.link.forEach(function(cmd) {
            chrome.contextMenus.create({
                title: cmd.title,
                id: cmd.id,
                contexts: ['link', 'image']
            });
        });
    });
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({blackList: blackList}, function() {
        console.log("Black list loaded");
    });
    setupContextMenus();
    setupListeners();
});

const showAllert = ()=>{
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'favicon.png',
        title:'Blocked URL',
        message:"Action blocked"
    });
};
const removeTab = (id) =>{
    console.log("Removing tab id:", id);
    chrome.tabs.remove(id, ()=>{
        showAllert()
    });
};

const webNavigation_onCommitted_Listener = function (e) {
    try {
        chrome.tabs.goBack(e.tabId, ()=>{
            if(chrome.runtime.lastError){
                removeTab(e.tabId)
            }else {
                showAllert()
            }
        })
    } catch (e) {
        removeTab(e.tabId)
    }
};


function setupListeners() {
    if(chrome.webNavigation.onCommitted.hasListeners()) {
        chrome.webNavigation.onCommitted.removeListener(webNavigation_onCommitted_Listener);
    }
    chrome.storage.sync.get(['blackList'], function(res) {
        chrome.webNavigation.onCommitted.addListener(
            webNavigation_onCommitted_Listener,
            {url: res.blackList.map(item => ({urlEquals: item}))}
        );
    });

}

setupListeners();
setupContextMenus();


chrome.storage.sync.onChanged.addListener(function(changes) {
    if('blackList' in changes) {
        var blackChanges = changes['blackList'];
        blackList.splice(0, blackList.length);
        blackList.push.apply(blackList, blackChanges.newValue);
        setupListeners();
    }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    console.log("current blocking list", blackList);
    var link_to_block = null;
    switch(info.menuItemId) {
        case 'block_page':
            link_to_block = info.pageUrl;
            break;
        case 'block_link':
            link_to_block = info.linkUrl;
            break;
    }
    if(!!link_to_block) {
        //remove fragmant from url
        link_to_block = link_to_block.replace(/#(.*)$/, '');
        var newBlackList = blackList;
        newBlackList.push(link_to_block);
        chrome.storage.sync.set({blackList: newBlackList});
    }

});
