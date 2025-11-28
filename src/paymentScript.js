function getToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('id:', id)

    let url = window.location.protocol + '//' + window.location.host + "/api/v1/payment/get-token"
    const http = new XMLHttpRequest()
    http.open('POST', url)
    http.setRequestHeader('Content-type', 'application/json')
    http.send(JSON.stringify({ id: id })) // Make sure to stringify
    http.onload = function () {
        // Do whatever with response
        let json = JSON.parse(http.response)
        console.log(json.token)
        postRefId(json.token)
    }
}

function postRefId(refIdValue) {
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "https://asan.shaparak.ir");
    form.setAttribute("target", "_self");
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("name", "RefId");
    hiddenField.setAttribute("value", refIdValue);
    form.appendChild(hiddenField);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}