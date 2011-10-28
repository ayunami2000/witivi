/*
 * Transition Item Class
 */

function TransitionItem(type) {
    this._transitionType = type;
    this._type = MediaItem.Type.TRANSITION;
    this._properties = new Array();

    this._properties["Name"] = "Transition";

    // create thumbnail
    this._thumbnail = new Image();
    var self = this;
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
        previewMedia(self);
        // select the clicked item
        $('.ui-selected').removeClass('ui-selected')
        $(this).addClass("ui-selected");
    });

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

TransitionItem.prototype.getThumbnailSource = function() {
    // TODO: implement
    return "images/placeholder.png";
}

TransitionItem.prototype.getThumbnail = function() {
    return this._thumbnail;
}

TransitionItem.prototype.fillProperties = function() {
    // nothing to do, already done :)
}

var xxx = 1;