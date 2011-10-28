/*
 * Misc UI functions
 */

function ensureTimelineStop() {
    var video = document.getElementById('video-preview');
    if ((typeof currentPreviewItem != "undefined") &&
        (currentPreviewItem.constructor.name == "MediaTimelineUI" || currentPreviewItem.constructor.name == "MediaTimelineItemUI")) {
        video.pause();
    }
}

function rangeSliderSlide(event, ui){
    //console.log("rangeSliderSlide");
    // only check for timeline objects case
    if (currentPreviewItem.constructor.name == "MediaTimelineItemUI") {
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
                inpoint.innerText = nsecsToString(object.inpoint, true);
            }

            var outpoint = document.getElementById('valueOutpoint');
            var clipDuration = document.getElementById('valueDuration');
            if (outpoint && clipDuration && values) {
                object.duration = values[1] * 1e6 - object.inpoint;
                outpoint.innerText = nsecsToString(object.inpoint + object.duration, true);
                clipDuration.innerText = nsecsToString(object.duration, true);
            }

            updateTimelineLength();
        }
    }
}

function rangeSliderStop(event, ui) {
    //console.log("rangeSliderStop");
    rangeSliderSlide(event, ui);
    if (currentPreviewItem.constructor.name == "MediaTimelineItemUI") {
        var video = document.getElementById('video-preview');
        if (video) {
            video.currentTime = ui.value / 1000.0;
        }
    }
}

function seekSliderSlide(event, ui) {
    //console.log("seekSliderSlide");
    if ((currentPreviewItem.constructor.name == "MediaItem" && currentPreviewItem._type == MediaItem.Type.VIDEO) ||
        (currentPreviewItem.constructor.name == "MediaTimelineUI")) {
        var video = document.getElementById('video-preview');
        if (video) {
            video.currentTime = ui.value / 1000.0;
            //console.log("sliding to " + ui.value);
        }
        updateCurrentTime();
    }
}

function seekSliderStop(event, ui) {
    //console.log("seekSliderStop");
    seekSliderSlide(event, ui);
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

function updateSeekSliderPos() {
    var video = document.getElementById('video-preview');
    if (video) {
        //console.log("current time updating seek slider " + video.currentTime);
        $('#slider-seek').slider( "option", "value", video.currentTime * 1e3);
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

function previewMedia(stuff, uielement) {
    currentPreviewItem = stuff;

    // select the clicked item
    $('.ui-selected').removeClass('ui-selected');
    if (typeof uielement != "undefined") {
        $(uielement).addClass("ui-selected");
    }

    // extract data depending on the stuff
    var type = MediaItem.Type.UNKNOWN;
    var src;

    if (currentPreviewItem.constructor.name == "TransitionItem") {
        console.log("Got transition item");
        type = MediaItem.Type.TRANSITION;
    } else if (currentPreviewItem.constructor.name == "MediaItem") {
        type = currentPreviewItem._type;
        src = currentPreviewItem.getFilename();
    } else if (currentPreviewItem.constructor.name == "MediaTimelineItemUI") {
        type = currentPreviewItem.getMediaItem()._type;
        if (!(type & MediaItem.Type.TRANSITION)) {
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
    }

    // fill the media info pane with current preview item information
    currentPreviewItem.fillProperties();
    fillMediaInfo(currentPreviewItem);

    setupSliders();

    updatePlayPause();
    updateCurrentTime();
}

function setupSliders() {
    // setup the inpoint / outpoint slider
    //console.log("setupSliders");
    if (currentPreviewItem.constructor.name == "MediaTimelineItemUI") {
        //console.log("enabling slider for videos range=true");
        $('#slider-range').show();
        $('#slider-seek').hide();
        $('#slider-range').slider( "option", "disabled", false );
        $('#slider-range').slider( "option", "range", true);
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
    } else if ((currentPreviewItem.constructor.name == "MediaItem" && currentPreviewItem._type == MediaItem.Type.VIDEO) ||
               (currentPreviewItem.constructor.name == "MediaTimelineUI")) {
        //console.log("enabling slider for videos range=false");
        $('#slider-range').hide();
        $('#slider-seek').show();
        var video = document.getElementById('video-preview');
        if (video.duration > 0) {
            currentPreviewItem.duration = video.duration;
        }
        if (currentPreviewItem.duration && currentPreviewItem.duration > 0) {
            var max = currentPreviewItem.duration * 1e3;
            $('#slider-seek').slider( "option", "disabled", false);
            $('#slider-seek').slider( "option", "min", 0);
            $('#slider-seek').slider( "option", "max", max);
            $('#slider-seek').slider( "option", "value", 0);
        } else {
            $('#slider-seek').slider( "option", "disabled", true);
        }
    } else {
        //console.log("disabling sliders");
        $('#slider-range').hide();
        $('#slider-seek').show();
        $('#slider-seek').slider( "option", "disabled", true);
    }
}

function updateSliders() {
    //console.log("updateSliders");
    if (currentPreviewItem.constructor.name == "MediaTimelineUI") {
        // we ignore for the timeline segments
        return;
    }

    var video = document.getElementById('video-preview');
    if (video && video.currentTime) {
        $('#slider-seek').slider( "option", "value", video.currentTime * 1e3);
    }
}

function previewPlayPause() {
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

function updateTimelineLength() {
    //console.log("updateTimelineLength");
    var info = document.getElementById('timeline-length');
    if (info) {
        var tl = mediaTimelineUI.getMediaTimeline();
        var duration = 0;
        for(var index = 0;index < tl.numObjects();index++) {
            if (tl.at(index).duration >= 0 && tl.at(index).duration < MAXTIME) {
                duration += parseFloat(tl.at(index).duration);
            }
        }
        info.innerText = nsecsToString(duration, true);
    }
}

function sortableStartEvent(event, ui) {
    if (ui.placeholder) {
        ui.placeholder.attr("src", "images/placeholder.png")
    }
}

