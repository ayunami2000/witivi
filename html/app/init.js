/*
 * Misc initialization code
 */

function main()
{
    $(document).ready( function() {
        initLayout();

        // check for webkit supporting Media Timeline feature
        if (typeof MediaTimeline == "undefined") {
            $('#text-preview-timeline').attr('innerHTML', "<br><br>ERROR: your browser does not support GES Webkit extension");
            return;
        }

        initDataModel();
        initUI();
    });
}

function initDataModel() {
    mediaLibrary = new MediaLibrary();
    mediaLibrary.addMediaFiles(mediaFiles);
    mediaLibrary.addTransitions(transitionTypes);
    mediaLibrary.addTestSources(testSourceTypes);

    if (typeof MediaTimeline != "undefined") {
        mediaTimelineUI = new MediaTimelineUI(new MediaTimeline());
    }
}

function initUI() {
    // initialize each of the panes UI
    initPreviewUI();
    initMediaTimelineUI();
    initMediaLibraryUI();
    initThemeSwitcherUI();
}

function initThemeSwitcherUI() {
    if (enableThemeSwitcher) {
        $(".buttons").show();
        $(".buttons BUTTON").show();
        addThemeSwitcher('#outer-north',{ top: '13px', right: '20px' });
        // if a theme is applied by ThemeSwitch *onLoad*, it may change the height of some content,
        // so we need to call resizeLayout to 'correct' any header/footer heights affected
        // call multiple times so fast browsers update quickly, and slower ones eventually!
        // NOTE: this is only necessary because we are changing CSS *AFTER LOADING* (eg: themeSwitcher)
        setTimeout( resizePageLayout, 1000 ); /* allow time for browser to re-render for theme */
        //setTimeout( resizePageLayout, 5000 ); /* for really slow browsers */

        $("#toggleCustomTheme").click(function () {
            $('body').toggleClass('custom');
            resizePageLayout();
        });
        $("#removeUITheme").click(function () {
            removeUITheme(); 
            resizePageLayout();
        });
    }
}
