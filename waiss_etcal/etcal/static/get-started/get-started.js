var current_fs, next_fs, previous_fs; //fieldsets
var opacity;

var fx = document.getElementById("farm-lat"), //farm location holders
    fy = document.getElementById("farm-long"),
    fh = document.getElementById("fh"),
    sx = document.getElementById("sta-lat"), //station location holders
    sy = document.getElementById("sta-long"),
    sh = document.getElementById("sh");

var left, opacity, scale;//variables for form validation
var animating; //flag to prevent quick multiclick glitches
var msformValidation;
var validationPassed = false, validationArray = [];

var url, cropId, soilId, stationId, num; //for ajax dynamically filled out input fields

var stage_init, stage_dev, stage_mid, stage_late, crop_dtm, cs_init, cs_dev, cs_mid, cs_late; //for function in computation of cumulative growth stage



$(document).ready(function () {

    //---------JQUERY VALIDATION----------------//
    /*check completeness and validate the input fields in each step
    in the multi-step form before proceeding to the next one*/

    msformValidation = $("#msform").validate({
        submitHandler: function () { }, //prevent traditional form submission
        rules: {
            'farm-name': { required: true },
            'farm-brgy': { required: true },
            'farm-muni': { required: true },
            'farm-prov': { required: true },
            'crops': { required: true },
            'crop-drz': { required: true },
            'crop-dtm': { required: true },
            'stage-init': { required: true },
            'stage-dev': { required: true },
            'stage-mid': { required: true },
            'stage-late': { required: true },
            'kc-init': { required: true },
            'kc-mid': { required: true },
            'kc-late': { required: true },
            'soils': { required: true },
            'soil-fc': { required: true },
            'soil-pwp': { required: true },
            'soil-perc': { required: true },
            'init-depl': { required: true },
            'mad': { required: true },
            'stations': { required: true },
            'sta-type': { required: true },
            'sta-name': { required: true },
            'sta-lat': { required: true },
            'sta-long': { required: true },
            'dap': { required: '#data-form:visible' },
            'data-type': { required: '#data-form:visible'  },
            'corr-factor': { required: '#data-form:visible' },
            'date_measured[]': { required: '#enter-single-data-form:visible'  },
            'eto_data[]': { required: '#enter-single-data-form:visible'  },
            'excel_file': { required: '#upload-excel-data-form:visible'  },
        },
        messages: {
            'date_measured[]': { required: "There are missing fields." },
            'eto_data[]': { required: "There are missing fields." },
            'excel_file': { required: "There are no file uploaded."}
        },
    });

    function validateField(elem, array) {      //validate the field and push the result to array for conditional next form  
        validationPassed = $(elem).valid();
        array.push(validationPassed);
    }

    $(".next").click(function () {

        current_fs = $(this).parent();

        //run validation on the inputs for the current step
        if (current_fs.data('step') == 1) {
            validationPassed = false, validationArray = [];
            validateField('#farm-name', validationArray);
            validateField('#farm-brgy', validationArray);
            validateField('#farm-muni', validationArray);
            validateField('#farm-prov', validationArray);
            if (validationArray[1] == false || validationArray[2] == false || validationArray[3] == false) {//if local address is given, coordinates is not required
                $("#farm-lat").prop('required', true);
                $("#farm-long").prop('required', true);
                validateField('#farm-lat', validationArray);
                validateField('#farm-long', validationArray);
            }
        }
        else if (current_fs.data('step') == 2) {
            validationPassed = false, validationArray = [];
            validateField('#crops', validationArray);
            if (validationArray[0] == false) {//if no crops in the default list is selected, the 'other' crop input field is required
                validationArray = [];
                $("#crop-other").prop('required', true);
                validateField('#crop-other', validationArray);
            }
            validateField('#crop-drz', validationArray);
            validateField('#crop-dtm', validationArray);
            validateField('#stage-init', validationArray);
            validateField('#stage-dev', validationArray);
            validateField('#stage-mid', validationArray);
            validateField('#stage-late', validationArray);
            validateField('#kc-init', validationArray);
            validateField('#kc-mid', validationArray);
            validateField('#kc-late', validationArray);
        }
        else if (current_fs.data('step') == 3) {
            validationPassed = false, validationArray = [];
            validateField('#soils', validationArray);
            if (validationArray[0] == false) {//if no soils in the default list is selected, the 'other' soil input field is required
                validationArray = [];
                $("#soil-other").prop('required', true);
                validateField('#soil-other', validationArray);
            }
            validateField('#soil-fc', validationArray);
            validateField('#soil-pwp', validationArray);
            validateField('#soil-perc', validationArray);
            validateField('#init-depl', validationArray);
            validateField('#mad', validationArray);
        }
        else if (current_fs.data('step') == 4) {
            validationPassed = false, validationArray = [];
            validateField('#stations', validationArray);
            validateField('#sta-type', validationArray);
            if (validationArray[1] == false) {//if no station type in the default list is selected, the 'other' station input field is required
                validationArray = [];
                $("#sta-type-other").prop('required', true);
                validateField('#sta-type-other', validationArray);
            }
            validateField('#sta-name', validationArray);
            validateField('#sta-lat', validationArray);
            validateField('#sta-long', validationArray);
            if (validationArray[3] == false || validationArray[4] == false) {//if coordinates is given, local address is not required
                $("#sta-brgy").prop('required', true);
                $("#sta-muni").prop('required', true);
                $("#sta-prov").prop('required', true);
                validateField('#sta-brgy', validationArray);
                validateField('#sta-muni', validationArray);
                validateField('#sta-prov', validationArray);
            }
        }
        else if (current_fs.data('step') == 5) {
            if ($("#data-form").is(':visible') == true) {
                validationPassed = false, validationArray = [];
                validateField('#dap', validationArray);
                validateField('#data-type', validationArray);
                validateField('#corr-factor', validationArray);

                if ($("#enter-single-data-form").is(':visible') == true) {
                    $("table.input-data tbody").find('input[name="date_measured[]"]').each(function () {
                        //alert("1");
                        validateField(this, validationArray);
                        if (validationPassed) {
                            $("table.input-data tbody").find('input[name="eto_data[]"]').each(function () {
                                //alert("2");
                                validateField(this, validationArray);
                                if (validationPassed) {
                                    $("table.input-data tbody").find('input[name="rain_data[]"]').each(function () {
                                        //alert("3");
                                        if ($(this).val() == "") {
                                            //alert("4");
                                            num = 0.
                                            $(this).val(num.toFixed(2));
                                            $(this).focus();
                                            validateField(this, validationArray);
                                            if (validationPassed) {
                                                //alert("5");
                                                $("table.input-data tbody").find('input[name="irrig_data[]"]').each(function () {
                                                    //alert("6");
                                                    if ($(this).val() == "") {
                                                        //alert("7");
                                                        num = 0.
                                                        $(this).val(num.toFixed(2));
                                                        $(this).focus();
                                                        validateField(this, validationArray);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else if ($("#upload-excel-data-form").is(':visible') == true){                    
                }
            }
            else {
                $("#data-form").find('input').each(function(){
                    $(this).prop('required', false);
                });
                $("#data-form").find('select').each(function(){
                    $(this).prop('required', false);
                });
                validationPassed = true;
            }
        }
        else if (current_fs.data('step') == 6) {
            $("#msform").submit();
        }

        for (i = 0; i < validationArray.length; i++) {
            //alert("8");
            validationPassed = validationArray[i];
            if (!validationPassed) {
                //alert("9");
                return false
            }
        }

        if (validationPassed) {
            //alert("10");
            next_fs = $(this).parent().next();
            //Add Class Active
            $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
            //show the next fieldset
            next_fs.show();
            //hide the current fieldset with style
            current_fs.animate({ opacity: 0 }, {
                step: function (now) {
                    // for making fielset appear animation
                    opacity = 1 - now;
                    current_fs.css({
                        'display': 'none',
                        'position': 'relative'
                    });
                    next_fs.css({ 'opacity': opacity });
                },
                duration: 600
            });
        }

    });

    $(".previous").click(function () {

        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        //Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        //show the previous fieldset
        previous_fs.show();

        //hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
            step: function (now) {
                // for making fielset appear animation
                opacity = 1 - now;

                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                previous_fs.css({ 'opacity': opacity });
            },
            duration: 600
        });
    });

    //-----------------end of MULTI-STEP FORM with Jquery Validation------------//





    //--------Input Field Description Popovers-----------//
    //popup descriptions for each input field in the form
    //to help users in filling out
    $('[data-toggle="popover"]').popover();
    $('.popover-dismiss').popover({
        trigger: 'hover',
        placement: 'right',
    });
    //--------end of Popovers---------------------------//





    //-----initialize form elements after ajax call---------//

    $('body').on('change', 'input', function () {
        /*performs a recalculation everytime an input field is changed*/
        computeCumStage();
    });

    $('.form-card').on('change', '#sta-type', function () {//activate toggle select for station type        
        stationId = $(this).val();
        if ((stationId != "Other") && (stationId != "")) {
            $("#sta-type-other").attr('hidden', '');
            $(this).prop('required', true);
        }
        else if (stationId == "Other") {
            //$("#station-form").find('input').val('');
            $("#sta-type-other").removeAttr('hidden');
            $("#sta-type-other").prop('required', true);
        }
        else if (stationId == "") {
            //$("#station-form").find('input').val('');
            $("#sta-type-other").attr('hidden', '');
            $(this).prop('required', true);
        }
    });

    $('.form-card').on('click', '#sta-my-loc', function () {//activate get location button in station
        sx = document.getElementById("sta-lat"); //reset station location holders
        sy = document.getElementById("sta-long");
        getLocationforStation();//onclick functions are removed in the load-station.html (after ajax call) and then called again
    });

    $('.form-card').on('change', '#input-type', function (){ //activate select button for data input (if single input or through excel file)
        var value = $(this).val();
        if (value == "single-data"){
            $('#enter-single-data-form').removeAttr('hidden');
            $('#upload-excel-data-form').attr('hidden', '');
        }
        else if (value == "excel-data"){
            $('#enter-single-data-form').attr('hidden', '');
            $('#upload-excel-data-form').removeAttr('hidden');
            $('#customFile').prop('required', true);
        }
    });

    $('#customFile').on('change',function(){
        //get the file name
        var fileName = $(this).val();
        //replace the "Choose a file" label
        $(this).next('.custom-file-label').html(fileName);
    });
    //------------end of initializaation after ajax-----------------//





    //---------AJAX LOADED HTML DATA------------//
    /*use ajax to request information from database depending on the
    on the value of a select field, and use these information
    to populate the fieldset form*/

    $("#crops").change(function () {//for crop select
        url = $("#msform").attr("data-crop-url");
        cropId = $(this).val();

        if ((cropId != "Other") && (cropId != "")) {
            $.ajax({
                url: url,
                data: {
                    'crop': cropId
                },
                success: function (data) {
                    $("#crop-form").html(data);
                    computeCumStage();
                }
            });
            $("#crop-other").attr('hidden', '');
            $(this).prop('required', true);
        }
        else if (cropId == "Other") {
            $("#crop-form").find('input').val('');
            $("#crop-other").removeAttr('hidden');
            $("#crop-other").prop('required', true);

        }
        else if (cropId == "") {
            $("#crop-form").find('input').val('');
            $("#crop-other").attr('hidden', '');
            $(this).prop('required', true);
        }
    });

    $("#soils").change(function () {//for soil select
        url = $("#msform").attr("data-soil-url");
        soilId = $(this).val();

        if ((soilId != "Other") && (soilId != "")) {
            $.ajax({
                url: url,
                data: {
                    'soil': soilId
                },
                success: function (data) {
                    $("#soil-form").html(data);
                }
            });
            $("#soil-other").attr('hidden', '');
            $(this).prop('required', true);
        }
        else if (soilId == "Other") {
            $("#soil-form").find('input').val('');
            num = 0;
            $('input[name="init-depl"]').val(num.toFixed(2));
            num = 0.5;
            $('input[name="mad"]').val(num.toFixed(2));
            $("#soil-other").removeAttr('hidden');
            $("#soil-other").prop('required', true);
        }
        else if (soilId == "") {
            $("#soil-form").find('input').val('');
            num = 0;
            $('input[name="init-depl"]').val(num.toFixed(2));
            num = 0.5;
            $('input[name="mad"]').val(num.toFixed(2));
            $("#soil-other").attr('hidden', '');
            $(this).prop('required', true);
        }
    });

    $("#stations").change(function () {//for station select
        url = $("#msform").attr("data-station-url");
        stationId = $(this).val();

        if ((stationId != "Other") && (stationId != "")) {
            $.ajax({
                url: url,
                data: {
                    'station': stationId
                },
                success: function (data) {
                    $("#station-form").html(data);
                }
            });
            $("#station-other").attr('hidden', '');
            $(this).prop('required', true);
        }
        else if (stationId == "Other") {
            $("#station-form").find('input').val('');
            $("#station-other").removeAttr('hidden');
            $("#station-other").prop('required', true);
            $("#sta-my-loc").val('Get my location');
            $("#sta-type option[value='']").attr('selected', 'selected');
        }
        else if (stationId == "") {
            $("#station-form").find('input').val('');
            $("#station-other").attr('hidden', '');
            $(this).prop('required', true);
            $("#sta-my-loc").val('Get my location');
            $("#sta-type option[value='']").attr('selected', 'selected');
        }
    });
    
    $("#upload-button").click(function () {//for crop select
        url = $("#uploadform").attr("action");
        var form_data = new FormData();
        var file_data = $('#customFile')[0].files[0];
        form_data.append('excel_file', file_data);

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: url,
            data: form_data,
            processData:false,
            contentType: false,
            success: function (data) {
                alert("File has been uploaded!");
                $("#load-data-file").html(data);
            }
        });
    });
    //-------------end of AJAX HTML DATA------------//




    //---------adding data now or later--------------//
    /*users have the option to add their first data or just setup their
    farm and input data later*/
    $("#add-now").click(function () {//user clicks 'YES'
        $("#add-now-form").attr('hidden', '');
        $("#not-now-form").attr('hidden', '');
        $("#data-form").removeAttr('hidden');
        //$("#back-data-opt").removeAttr('hidden');
        $("#data-form").find('input').each(function(){
            $(this).removeAttr('hidden');
        });
        $("#data-form").find('select').each(function(){
            $(this).removeAttr('hidden');
        });
    });
    $("#not-now").click(function () {//user clicks 'MAYBE LATER'
        $("#add-now-form").attr('hidden', '');
        $("#data-form").attr('hidden', '');
        $("#not-now-form").removeAttr('hidden');
        //$("#back-data-opt").removeAttr('hidden');
        $("#data-form").find('input').each(function(){
            $(this).attr('hidden', '');
        });
        $("#data-form").find('select').each(function(){
            $(this).attr('hidden', '');
        });
    });
    /*$("#back-data-opt").click(function () {//user clicks 'CHANGED MY MIND'
        $("#add-now-form").removeAttr('hidden');
        $("#data-form").attr('hidden', '');
        $("#not-now-form").attr('hidden', '');
        $("#back-data-opt").attr('hidden', '');
        $("#data-form").find('.error').each(function(){
            $(this).removeClass('error').next('label.error').remove();
        });
        $("#data-form").find('input').each(function(){
            $(this).attr('hidden', '');
        });
        $("#data-form").find('select').each(function(){
            $(this).attr('hidden', '');
        });
    });*/
});





//-----------HTML GEOLOCATION------------//
/*requet the user's current location and directly input
to the concerned field*/
function getLocationforFarm() {
    x = fx;
    y = fy;
    h = fh;
    getLocation();
}

function getLocationforStation() {
    x = sx;
    y = sy;
    h = sh;
    getLocation();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    x.value = parseFloat(position.coords.latitude);
    x.focus();
    y.value = parseFloat(position.coords.longitude);
    y.focus();
    h.innerHTML = "";
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            h.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            h.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            h.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            h.innerHTML = "An unknown error occurred."
            break;
    }
}
//---------end of HTML GEOLOCATION----------//




//--compute Cumulative Stage in Crop Information----//
function computeCumStage() {
    stage_init = $('input[name="stage-init"]').val();
    stage_dev = $('input[name="stage-dev"]').val();
    stage_mid = $('input[name="stage-mid"]').val();
    stage_late = $('input[name="stage-late"]').val();
    crop_dtm = $('input[name="crop-dtm"]').val();

    if ((stage_init != "") && (stage_dev != "") && (stage_mid != "") && (stage_late != "")) {
        cs_init = parseInt(stage_init);
        cs_dev = parseInt(stage_init) + parseInt(stage_dev);
        cs_mid = parseInt(stage_init) + parseInt(stage_dev) + parseInt(stage_mid);
        cs_late = parseInt(stage_init) + parseInt(stage_dev) + parseInt(stage_mid) + parseInt(stage_late);
        $('input[name="cs-init"]').val(cs_init);
        $('input[name="cs-dev"]').val(cs_dev);
        $('input[name="cs-mid"]').val(cs_mid);
        $('input[name="cs-late"]').val(cs_late);

        $('input[name="crop-dtm"]').val(cs_late);
    }
}
//-----end of cumulative growth stage computation-------//