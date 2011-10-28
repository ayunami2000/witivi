/*
 * Transition Item Class
 */

function TransitionItem(type) {
    this._transitionType = type;
    this._type = MediaItem.Type.TRANSITION;

    // fill the properties
    this._properties = new Array();
    // TODO fill the transition name
    //this._properties["Name"] = "Transition";
    this._properties["Source"] = "Library";
    this._properties["Type"] = "Transition";

    return this;
}

TransitionItem.prototype.getType = function() {
    return this._type;
}

TransitionItem.prototype.getProperties = function() {
    return this._properties;
}

TransitionItem.prototype.getTransitionType = function() {
    return this._transitionType;
}

TransitionItem.prototype.fillProperties = function() {
    // nothing to do, already done :)
}

TransitionItem.prototype.getThumbnailSource = function() {
    // TODO: implement
    return "images/placeholder.png";
}

TransitionItem.prototype.getThumbnail = function() {
    if (typeof this._thumbnail == "undefined") {
        var self = this;
        this._thumbnail = new Image();
        this._thumbnail.getMediaItem = function() { return self; }
        this._thumbnail.setAttribute("src", this.getThumbnailSource());
        this._thumbnail.setAttribute("width", "75px");
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
            // TODO transition preview, create timeline on-the-fly to show the transition with two sample images
            previewMedia(self);
        });
    }
    return this._thumbnail;
}

TransitionItem.prototype.showInUI = function() {
    $(".transition-library-container").append( this.getThumbnail() );
};
