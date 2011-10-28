/*
 * Media Item class
 * - Used for video and image files
 * - Provides thumbnail
 * - Provides properties like type, filename, extension, URI
 */

function MediaItem(filename) {
    this._filename = filename;
    this._extension = this._filename.split(".").pop();
    this._properties = new Array();

    // detect type and fill the properties and type
    this._type = 0;
    this._properties["Name"] = this.getBasename();
    this._properties["Source"] = "Library";
    if (this._extension == "avi"
        || this._extension == "mp4"
        || this._extension == "mov"
        || this._extension == "ogg") {
        this._type |= MediaItem.Type.VIDEO;
        this._properties["Type"] = "Video";
    } else if (this._extension == "jpg") {
        this._type |= MediaItem.Type.IMAGE;
        this._properties["Type"] = "Image";
    } else {
        this._type = MediaItem.Type.UNKNOWN;
        this._properties["Type"] = "Unknown";
    }

    return this;
}

MediaItem.prototype.getType = function() {
    return this._type;
};

MediaItem.prototype.getFilename = function() {
    return this._filename;
};

MediaItem.prototype.getExtension = function() {
    return this._extension;
};

MediaItem.prototype.getURI = function() {
    if (typeof this._uri == "undefined") {
        var src = this.getThumbnail().baseURI;
        var lastIndex = src.lastIndexOf('/');
        if (lastIndex == -1) {
            return this.getFilename();
        }
        this._uri = src.slice(0,lastIndex).concat('/' + this._filename);
    }
    return this._uri;
};

MediaItem.prototype.getBasename = function() {
    if (typeof this._basename == "undefined") {
        var path = this.getFilename().split("/");
        this._basename = path.pop();
    }
    return this._basename;
};

MediaItem.prototype.getProperties = function() {
    return this._properties;
};

MediaItem.prototype.fillProperties = function() {
    // nothing to do, already done :)
};

MediaItem.prototype.getThumbnailSource = function() {
    if (typeof this._thumbnailSource == "undefined") {
        var path = this._filename.split("/");
        var leafname = path.pop();
        path.push("thumbnail");
        path.push(leafname);
        this._thumbnailSource = path.join("/") + (".jpg");
    }
    return this._thumbnailSource;
};

MediaItem.prototype.getThumbnail = function() {
    if (typeof this._thumbnail == "undefined") {
        this._thumbnail = new Image();
        var self = this;
        this._thumbnail.getMediaItem = function() { return self; }
        this._thumbnail.setAttribute("src", this.getThumbnailSource());
        this._thumbnail.setAttribute("width", "150px");
        this._thumbnail.setAttribute("class",
                "media-library-item draggable ui-widget-content");

        $(this._thumbnail).draggable({
            // Use a helper-clone that is append to 'body'
            // so is not 'contained' by a pane.
            //
            helper: function (x) {
                var newhelper = $(this).clone();
                currentDraggedMediaItem = self;
                return newhelper.appendTo('body').css('zIndex',5).show();
            },
            stop : function (x) {
                currentDraggedMediaItem = false;
            },
            connectToSortable : '.media-timeline-container',
            cursor: 'move',
            distance: 30,
            opacity: 0.7
        });

        $(this._thumbnail).bind('click', function() {
            previewMedia(self, $(this));
        });
    }
    return this._thumbnail;
};

MediaItem.prototype.showInUI = function() {
    if (this.getType() & MediaItem.Type.VIDEO) {
        $(".video-library-container").append( this.getThumbnail() );
    } else if (this.getType() & MediaItem.Type.IMAGE) {
        $(".image-library-container").append( this.getThumbnail() );
    }
};

MediaItem.Type = {
    UNKNOWN : 0,
    IMAGE : 1,
    VIDEO : 2,
    AUDIO : 4,
    TIMELINE_OBJECT : 8,
    TIMELINE : 16,
    TRANSITION : 32
};
