
/*This covers the equations and functionalities of the dash changes every
farm change in the dashboard. After the data has been requested from the
server, the data will be assigned to the hidden div containing the input
types which will hold the data to easily access it for later*/
var date_planted, crop_dtm, crop_drz, stage_init, stage_dev, stage_mid, stage_late, kc_init, kc_mid, kc_late, mad, percolation, init_depl;
var date_data = [], eto_data = [], rain_data = [], irrig_data = [], adj_eto_data=[], value_holder=[];
var DAP_js_converted, date_today, date_harvest, DAP_today, DOH_today;
var valDAP = [], valKc = [], valETc = [], valEFR = [], valRZWD = [], valSurplusWater = [], valDRZ = [], valFC = [], valPWP = [], valTAW = [], valRAW = [], valActualRAW = [], valPerc = [], valKs = [], valETcs = [], valCWR = [], valAveCWR = [], valDBI = [];
var valnegRZWD = [], valnegFC = [], valnegPWP = [], valnegRAW = [], valdMAD = [], valnegdMAD = [], valnegActualRAW = [], valdActualRAW = [];
var latest_index;
var valDBI_itr_1 = [], valKc_pred = [], valKc_multip = [], valETcs_pred = [], valSurplusDay_pred = [], valPerc_pred = [], valCWR_pred = [], valDBI_itr_2 = [], valDBI_itr_3 = [];
var valDAP_init = [], valDAP_dev = [], valDAP_mid = [], valDAP_late = [];
var date_data_init = [], date_data_dev = [], date_data_mid = [], date_data_late = [];
var currentpercentMC, currentpercentMCdec, valMC, percentMAD, percentPWP;

function dataHandler() {
    date_planted = $("#DAP-holder").val();
    farm_loc = $("#farm-loc-holder").val();
    farm_coor = $("#farm-coor-holder").val();
    crop = $("#crop-holder").val();
    soil = $("#soil-holder").val();
    crop_dtm = parseInt($("#dtm-holder").val());
    crop_drz = parseFloat($("#drz-holder").val());
    stage_init = parseInt($("#init-stage-holder").val());
    stage_dev = parseInt($("#dev-stage-holder").val());
    stage_mid = parseInt($("#mid-stage-holder").val());
    stage_late = parseInt($("#late-stage-holder").val());
    stage_dev_cum = stage_init + stage_dev;
    stage_mid_cum = stage_dev_cum + stage_mid;
    stage_late_cum = crop_dtm;
    kc_init = parseFloat($("#kc-init-holder").val());
    kc_mid = parseFloat($("#kc-mid-holder").val());
    kc_late = parseFloat($("#kc-late-holder").val());
    soil_fc = parseFloat($("#fc-holder").val());
    soil_pwp = parseFloat($("#pwp-holder").val());
    mad = parseFloat($("#mad-holder").val());
    percolation = parseFloat($("#perc-holder").val());
    init_depl = parseFloat($("#init-depl-holder").val());
    corr_factor = parseFloat($("#corr-factor-holder").val());
    $("#dataHolder").find('input[name="date-data-holder"]').each(function(){
        date_data.push($(this).val());
    });
    $("#dataHolder").find('input[name="eto-data-holder"]').each(function(){
        eto_data.push(parseFloat($(this).val()));
        if (corr_factor != ""){
            adj_eto_data.push((parseFloat($(this).val())*corr_factor));
        }
    });
    $("#dataHolder").find('input[name="rain-data-holder"]').each(function(){
        rain_data.push(parseFloat($(this).val()));
    });
    $("#dataHolder").find('input[name="irrig-data-holder"]').each(function(){
        irrig_data.push(parseFloat($(this).val()));
    });
    //alert("DAP="+date_planted+" DTM="+crop_dtm+" DRZ="+crop_drz+" stage_init="+stage_init+" stage_dev="+stage_dev+" stage_mid="+stage_mid+" stage_late="+stage_late+" stage_dev_cum="+stage_dev_cum+" stage_mid_cum="+stage_mid_cum+" stage_late_cum="+stage_late_cum+" kc_init="+kc_init+" kc_mid="+kc_mid+" kc_late="+kc_late+" soil_fc="+soil_fc+" soil_pwp="+soil_pwp+" mad="+mad+"perc="+percolation+" init_depl="+init_depl);
    //alert("date_data="+date_data+" eto_data="+eto_data+" rain_data"+rain_data+" irrig_data"+irrig_data);
}

function calcData() {
    DAP_js_converted = new Date(date_planted);
    date_today = new Date();
    DAP_today = Math.floor((date_today.getTime() - DAP_js_converted.getTime()) / (1000 * 3600 * 24));
    date_harvest = new Date(DAP_js_converted);
    date_harvest.setDate(date_harvest.getDate() + crop_dtm);
    DOH_today = (date_harvest.getTime() - date_today.getTime()) / (1000 * 3600 * 24);
    date = date_harvest;
    date_harvest = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
    date = DAP_js_converted;
    date_planted = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
    if (DOH_today > 0) {
        DOH_today = Math.floor(DOH_today);
    }
    else if (DOH_today <= 0) {
        DOH_today = Math.ceil(DOH_today);
    }
    for (var i = 0; i < date_data.length; i++) {
        //Days After Planting
        valDAP[i] = new Date(date_data[i]);
        valDAP[i] = Math.floor((valDAP[i].getTime() - DAP_js_converted.getTime()) / (1000 * 3600 * 24));
        //Crop Coefficient, Kc -----and---------- Cumulative plant growth stage
        if (valDAP[i] <= stage_init) {
            valKc[i] = kc_init;
            valDAP_init[i] = valDAP[i];
            date_data_init[i] = date_data[i];
        }
        else if (valDAP[i] <= stage_dev_cum) {
            valKc[i] = (kc_init + (((valDAP[i] - stage_init) / stage_dev) * (kc_mid - kc_init)));
            valDAP_dev[i] = valDAP[i];
            date_data_dev[i] = date_data[i];
        }
        else if (valDAP[i] <= stage_mid_cum) {
            valKc[i] = kc_mid;
            valDAP_mid[i] = valDAP[i];
            date_data_mid[i] = date_data[i];
        }
        else if (valDAP[i] <= stage_late_cum) {
            valKc[i] = (kc_mid + (((valDAP[i] - stage_mid_cum) / stage_late) * (kc_late - kc_mid)));
            valDAP_late[i] = valDAP[i];
            date_data_late[i] = date_data[i];
        }
        //Crop Evapotranspiration, ETc
        if (adj_eto_data[i] != ""){
            value_holder[i] = adj_eto_data[i];
        }
        else {
            value_holder[i] = eto_data[i]
        }
        valETc[i] = value_holder[i] * valKc[i];
        //Effective Rainfall
        if (rain_data[i] < (0.2 * value_holder[i])){
            valEFR[i] = 0;
        }
        else {
            valEFR[i] = rain_data[i];
        }
        //Root Zone Water Deficit, RZWD        
        if ((i == 0) || (valDAP[i] == 0)) {
            valRZWD[i] = init_depl + valETc[i] - valEFR[i] - irrig_data[i];
            if (valRZWD[i] < 0) {
                valRZWD[i] = 0;
            }
        }
        else {
            valRZWD[i] = valRZWD[i - 1] + valETc[i] - valEFR[i] - irrig_data[i] - valSurplusWater[i - 1] + valPerc[i - 1];
            if (valRZWD[i] < 0) {
                valRZWD[i] = 0;
            }
        }
        //Negative Root Zone Water Deficit, negRZWD
        valnegRZWD[i] = -valRZWD[i];
        //Surplus Water
        if ((i == 0) || (valDAP[i] == 0)) {
            valSurplusWater[i] = -init_depl - valETc[i] + valEFR[i] + irrig_data[i];
            if (valRZWD[i] > 0) {
                valSurplusWater[i] = 0;
            }
            else {
                if (valSurplusWater[i] <= 0) {
                    valSurplusWater[i] = 0;
                }
            }
        }
        else {
            valSurplusWater[i] = -valRZWD[i - 1] - valETc[i] + valEFR[i] + irrig_data[i] + valSurplusWater[i - 1] - valPerc[i - 1];
            if (valRZWD[i] > 0) {
                valSurplusWater[i] = 0;
            }
            else {
                if (valSurplusWater < 0) {
                    valSurplusWater[i] = 0;
                }
            }
        }
        //Current Root Zone Depth, drz
        if (valDAP[i] <= stage_init) {
            valDRZ[i] = (crop_drz * (0.5 + (0.5 * (Math.sin((3.03 * stage_init / crop_dtm - 1.47))))));
        }
        else {
            valDRZ[i] = (crop_drz * (0.5 + (0.5 * (Math.sin((3.03 * valDAP[i] / crop_dtm - 1.47))))));
        }
        //Field Capacity, FC
        valFC[i] = soil_fc * valDRZ[i];
        //Negative FC
        valnegFC[i] = -valFC[i];
        //Permanent Wilting Point, PWP
        valPWP[i] = soil_pwp * valDRZ[i];
        //Negative PWP
        valnegPWP[i] = -valPWP[i];
        //Total Available Water, TAW
        valTAW[i] = valFC[i] - valPWP[i];
        //Readily Available Water, RAW
        valRAW[i] = valTAW[i] * mad;
        //MAD equivalent depth, dMAD
        valdMAD[i] = valFC[i] - valRAW[i];
        //Negative dMAD
        valnegdMAD[i] = -valdMAD[i];
        //Negative Readily Available Water, negRAW
        valnegRAW[i] = -valRAW[i];
        //Actual Readily Available Water, Actual RAW
        valActualRAW[i] = valRAW[i] - valRZWD[i] + valSurplusWater[i];
        //Negative Actual Readily Available Water, negActual RAW
        valnegActualRAW[i] = -valActualRAW[i];
        //Actual RAW equivalent depth (from MAD), dActualRAW
        valdActualRAW[i] = valActualRAW[i] + valdMAD[i];
        //Percolation, P
        if (valSurplusWater[i] > 0) {
            if (valSurplusWater[i] < percolation) {
                valPerc[i] = percolation;
            }
            else {
                valPerc[i] = valSurplusWater[i]
            }
        }
        else {
            valPerc[i] = 0;
        }
        //Water Stress Coefficient, Ks
        if ((valFC[i] - valRZWD[i]) < (valFC[i] - valRAW[i])) {
            valKs[i] = (valTAW[i] - valRZWD[i]) / (valTAW[i] - valRAW[i])
        }
        else {
            valKs[i] = 1;
        }
        //Actual Crop ET, ETcs
        valETcs[i] = valETc[i] * valKs[i];
        //Crop Water Requirement, CWR(ETc+P)
        valCWR[i] = valETcs[i] + valPerc[i];
        //Days Before Irrigation, DBI
        var totalCWR = 0;
        var sampleCWR = 10;
        if (i < sampleCWR) {
            for (var j = 0; j < (i + 1); j++) {
                totalCWR += valCWR[j];
            }
            valAveCWR[i] = totalCWR / (i + 1);
        }
        else {
            for (var j = i; j < (i + sampleCWR); j++) {
                totalCWR += valCWR[j];
            }
            valAveCWR[i] = totalCWR / sampleCWR;
        }
        valDBI[i] = Math.round(valActualRAW[i] / (valAveCWR[i]));
    }
    latest_index = date_data.length - 1;
    alert("DAP="+valDAP + " Kc="+valKc+" ETc=" +valETc+" EFR="+valEFR+" RZWD="+valRZWD+" Surplus="+valSurplusWater+" DRZ="+valDRZ+" FC="+valFC+" PWP="+valPWP+" TAW="+valTAW+" RAW="+valRAW+" Actual RAW="+valActualRAW+ " Perc="+valPerc+" Ks="+valKs+" ETcs="+valETcs+" CWR="+valCWR+" DBI=" +valDBI);
    alert("valAveCWR"+valAveCWR);
    alert("depthActualRAW="+valdActualRAW+" Perc="+valPerc+" Ks="+valKs+" ETcs="+valETcs+" CWR="+valCWR+" DBI=" +valDBI);
}

function iterateData() {
    var iterations = 100;
    for (var i = 0; i < date_data.length; i++) {
        //(Days' in excel)
        valDBI_itr_1[i] = valDBI[i];
        for (var j = 0; j < iterations; j++) {
            //Predicted Kc
            if (valDBI_itr_1[i] <= 0) {
                valKc_pred[i] = valKc[i];
            }
            else {
                var totalKc = 0;
                var sampleKc = valDBI_itr_1[i];
                for (var k = i; k < (i + sampleKc); k++) {
                    totalKc += valKc[k];
                }
                valKc_pred[i] = totalKc / (sampleKc);
            }
            //Kc Multiplier
            valKc_multip[i] = valKc_pred[i] / valKc[i];
            //Predicted ETcs
            var totalETcs = 0;
            var sampleETcs = 10;
            var aveETcs = 0;
            if (i < sampleETcs) {
                for (var k = 0; k < (i + 1); k++) {
                    totalETcs += valETcs[k];
                }
                aveETcs = totalETcs / (i + 1);
            }
            else {
                for (var k = i; k < (i + sampleETcs); k++) {
                    totalETcs += valETcs[k];
                }
                aveETcs = totalETcs / sampleETcs;
            }
            valETcs_pred[i] = aveETcs * valKc_multip[i];
            //Predicted days before surplus water runs out
            if (valSurplusWater[i] > 0) {
                totalETcs = 0;
                sampleETcs = 3;
                aveETcs = 0;
                if (i < sampleETcs) {
                    for (var k = 0; k < (i + 1); k++) {
                        totalETcs += valETcs[k];
                    }
                    aveETcs = totalETcs / (i + 1);
                }
                else {
                    for (var k = i; k < (i + sampleETcs); k++) {
                        totalETcs += valETcs[k];
                    }
                    aveETcs = totalETcs / sampleETcs;
                }
                valSurplusDay_pred[i] = Math.floor(valSurplusWater[i] / (aveETcs + percolation));
            }
            else {
                valSurplusDay_pred[i] = 0;
            }
            //Predicted Percolation
            if (valSurplusDay_pred[i] == 0) {
                valPerc_pred[i] = 0;
            }
            else {
                valPerc_pred[i] = ((valSurplusDay_pred[i] * percolation) / valDBI[i]);
            }
            //Predicted CWR (ETcs+P)
            valCWR_pred[i] = valETcs_pred[i] + valPerc_pred[i];
            //(Days Before Irrigation' in excel)
            valDBI_itr_2[i] = valActualRAW[i] / valCWR_pred[i];
            if (valDBI_itr_2[i] > 0) {
                valDBI_itr_2[i] = Math.floor(valDBI_itr_2[i]);
            }
            else if (valDBI_itr_2[i] <= 0) {
                valDBI_itr_2[i] = Math.ceil(valDBI_itr_2[i]);
            }
            //(Days in excel -- unrounded Days before irrigation)
            valDBI_itr_3[i] = valActualRAW[i] / valCWR_pred[i];
            //Back to Days' -- replace initial data used
            valDBI_itr_1[i] = Math.round(valActualRAW[i] / valCWR_pred[i]);
        }
    }
    //alert(valDBI_itr_1);
}

function displayResults() {
    document.getElementById("valDAP").textContent = DAP_today;
    document.getElementById("valDOH").textContent = DOH_today;
    document.getElementById("dPlanted").textContent = date_planted;
    document.getElementById("dHarvest").textContent = date_harvest;
    lastDataUpdate();
    soilWaterStatus();
    soilWaterGauge();
    dayToIrrigate();
    irrigateWater();
    farmDetails();
}

function lastDataUpdate() {
    var last_data = new Date(date_data[latest_index]);
    date_today = new Date();
    data_update_diff = (last_data.getTime() - date_today.getTime()) / (1000 * 3600 * 24);
    if (data_update_diff > 0) {
        data_update_diff = Math.floor(data_update_diff);
    }
    else if (data_update_diff <= 0) {
        data_update_diff = Math.ceil(data_update_diff);
    }
    $("#lastDataAlert").hide();
    if (data_update_diff >= -1) {
        document.getElementById("lastDataUpdate").textContent = " ";
        document.getElementById("lastDataAlert_text").textContent = "Update your data now for more accurate advisories.";
        $("#lastDataAlert").show();
    }
    else if (data_update_diff < -1) {
        document.getElementById("lastDataUpdate").textContent = "Last data update: " + Math.abs(data_update_diff) + " days ago";
        document.getElementById("lastDataAlert_text").textContent = "Your last data input was " + Math.abs(data_update_diff) + " days ago. It is recommended to update your data for more accurate advisories. Thank you!";
        $("#lastDataAlert").show();
    }
}

function dayToIrrigate() {
    //Date To Irrigate
    var days_bef_irrigate;
    if ((valDBI_itr_2[latest_index] == "") || (isNaN(valDBI_itr_2[latest_index]))){
        days_bef_irrigate = valDBI[latest_index];
        alert(1);
    }
    else  {
        days_bef_irrigate = valDBI_itr_2[latest_index];
        alert(2);
    }
    var date_irrigate = new Date(date_data[latest_index]);
    date_irrigate.setDate(date_irrigate.getDate() + days_bef_irrigate);
    var dd = date_irrigate.getDate();
    var m = date_irrigate.toLocaleString('default', { month: 'short' });
    var yyyy = date_irrigate.getFullYear()
    document.getElementById("textDBI").innerHTML = dd + " " + m + " " + yyyy;
    date_today = new Date();
    if (date_irrigate.getTime() < date_today.getTime()) {
        dd = date_today.getDate();
        m = date_today.toLocaleString('default', { month: 'short' });
        yyyy = date_today.getFullYear()
        document.getElementById("textDBI").innerHTML = dd + " " + m + " " + yyyy;
    }
    //Days Before Irrigation
    var DBI_today = (date_irrigate.getTime() - date_today.getTime()) / (1000 * 3600 * 24);
    if (DBI_today > 0) {
        DBI_today = Math.floor(DBI_today);
    }
    else if (DBI_today <= 0) {
        DBI_today = Math.ceil(DBI_today);
    }
    if (DBI_today > 1) {
        document.getElementById("valDBI").textContent = DBI_today + " days from now";
        document.getElementById("textDBINote").textContent = " ";
    }
    else if (DBI_today == 1) {
        document.getElementById("valDBI").textContent = "Tomorrow";
        document.getElementById("textDBINote").textContent = " ";
    }
    else if (DBI_today == 0) {
        document.getElementById("valDBI").textContent = "Today";
        document.getElementById("textDBINote").textContent = " ";
    }
    else if (DBI_today == -1) {
        document.getElementById("valDBI").textContent = "Today";
        document.getElementById("textDBINote").textContent = "Needed since yesterday";
    }
    else if (DBI_today < -1) {
        document.getElementById("valDBI").textContent = "Today";
        document.getElementById("textDBINote").textContent = "Needed since " + Math.abs(DBI_today) + " days ago";
    }
    alert("days_bef_irrigate:"+days_bef_irrigate+" date_irrigate:"+date_irrigate+" DBI_today:"+DBI_today);
}

function soilWaterStatus() {
    var threshold_level = 0.05;
    var critical_level = 0.5; //50% below MAD and above PWP
    var diffActualRAW;
    var pathPercent;
    valMC = parseFloat(valdActualRAW[latest_index]).toFixed(2)
    currentpercentMCdec = (valMC / parseFloat(valFC[latest_index]));
    percentMAD = (parseFloat(valdMAD[latest_index]) / parseFloat(valFC[latest_index]));
    percentPWP = (parseFloat(valPWP[latest_index]) / parseFloat(valFC[latest_index]));
    pathPercent = (301.635 - (301.635 * currentpercentMCdec));
    document.getElementById("valCurrentMC").textContent = valMC + "mm";
    //document.getElementById("path-circle").style.strokeDashoffset = pathPercent;
    //>5% above FC level
    if (valdActualRAW[latest_index] > ((1 + threshold_level) * valFC[latest_index])) {
        document.getElementById("textActualRAW").textContent = "Sufficient";
        diffActualRAW = Math.round(valActualRAW[latest_index] - valFC[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm Above FC";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valMC + "mm" + " which is still at sufficient levels with " + diffActualRAW + "mm of soil moisture above field capacity.";
    }
    //(+/-)5% at FC level
    else if ((valdActualRAW[latest_index] <= ((1 + threshold_level) * valFC[latest_index])) && (valdActualRAW[latest_index] > ((1 - threshold_level) * valFC[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Sufficient";
        document.getElementById("valActualRAW").textContent = "At Field Capacity";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valMC + "mm" + " which is sufficient and is at field capacity level.";
    }
    //<5% below FC level and >5% above MAD level
    else if ((valdActualRAW[latest_index] <= ((1 - threshold_level) * valFC[latest_index])) && (valdActualRAW[latest_index] > ((1 + threshold_level) * valdMAD[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Sufficient";
        diffActualRAW = Math.round(valFC[latest_index] - valActualRAW[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm Below FC";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valMC + "mm" + " which is still at sufficient levels with " + diffActualRAW + "mm of soil moisture below field capacity.";
    }
    //(+/-)5% at MAD level
    else if ((valdActualRAW[latest_index] <= ((1 + threshold_level) * valdMAD[latest_index])) && (valdActualRAW[latest_index] > ((1 - threshold_level) * valdMAD[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Threshold Level";
        document.getElementById("valActualRAW").textContent = "Within 5% near MAD";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valMC + "mm" + " which is at threshold level or within 5% near management allowable depletion level.";
    }
    //<5% below MAD and >50% above PWP
    else if ((valdActualRAW[latest_index] <= ((1 - threshold_level) * valdMAD[latest_index])) && (valdActualRAW[latest_index] > ((1 + critical_level) * valPWP[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Water Stress";
        diffActualRAW = Math.round(valRAW[latest_index] - valActualRAW[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm Below MAD";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valMC + "mm" + " which is in water stress condition with " + diffActualRAW + "mm of soil moisture below management allowable depletion.";
    }
    //<50% above PWP and beyond
    else if ((valdActualRAW[latest_index] <= ((1 + critical_level) * valPWP[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Critical";
        diffActualRAW = Math.round(valActualRAW[latest_index] - valPWP[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm near PWP";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valMC + "mm" + " which is in critical condition with" + diffActualRAW + "mm of soil moisture near permanent wilting point.";
    }
}

function soilWaterGauge() {
    /*gauge chart*/
    (function () {
        var Needle, arc, arcEndRad, arcStartRad, barWidth, chart, chartInset, degToRad, el, endPadRad, height, i, margin, needle, numSections, padRad, percToDeg, percToRad, percent, radius, ref, sectionIndx, sectionPerc, startPadRad, svg, totalPercent, width, subIndicator, label;

        percent = currentpercentMCdec;

        barWidth = 60;

        numSections = 3;

        // / 2 for HALF circle
        sectionPerc = [(percentPWP - 0.5), (percentMAD - 0.5), (0.5 - (percentPWP - 0.5) - (percentMAD - 0.5))];

        padRad = 0;

        chartInset = 10;

        // start at 270deg
        totalPercent = .75;

        subIndicator = totalPercent + (percentMAD * 100 / 200)

        d3.select('#soilwatergauge').remove();
        el = d3.select('.chart-gauge');

        margin = {
            top: 10,
            right: 20,
            bottom: 30,
            left: 20
        };


        width = el[0][0].offsetWidth - margin.left - margin.right;

        height = width;

        radius = Math.min(width, height) / 2;

        percToDeg = function (perc) {
            return perc * 360;
        };

        percToRad = function (perc) {
            return degToRad(percToDeg(perc));
        };

        degToRad = function (deg) {
            return deg * Math.PI / 180;
        };

        svg = el.append('svg').attr('id', 'soilwatergauge').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

        chart = svg.append('g').attr('transform', `translate(${(width + margin.left) / 2}, ${(height + margin.top) / 2})`);

        // build gauge bg
        for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
            arcStartRad = percToRad(totalPercent);
            arcEndRad = arcStartRad + percToRad(sectionPerc[sectionIndx - 1]);
            totalPercent += sectionPerc[sectionIndx - 1];
            startPadRad = 0;
            endPadRad = 0;
            arc = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth).startAngle(arcStartRad + startPadRad).endAngle(arcEndRad - endPadRad);
            chart.append('path').attr('class', `arc chart-color${sectionIndx}`).attr('d', arc);
        }

        arc2 = d3.svg.arc().outerRadius(radius - chartInset + 10).innerRadius(radius - chartInset - barWidth - 10).startAngle(percToRad(subIndicator)).endAngle(percToRad(subIndicator));
        chart.append('path').attr('d', arc2).style("stroke", "black").style("stroke-width", "2px");

        Needle = class Needle {
            constructor(len, radius1) {
                this.len = len;
                this.radius = radius1;
            }

            drawOn(el, perc) {
                el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
                return el.append('path').attr('class', 'needle').attr('d', this.mkCmd(perc));
            }

            animateOn(el, perc) {
                var self;
                self = this;
                return el.transition().delay(500).ease('elastic').duration(3000).selectAll('.needle').tween('progress', function () {
                    return function (percentOfPercent) {
                        var progress;
                        progress = percentOfPercent * perc;
                        return d3.select(this).attr('d', self.mkCmd(progress));
                    };
                });
            }

            mkCmd(perc) {
                var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
                thetaRad = percToRad(perc / 2); // half circle
                centerX = 0;
                centerY = 0;
                topX = centerX - this.len * Math.cos(thetaRad);
                topY = centerY - this.len * Math.sin(thetaRad);
                leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
                leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
                rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
                rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
                return `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;
            }
        };


        needle = new Needle(65, 10);

        needle.drawOn(chart, 0);

        needle.animateOn(chart, percent);

    }).call(this);

    //# sourceURL=coffeescript
}

function irrigateWater() {
    valMC = parseFloat(valdActualRAW[latest_index]).toFixed(2)
    currentpercentMC = ((valMC / valFC[latest_index]) * 100).toFixed(2);
    var valIrrigate = Math.round(valFC[latest_index] - valdActualRAW[latest_index]);
    var valpercentIrrigate = (valIrrigate) / valFC[latest_index] * 100;
    var valpercentroundIrrigate = valpercentIrrigate.toFixed(2);
    document.getElementById("mc-progress").style.width = currentpercentMC + "%";
    document.getElementById("mc-progress").textContent = currentpercentMC + "%";
    document.getElementById("irrigate-progress").style.width = valpercentroundIrrigate + "%";
    document.getElementById("irrigate-progress").textContent = valpercentroundIrrigate + "%";
    if (valIrrigate > 0) {
        document.getElementById("valIrrigate").textContent = valIrrigate + "mm";
        document.getElementById("textIrrigate").textContent = "To reach Field Capacity";
        document.getElementById("textIrrigateNote").textContent = "The current soil moisture content is " + currentpercentMC + "%. " + "To reach field capacity, " + valIrrigate + "mm of water is needed.";
    }
    else {
        valIrrigate = 0;
        document.getElementById("valIrrigate").textContent = valIrrigate + "mm";
        document.getElementById("textIrrigate").textContent = "Still Above Field Capacity";
        document.getElementById("textIrrigateNote").textContent = "The current soil moisture content is " + currentpercentMC + "% and is still above field capacity. No irrigation is needed.";
    }

}

function farmDetails(){
    document.getElementById('textFarmLocation').textContent = farm_loc;
    document.getElementById('textFarmCoordinates').textContent = farm_coor;
    document.getElementById('textFarmCrop').textContent = crop;
    document.getElementById('textFarmSoil').textContent = soil;
}

function resetArrayHolder() {
    date_data = []; eto_data = []; rain_data = []; irrig_data = [], value_holder = [], adj_eto_data=[];
    valDAP = []; valKc = []; valETc = []; valEFR = []; valRZWD = []; valSurplusWater = []; valDRZ = []; valFC = []; valPWP = []; valTAW = []; valRAW = []; valActualRAW = []; valPerc = []; valKs = []; valETcs = []; valCWR = []; valAveCWR = []; valDBI = [];
    valnegRZWD = []; valnegFC = []; valnegPWP = []; valnegRAW = []; valdMAD = []; valnegdMAD = []; valnegActualRAW = []; valdActualRAW = [];
    valDBI_itr_1 = []; valKc_pred = []; valKc_multip = []; valETcs_pred = []; valSurplusDay_pred = []; valPerc_pred = []; valCWR_pred = []; valDBI_itr_2 = []; valDBI_itr_3 = [];
    valDAP_init = [], valDAP_dev = [], valDAP_mid = [], valDAP_late = [];
}
/*end of equations and rendering of functionalities*/


/*render highcharts for dashboard, values are extracted from the input types
and then calculated through the function*/
function renderHighchart() {
    var soilwater_title = "Soil Water Condition";
    var appliedwater_title = "Applied Water";
    var xrange_title = "Growth Stages";
    var et_title = "Evapotranspiration";

    var chart1;
    var chart2;
    var chart3;

    var hasPlotBand = false;

    var actualRAW_chartdata=[], growth_data = [], eto_chartdata=[], actualet_chartdata=[], rain_chartdata=[], irrig_chartdata=[];
    for (i=0; i<date_data.length; i++){
        date_data[i] = new Date(date_data[i]).getTime();
        date_data_init[i] = new Date(date_data_init[i]).getTime();
        date_data_dev[i] = new Date(date_data_dev[i]).getTime();
        date_data_mid[i] = new Date(date_data_mid[i]).getTime();
        date_data_late[i] = new Date(date_data_late[i]).getTime();
        actualRAW_chartdata.push({
            x: date_data[i],
            y: valdActualRAW[i]
        });
        rain_chartdata.push({
            x: date_data[i],
            y: rain_data[i]
        });
        irrig_chartdata.push({
            x: date_data[i],
            y: irrig_data[i]
        });
        eto_chartdata.push({
            x: date_data[i],
            y: eto_data[i]
        });
        actualet_chartdata.push({
            x: date_data[i],
            y: valETcs[i]
        });
    }
    if (date_data_init != ""){
        growth_data.push({
            x: (date_data_init[0]),
            x2: (date_data_init[date_data_init.length-1]),
            y:0,
            color: "#acd14f",
            stage: "Initial Stage",
        });
        if (date_data_dev != ""){
            growth_data.push({
                x: (date_data_dev[0]),
                x2: (date_data_dev[date_data_dev.length-1]),
                y:0,
                color: "#86d640",
                stage: "Developmental Stage",
            });
            if (date_data_mid != ""){
                growth_data.push({
                    x: (date_data_mid[0]),
                    x2: (date_data_mid[date_data_mid.length-1]),
                    y:0,
                    color: "#40d656",
                    stage: "Mid-season",
                });
                if (date_data_late != ""){
                    growth_data.push({
                        x: (date_data_late[0]),
                        x2: (date_data_late[date_data_late.length-1]),
                        y:0,
                        color: "#1ebd4e",
                        stage: "Late Season",
                    });
                }
            }
        }
    }

    //catch mousemove event and have all 3 charts' crosshairs move along indicated values on x axis

    function syncronizeCrossHairs(chart) {
        var container = $(chart.container),
            offset = container.offset(),
            x, y, isInside, report;

        container.mousemove(function (evt) {

            x = evt.clientX - chart.plotLeft - offset.left;
            y = evt.clientY - chart.plotTop - offset.top;
            var xAxis = chart.xAxis[0];
            var xVal = xAxis.toValue(x, true);
            //remove old plot line and draw new plot line (crosshair) for this chart
            var xAxis1 = chart1.xAxis[0];
            var points1 = chart1.series[0].points;

            Highcharts.each(points1, function (point, i) {
                if (i + 1 < points1.length && point.x <= xVal && points1[i + 1].x > xVal) {
                    //reset state
                    point.setState();
                    points1[i + 1].setState();

                    if (xVal - point.x <= points1[i + 1].x - xVal) {
                        chart1.tooltip.refresh(point);
                        point.setState('hover');
                    } else {
                        chart1.tooltip.refresh(points1[i + 1]);
                        points1[i + 1].setState('hover');
                    }
                }
            });

            xAxis1.removePlotLine("myPlotLineId");
            xAxis1.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',
                //dashStyle: 'dash',                   
                id: "myPlotLineId"
            });

            var xAxis2 = chart2.xAxis[0];
            var points2 = [chart2.series[0].points,chart2.series[1].points];
            Highcharts.each(points2, function (point, i) {
                if (i + 1 < points2.length && point.x <= xVal && points2[i + 1].x > xVal) {
                    //reset state
                    point.setState();
                    points2[i + 1].setState();

                    if (xVal - point.x <= points2[i + 1].x - xVal) {
                        chart2.tooltip.refresh(point);
                        point.setState('hover');
                    } else {
                        chart2.tooltip.refresh(points2[i + 1]);
                        points2[i + 1].setState('hover');
                    }
                }
            });

            xAxis2.removePlotLine("myPlotLineId");
            xAxis2.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',
                //dashStyle: 'dash',                   
                id: "myPlotLineId"
            });

            //remove old crosshair and draw new crosshair on chart2
            var xAxis3 = chart3.xAxis[0];
            var points3 = chart3.series[0].points;
            xAxis3.removePlotLine("myPlotLineId");
            xAxis3.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',
                //dashStyle: 'dash',                   
                id: "myPlotLineId"
            });

            Highcharts.each(points3, function (point) {

                if (point.x < xVal && point.x2 > xVal) {
                    chart3.tooltip.refresh(point);
                    point.update({
                        color: '#4879b2'
                    });
                } else {
                    point.update({
                        color: '#fff'
                    });
                }
            });

            var xAxis4 = chart4.xAxis[0];
            var points4 = [chart4.series[0].points,chart4.series[1].points];
            Highcharts.each(points4, function (point, i) {
                if (i + 1 < points4.length && point.x <= xVal && points4[i + 1].x > xVal) {
                    //reset state
                    point.setState();
                    points4[i + 1].setState();

                    if (xVal - point.x <= points4[i + 1].x - xVal) {
                        chart4.tooltip.refresh(point);
                        point.setState('hover');
                    } else {
                        chart4.tooltip.refresh(points4[i + 1]);
                        points4[i + 1].setState('hover');
                    }
                }
            });

            xAxis4.removePlotLine("myPlotLineId");
            xAxis4.addPlotLine({
                value: chart.xAxis[0].translate(x, true),
                width: 1,
                color: 'red',
                //dashStyle: 'dash',                   
                id: "myPlotLineId"
            });

            //if you have other charts that need to be syncronized - update their crosshair (plot line) in the same way in this function.                   
        });
    }

    //Soil Water container
    chart1 = Highcharts.chart('soilwaterChart', {
        chart: {
            type: 'spline',
            marginLeft: 87,
            zoomType: 'x',
            height: 400,
            plotBackgroundColor: {
                linearGradient: [0, 0, 0, 400],
                stops: [
                    [(1 - (Math.min.apply(Math, valdMAD) / Math.min.apply(Math, valFC))), '#856f52'],
                    [(1 - 0.9 * (Math.min.apply(Math, valdMAD) / Math.min.apply(Math, valFC))), '#856f52'],
                    [(1 - 0.8 * (Math.min.apply(Math, valdMAD) / Math.min.apply(Math, valFC))), '#b39369'],
                    [(1 - 0.7 * (Math.min.apply(Math, valdMAD) / Math.min.apply(Math, valFC))), '#b39369'],
                    [(1 - 0.5 * (Math.min.apply(Math, valdMAD) / Math.min.apply(Math, valFC))), '#c9a473'],
                    [(1 - (Math.min.apply(Math, valPWP) / Math.min.apply(Math, valFC))), '#c9a473'],
                    [(1 - 0.9 * (Math.min.apply(Math, valPWP) / Math.min.apply(Math, valFC))), '#e3b87f'],
                    [(1 - 0.8 * (Math.min.apply(Math, valPWP) / Math.min.apply(Math, valFC))), '#e3b87f'],
                    [(1 - 0.7 * (Math.min.apply(Math, valPWP) / Math.min.apply(Math, valFC))), '#c79f69'],
                    [(1 - 0.5 * (Math.min.apply(Math, valPWP) / Math.min.apply(Math, valFC))), '#f7d4a6'],
                    [(1 - 0.2 * (Math.min.apply(Math, valPWP) / Math.min.apply(Math, valFC))), '#f7d4a6'],
                ]
            }
        },

        /*tooltip: {
            formatter: function () {
                $('#test').html(this.y + '%');
                return this.y;
            }
        },*/

        title: {
            text: soilwater_title,
            align: 'left',
            margin: 10,
            x: 0
        },

        xAxis: {
            //today
            events: {
                afterSetExtremes: function () {
                    var xMin = this.chart.xAxis[0].min;
                    var xMax = this.chart.xAxis[0].max;

                    chart2.xAxis[0].setExtremes(xMin, xMax);
                    chart3.xAxis[0].setExtremes(xMin, xMax);
                }
            },
            plotLines: [{ // mark the weekend
                color: '#9B9B9B',
                width: 1,
                value: new Date(date_harvest).getTime(),
            }],
            type: 'datetime',
            labels: {
                format: '{value:%b %e}'
            },
        },
        yAxis: {
            reversed: false,
            title: {
                text: '',
                max: 100,
                lineWidth: 0, //get rid of the 
                minorGridLineWidth: 0,
                lineColor: 'transparent',
                floor: 0,
                ceiling: 100
            },
            labels: {
                format: '{value} mm'
            },
            gridLineColor: 'transparent',
            min: Math.min.apply(Math, valPWP),
            startOnTick: true,

            //Allowable Depletion line     
            plotLines: [{
                value: Math.min.apply(Math, valdMAD),
                width: 3,
                color: '#ffc629',
                label: {
                    text: 'Management Allowable Depletion Line',
                    style: {
                        color: '#ffc629',
                    },
                    textAlign: 'left',
                    x: 320,
                    y: 15,
                },
            },

            //Permanent Wilting Point Line       
            {
                value: Math.min.apply(Math, valPWP),
                width: 3,
                color: '#ff4229',
                label: {
                    text: 'Permanent Wilting Point',
                    style: {
                        color: '#ff4229',
                    },
                    textAlign: 'left',
                    x: 380,
                    y: 15,
                },
            },

            //Field Capacity Line        
            {
                value: Math.min.apply(Math, valFC),
                width: 3,
                color: '#41d165',
                label: {
                    text: 'Field Capacity',
                    style: {
                        color: '#41d165',
                    },
                    textAlign: 'left',
                    x: 470,
                    y: -4,
                    rotation: 0
                },

            }
            ],

        },
        series: [{
            name: 'Current Soil Moisture Content',
            data: actualRAW_chartdata,
            //pointStart: new Date(date_data[0]),
            //pointInterval: 24 * 3600 * 1000 * 1,
            //zoneAxis: 'y',
            zones: [{
                value: Math.min.apply(Math, valPWP),
                dashStyle: 'dot'
            }, {
                value: Math.min.apply(Math, valdMAD),
                dashStyle: 'dot'
            }],
            color: {
                linearGradient: [0, 0, 0, 200],
                stops: [
                    [0, 'rgb(0, 118, 255)'],
                    [0.5, 'rgb(168, 235, 204)'],
                    [1, 'rgb(255, 89, 0)']
                ]
            }
        }],
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            //shared: true,
            useHTML: true
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
                }
            },
        },
        credits: {
            enabled: false
        },
    }, function (chart) {
        syncronizeCrossHairs(chart);
    });

    //Applied Water container
    chart2 = Highcharts.chart('appliedwaterChart', {
        chart: {
            type: 'line',
            marginLeft: 87,
            height: 250,
            zoomType: 'x',
        },
        title: {
            text: appliedwater_title,
            align: 'left',
            margin: 10,
            x: 0
        },
        xAxis: {
            //today
            events: {
                afterSetExtremes: function () {
                    var xMin = this.chart.xAxis[0].min;
                    var xMax = this.chart.xAxis[0].max;

                    chart1.xAxis[0].setExtremes(xMin, xMax);
                    chart2.xAxis[0].setExtremes(xMin, xMax);
                }
            },
            plotLines: [{ // mark the weekend
                color: '#9B9B9B',
                width: 1,
                value: new Date(date_harvest).getTime(),
            }],
            type: 'datetime',
            labels: {
                format: '{value:%b %e}'
            },
        },
        yAxis: {
            title:'',
            labels: {
                format: '{value} mm'
            },
        },
        plotOptions: {
            line: {
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                marker: {
                    enabled: false
                },
            },

        },
        series: [{
            name: 'Rainfall',
            color: '#47ceff',
            data: rain_chartdata,
            //pointStart: new Date(date_data[0]),
            //pointInterval: 24 * 3600 * 1000 * 1
        }, {
            name: 'Irrigation',
            color: '#8ccc64',
            data: irrig_chartdata,
            //pointStart: new Date(date_data[0]),
            //pointInterval: 24 * 3600 * 1000 * 1
        }],
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        credits: {
            enabled: false
        },

    }, function (chart) {
        syncronizeCrossHairs(chart);
    });

    //Growth Stage container
    chart3 = new Highcharts.chart('growthstageChart', {
        chart: {
            type: 'xrange',
            zoomType: 'x',
            marginLeft: 87,
            height: 200,
            resetZoomButton: {
                theme: {
                    fill: 'white',
                    stroke: '#4A90E2',
                    color: '#4A90E2',
                    r: 0,
                    states: {
                        hover: {
                            fill: '#4A90E2',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                }
            }
        },
        title: {
            text: xrange_title,
            align: 'left',
            margin: 10,
            x: 0
        },
        xAxis: {
            events: {
                afterSetExtremes: function () {
                    var xMin = this.chart.xAxis[0].min;
                    var xMax = this.chart.xAxis[0].max;

                    chart1.xAxis[0].setExtremes(xMin, xMax);
                    chart3.xAxis[0].setExtremes(xMin, xMax);
                }
            },
            type: 'datetime',
            labels: {
                format: '{value:%b %e}'
            },
            //maxPadding: 0.06,
            plotLines: [{ // mark the weekend
                color: '#9B9B9B',
                width: 1,
                value: new Date(date_harvest).getTime(),
            }],
        },
        yAxis:{
            categories: ['Stage'],
            title:{
                text: ''
            },
        },
        plotOptions: {
            xrange: {
                pointPlacement: "on"
            }
        },
        series: [{
            name: 'Plant Growth Stage',
            // pointPadding: 0,
            // groupPadding:
            borderColor: '#53c447',
            pointWidth: 18,
            data: growth_data,
            //pointStart: Date.UTC(2017, 6, 2),
            //pointInterval: 24 * 3600 * 1000 * 2,
            dataLabels: {
              enabled: true,
              //color: '#53c447',
            },
            maxPointWidth:20,
        }],
        tooltip: {
            formatter: function () {
                return  this.series.name + '<br> <b>' + this.point.stage + '</b>';
            }
        },
        credits: {
            enabled: false
        },
    }, function (chart) {
        syncronizeCrossHairs(chart);
    });

    //Evapotranspiration container
    chart4 = Highcharts.chart('etChart', {
        chart: {
            type: 'line',
            marginLeft: 87,
            height: 300,
            zoomType: 'x',
        },
        title: {
            text: et_title,
            align: 'left',
            margin: 10,
            x: 0
        },
        xAxis: {
            //today
            events: {
                afterSetExtremes: function () {
                    var xMin = this.chart.xAxis[0].min;
                    var xMax = this.chart.xAxis[0].max;

                    chart1.xAxis[0].setExtremes(xMin, xMax);
                    chart2.xAxis[0].setExtremes(xMin, xMax);
                }
            },
            plotLines: [{ // mark the weekend
                color: '#9B9B9B',
                width: 1,
                value: new Date(date_harvest).getTime(),
            }],
            type: 'datetime',
            labels: {
                format: '{value:%b %e}'
            },
        },
        yAxis: {
            title:'',
            labels: {
                format: '{value} mm'
            },
        },
        plotOptions: {
            line: {
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                marker: {
                    enabled: false
                },
            },

        },
        series: [{
            name: 'Reference ET',
            color: '#4797ff',
            data: eto_chartdata,
            //pointStart: new Date(date_data[0]),
            //pointInterval: 24 * 3600 * 1000 * 1
        }, {
            name: 'Actual ET',
            color: '#ffb753',
            data: actualet_chartdata,
            //pointStart: new Date(date_data[0]),
            //pointInterval: 24 * 3600 * 1000 * 1
        }],
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        credits: {
            enabled: false
        },

    }, function (chart) {
        syncronizeCrossHairs(chart);
    });

    (function () {
        var longestW = chart1.plotLeft;
        var charts = [chart1, chart2, chart3, chart4];
        Highcharts.each(charts, function (chart, i) {
            if (i < charts.length - 1 && charts[i].plotLeft < charts[i + 1].plotLeft) {
                longestW = charts[i + 1].plotLeft;
            }
        });
        Highcharts.each(charts, function (chart) {
            chart3.update({
                yAxis: {
                    labels: {
                        padding: 150
                    }
                }
            });
        });
    })();

}

/* For the dash change every time the a farm
is selected in the farm select input.
The url will request data from the server thru ajax and
receive it asynchronously */

var url,farmId;
$(document).ready(function () {
    //for farm details update in dashboard html
    $("#dash").change(function () {
        url = $("#farms").attr("data-farm-url");
        farmId = $(this).val();

        $.ajax({
            url: url,
            data: {
                'farm': farmId
            },
            success: function(data){
                $("#dataHolder").html(data);
                resetArrayHolder();
                dataHandler();
                calcData();
                iterateData();
                displayResults();
                renderHighchart();
            }
        });
    });

    //load dashboard initial values on page load
    url = $("#dash").attr("data-farm-url");
    farmId = $("#farms").val();

    $.ajax({
        url: url,
        data: {
            'farm': farmId
        },
        success: function (data) {
            $("#dataHolder").html(data);
            resetArrayHolder();
            dataHandler();
            calcData();
            iterateData();
            displayResults();
            renderHighchart();
        }
    });
});

window.onload = function () {
    resetArrayHolder();
    dataHandler();
    calcData();
    iterateData();
    displayResults();
    renderHighchart();
}