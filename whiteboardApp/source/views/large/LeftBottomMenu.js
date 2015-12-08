enyo.kind({
    name: "blanc.LeftBottomMenu",
    kind: "blanc.MenuLarge",
    classes: "leftbottom-menu-container",
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
                buttons: isConfActive ? isOrganizer ? ["leave", "files", "widgets", "people"] : 
                ["leave", "widgets",  "people"] : ["meetings", "files", "widgets", "settings"]
            }, {
                owner: this
            });
        this.middle = this.createComponent({
                name: "middle",
                kind: "blanc.ButtonGroup",
                classes: "menu middle",
                menuModel: mm,
                style: "height:120px;",
                buttons: isConfActive ? isOrganizer ? ["addDocument", "invite"] : [] : ["addDocument", "invite"]
            }, {
                owner: this
            });
        this.trailing = this.createComponent({
            name: "trailing",
            kind: "blanc.ButtonGroup",
            classes: "menu trailing",
            menuModel: mm,
            buttons: ["leftArrow"]
        },{
            owner: this
        });
        this.render();
    }
})