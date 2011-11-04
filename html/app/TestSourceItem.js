/*
 * TestSource Item Class
 */

function TestSourceItem(type) {
    this._testSourceType = type;
    this._type = MediaItem.Type.TEST_SOURCE;

    // fill the properties
    this._properties = new Array();
    // TODO fill the test source name
    //this._properties["Name"] = "TestSource";
    this._properties["Source"] = "Library";
    this._properties["Type"] = "TestSource";

    return this;
}

TestSourceItem.prototype.getType = function() {
    return this._type;
}

TestSourceItem.prototype.getProperties = function() {
    return this._properties;
}

TestSourceItem.prototype.getTestSourceType = function() {
    return this._testSourceType;
}

TestSourceItem.prototype.fillProperties = function() {
    // nothing to do, already done :)
}

TestSourceItem.prototype.getThumbnailSource = function() {
    return "images/test_source_" + this._testSourceType + ".png";
}

TestSourceItem.prototype.getThumbnail = function() {
    if (typeof this._thumbnail == "undefined") {
        var self = this;
        this._thumbnail = new Image();
        this._thumbnail.getMediaItem = function() { return self; }
        this._thumbnail.setAttribute("src", this.getThumbnailSource());
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
            cursor: 'move',
            distance: 30,
            opacity: 0.7
        });

        $(this._thumbnail).bind('click', function() {
            previewMedia(self);
        });
    }
    return this._thumbnail;
}

TestSourceItem.prototype.showInUI = function() {
    $(".test-source-library-container").append( this.getThumbnail() );
};

var testSourceTypes = [
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_SMPTE,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_SNOW,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_BLACK,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_WHITE,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_RED,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_GREEN,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_BLUE,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_CHECKERS1,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_CHECKERS2,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_CHECKERS4,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_CHECKERS8,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_CIRCULAR,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_BLINK,
    MediaTimelineTestSource.VIDEO_TEST_PATTERN_SMPTE75
];
