/*
 * Media Timeline Item UI class
 */
function MediaTimelineItemUI(mediaItem) {
    this._mediaItem = mediaItem;
    this._properties = new Array();
    if (mediaItem.getType() & MediaItem.Type.TRANSITION) {
        this._type = mediaItem.getType();
    } else {
        this._type = MediaItem.Type.VIDEO;
    }

    // copy the properties from the media item
    var itemProps = mediaItem.getProperties();
    for (prop in itemProps) {
        this._properties[prop] = itemProps[prop];
    }

    // overwrite source property for timeline items
    this._properties["Source"] = "Clip";

    // setup default values of inpoint and duration for images
    var tlObject = this.getTimelineObject();
    if (mediaItem._type == MediaItem.Type.IMAGE) {
        tlObject.inpoint = 0;
        tlObject.duration = 5e9;
    }

    return this;
}

MediaTimelineItemUI.prototype.getTimelineObject = function() {
    if (!this._timelineObject) {
        if (this._mediaItem.getType() & (MediaItem.Type.VIDEO | MediaItem.Type.IMAGE | MediaItem.Type.AUDIO)) {
            this._timelineObject = new MediaTimelineFileSource(this._mediaItem.getURI());
        } else if (this._mediaItem.getType() & MediaItem.Type.TRANSITION) {
            this._timelineObject = new MediaTimelineTransitionOperation(this._mediaItem.getTransitionType());
        }
    }

    return this._timelineObject;
}

MediaTimelineItemUI.prototype.getMediaItem= function() {
    return this._mediaItem;
}

MediaTimelineItemUI.prototype.getProperties = function() {
    return this._properties;
}

MediaTimelineItemUI.prototype.fillProperties = function() {
    var object = this.getTimelineObject();
    if (object) {
        this._properties["Start"] = nsecsToString(object.start, true);
        this._properties["Inpoint"] = nsecsToString(object.inpoint, true);
        this._properties["Outpoint"] = nsecsToString(object.inpoint + object.duration, true);
        this._properties["Duration"] = nsecsToString(object.duration, true);
        //this._properties["Priority"] = "" + object.priority;
    }
}

MediaTimelineItemUI.prototype.setThumbnail= function(thumbnail) {
    this._thumbnail = thumbnail;
    if (thumbnail) {
        var self = this;
        this._thumbnail.getMediaItem = function() { return self._mediaItem; }
        this._thumbnail.getMediaTimelineItemUI = function() { return self; }
        $(this._thumbnail).addClass('media-timeline-item ui-widget-content');
        $(this._thumbnail).removeClass('ui-selected');

        $(this._thumbnail).bind('click', function() {
            previewMedia(this.getMediaTimelineItemUI(), $(this), true);
        });
    }
}

MediaTimelineItemUI.prototype.getThumbnail= function() {
    if (!this._thumbnail) {
        this.setThumbnail(new Image());
        this._thumbnail.setAttribute("src", this._mediaItem.getThumbnailSource());
   }

    return this._thumbnail;
}
