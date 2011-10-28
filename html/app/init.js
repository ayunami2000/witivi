/*
 * Misc initialization code
 */

function initDataModel() {
    mediaLibrary = new MediaLibrary();
    mediaLibrary.addMediaFiles(mediaFiles);

    if (typeof MediaTimeline == "undefined") {
        $('#text-preview-timeline').attr('innerHTML', "<br><br>ERROR: your browser does not support GES Webkit extension");
        return;
    }

    mediaTimelineUI = new MediaTimelineUI(new MediaTimeline());

    // load the transitions
    this._transitionItems = [];
    for (var type in transitionTypes) {
        var item = new TransitionItem(transitionTypes[type]);
        this._transitionItems.push(item);
        $(".transition-library-container").append( item.getThumbnail() );
    }

}

function initUI() {
    $( "#preview-playpause" ).button({
        icons: { primary:  "ui-icon-play" },
        text: false
    }).click(function () {
        previewPlayPause();
    });

    $( "#media-library" ).accordion({fillSpace:true});

    $( "#timeline-play" ).button({
        icons: { primary:  "ui-icon-video" },
        text: false
    }).click(function () {
        $('.ui-selected').removeClass('ui-selected')
        $(".media-timeline-container img").addClass("ui-selected");

        previewMedia(mediaTimelineUI);
        var video = document.getElementById('video-preview');
        if (video) {
            video.play();
        }
        updatePlayPause();
    });
    $( "#timeline-new" ).button({
        icons: { primary:  "ui-icon-document" },
        text: false
    });
    $( "#timeline-load" ).button({
        icons: { primary:  "ui-icon-folder-open" },
        text: false
    });
    $( "#timeline-save" ).button({
        icons: { primary:  "ui-icon-disk" },
        text: false
    });
    $( "#timeline-render" ).button({
        icons: { primary:  "ui-icon-video" },
        text: false
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
    $( "#timeline-zoomout" ).button({
        icons: { primary:  "ui-icon-zoomout" },
        text: false
    });
    $( "#timeline-zoomin" ).button({
        icons: { primary:  "ui-icon-zoomin" },
        text: false
    });
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
