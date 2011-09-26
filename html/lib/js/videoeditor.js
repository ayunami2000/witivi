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
    this._thumbnail.getMediaItem = function() { return self; }
    this._thumbnail.setAttribute("src", this._thumbnailSource);
    this._thumbnail.setAttribute("width", "150px");
    this._thumbnail.setAttribute("class", "media-library-item draggable ui-widget-content");

    $(this._thumbnail).draggable({
        //  use a helper-clone that is append to 'body' so is not 'contained' by a pane
        helper: function (x) {
            var mtui = new MediaTimelineUIItem(self);
            this._mtui = mtui;
            var newhelper = $(mtui.getThumbnail());//.attr('width', '150px').css({'width':'150px'}).addClass('media-timeline-item');
            return newhelper.appendTo('body').css('zIndex',5).show();
        },
        connectToSortable : '.media-timeline-container',
        cursor: 'move'
    });

    $(this._thumbnail).bind('click', function() {
        $('video').attr('src', filename);
    });

    return this;
}

MediaItem.prototype.getType = function() {
    return this._type;
}

MediaItem.prototype.getFilename = function() {
    return this._filename;
};

MediaItem.prototype.getURI = function() {
    var src = this.getThumbnail().baseURI;
    var lastIndex = src.lastIndexOf('/');
    if (lastIndex == -1) {
        return this.getFilename();
    }
    return src.slice(0,lastIndex).concat('/' + this._filename);
}

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
 * Media Timeline UI Item
 */
var MediaTimelineUIItem = function(mediaItem) {
    this._mediaItem = mediaItem;

    // create thumbnail
    this._thumbnail = new Image();
    var self = this;
    this._thumbnail.getMediaItem = function() { return self._mediaItem; }
    this._thumbnail.getMediaTimelineItem = function() { return self; }
    this._thumbnail.setAttribute("src", this._mediaItem.getThumbnailSource() );
    $(this._thumbnail).addClass('media-timeline-item ui-widget-content');//.attr('width', '150px').css({'width':'150px'});

    $(this._thumbnail).bind('click', function() {
        $('video').attr('src', this.getMediaItem().getFilename());
    });

    return this;
}

MediaTimelineUIItem.prototype.getTimelineObject = function() {
    if (!this._timelineObject) {
        this._timelineObject = new MediaTimelineFileSource(mediaItem.getURI());
    }
    return this._timelineObject;
}

MediaTimelineUIItem.prototype.getThumbnail= function() {
    return this._thumbnail;
}

MediaTimelineUIItem.prototype.getMediaItem= function() {
    return this._mediaItem;
}

/*
 * Media Timeline UI
 */

var MediaTimelineUI = function(timeline) {
    this._timeline = timeline;

    $( ".media-timeline-container" ).sortable({
    });
    $( ".media-timeline-container" ).disableSelection();
};

MediaTimelineUI.prototype.addMediaItem = function(mediaItem) {
    var item = new MediaTimelineUIItem(mediaItem);

    // add timeline object to the timeline
    var timelineObject = item.getTimelineObject();
    this._timeline.addObject(item.getTimelineObject(), 0);

    // make it appear in the UI too
    $(".media-timeline-container").append( item.getThumbnail() );
}

/*
 * Data model
 */

function initDataModel() {
    mediaLibrary = new MediaLibrary();
    mediaLibrary.addMediaFiles(mediaFiles);

    mediaTimelineUI = new MediaTimelineUI(new MediaTimeline());
}

/*
 * Data model
 */

// media library
var mediaLibrary;

// Timeline to use in the video editor application
var mediaTimelineUI;

// media items
//var editTimelineMediaItem;
//var currentMediaItem;
