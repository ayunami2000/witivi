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
};

MediaTimelineUI.prototype.getMediaTimeline = function() {
    return this._timeline;
}

MediaTimelineUI.prototype.fillProperties = function() {
    var tl = this._timeline;

    this._properties["Clips"] = tl.numObjects();
    var duration = 0;
    for(var index = 0;index < tl.numObjects();index++) {
        if (tl.at(index).duration >= 0 && tl.at(index).duration < MAXTIME) {
            duration += parseFloat(tl.at(index).duration);
        }
    }
    this._properties["Length"] = nsecsToString(duration, true);
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
                var mtui = new MediaTimelineItemUI(currentDraggedMediaItem);
                mtui.setThumbnail($(this).context);
                if (currentDraggedMediaItem._type == MediaItem.Type.IMAGE) {
                    var tlObject = mtui.getTimelineObject();
                    tlObject.inpoint = 0;
                    tlObject.duration = 5e9;
                }
                ensureTimelineStop();
                // add to the timeline to proper position
                mediaTimelineUI.getMediaTimeline().addObject(
                        mtui.getTimelineObject(), index);
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
