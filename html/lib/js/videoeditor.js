function dumpObject(obj) {
  var output = '';
  for (property in obj) {
    output += property + ': ' + obj[property] + "\n";
  }
  console.log(output);
}

/*
 * Media Item class
 */

function MediaItem(filename) {
    this._filename = filename;
    this._extension = this._filename.split(".").pop();
    this._thumbnailSource = this.getThumbnailSource();

    // detect type
    this._type = MediaItem.Type.UNKNOWN;
    if (this._extension == "avi") {
        this._type |= MediaItem.Type.VIDEO;
    } else if (this._extension == "jpg") {
        this._type |= MediaItem.Type.IMAGE;
    }

    // create thumbnail
    this._thumbnail = new Image();
    var self = this;
    this._thumbnail.mediaItem = function() { return self; }
    this._thumbnail.setAttribute("src", this._thumbnailSource);
    this._thumbnail.setAttribute("width", "100%");
    this._thumbnail.setAttribute("class", "media-library-item draggable ui-widget-content");

    //dumpObject(this._thumbnail.mediaItem());
    //dumpObject(this._thumbnail.mediaItem());

    $(this._thumbnail).draggable({
        //  use a helper-clone that is append to 'body' so is not 'contained' by a pane
        helper: function () {
            var newhelper = $(this).clone();
            return newhelper.appendTo('body').css('zIndex',5).show();
        }
        ,   cursor: 'move'
    });

    return this;
}

Image.prototype.getMediaItem = function() {
    return this._mediaItem;
}

MediaItem.prototype.getType = function() {
    return this._type;
}

MediaItem.prototype.getFilename = function() {
    return this._filename;
};

MediaItem.prototype.getBasename = function() {
    var path = this._filename.split("/");
    return path.pop();
};

MediaItem.prototype.getThumbnailSource = function() {
    var path = this._filename.split("/");
    var leafname = path.pop();
    path.push("thumbnail");
    path.push(leafname);
    return path.join("/") + (".jpg");
};

MediaItem.prototype.getThumbnail = function() {
    return this._thumbnail;
};

MediaItem.prototype.getProperties = function() {
    return {
        "Source" : "Library",
        "Type" : "Video",
        "Duration" : "00:01:17",
        "Start" : "00:00:00",
        "Inpoint" : "00:00:00",
        "Outpoint" : "00:10:00",
        "Priority" : 1
    };
}

MediaItem.Type = {
    UNKNOWN : 0,
    IMAGE : 1,
    VIDEO : 2,
    AUDIO : 4,
    TIMELINE_OBJECT : 8,
    TIMELINE : 16
};

/*
 * Media Library class
 */

var MediaLibrary = function() {
    this._mediaItems = [];
};

MediaLibrary.prototype.toggleByType = function(type) {
    for (var item in this._mediaItems) {
        console.log(this._mediaItems[item].getType());
        if (this._mediaItems[item].getType() & type) {
            $(this._mediaItems[item].getThumbnail()).toggle();
        }
    }
};

MediaLibrary.prototype.showByType = function(type) {
    for (var item in this._mediaItems) {
        console.log(this._mediaItems[item].getType());
        if (this._mediaItems[item].getType() & type) {
            $(this._mediaItems[item].getThumbnail()).show();
        }
    }
};

MediaLibrary.prototype.hideByType = function(type) {
    for (var item in this._mediaItems) {
        console.log(this._mediaItems[item].getType());
        if (this._mediaItems[item].getType() & type) {
            $(this._mediaItems[item].getThumbnail()).hide();
        }
    }
};

MediaLibrary.prototype.addMediaFiles = function(files) {
    for (var file in files) {
        var item = new MediaItem(files[file]);
        this._mediaItems.push(item);
        $(".media-library-container").append( item.getThumbnail() );
    }
}

/*
 * Helper functions
 */

function previewMedia(obj) {
    // check if image / video / whatever
    // preview on video element
    // modify info properties of the window
    alert("preview media");
}

/*
 * Data model
 */

// Timeline to use in the video editor application
//var editTimeline = new MediaTimeline();

// media items
var editTimelineMediaItem = null;
var currentMediaItem = null;

// media library
var mediaLibrary = new MediaLibrary();
