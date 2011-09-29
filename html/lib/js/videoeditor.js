function nsecsToString(nsecs) {
    var seconds = Math.floor(nsecs * 0.000000001);

    var minutes = Math.floor(seconds/60);
    seconds = seconds % 60;

    var hours = Math.floor(minutes/60);
    minutes = minutes % 60

    return (hours > 0 ? hours + ":" : "") + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function dumpObject(obj) {
  var output = '';
  for (property in obj) {
    output += property + ': ' + obj[property] + "\n";
  }
  console.log(output);
}

function fillMediaInfo(item) {
   var properties = item.getProperties();
   
   var content = "<table>";
   for (key in properties) {
        content += "<tr><td><b>" + key + ":</b></td>";
        content += "<td>" + properties[key] + "</td></tr>";
   }
   content += "</table>";
   $('#ui-mediaitem-info').attr('innerHTML', content);
}

/*
 * Media Item class
 */

function MediaItem(filename) {
    this._filename = filename;
    this._extension = this._filename.split(".").pop();
    this._thumbnailSource = this.getThumbnailSource();
    this._properties = new Array();

    // detect type and fill the properties
    this._type = MediaItem.Type.UNKNOWN;
    this._properties["Name"] = this.getBasename();
    this._properties["Source"] = "Library";
    if (this._extension == "avi") {
        this._type |= MediaItem.Type.VIDEO;
        this._properties["Type"] = "Video";
    } else if (this._extension == "jpg") {
        this._type |= MediaItem.Type.IMAGE;
        this._properties["Type"] = "Image";
    }

    // fill the properties

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
            var newhelper = $(this).clone();
            currentDraggedMediaItem = self;
            return newhelper.appendTo('body').css('zIndex',5).show();
        },
        stop : function (x) {
            currentDraggedMediaItem = false;
        },
        connectToSortable : '.media-timeline-container',
        cursor: 'move'
    });

    $(this._thumbnail).bind('click', function() {
        if (self._type == MediaItem.Type.VIDEO) {
            $('#text-preview').hide();
            $('#video-preview').attr('src', filename).show();
            $('#image-preview').hide();
        } else if (self._type == MediaItem.Type.IMAGE) {
            $('#text-preview').hide();
            $('#video-preview').hide();
            $('#image-preview').attr('src', filename).show();
        }
        fillMediaInfo(this.getMediaItem());
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
    return this._properties;
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
    this._properties = new Array();

    // copy the properties from the media item
    var itemProps = mediaItem.getProperties();
    for (prop in itemProps) {
        this._properties[prop] = itemProps[prop];
    }

    this._properties["Source"] = "Timeline";

    return this;
}

MediaTimelineUIItem.prototype.getTimelineObject = function() {
    if (!this._timelineObject) {
        this._timelineObject = new MediaTimelineFileSource(this._mediaItem.getURI());
    }
    return this._timelineObject;
}

MediaTimelineUIItem.prototype.setThumbnail= function(thumbnail) {
    this._thumbnail = thumbnail;
    var self = this;
    this._thumbnail.getMediaItem = function() { return self._mediaItem; }
    this._thumbnail.getMediaTimelineUIItem = function() { return self; }
    $(this._thumbnail).addClass('media-timeline-item ui-widget-content');//.attr('width', '150px').css({'width':'150px'});

    $(this._thumbnail).bind('click', function() {
        if (this.getMediaItem()._type == MediaItem.Type.VIDEO) {
            $('#text-preview').hide();
            $('#video-preview').attr('src', this.getMediaItem().getFilename()).show();
            $('#image-preview').hide();
        } else if (this.getMediaItem()._type == MediaItem.Type.IMAGE) {
            $('#text-preview').hide();
            $('#video-preview').hide();
            $('#image-preview').attr('src', this.getMediaItem().getFilename()).show();
        }
        // fill the timeline object properties before showing the media info
        this.getMediaTimelineUIItem().fillTimelineObjectProperties();
        fillMediaInfo(this.getMediaTimelineUIItem());
    });
}

MediaTimelineUIItem.prototype.getThumbnail= function() {
    if (!this._thumbnail) {
        this.setThumbnail(new Image());
        this._thumbnail.setAttribute("src", this._mediaItem.getThumbnailSource() );
   }

    return this._thumbnail;
}

MediaTimelineUIItem.prototype.getMediaItem= function() {
    return this._mediaItem;
}

MediaTimelineUIItem.prototype.getProperties = function() {
    return this._properties;
}

MediaTimelineUIItem.prototype.fillTimelineObjectProperties = function() {
    var object = this.getTimelineObject();

    this._properties["Start"] = nsecsToString(object.start);
    this._properties["Inpoint"] = nsecsToString(object.inpoint);
    this._properties["Duration"] = nsecsToString(object.duration);
    this._properties["Priority"] = "" + object.priority;
}

/*
 * Media Timeline UI
 */

var MediaTimelineUI = function(timeline) {
    this._timeline = timeline;

    $( ".media-timeline-container" ).sortable({});
    $( ".media-timeline-container" ).disableSelection();
    $( ".media-timeline-container" ).bind( "sortupdate", function(event, ui) {
        mediaTimelineUI.updateMediaTimelineSorting();
    });
    //$( ".media-timeline-container" ).bind( "sortremove", function(event, ui) {
        //console.log("sortremove ui.position=" + ui.position + " offset="  + ui.offset);
        //mediaTimelineUI.updateMediaTimelineSorting();
    //});
};

MediaTimelineUI.prototype.getMediaTimeline = function() {
    return this._timeline;
}

MediaTimelineUI.prototype.addMediaItem = function(mediaItem) {
    var item = new MediaTimelineUIItem(mediaItem);

    // add timeline object to the timeline
    var timelineObject = item.getTimelineObject();
    this._timeline.addObject(item.getTimelineObject(), 0);

    // make it appear in the UI too
    $(".media-timeline-container").append( item.getThumbnail() );
}

MediaTimelineUI.prototype.updateMediaTimelineSorting = function() {
    $(".media-timeline-container img").each(function(index) {
        // new element
        if (typeof($(this).context.getMediaItem) == "undefined") {
            console.log("new item found: " + index);
            if (currentDraggedMediaItem) {
                var mtui = new MediaTimelineUIItem(currentDraggedMediaItem);
                mtui.setThumbnail($(this).context);
                // add to the timeline to proper position
                mediaTimelineUI.getMediaTimeline().addObject(mtui.getTimelineObject(), index);
            }
        } else {
            console.log("item was here before: " + index);
            var tlObject = $(this).context.getMediaTimelineUIItem().getTimelineObject();
            if (mediaTimelineUI.getMediaTimeline().index(tlObject) != index) {
                console.log("item has changed position " + mediaTimelineUI.getMediaTimeline().index(tlObject) + " to " + index);
                mediaTimelineUI.getMediaTimeline().moveObject(tlObject, index);
            }
        }
    });

    // TODO check for removals
};

/*
 * Data model
 */

function initDataModel() {
    mediaLibrary = new MediaLibrary();
    mediaLibrary.addMediaFiles(mediaFiles);

    mediaTimelineUI = new MediaTimelineUI(new MediaTimeline());
}

function initUI() {
    $( "#timeline-play" ).button({
        icons: { primary:  "ui-icon-play" },
        text: false
    }).click(function () {
        $('#text-preview').hide();
        $('#video-preview').attr('src', "ges://foobar").show();
        $('#image-preview').hide();
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
    });
    $( "#timeline-zoomout" ).button({
        icons: { primary:  "ui-icon-zoomout" },
        text: false
    });
    $( "#timeline-zoomin" ).button({
        icons: { primary:  "ui-icon-zoomin" },
        text: false
    });

    $( "#library-image" ).button({
        icons: { primary:  "ui-icon-image" },
        text: false
    }).click(function() {
        mediaLibrary.toggleByType( MediaItem.Type.IMAGE );
    });
    $( "#library-video" ).button({
        icons: { primary:  "ui-icon-video" },
        text: false
    }).click(function() {
        mediaLibrary.toggleByType( MediaItem.Type.VIDEO );
    });
    $( "#library-test" ).button({
        icons: { primary:  "ui-icon-script" },
        text: false
    });
    $( "#library-toolbar").buttonset();

}

/*
 * Data model
 */

// media library
var mediaLibrary;

// Timeline to use in the video editor application
var mediaTimelineUI;

// media items
var currentDraggedMediaItem;
