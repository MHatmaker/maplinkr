
var prevPaneWidth = null;

function adjustSearchPane()
{
    console.log("clicked adjustSearchPane button");
    var dpan = dijit.byId('verbagePan');
    var apan = dojo.byId('verbagePan');
    var dmapWindow = dijit.byId('mapWindow');
    var buttonShowHide = dojo.byId('buttonRightPaneShowHide');
    if(buttonShowHide.innerText == 'Shrink')
    {
        prevPaneWidth = dpan.w; //apan.style.width;
        buttonShowHide.innerText = 'Expand';
        dojo.style(apan, 'width', '20px'); 
        dpan.w = 20;
    }
    else
    {
        buttonShowHide.innerText = 'Shrink';
        dojo.style(apan, 'width', prevPaneWidth); 
        dpan.w = prevPaneWidth;
    }
    dmapWindow.resize();
}