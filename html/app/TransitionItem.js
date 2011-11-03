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
    return "images/transition_" + this._transitionType + ".png";
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


var transitionTypes = [
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BAR_WIPE_LR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BAR_WIPE_TB,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_TL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_TR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_BR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_BL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FOUR_BOX_WIPE_CI,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FOUR_BOX_WIPE_CO,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNDOOR_V,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNDOOR_H,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_TC,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_RC,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_BC,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOX_WIPE_LC,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DIAGONAL_TL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DIAGONAL_TR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOWTIE_V,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BOWTIE_H,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNDOOR_DBL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNDOOR_DTL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_MISC_DIAGONAL_DBD,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_MISC_DIAGONAL_DD,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_VEE_D,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_VEE_L,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_VEE_U,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_VEE_R,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNVEE_D,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNVEE_L,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNVEE_U,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_BARNVEE_R,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_IRIS_RECT,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_CLOCK_CW12,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_CLOCK_CW3,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_CLOCK_CW6,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_CLOCK_CW9,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_PINWHEEL_TBV,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_PINWHEEL_TBH,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_PINWHEEL_FB,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FAN_CT,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FAN_CR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLEFAN_FOV,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLEFAN_FOH,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWT,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWB,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLESWEEP_PV,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLESWEEP_PD,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLESWEEP_OV,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLESWEEP_OH,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FAN_T,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FAN_R,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FAN_B,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_FAN_L,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLEFAN_FIV,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLEFAN_FIH,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWTL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWBL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWBR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SINGLESWEEP_CWTR,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLESWEEP_PDTL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_DOUBLESWEEP_PDBL,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SALOONDOOR_T,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SALOONDOOR_L,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SALOONDOOR_B,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_SALOONDOOR_R,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_WINDSHIELD_R,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_WINDSHIELD_U,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_WINDSHIELD_V,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_WINDSHIELD_H,
    MediaTimelineTransitionOperation.TRANSITION_TYPE_CROSSFADE
];
