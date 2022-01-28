  
// load medallia

  if (window.KAMPYLE_ONSITE_SDK) {
    //Check Medallia code has been loaded 
    onsiteLoaded();
    //your custom function
  } else {
    // On the neb_OnsiteLoaded event call onsiteLoaded function 
    window.addEventListener('neb_OnsiteLoaded', onsiteLoaded);
  }

  function onsiteLoaded() {
    // load the form and store status (true/false) in neb_status
    var neb_status = KAMPYLE_ONSITE_SDK.loadForm(4);
    // if (neb_status === true) {
      // if form is loaded then decide what to do  
      // your code goes here
    // }
  }

//  show medallia

  if (window.KAMPYLE_ONSITE_SDK) {
    //If Medallia code has been loaded 
    onsiteLoaded(); //your custom function
  } else {
    // On the neb_OnsiteLoaded event, call onsiteLoaded function
    window.addEventListener('neb_OnsiteLoaded', onsiteLoaded);
  }

  function onsiteLoaded() {
    // load the form and store status (true/false) in neb_status
    var neb_status = KAMPYLE_ONSITE_SDK.loadForm(4);
    // If form is loaded
    // if (neb_status === true) {
    //   // set CSS attribute display to inherit so button can be seen
    //   document.getElementById("mdFormButton").style.display = "inherit"
    // }
  }