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

    // create thumbnail
    this._thumbnail = new Image();
    var self = this;
    this._thumbnail.getMediaItem = function() { return self; }
    this._thumbnail.setAttribute("src", this._thumbnailSource);
    this._thumbnail.setAttribute("width", "150px");
    this._thumbnail.setAttribute("class",
            "media-library-item draggable ui-widget-content");

    $(this._thumbnail).draggable({
        /* Use a helper-clone that is append to 'body'
         * so is not 'contained' by a pane.
         */
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
        previewMedia(self);
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

MediaItem.prototype.fillProperties = function() {
    // nothing to do, already done :)
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
        if (this._mediaItems[item].getType() & type) {
            $(this._mediaItems[item].getThumbnail()).toggle();
        }
    }
};

MediaLibrary.prototype.showByType = function(type) {
    for (var item in this._mediaItems) {
        if (this._mediaItems[item].getType() & type) {
            $(this._mediaItems[item].getThumbnail()).show();
        }
    }
};

MediaLibrary.prototype.hideByType = function(type) {
    for (var item in this._mediaItems) {
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
function MediaTimelineUIItem(mediaItem) {
    this._mediaItem = mediaItem;
    this._properties = new Array();
    this._type = MediaItem.Type.VIDEO;

    // copy the properties from the media item
    var itemProps = mediaItem.getProperties();
    for (prop in itemProps) {
        this._properties[prop] = itemProps[prop];
    }

    this._properties["Source"] = "Clip";

    return this;
}

MediaTimelineUIItem.prototype.getTimelineObject = function() {
    if (!this._timelineObject) {
        this._timelineObject =
                new MediaTimelineFileSource(this._mediaItem.getURI());
    }

    return this._timelineObject;
}

MediaTimelineUIItem.prototype.setThumbnail= function(thumbnail) {
    this._thumbnail = thumbnail;
    var self = this;
    this._thumbnail.getMediaItem = function() { return self._mediaItem; }
    this._thumbnail.getMediaTimelineUIItem = function() { return self; }
    $(this._thumbnail).addClass('media-timeline-item ui-widget-content');

    $(this._thumbnail).bind('click', function() {
        previewMedia(this.getMediaTimelineUIItem());
    });
}

MediaTimelineUIItem.prototype.getThumbnail= function() {
    if (!this._thumbnail) {
        this.setThumbnail(new Image());
        this._thumbnail.setAttribute("src",
                this._mediaItem.getThumbnailSource());
   }

    return this._thumbnail;
}

MediaTimelineUIItem.prototype.getMediaItem= function() {
    return this._mediaItem;
}

MediaTimelineUIItem.prototype.getProperties = function() {
    return this._properties;
}

MediaTimelineUIItem.prototype.fillProperties = function() {
    var object = this.getTimelineObject();

    this._properties["Start"] = nsecsToString(object.start);
    this._properties["Inpoint"] = nsecsToString(object.inpoint);
    this._properties["Outpoint"] = nsecsToString(object.inpoint + object.duration);
    this._properties["Duration"] = nsecsToString(object.duration);
    //this._properties["Priority"] = "" + object.priority;
}

/*
 * Media Timeline UI
 */

function MediaTimelineUI(timeline) {
    this._timeline = timeline;
    this._properties = new Array();
    this._type = MediaItem.Type.VIDEO;

    this._properties["Source"] = "Timeline";
    this._properties["Type"] = "Video";

    $( ".media-timeline-container" ).sortable({});
    $( ".media-timeline-container" ).selectable();
    $( ".media-timeline-container" ).bind( "sortupdate", function(event, ui) {
        mediaTimelineUI.updateMediaTimelineSorting();
    });
};

MediaTimelineUI.prototype.getMediaTimeline = function() {
    return this._timeline;
}

MediaTimelineUI.prototype.updateMediaTimelineSorting = function() {
    $(".media-timeline-container img").each(function(index) {
        // new element
        if (typeof($(this).context.getMediaItem) == "undefined") {
            //console.log("new item found: " + index);
            if (currentDraggedMediaItem) {
                var mtui = new MediaTimelineUIItem(currentDraggedMediaItem);
                mtui.setThumbnail($(this).context);
                if (currentDraggedMediaItem._type == MediaItem.Type.IMAGE) {
                    var tlObject = mtui.getTimelineObject();
                    tlObject.inpoint = 0;
                    tlObject.duration = 3e9;
                }
                // add to the timeline to proper position
                mediaTimelineUI.getMediaTimeline().addObject(
                        mtui.getTimelineObject(), index);
            }
        } else {
            //console.log("item was here before: " + index);
            var tlObject = $(this).context.getMediaTimelineUIItem().getTimelineObject();
            if (mediaTimelineUI.getMediaTimeline().index(tlObject) != index) {
                //console.log("item has changed position " + mediaTimelineUI.getMediaTimeline().index(tlObject) + " to " + index);
                mediaTimelineUI.getMediaTimeline().moveObject(tlObject, index);
            }
        }
    });

    $('#text-preview-timeline').hide();

    // use a timeout, since the timeline might take some time to update some properties
    setTimeout("refreshMediaInfo(mediaTimelineUI);", 100);
};

MediaTimelineUI.prototype.fillProperties = function() {
    var tl = this._timeline;

    this._properties["Clips"] = tl.numObjects();
    var duration = 0;
    for(var index = 0;index < tl.numObjects();index++) {
        if (tl.at(index).duration >= 0 && tl.at(index).duration < 18446744073709552000) {
            duration += parseFloat(tl.at(index).duration);
        }
    }
    this._properties["Length"] = nsecsToString(duration);
}

MediaTimelineUI.prototype.getProperties = function() {
    return this._properties;
}

/*
 * Misc functions
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
        previewMedia(mediaTimelineUI);
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
            // Remove the Item from the MediaTimeline Object.
            var tlObject =
                $(this).context.getMediaTimelineUIItem().getTimelineObject();
            if (tlObject) {
                mediaTimelineUI.getMediaTimeline().removeObject(tlObject);
            }

            refreshMediaInfo(currentPreviewItem);

            // Remove the visual representation of the item.
            $(this).remove();

            if (mediaTimelineUI.getMediaTimeline().numObjects() <= 0) {
                $('#text-preview-timeline').show();
            }
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

    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 0,
        values: [0, 0],
        step: 1000 / fps,
        slide: updateInOutpoints,
        stop: rangeSliderStop,
        disabled: true
    });

    var video = document.getElementById('video-preview');
    video.addEventListener("loadedmetadata", videoMetadataUpdated, false);
}

function updateInOutpoints(event, ui){

    // only check for timeline objects case
    if (currentPreviewItem.constructor.name == "MediaTimelineUIItem") {
        // seek
        var video = document.getElementById('video-preview');
        if (video) {
            video.currentTime = ui.value / 1000.0;
        }

        var object = currentPreviewItem.getTimelineObject();
        if (object) {
            var values = $('#slider-range').slider( "option", "values");
            var inpoint = document.getElementById('valueInpoint');
            if (inpoint && values) {
                object.inpoint = values[0] * 1e6;
                inpoint.innerText = nsecsToString(object.inpoint);
            }

            var outpoint = document.getElementById('valueOutpoint');
            var clipDuration = document.getElementById('valueDuration');
            if (outpoint && clipDuration && values) {
                object.duration = values[1] * 1e6 - object.inpoint;
                outpoint.innerText = nsecsToString(object.inpoint + object.duration);
                clipDuration.innerText = nsecsToString(object.duration);
            }
        }
    }
}

function rangeSliderStop(event, ui) {
    if (currentPreviewItem.constructor.name == "MediaTimelineUIItem") {
        var video = document.getElementById('video-preview');
        if (video) {
            video.currentTime = ui.value / 1000.0;
        }
    }
}

function fillMediaInfo(item) {
   var properties = item.getProperties();

   var content = "<table>";
   for (key in properties) {
        content += "<tr><td><b>" + key + ":</b></td>";
        content += "<td id='value" + key + "'>" + properties[key] + "</td></tr>";
   }
   content += "</table>";
   $('#ui-mediaitem-info').attr('innerHTML', content);
}

function secsToString(secs) {
    return nsecsToString(1e9 * secs);
}

function nsecsToString(nsecs) {
    if (nsecs < 0 || nsecs >= 18446744073709552000) {
        nsecs = 0;
    }

    var seconds = Math.floor(nsecs / 1e9);
    var mseconds = Math.round((nsecs / 1e6) % 1e3);

    var minutes = Math.floor(seconds/60);
    seconds = seconds % 60;

    var hours = Math.floor(minutes/60);
    minutes = minutes % 60

    var text = (hours > 0 ? hours + ":" : "") + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    // missing sprintf :P
    if (mseconds >= 100) {
        text = text + "." + mseconds;
    } else if (mseconds >= 10) {
        text = text + ".0" + mseconds;
    } else if (mseconds > 10) {
        text = text + ".00" + mseconds;
    }
    return text;
}

function dumpObject(obj) {
    var output = '';
    for (property in obj) {
        output += property + ': ' + obj[property] + "\n";
    }
    console.log(output);
}

function previewMedia(stuff) {
    currentPreviewItem = stuff;

    // extract data depending on the stuff
    var type = MediaItem.Type.UNKNOWN;
    var src;

    if (currentPreviewItem.constructor.name == "MediaItem") {
        type = currentPreviewItem._type;
        src = currentPreviewItem.getFilename();
    } else if (currentPreviewItem.constructor.name == "MediaTimelineUIItem") {
        type = currentPreviewItem.getMediaItem()._type;
        src = currentPreviewItem.getMediaItem().getFilename();
    } else if (currentPreviewItem.constructor.name == "MediaTimelineUI") {
        type = MediaItem.Type.VIDEO;
        src = "ges://foobar";
    }

    // enable the proper viewer depending on the media type
    if (type == MediaItem.Type.VIDEO) {
        $('#text-preview').hide();
        $('#video-preview').attr('src', src).show();
        $('#image-preview').hide();
    } else if (type == MediaItem.Type.IMAGE) {
        $('#text-preview').hide();
        $('#video-preview').hide();
        $('#image-preview').attr('src', src).show();
    }

    // fill the media info pane with current preview item information
    currentPreviewItem.fillProperties();
    fillMediaInfo(currentPreviewItem);

    // setup the inpoint / outpoint slider
    if (currentPreviewItem.constructor.name == "MediaTimelineUIItem") {
        $('#slider-range').slider( "option", "disabled", false );
        var object = currentPreviewItem.getTimelineObject();
        var min = 0;
        var max = 0;
        if (currentPreviewItem._mediaItem._type == MediaItem.Type.IMAGE) {
            max = 20e3;
        } else {
            if (currentPreviewItem.duration) {
                max = currentPreviewItem.duration * 1e3;
            } else if (object) {
                // fallback in case we don't have metadata info yet (get metadata async)
                max = object.duration / 1e6;
            }
        }
        var inpoint = object.inpoint / 1e6;
        var outpoint = (object.inpoint + object.duration) / 1e6;
        $('#slider-range').slider( "option", "min", min);
        $('#slider-range').slider( "option", "max", max);
        $('#slider-range').slider( "option", "values", [inpoint, outpoint] );
    } else {
        $('#slider-range').slider( "option", "disabled", true );
    }
}

function refreshMediaInfo(obj) {
    if (currentPreviewItem && currentPreviewItem == obj) {
        obj.fillProperties();
        fillMediaInfo(currentPreviewItem);
    }
}

function videoMetadataUpdated() {
    var video = document.getElementById('video-preview');
    if (video && currentPreviewItem._type == MediaItem.Type.VIDEO) {
        if (video.videoWidth > 0) {
            currentPreviewItem._properties["Width"] = video.videoWidth;
        }
        if (video.videoHeight > 0) {
            currentPreviewItem._properties["Height"] = video.videoHeight;
        }
        if (video.duration > 0) {
            currentPreviewItem.duration = video.duration;
            currentPreviewItem._properties["Length"] = nsecsToString(video.duration * 1e9);
        }
    }

    /*
    // some debug info
    if (video) {
        currentPreviewItem._properties['error'] = video.error;
        currentPreviewItem._properties['networkState'] = video.networkState;
        currentPreviewItem._properties['preload'] = video.preload;
        currentPreviewItem._properties['buffered'] = video.buffered;
        currentPreviewItem._properties['readyState'] = video.readyState;
        currentPreviewItem._properties['seeking'] = video.seeking;
        currentPreviewItem._properties['currentTime'] = video.currentTime;
        currentPreviewItem._properties['initialTime'] = video.initialTime;
        currentPreviewItem._properties['duration'] = video.duration;
        currentPreviewItem._properties['startOffsetTime'] = video.startOffsetTime;
        currentPreviewItem._properties['paused'] = video.paused;
        currentPreviewItem._properties['defaultPlaybackRate'] = video.defaultPlaybackRate;
        currentPreviewItem._properties['playbackRate'] = video.playbackRate;
        currentPreviewItem._properties['played'] = video.played;
        currentPreviewItem._properties['seekable'] = video.seekable;
        currentPreviewItem._properties['ended'] = video.ended;
        currentPreviewItem._properties['autoplay'] = video.autoplay;
        currentPreviewItem._properties['loop'] = video.loop;
        currentPreviewItem._properties['mediaGroup'] = video.mediaGroup;
        setTimeout(refreshCurrentMediaInfo, 200);
    }
    */

    refreshMediaInfo(currentPreviewItem);
}

function imageMetadataUpdated() {
    var image = document.getElementById('image-preview');
    if (image && currentPreviewItem._type == MediaItem.Type.IMAGE) {
        if (image.naturalWidth > 0) {
            currentPreviewItem._properties["Width"] = image.naturalWidth;
        }
        if (image.naturalHeight > 0) {
            currentPreviewItem._properties["Height"] = image.naturalHeight;
        }
    }

    refreshMediaInfo(currentPreviewItem);
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

// current preview item
var currentPreviewItem;

// set some reference value for FPS (needed for time in/out editing)
var fps = 25;
