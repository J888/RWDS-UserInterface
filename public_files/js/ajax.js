
// ********************** ajax *************************************
// Make an ajax call to the given url, then if the call was successful,
// call the Success Callback fn, otherwise, set an error message into the
// DOM element that has id 'errorId' (or if errorId was not supplied or
// invalid, alert the error message to the user/HTML coder).
function ajax(url, callBackSuccess) {

// The httpReq Object is now local to function "ajaxCall" (not global)
    var httpReq;
    if (window.XMLHttpRequest) {
        httpReq = new XMLHttpRequest(); //For Firefox, Safari, Opera
    } else if (window.ActiveXObject) {
        httpReq = new ActiveXObject("Microsoft.XMLHTTP"); //For IE 5+
    } else {
        alert('ajax not supported');
        return;
    }

    console.log("ajax.js: ready to make ajax call to " + url);
    httpReq.open("GET", url); // specify the page you want to GET

    // Specify the function that you want to run once the ajax call has returned
    // the data. Ajax calls are asyncrhonous (non-blocking). So, after you specify
    // the function, some time may pass before the function runs.
    httpReq.onreadystatechange = function () {

        // readyState == 4 means that the http request is complete
        if (httpReq.readyState === 4) {
            if (httpReq.status === 200) {
                callBackSuccess(httpReq); // success, call the function that was provided by HTML coder

            } else { // status code indicates that ajax call didnt return anything (e.g., bad url, no internet connection)

                // communicate error
                var errorMsg = "ajax.js error (" + httpReq.status + " " + httpReq.statusText +
                        ") while attempting to read '" + url + "'";
                console.log(errorMsg);

                
            }
        }
    }; // end of anonymous function

    httpReq.send(null); // initiate ajax call

} // end function ajax
