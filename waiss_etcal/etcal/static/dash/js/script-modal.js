$(document).ready(function () {
    //reset modal forms upon close event
    $('#btnAddData').on('click', function () {
        document.getElementById('addData').reset();
        $('#add-data-table tbody .dynamic-row').remove();
        var farm_id = $("#farms").val();
        $("#selectAddDataFarmName").val(farm_id).change();
    });
    $('#btnAddFarm').on('click', function () {
    });
    $('#btnAddStation').on('click', function () {
    });

    //modal for adding data to farm    
    $('.modal-body').on('change', '#selectAddDataInputMethod', function (){ //activate select button for data input (if single input or through excel file)
        var value = $(this).val();
        if (value == "single-data"){
            $('#single-data').removeAttr('hidden');
            $('#upload-data').attr('hidden', '');
        }
        else if (value == "excel-data"){
            $('#single-data').attr('hidden', '');
            $('#upload-data').removeAttr('hidden');
            $('#customFile').prop('required', true);
        }
    });
    /*when user choose to upload formatted excel file,
    a new window will open and pop up for uploading file*/
    var uploadWindow, uploadForm;
    $("#upload-link").click(function () {
        uploadWindow = window.open("/getstarted/upload/file", "uploadWindow", "width=800,height=700");
        if ($("#upload-message").is(':visible')){
            $("#upload-message").scrollIntoView();
        }
        else{
            $("#uploadform").scrollIntoView();
        }
    });
    $("#upload-go-back-link").click(function () {
        uploadWindow.close();
    });
});