export class BottomNavigationButton {
    public name: String;
    public icon: String;
    public text: String;
    public link: String;
    public visible: boolean;
    public onClick: any;
    public active: boolean;

    constructor(name: string, icon: String, text: String, onClick: Function, link: String, visible: boolean) {
        this.name = name;
        this.icon = icon;
        this.text = text;
        this.link = link;
        this.onClick = onClick;
        this.visible = visible;        
    }

    public setVisible(visible: boolean): void {
        this.visible = visible;
    }

    setActive = function (active: boolean) {
        this.active = active;
    }
}