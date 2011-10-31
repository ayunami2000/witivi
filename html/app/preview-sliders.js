/*
 * All functions related with the sliders
 */

function initSlidersUI() {
    // setup slider for inpoint / outpoint editing
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 0,
        values: [0, 0],
        step: 1000 / fps,
        slide: rangeSliderSlide,
        stop: rangeSliderStop,
        disabled: true
    }).hide();

    // setup slider for seeking
    $("#slider-seek").slider({
        range: false,
        min: 0,
        max: 0,
        value: 0,
        step: 1000 / fps,
        slide: seekSliderSlide,
        stop: seekSliderStop,
        disabled: true
    }).show();
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

function rangeSliderSlide(event, ui){
    //console.log("rangeSliderSlide");
    // only check for timeline objects case
    if (currentPreviewItem.constructor.name == "MediaTimelineItemUI") {
        // seek
        var video = document.getElementById('video-preview');
        if (video) {
            video.currentTime = ui.value / 1000.0;
            updateCurrentTime();
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
            updateCurrentTime();
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

function updateSeekSliderPos() {
    var video = document.getElementById('video-preview');
    if (video) {
        //console.log("current time updating seek slider " + video.currentTime);
        $('#slider-seek').slider( "option", "value", video.currentTime * 1e3);
    }
}
