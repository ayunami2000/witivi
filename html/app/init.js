/*
 * Misc initialization code
 */

function initDataModel() {
    mediaLibrary = new MediaLibrary();
    mediaLibrary.addMediaFiles(mediaFiles);
    mediaLibrary.addTransitions(transitionTypes);

    if (typeof MediaTimeline != "undefined") {
        mediaTimelineUI = new MediaTimelineUI(new MediaTimeline());
    }
}

function initMediaLibraryUI() {
    // setup
    $( "#media-library" ).accordion({
        fillSpace:true
    });
}

function initPreviewUI() {
    // setup toolbar buttons for preview window
    $( "#preview-playpause" ).button({
        icons: { primary:  "ui-icon-play" },
        text: false
    }).click(function () {
        previewPlayPause();
    });

    // setup slider for seeking
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 0,
        values: [0, 0],
        step: 1000 / fps,
        slide: rangeSliderSlide,
        stop: rangeSliderStop,
        disabled: true
    }).hide();

    // setup slider for inpoint / outpoint editing
    $("#slider-seek").slider({
        range: false,
        min: 0,
        max: 0,
        value: 0,
        step: 1000 / fps,
        slide: seekSliderSlide,
        stop: seekSliderStop,
        disabled: true
    }).show();

    // setup video
    var video = document.getElementById('video-preview');
    if (video) {
        video.addEventListener("loadedmetadata", videoMetadataUpdated, false);
        video.addEventListener("ondurationchanged", setupSliders, false);
        // following event does not seem to work :(
        //video.addEventListener("ontimeupdate", updateSliders, false);
    }

    updatePlayPause();
    updateCurrentTime();
}

function initMediaTimelineUI() {
    // setup media timeline container
    $( ".media-timeline-container" ).sortable({
        placeholder: 'ui-state-highlight',
        forcePlaceholderSize: true,
        tolerance: "pointer",
        distance: 30,
        delay: 100,
        opacity: 0.7,
        start: sortableStartEvent
    });
    //$( ".media-timeline-container" ).selectable();
    $( ".media-timeline-container" ).bind( "sortupdate", function(event, ui) {
        mediaTimelineUI.updateMediaTimelineSorting();
    });

    // setup toolbar buttons for timeline
    $( "#timeline-play" ).button({
        icons: { primary:  "ui-icon-video" },
        text: false
    }).click(function () {
        previewMedia(mediaTimelineUI, ".media-timeline-container img");
        var video = document.getElementById('video-preview');
        if (video) {
            video.play();
        }
        updatePlayPause();
    });

    $( "#timeline-trash" ).button({
        icons: { primary:  "ui-icon-trash" },
        text: false
    }).click(function () {
        // Go through all selected items.
        $(".media-timeline-container .ui-selected").each(function(index) {
            ensureTimelineStop();
            // Remove the Item from the MediaTimeline Object.
            var tlObject =
                $(this).context.getMediaTimelineItemUI().getTimelineObject();
            if (tlObject) {
                mediaTimelineUI.getMediaTimeline().removeObject(tlObject);
            }

            refreshMediaInfo(currentPreviewItem);
            updateTimelineLength();

            // Remove the visual representation of the item.
            $(this).effect("fade", {}, 500, function() {
                $(this).remove();

                if (mediaTimelineUI.getMediaTimeline().numObjects() <= 0) {
                    $('#text-preview-timeline').show();
                }
            });
        });
    });
}

function initUI() {
    // check for webkit supporting
    if (typeof MediaTimeline == "undefined") {
        $('#text-preview-timeline').attr('innerHTML', "<br><br>ERROR: your browser does not support GES Webkit extension");
        return;
    }

    // initialize each of the panes UI
    initMediaLibraryUI();
    initPreviewUI();
    initMediaTimelineUI();
}
