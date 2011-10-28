/*
 * Application layout code
 */

function initLayout() {

    /*
     *  Define options for all the layouts
     */

    var pageLayoutOptions = {
        name:                   'pageLayout' // only for debugging
    ,   resizeWithWindowDelay:  250     // delay calling resizeAll when window is *still* resizing
    ,   resizable:              false
    ,   slidable:               false
    ,   closable:               false
    ,   north__paneSelector:    "#outer-north"
    ,   center__paneSelector:   "#outer-center"
    ,   south__paneSelector:    "#outer-south"
    ,   south__spacing_open:    0
    ,   north__spacing_open:    0
    };

    var tabsContainerLayoutOptions = {
        name:                   'tabsContainerLayout' // only for debugging
    ,   resizable:              false
    ,   slidable:               false
    ,   closable:               false
    ,   north__paneSelector:    "#tabbuttons"
    ,   center__paneSelector:   "#tabpanels"
    ,   spacing_open:           0
    ,   center__onresize:       $.layout.callbacks.resizeTabLayout // resize ALL visible layouts nested inside
    };

    var tabLayoutOptions = {
        name:                   'tabPanelLayout' // only for debugging
    ,   resizeWithWindow:       false   // required because layout is 'nested' inside tabpanels container
    ,   resizerDragOpacity:     0.5
    ,   north__resizable:       false
    ,   south__resizable:       false
    ,   north__closable:        false
    ,   south__closable:        false
    ,   west__minSize:          255
    ,   west__size:             415
    ,   east__minSize:          200
    ,   east__size:             300
    ,   center__minWidth:       400
    ,   spacing_open:           30
    ,   spacing_closed:         30
    ,   contentSelector:        ".ui-widget-content"
    ,   togglerContent_open:    '<div class="ui-icon"></div>'
    ,   togglerContent_closed:  '<div class="ui-icon"></div>'
    ,   triggerEventsOnLoad:    true // so center__onresize is triggered when layout inits
    ,   center__onresize:       $.layout.callbacks.resizePaneAccordions // resize ALL Accordions nested inside
    ,   west__onresize:         $.layout.callbacks.resizePaneAccordions // ditto for west-pane
    //  after the layout loads, init sidebar-layouts...
    ,   onload: function ( layout ) {
            layout.panes.west.layout( sidebarLayoutOptions );
            layout.panes.center.layout( sidebarLayoutOptions );
        }
    };

    var sidebarLayoutOptions = {
        name:                   'sidebarLayout' // only for debugging
    ,   showErrorMessages:      false   // some panes do not have an inner layout
    ,   resizeWhileDragging:    true
    ,   north__size:            "30%"
    ,   south__size:            "40%"
    ,   minSize:                100
    ,   center__minHeight:      100
    ,   spacing_open:           30
    ,   spacing_closed:         30
    ,   contentSelector:        ".ui-widget-content"
    ,   togglerContent_open:    '<div class="ui-icon"></div>'
    ,   togglerContent_closed:  '<div class="ui-icon"></div>'
    };

    var pageLayout = $("body").layout( pageLayoutOptions );

    // first init the tabs inside the center-pane
    // then init the layout that wraps them
    pageLayout.panes.center
        .tabs({
            show: $.layout.callbacks.resizeTabLayout
        })
        // make the tabs sortable
        .find(".ui-tabs-nav") .sortable({ axis: 'x', zIndex: 2 }) .end()
        // create the layout to wrap the tab buttons (north) and panels (center)
        .layout( tabsContainerLayoutOptions )
    ;

    // init ALL the tab-layouts - all use the same options
    $("#tab1").layout( tabLayoutOptions );

    if (enableThemeSwitcher) {
        $(".buttons").show();
        $(".buttons BUTTON").show();
        addThemeSwitcher('#outer-north',{ top: '13px', right: '20px' });
        // if a theme is applied by ThemeSwitch *onLoad*, it may change the height of some content,
        // so we need to call resizeLayout to 'correct' any header/footer heights affected
        // call multiple times so fast browsers update quickly, and slower ones eventually!
        // NOTE: this is only necessary because we are changing CSS *AFTER LOADING* (eg: themeSwitcher)
        setTimeout( resizePageLayout, 1000 ); /* allow time for browser to re-render for theme */
        //setTimeout( resizePageLayout, 5000 ); /* for really slow browsers */
    }
}

/*
 *  Utility methos used for UI Theme Selector
 */
function toggleCustomTheme () {
    $('body').toggleClass('custom');
    resizePageLayout();
};

function resizePageLayout () {
    var pageLayout = $("body").data("layout");
    if (pageLayout) pageLayout.resizeAll();
};
