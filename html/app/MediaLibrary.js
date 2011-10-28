/*
 * Media Library class
 */

function MediaLibrary() {
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
        if (item.getType() & MediaItem.Type.VIDEO) {
            $(".video-library-container").append( item.getThumbnail() );
        } else if (item.getType() & MediaItem.Type.IMAGE) {
            $(".image-library-container").append( item.getThumbnail() );
        } 
    }
}
