var zIndexCounter = 1000;

export function initializeWindows() {
    $(".window.glass:not(.ui-draggable)").draggable({
        handle: ".title-bar",
        containment: 'body',
        start: function (event, ui) {
            zIndexCounter++;
            $(this).css('z-index', zIndexCounter);
        }
    });

    $(".window.glass:not(.ui-resizable)").resizable({});
}

export function minimizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = windowBody.style.display === 'none' ? '' : 'none';
    window.classList.remove('maximized');
}

export function maximizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = '';
    if (window.classList.contains('maximized')) {
        window.classList.remove('maximized');
        window.style.maxWidth = '';
        window.style.height = '';
    } else {
        window.classList.add('maximized');
        window.style.maxWidth = '100%';
        window.style.height = '100%';
    }
    window.classList.remove('minimized');
}

export function closeWindow(button) {
    const window = button.closest('.window');
    window.remove();
}

function switchTab(tabButton) {
    const $tabButton = $(tabButton);
    const containerId = $tabButton.closest('.window').attr('id');
    const contentId = $tabButton.data('content-id');
    const url = $tabButton.data('url');

    // Handle tab selection UI
    $("#" + containerId + " menu[role='tablist'] button").attr("aria-selected", "false");
    $tabButton.attr("aria-selected", "true");

    // Load tab content
    $("#" + containerId + " .tab-content").empty();
    $("#" + contentId).load(url, function (response, status, xhr) {
        if (status === "error") {
            console.error("Failed to load tab content:", xhr.status, xhr.statusText);
            $(this).html("Sorry, there was an error loading the content.");
        }
    });
}


$(function () {
    initializeWindows();

    $(document).on('click', '.window', function () {
        zIndexCounter++;
        $(this).css('z-index', zIndexCounter);
    });

    $(document).on('click', '[role="tab"]', function () {
        switchTab(this);
    });
});

export function loadContent(container, url, page) {
    const newDivId = `app-${page}`;
    $(container).append(`<div id="${newDivId}" class="draggable"></div>`);
    $(`#${newDivId}`).load(url, function (response, status, xhr) {
        if (status === "error") {
            console.log("Error loading content: " + xhr.status + " " + xhr.statusText);
        } else {
            initializeWindows();
        }
    });
}

export function redirectToVideo(url) {
    window.location.href = url;
}

export function loadJudgingSheet(url, page) {
    const newDivId = `app-${page}`;
    $('#app-contest').append(`<div id="${newDivId}" class="draggable"><div class="judging-sheet"><iframe src="${url}" frameborder="0" width="100%" height="500px"></iframe></div></div>`);
}

export function loadPageHashContent() {
    // Listen for deep-link messages from parent window (iframe method)
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'deep-link' && event.data.slug) {
            console.log('Deep-link message received:', event.data.slug);
            processHash(event.data.slug);
        }
    });

    // Also process hash from URL on initial load
    const urlHash = window.location.hash.substring(1);
    if (urlHash) {
        processHash(urlHash);
    }
}

function processHash(hash) {
    $.getJSON('/content/apps/windows/content/jsonLists/pageHashes.json', function (data) {
        console.log("Page Hashes:", data);
        console.log("Processing Hash:", hash);

        const contentUrl = data[hash];
        if (contentUrl) {
            const baseHash = hash.replace(/-(info|judgingSheet|resultsVideo)$/, '');
            if (hash.endsWith("-info")) {
                loadContent('#app-container', contentUrl, baseHash);
            } else if (hash.endsWith("-judgingSheet")) {
                loadJudgingSheet(contentUrl, baseHash);
            } else if (hash.endsWith("-resultsVideo")) {
                redirectToVideo(contentUrl);
            } else {
                loadContent('#app-container', contentUrl, baseHash);
            }
        } else {
            console.log("No matching content for hash:", hash);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to load pageHashes.json:", textStatus, errorThrown);
    });
}