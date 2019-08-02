document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get('blackList', ({blackList})=> {
        publishData(blackList)
    });

    const itemTemplate = (item)=>{
        return (
            '<li class="item">'+
            '<div>'+
                item +
            '</div>'+
            '</li>'
        )
    };
    const listTemplate = (list)=>{
        return (
            '<ul id="items-list">'+ 
                list.map(item=> itemTemplate(item)) +
            '</ul>'
        )
    };

    const publishData = (data)=>{
        const wrapper = document.querySelector('#list-wrapper');
        wrapper.innerHTML=listTemplate(data);
    };

});
