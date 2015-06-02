enyo.kind({
    name: "blanc.LeftBottomMenu",
    kind: "blanc.MenuLarge",
    classes: "leftbottom-menu-container",
    create: function(){
        this.inherited(arguments);
    },
    init: function(mm){
        this.inherited(arguments);
        this.leading = this.createComponent({
            name: "leading",
            kind: "blanc.ButtonGroup",
            classes: "menu leading",
            menuModel: mm,
            buttons: ["meetings", "files", "widgets", "settings"]
        },{
            owner: this
        });
        this.middle = this.createComponent({
            name: "middle",
            kind: "blanc.ButtonGroup",
            classes: "menu middle",
            menuModel: mm,
            style: "height:120px;",
            buttons: ["addDocument", "invite"]
        },{
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