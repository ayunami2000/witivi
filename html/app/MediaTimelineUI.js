/*
 * Media Timeline UI class
 */

function MediaTimelineUI(timeline) {
    this._timeline = timeline;
    this._type = MediaItem.Type.VIDEO;

    // fill properties
    this._properties = new Array();
    this._properties["Source"] = "Timeline";
    this._properties["Type"] = "Video";
    this.fillProperties();
};

MediaTimelineUI.prototype.getMediaTimeline = function() {
    return this._timeline;
}

MediaTimelineUI.prototype.getDuration = function() {
    var tl = this.getMediaTimeline();
    var duration = 0;
    var numObjects = tl.numObjects();
    if (numObjects > 0) {
        var object = tl.at(numObjects - 1);
        if (object) {
            duration += parseFloat(object.start);
            duration += parseFloat(object.duration);
        }
    }
    return duration;
}

MediaTimelineUI.prototype.fillProperties = function() {
    this._properties["Clips"] = this.getMediaTimeline().numObjects();
    this._properties["Length"] = nsecsToString(this.getDuration(), true);
}

MediaTimelineUI.prototype.getProperties = function() {
    return this._properties;
}

MediaTimelineUI.prototype.updateMediaTimelineSorting = function() {
    $(".media-timeline-container img").each(function(index) {
        // new element
        if (typeof($(this).context.getMediaItem) == "undefined") {
            //console.log("new item found: " + index);
            if (currentDraggedMediaItem) {
                ensureTimelineStop();
                var mtui = new MediaTimelineItemUI(currentDraggedMediaItem);
                mtui.setThumbnail($(this).context);
                // add to the timeline to proper position
                mediaTimelineUI.getMediaTimeline().addObject(mtui.getTimelineObject(), index);
            }
        } else {
            //console.log("item was here before: " + index);
            var tlObject = $(this).context.getMediaTimelineItemUI().getTimelineObject();
            if (mediaTimelineUI.getMediaTimeline().index(tlObject) != index) {
                //console.log("item has changed position " + mediaTimelineUI.getMediaTimeline().index(tlObject) + " to " + index);
                ensureTimelineStop();
                mediaTimelineUI.getMediaTimeline().moveObject(tlObject, index);
            }
        }
    });

    $('#text-preview-timeline').hide();

    // use a timeout, since the timeline might take some time to update some properties
    setTimeout("refreshMediaInfo(mediaTimelineUI);", 100);
    setTimeout("updateTimelineLength();", 100);
};

/*
 * Media timeline UI functions
 */

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
        previewMedia(mediaTimelineUI, ".media-timeline-container img", true);
    });

    $( "#timeline-trash" ).button({
        icons: { primary:  "ui-icon-trash" },
        text: false
    }).click(function () {
        // Go through all selected items.
        $(".media-timeline-container .ui-selected").each(function(index) {
            ensureTimelineStop();
            // Remove the Item from the MediaTimeline Object.
            var tlObject = $(this).context.getMediaTimelineItemUI().getTimelineObject();
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

function ensureTimelineStop() {
    var video = document.getElementById('video-preview');
    if ((typeof currentPreviewItem != "undefined") &&
        (currentPreviewItem.constructor.name == "MediaTimelineUI" || currentPreviewItem.constructor.name == "MediaTimelineItemUI")) {
        video.pause();
        video.src = null;
    }
}

function updateTimelineLength() {
    //console.log("updateTimelineLength");
    var info = document.getElementById('timeline-length');
    if (info) {
        info.innerText = nsecsToString(mediaTimelineUI.getDuration(), true);
    }
}

function sortableStartEvent(event, ui) {
    if (ui.placeholder) {
        ui.placeholder.attr("src", "images/placeholder.png")
    }
}
