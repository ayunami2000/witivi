/*
 * Media Library class
 */

function MediaLibrary() {
    this._mediaItems = [];
};

MediaLibrary.prototype.addMediaFiles = function(files) {
    for (var file in files) {
        var item = new MediaItem(files[file]);
        this._mediaItems.push(item);
        item.showInUI();
    }
}
