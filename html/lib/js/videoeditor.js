/*
 * Classes
 */

// Helper to get item information from a media item
function MediaItem (object) {
    
    this.Type = { 
        IMAGE : 0,
        VIDEO : 1,
        AUDIO : 2,
        TIMELINE : 3
    };
    
    this.updateInfo = function(obj) {
        if (typeof(obj) != "undefined") {
            this._object = obj;
            this._type = Type.VIDEO;
        }

        //if (typeof(this.object) == "MediaTimeline") {
        //} else if (typeof(this.object) == "img") {            
        //}
    };

    this.type = function() {
        return this._type;
    };
    
    this.id = function() {
        return "train-entry-s1.mp4";
    };
    
    // return a list of property names, match one to one with infoValues
    this.infoFields = function() {
        // depending on the media item type, return proper information
        return [
            "Source",
            "Type",
            "Duration",
            "Start",
            "Inpoint",
            "Outpoint",
            "Priority",
        ];
    };
    
    // return a list of proerty values, match one to one with infoFields
    this.infoValues = function() {
        // depending on the media item type, return proper values
        return [
            "Library",
            "Video",
            "00:01:17",
            "00:00:00",
            "00:00:00",
            "00:10:00",
            "1"
        ];
    }

    updateInfo(object);    

}

// library of all media items
var MediaLibrary = function() {
        
    this.addMediaItem = function() {
    };

    this.getMediaItemsByType = function(type) {        
    };
    
    this.getAllMediaItems() = function() {        
    };

};

var LibraryItem = function(name) {
    // check type of name
    this.name = name;
    //this.type = type;
}();

/*
 * Helper functions
 */


function toMediaSrc(obj) {
   // return URL for the real media (not the thumbnail) 
}

function toThumbnailSrc(obj) {
   // return URL for the thumbnail (not the real media)
}

function previewMedia(obj) {
    // check if image / video / whatever
    // preview on video element
    // modify info properties of the window
    alert("preview media");
}

/*
 * Data model
 */

// Timeline to use in the video editor application
//var editTimeline = new MediaTimeline();

// media items 
var editTimelineMediaItem = new MediaItem();
var currentMediaItem = new MediaItem();

// media library 
var mediaLibrary = new MediaLibrary(); 
