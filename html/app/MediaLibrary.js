/*
 * Media Library class
 */

function MediaLibrary() {
    this._mediaItems = [];
    this._transitionItems = [];
};

MediaLibrary.prototype.addMediaFiles = function(files) {
    for (var file in files) {
        var item = new MediaItem(files[file]);
        this._mediaItems.push(item);
        item.showInUI();
    }
}

MediaLibrary.prototype.addTransitions = function(transitionTypes) {
    for (var type in transitionTypes) {
        var item = new TransitionItem(transitionTypes[type]);
        this._transitionItems.push(item);
        item.showInUI();
    }
}

/*
 * Media Library UI code
 */

function initMediaLibraryUI() {
    // setup
    $( "#media-library" ).accordion({
        fillSpace:true
    });
}
