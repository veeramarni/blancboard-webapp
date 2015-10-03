enyo.kind({
    name: "ButtonState",
    kind: "enyo.Object",
    statics: {
        ACTIVE: "ACTIVE",
        ENABLED: "ENABLED",
        DISABLED: "DISABLED"
    }
});

enyo.kind({
    name: "blanc.MenuModel",
    kind: "enyo.Object",
    buttons: {
        spacer: {
            name: "spacer",
            kind: "blanc.MenuButton",
            classes: "",
            state: ButtonState.DISABLED
        },
        meetings: {
            name: "meetings",
            kind: "blanc.MenuButton",
            classes: "meetings-button",
            tooltip: "Host or join an online meeting",
            state: ButtonState.DISABLED
        },
        files: {
            name: "files",
            kind: "blanc.MenuButton",
            classes: "files-button",
            tooltip: "View list of files and whiteboard",
            state: ButtonState.DISABLED
        },
        widgets: {
            name: "widgets",
            kind: "blanc.MenuButton",
            classes: "widgets-button",
            tooltip: $L("View the list of applications"),
            state: ButtonState.DISABLED
        },
        settings: {
            name: "settings",
            kind: "blanc.MenuButton",
            classes: "settings-button",
            tooltip: $L("Edit your user profile and account settings"),
            state: ButtonState.DISABLED
        },
        fileMenu: {
            name: "fileMenu",
            kind: "blanc.MenuButton",
            classes: "filemenu-button",
            tooltip: $L("Display a file menu"),
            state: ButtonState.DISABLED
        },
        pages: {
            name: "pages",
            kind: "blanc.MenuButton",
            classes: "pages-button",
            tooltip: $L("Display a list of pages"),
            state: ButtonState.DISABLED
        },
        leftArrow: {
            name: "leftArrow",
            kind: "blanc.MenuButton",
            classes: "left-button",
            tooltip: $L("Previous page"),
            state: ButtonState.DISABLED
        },
        rightArrow: {
            name: "rightArrow",
            kind: "blanc.MenuButton",
            classes: "right-button",
            tooltip: $L("Next page"),
            state: ButtonState.DISABLED
        },
        invite: {
            name: "invite",
            kind: "blanc.MenuButton",
            classes: "invite-button",
            tooltip: $L("Invite others to join your online meeting room"),
            state: ButtonState.DISABLED
        },
        addDocument: {
            name: "addDocument",
            kind: "blanc.MenuButton",
            classes: "add-button",
            tooltip: $L("Upload a file or create a sketchbook"),
            state: ButtonState.DISABLED
        },
        palette: {
            name: "palette",
            kind: "blanc.MenuButton",
            classes: "palette-button",
            tooltip: $L("Set the pen color and line width"),
            state: ButtonState.DISABLED
        },
        pen: {
            name: "pen",
            kind: "blanc.MenuButton",
            classes: "pen-button",
            tooltip: $L("Enable or disable drawing"),
            state: ButtonState.DISABLED
        },
        eraser: {
            name: "eraser",
            kind: "blanc.MenuButton",
            classes: "eraser-button",
            tooltip: $L("Enable or disable the eraser"),
            state: ButtonState.DISABLED
        },
        undo: {
            name: "undo",
            kind: "blanc.MenuButton",
            classes: "undo-button",
            tooltip: $L("Undo the last drawing"),
            state: ButtonState.DISABLED
        },
        clear: {
            name: "clear",
            kind: "blanc.MenuButton",
            classes: "clear-button",
            tooltip: $L("Clear all drawings"),
            state: ButtonState.DISABLED
        },
        leave: {
            name: "leave",
            kind: "blanc.MenuButton",
            classes: "leave-button",
            tooltip: $L("Leave the meeting"),
            state: ButtonState.ENABLED
        },
        people: {
            name: "people",
            kind: "blanc.MenuButton",
            classes: "people-button",
            tooltip: $L("View the list of meeting attendees"),
            state: ButtonState.ENABLED
        },
        videoconf: {
            name: "videoconf",
            kind: "blanc.MenuButton",
            classes: "videoconf-button",
            state: ButtonState.DISABLED
        },
        fullscreen: {
            name: "fullscreen",
            kind: "blanc.MenuButton",
            classes: "fullscreen-button",
            tooltip: $L("Switch to fullscreen mode"),
            state: ButtonState.DISABLED
        },
        audio: {
            name: "audio",
            kind: "blanc.MenuButton",
            classes: "audio-button",
            tooltip: $L("Voice conferencing"),
            state: ButtonState.DISABLED
        }
    },
    disableAll: function() {
        for (var e in this.buttons) {
            var button = this.buttons[e];
            button && (button.state = ButtonState.DISABLED);
        }
    },
    enableDrawing: function() {
        if (this.buttons.palette.state === ButtonState.DISABLED) {
            this.buttons.palette.state = ButtonState.ENABLED;
            this.buttons.pen.state = ButtonState.ENABLED;
            this.buttons.eraser.state = ButtonState.ENABLED;

        }
    },
    disableDrawing: function() {
        this.buttons.palette.state = ButtonState.DISABLED;
        this.buttons.pen.state = ButtonState.DISABLED;
        this.buttons.eraser.state = ButtonState.DISABLED;
        this.buttons.undo.state = ButtonState.DISABLED;
        this.buttons.clear.state = ButtonState.DISABLED;
        blanc.Session.getToolbox().set("mode", blanc.DrawMode.NONE);

    },
    enableNavigation: function() {
        this.buttons.pages.state = ButtonState.ENABLED;
        this.buttons.leftArrow.state = ButtonState.ENABLED;
        this.buttons.rightArrow.state = ButtonState.ENABLED;
    },
    disableNavigation: function() {
        this.buttons.pages.state = ButtonState.DISABLED;
        this.buttons.leftArrow.state = ButtonState.DISABLED;
        this.buttons.rightArrow.state = ButtonState.DISABLED;
    },
    enableContentOperations: function() {
        this.buttons.files.state = ButtonState.ENABLED;
        this.buttons.addDocument.state = ButtonState.ENABLED;
        this.buttons.widgets.state = ButtonState.ENABLED;
        this.buttons.fileMenu.state = ButtonState.ENABLED;
    },
    disableContentOperations: function() {
        this.buttons.files.state = ButtonState.DISABLED;
        this.buttons.addDocument.state = ButtonState.DISABLED;
        this.buttons.widgets.state = ButtonState.DISABLED;
        this.buttons.fileMenu.state = ButtonState.DISABLED;
    },
    togglePen: function() {
        if (this.buttons.pen.state === ButtonState.ACTIVE) {
            this.buttons.pen.state = ButtonState.ENABLED;
            blanc.Session.getToolbox().set("mode", blanc.DrawMode.NONE);
        } else {
            this.buttons.pen.state = ButtonState.ACTIVE;
            blanc.Session.getToolbox().set("mode", blanc.DrawMode.PEN);
            this.buttons.eraser.state = ButtonState.ENABLED;
        }
    },
    activatePen: function() {
        this.buttons.pen.state = ButtonState.ACTIVE;
        this.buttons.eraser.state = ButtonState.ENABLED;
        blanc.Session.getToolbox().set("mode", blanc.DrawMode.PEN);
    },
    toggleEraser: function() {
        if (this.buttons.eraser.state === ButtonState.ACTIVE) {
            this.buttons.eraser.state = ButtonState.ENABLED;
            blanc.Session.getToolbox().set("mode", blanc.DrawMode.NONE);
        } else {
            this.buttons.eraser.state = ButtonState.ACTIVE;
            blanc.Session.getToolbox().set("mode", blanc.DrawMode.ERASER);
            this.buttons.pen.state = ButtonState.ENABLED;
        }
    },
    processSignin: function() {
        this.enableContentOperations();
        this.buttons.meetings.state = ButtonState.ENABLED;
        this.buttons.settings.state = ButtonState.ENABLED;
        this.buttons.invite.state = ButtonState.ENABLED;

    },
    processSignout: function(){
        this.disableAll();
    },
    undoStateChanged: function(event) {
        if (event.enable && this.buttons.undo.state == ButtonState.DISABLED) {
            this.buttons.undo.state = ButtonState.ENABLED;
        } else if (!event.enable && this.buttons.undo.state == ButtonState.ENABLED) {
            this.buttons.undo.state = ButtonState.DISABLED;
        }
    },
    clearStateChanged: function(event){
        if(event.enable && this.buttons.clear.state == ButtonState.DISABLED){
            this.buttons.clear.state = ButtonState.ENABLED;
        } else if (!event.enable && this.buttons.clear.state == ButtonState.ENABLED){
            this.buttons.clear.state = ButtonState.DISABLED;
        }
    },
    pageChanged: function(sender, event) {
        this.enableDrawing();
        this.enableNavigation();
        this.enableContentOperations();
        this.buttons.leftArrow.state = event.pageNo > 1 ? ButtonState.ENABLED : ButtonState.DISABLED;
        this.buttons.rightArrow.state = event.pageNo < event.npages ? ButtonState.ENABLED : ButtonState.DISABLED;
    },
    pageCreated: function(sender, event){
        event.pageNo === event.npages && (this.buttons.rightArrow.state = ButtonState.ENABLED);
    }
})