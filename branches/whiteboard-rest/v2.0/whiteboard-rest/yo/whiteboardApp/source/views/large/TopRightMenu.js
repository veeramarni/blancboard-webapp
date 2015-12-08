enyo.kind({
    name: "blanc.TopRightMenu",
    kind: "blanc.MenuLarge",
    classes: "topright-menu-container",
    create: function(){
        this.inherited(arguments);
    },
    init: function(mm){
        this.inherited(arguments);
         var isConfActive = blanc.Session.isConferenceActive(),
            isOrganizer = isConfActive ? blanc.Session.getConferenceSession().isOrganizer() : false;
        this.leading = this.createComponent({
            name: "leading",
            kind: "blanc.ButtonGroup",
            classes: "menu leading",
            menuModel: mm,
            buttons: isConfActive ? isOrganizer ? ["pages", "fullscreen"] : ["fullscreen"] : ["pages", "fullscreen"]
        },{
            owner: this
        });
        this.middle = this.createComponent({
            name: "middle",
            kind: "blanc.ButtonGroup",
            classes: "menu middle",
            style: "margin-top:-150px;height:300px;",
            menuModel: mm,
            buttons: ["palette", "pen", "eraser", "undo", "clear"]
        },{
            owner: this
        });
        this.trailing = this.createComponent({
            name: "trailing",
            kind: "blanc.ButtonGroup",
            classes: "menu trailing",
            menuModel: mm,
            buttons: ["rightArrow"]
        },{
            owner: this
        });
        this.render();
    }
})