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
});