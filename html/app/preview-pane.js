/*
 * All UI functions related with the preview pane (except the sliders)
 */

function initPreviewUI() {
    initSlidersUI();

    // setup toolbar buttons for preview window
    $( "#preview-playpause" ).button({
        icons: { primary:  "ui-icon-play" },
        text: false
    }).click(function () {
        previewPlayPause();
    });

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

function previewMedia(stuff, uielement, autoplay) {
    currentPreviewItem = stuff;
    clearPauseWhenReached();

    // select the clicked item
    $('.ui-selected').removeClass('ui-selected');
    if (typeof uielement != "undefined") {
        $(uielement).addClass("ui-selected");
    }

    // extract data depending on the stuff
    var type = MediaItem.Type.UNKNOWN;
    var src;

    if (currentPreviewItem.constructor.name == "TransitionItem") {
        type = MediaItem.Type.TRANSITION;
    } else if (currentPreviewItem.constructor.name == "TestSourceItem") {
        type = MediaItem.Type.TEST_SOURCE;
    } else if (currentPreviewItem.constructor.name == "MediaItem") {
        type = currentPreviewItem._type;
        src = currentPreviewItem.getFilename();
    } else if (currentPreviewItem.constructor.name == "MediaTimelineItemUI") {
        type = currentPreviewItem.getMediaItem()._type;
        if (!(type & (MediaItem.Type.TRANSITION | MediaItem.Type.TEST_SOURCE))) {
            src = currentPreviewItem.getMediaItem().getFilename();
        }
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
    } else if (type == MediaItem.Type.TRANSITION) {
        // TODO: check what exactly we can do to preview the transition
        $('#video-preview').hide();
        $('#image-preview').hide();
        $('#text-preview-description').text("Transition item. No preview available.");
        $('#text-preview').show();
    } else if (type == MediaItem.Type.TEST_SOURCE) {
        // TODO: use a secondary timeline to preview the test source ?
        $('#video-preview').hide();
        $('#image-preview').hide();
        $('#text-preview-description').text("Test Source item. No preview available.");
        $('#text-preview').show();
    }

    // fill the media info pane with current preview item information
    currentPreviewItem.fillProperties();
    fillMediaInfo(currentPreviewItem);

    setupSliders();

    if (type == MediaItem.Type.VIDEO && typeof autoplay != "undefined" && autoplay) {
        var video = document.getElementById('video-preview');
        if (video) {
            if (currentPreviewItem.constructor.name == "MediaTimelineItemUI") {
                var object = currentPreviewItem.getTimelineObject();
                var inpoint = object.inpoint / 1.0e9;
                var outpoint = (object.inpoint + object.duration)/ 1.0e9;
                setTimeout("playInOut("+inpoint+","+outpoint+");", 200);
            } else {
                video.play();
            }
        }
    }

    updatePlayPause();
    updateCurrentTime();
}

function playInOut(inpoint, outpoint) {
    var video = document.getElementById('video-preview');
    video.currentTime = inpoint;
    video.play();
    updatePlayPause();
    updateCurrentTime();
    // clear previous if any
    clearPauseWhenReached();
    pauseTargetTime = outpoint;
    pauseTimeoutId = setTimeout("checkOutpointReached()", 200);
}

var pauseTargetTime = null;
var pauseTimeoutId = null;

function checkOutpointReached() {
    if (pauseTargetTime != null) {
        var video = document.getElementById('video-preview');
        if (video) {
            if (video.currentTime >= pauseTargetTime) {
                video.pause();
                pauseTimeoutId = null;
            } else {
                pauseTimeoutId = setTimeout("checkOutpointReached()", 200);
            }
        }
    }
}

function clearPauseWhenReached() {
    if (pauseTimeoutId) {
        clearTimeout(pauseTimeoutId);
        pauseTimeoutId = null;
    }
}

function updateCurrentTime() {
    var info = document.getElementById('preview-current-time');

    var videoPreview = $('#video-preview');
    if (videoPreview.is(":visible")) {
        info.innerText = nsecsToString(videoPreview[0].currentTime * 1e9, false);
    } else {
        info.innerText = "";
    }
}

function videoTimeUpdate() {
    updateCurrentTime();
    updateSeekSliderPos();

    var video = document.getElementById('video-preview');
    if (!video.paused) {
        setTimeout("videoTimeUpdate();", 250);
    }
}

function updatePlayPause() {
    var button = $( "#preview-playpause" );
    button.show();

    var videoPreview = $('#video-preview');

    if (typeof currentPreviewItem == "undefined" || !videoPreview.is(":visible")) {
        button.button( "option", "disabled", true );
        return;
    }

    button.button( "option", "disabled", false );

    var options;
    if ( !videoPreview[0].paused ) {
        //console.log("this is playing");
        options = {
            label: "pause",
            icons: { primary: "ui-icon-pause" }
        };
    } else {
        //console.log("this is paused");
        options = {
            label: "play",
            icons: { primary: "ui-icon-play" }
        };
    }
    button.button( "option", options );

    videoTimeUpdate();
}

function previewPlayPause() {
    clearPauseWhenReached();
    var videoPreview = $('#video-preview');
    if (videoPreview.is(":visible")) {
        if (videoPreview[0].paused) {
            //console.log("go to play");
            videoPreview[0].play();
            setTimeout("videoTimeUpdate();", 250);
        } else {
            //console.log("go to pause");
            videoPreview[0].pause();
        }
        updatePlayPause();
    }
}

function refreshMediaInfo(obj) {
    //console.log("refreshMediaInfo");
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
            currentPreviewItem._properties["Length"] = nsecsToString(video.duration * 1e9, true);
            setupSliders();
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
