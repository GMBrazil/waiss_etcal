var date_planted, crop_dtm, crop_drz, stage_init, stage_dev, stage_mid, stage_late, kc_init, kc_mid, kc_late, mad, percolation, init_depl;
var date_data = [], eto_data = [], rain_data = [], irrig_data = [];
var DAP_js_converted, date_today, date_harvest, DAP_today, DOH_today;
var valDAP = [], valKc = [], valETc = [], valEFR = [], valRZWD = [], valSurplusWater = [], valDRZ = [], valFC = [], valPWP = [], valTAW = [], valRAW = [], valActualRAW = [], valPerc = [], valKs = [], valETcs = [], valCWR = [], valAveCWR = [], valDBI = [];
var valnegRZWD = [], valnegFC = [], valnegPWP = [], valnegRAW = [], valdMAD = [], valnegdMAD = [], valnegActualRAW = [], valdActualRAW = [];
var latest_index;
var valDBI_itr_1 = [], valKc_pred = [], valKc_multip = [], valETcs_pred = [], valSurplusDay_pred = [], valPerc_pred = [], valCWR_pred = [], valDBI_itr_2 = [], valDBI_itr_3 = [];
var valDAP_init = [], valDAP_dev = [], valDAP_mid = [], valDAP_late = [];
var date_data_init = [], date_data_dev = [], date_data_mid = [], date_data_late = [];

function dataHandler() {
    date_planted = '2021/1/11';
    crop_dtm = 80;
    crop_drz = 1000;
    stage_init = 20;
    stage_dev = 20;
    stage_mid = 30;
    stage_late = 10;
    stage_dev_cum = stage_init + stage_dev;
    stage_mid_cum = stage_dev_cum + stage_mid;
    stage_late_cum = crop_dtm;
    kc_init = 0.3;
    kc_mid = 1.15;
    kc_late = 1.05;
    soil_fc = 0.28;
    soil_pwp = 0.16;
    mad = 0.5;
    percolation = 2;
    init_depl = 0;
    date_data = ['2021/1/11', '2021/1/12', '2021/1/13', '2021/1/14', '2021/1/15', '2021/1/16', '2021/1/17', '2021/1/18',];
    eto_data = [4.33, 4.33, 4.36, 3.95, 3.9, 3.94, 3.86, 4.1];
    rain_data = [0, 0, 0, 0, 0, 0, 0, 0.1];
    irrig_data = [0, 0, 0, 0, 0, 0, 0, 0];
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
        valETc[i] = eto_data[i] * valKc[i];
        //Effective Rainfall
        if (rain_data[i] < (0.2 * eto_data[i])) {
            valEFR[i] = 0;
        }
        else {
            valEFR[i] = rain_data[i];
        }
        //Root Zone Water Deficit, RZWD        
        if (valDAP[i] == 0) {
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
        if (valDAP[i] == 0) {
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
    //alert("DAP="+valDAP + " Kc="+valKc+" ETc=" +valETc+" EFR="+valEFR+" RZWD="+valRZWD+" Surplus="+valSurplusWater+" DRZ="+valDRZ+" FC="+valFC+" PWP="+valPWP+" TAW="+valTAW+" RAW="+valRAW+" Actual RAW="+valActualRAW+ " Perc="+valPerc+" Ks="+valKs+" ETcs="+valETcs+" CWR="+valCWR+" DBI=" +valDBI);
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
    document.getElementById("dHarvest").textContent = date_harvest;
    //lastDataUpdate();
    soilWaterStatus();
    dayToIrrigate();
    irrigateWater();
}

/*function lastDataUpdate() {
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
}*/

function soilWaterStatus() {
    var threshold_level = 0.05;
    var critical_level = 0.5; //50% below MAD and above PWP
    var diffActualRAW;
    var currentMC, currentpercentMC, pathPercent;
    currentMC = (valFC[latest_index]-valdActualRAW[latest_index]);
    currentpercentMC = parseInt((currentMC)/valFC[latest_index]*100);
    pathPercent = (360-(360*currentpercentMC));
    document.getElementById("valCurrentMC").textContent = valdActualRAW[latest_index].toFixed(2) + "mm";
    document.getElementById("path-circle").style.strokeDashoffset = pathPercent;
    //>5% above FC level
    if (valdActualRAW[latest_index] > ((1 + threshold_level) * valFC[latest_index])) {
        document.getElementById("textActualRAW").textContent = "Sufficient";
        diffActualRAW = Math.round(valActualRAW[latest_index] - valFC[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm Above FC";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valdActualRAW[latest_index] + "mm" + " which is still at sufficient levels with " + diffActualRAW + "mm of soil moisture above field capacity.";
    }
    //(+/-)5% at FC level
    else if ((valdActualRAW[latest_index] <= ((1 + threshold_level) * valFC[latest_index])) && (valdActualRAW[latest_index] > ((1 - threshold_level) * valFC[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Sufficient";
        document.getElementById("valActualRAW").textContent = "At Field Capacity";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valdActualRAW[latest_index] + "mm" + " which is sufficient and is at field capacity level.";
    }
    //<5% below FC level and >5% above MAD level
    else if ((valdActualRAW[latest_index] <= ((1 - threshold_level) * valFC[latest_index])) && (valdActualRAW[latest_index] > ((1 + threshold_level) * valdMAD[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Sufficient";
        diffActualRAW = Math.round(valFC[latest_index] - valActualRAW[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm Below FC";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valdActualRAW[latest_index] + "mm" + " which is still at sufficient levels with " + diffActualRAW + "mm of soil moisture below field capacity.";
    }
    //(+/-)5% at MAD level
    else if ((valdActualRAW[latest_index] <= ((1 + threshold_level) * valdMAD[latest_index])) && (valdActualRAW[latest_index] > ((1 - threshold_level) * valdMAD[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Threshold Level";
        document.getElementById("valActualRAW").textContent = "Within 5% near MAD";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valdActualRAW[latest_index] + "mm" + " which is at threshold level or within 5% near management allowable depletion level.";
    }
    //<5% below MAD and >50% above PWP
    else if ((valdActualRAW[latest_index] <= ((1 - threshold_level) * valdMAD[latest_index])) && (valdActualRAW[latest_index] > ((1 + critical_level) * valPWP[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Water Stress";
        diffActualRAW = Math.round(valRAW[latest_index] - valActualRAW[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm Below MAD";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valdActualRAW[latest_index] + "mm" + " which is in water stress condition with " + diffActualRAW + "mm of soil moisture below management allowable depletion.";
    }
    //<50% above PWP and beyond
    else if ((valdActualRAW[latest_index] <= ((1 + critical_level) * valPWP[latest_index]))) {
        document.getElementById("textActualRAW").textContent = "Critical";
        diffActualRAW = Math.round(valActualRAW[latest_index] - valPWP[latest_index]);
        document.getElementById("valActualRAW").textContent = diffActualRAW + "mm near PWP";
        document.getElementById("textSoilWaterNote").textContent = "The current soil moisture content is " + valdActualRAW[latest_index] + "mm" + " which is in critical condition with" + diffActualRAW + "mm of soil moisture near permanent wilting point.";
    }
}

function dayToIrrigate() {
    //Date To Irrigate
    var days_bef_irrigate;
    if (valDBI_itr_1[latest_index] != "") {
        days_bef_irrigate = valDBI_itr_1[latest_index];
    }
    else {
        days_bef_irrigate = valDBI[latest_index];
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
}

function irrigateWater() {
    var valIrrigate = Math.round(valFC[latest_index] - valdActualRAW[latest_index]);
    var valpercentIrrigate = (valIrrigate)/valFC[latest_index] *100;
    document.getElementById("irrigate-progress").style.width = parseInt(valpercentIrrigate) + "%";
    if (valIrrigate > 0) {
        document.getElementById("valIrrigate").textContent = valIrrigate + "mm";
        document.getElementById("textIrrigate").textContent = "To reach Field Capacity";
        document.getElementById("textIrrigateNote").textContent = "The current soil moisture content is " + valpercentIrrigate + "%. " + "To reach field capacity, " + valIrrigate + "mm of water is needed.";
    }
    else {
        valIrrigate = 0;
        document.getElementById("valIrrigate").textContent = valIrrigate + "mm";
        document.getElementById("textIrrigate").textContent = "Still Above Field Capacity";
        document.getElementById("textIrrigateNote").textContent = "The current soil moisture content is " + valpercentIrrigate + "% and is still above field capacity. No irrigation is needed.";
    }

}

function resetArrayHolder() {
    date_data = []; eto_data = []; rain_data = []; irrig_data = [];
    valDAP = []; valKc = []; valETc = []; valEFR = []; valRZWD = []; valSurplusWater = []; valDRZ = []; valFC = []; valPWP = []; valTAW = []; valRAW = []; valActualRAW = []; valPerc = []; valKs = []; valETcs = []; valCWR = []; valAveCWR = []; valDBI = [];
    valnegRZWD = []; valnegFC = []; valnegPWP = []; valnegRAW = []; valdMAD = []; valnegdMAD = []; valnegActualRAW = []; valdActualRAW = [];
    valDBI_itr_1 = []; valKc_pred = []; valKc_multip = []; valETcs_pred = []; valSurplusDay_pred = []; valPerc_pred = []; valCWR_pred = []; valDBI_itr_2 = []; valDBI_itr_3 = [];
    valDAP_init = [], valDAP_dev = [], valDAP_mid = [], valDAP_late = [];
}

function renderChart() {
    //Charts for Results in dashboard.html
    var chartResults = Highcharts.chart({
        chart: {
            renderTo: 'scriptChart',
            type: 'column'
        },
        title: {
            text: 'Water Deficit'
        },
        xAxis: {
            categories: date_data,
            crosshair: true
        },
        yAxis: [{//Threshold Values
            title: {
                text: 'Amount of Water (mm)'
            },
            tickInterval: 10,
        },/*{//Deficit Values
        title: {
            text: 'Deficit/Surplus Water (mm)'
        },
        opposite: true,
        //startOnTick: true,
        //minPadding: 65.52,
        tickInterval:10,
    }*/],
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            spline: {
                stacking: 'normal',
            },
            areaspline: {
                stacking: 'normal',
            },
            series: {

            }
        },
        series: [{
            type: 'areaspline',
            name: 'Root Zone Deficit',
            //yAxis: 1,
            data: valnegRZWD,
            marker: {
                enabled: true
            },
            stack: 1,
            //opacity:0.5,
            //color: "mediumseagreen",
            color: "tomato",
            label: {
                style: {
                    //color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        },
        {
            type: 'areaspline',
            name: 'Field Capacity',
            data: valFC,
            //dashStyle: 'dash',
            marker: {
                enabled: false
            },
            color: '#64E572',
            stack: 1,
            opacity: 0.7,
            label: {
                enabled: false,
                style: {
                    color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        },
        {
            type: 'areaspline',
            name: 'Actual Readily Available Water',
            //yAxis: 1,
            data: valActualRAW,
            marker: {
                enabled: true
            },
            color: "mediumturquoise",
            //opacity:0.7,
            stack: 2,
            label: {
                style: {
                    //color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        },
        {
            type: 'areaspline',
            name: 'Management Allowable Depletion',
            data: valRAW,
            //dashStyle: 'dash',
            marker: {
                enabled: false
            },
            color: '#FFF263',
            stack: 2,
            //opacity:0.7,
            label: {
                enabled: false,
                style: {
                    color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        },
        {
            type: 'areaspline',
            name: 'Permanent Wilting Point',
            data: valPWP,
            //dashStyle: 'dash',
            marker: {
                enabled: false
            },
            color: '#FF9655',
            stack: 2,
            //opacity:0.7,
            label: {
                enabled: false,
                style: {
                    color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        },
        {
            type: 'spline',
            name: 'Current Soil Water Depth',
            data: valdActualRAW,
            //dashStyle: 'dash',
            marker: {
                enabled: true
            },
            color: 'black',
            //opacity:0.7,
            label: {
                enabled: true,
                style: {
                    //color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        },
        {
            type: 'column',
            name: 'Rainfall',
            //yAxis: 1,
            data: rain_data,
            marker: {
                enabled: false
            },
            color: '#1D5293',
            label: {
                enabled: false,
                style: {
                    color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        },
        {
            type: 'column',
            name: 'Irrigation',
            //yAxis: 1,
            data: irrig_data,
            marker: {
                enabled: false
            },
            color: '#9E9E9E',
            label: {
                enabled: false,
                style: {
                    color: "black"
                },
                onArea: false,
                //connectorAllowed: true,
            }
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1126
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    }
                }
            }]
        },
        credits: {
            enabled: false
        },
    });
}

function renderChart2() {

    var charts = [];
    var init_stage_points = [], dev_stage_points = [], mid_stage_points = [], late_stage_points = [];
    var rain_points = [], irrig_points = [], rzwd_points = [], fc_base_points = [], fc_range_points = [], actualRAW_points = [], actualRAW_base_points = [], mad_base_points = [], mad_range_points = [], pwp_points = [];
    addDataPoints();
    var axisX = {
        labelFormatter: function () { return ""; },
        tickLength: 0,
        lineThickness: 0
    },
        axisY = {
            labelFormatter: function () { return ""; },
            tickLength: 0,
            gridThickness: 0,
        };

    var weatherForecast = {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: "New Users",
            fontSize: 18,
            verticalAlign: "bottom"
        },
        axisX: axisX,
        axisY: axisY,
        data: [{
            type: "splineArea", //change type to bar, line, area, pie, etc
            markerSize: 0,
            dataPoints: [
                { x: new Date(2018, 00, 01), y: 74553 },
                { x: new Date(2018, 01, 01), y: 75374 },
                { x: new Date(2018, 02, 01), y: 76065 },
                { x: new Date(2018, 03, 01), y: 76521 },
                { x: new Date(2018, 04, 01), y: 76695 },
                { x: new Date(2018, 05, 01), y: 76381 },
                { x: new Date(2018, 06, 01), y: 76693 },
                { x: new Date(2018, 07, 01), y: 75624 },
                { x: new Date(2018, 08, 01), y: 76367 },
                { x: new Date(2018, 09, 01), y: 75426 },
                { x: new Date(2018, 10, 01), y: 76024 },
                { x: new Date(2018, 11, 01), y: 75960 }
            ]
        }]
    }
    var plantGrowth = {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: "Bounce Rate",
            fontSize: 18,
            verticalAlign: "bottom"
        },
        axisX: axisX,
        axisY: axisY,
        data: [{
            type: "splineArea", //change type to bar, line, area, pie, etc
            markerSize: 0,
            yValueFormatString: "#.##%",
            dataPoints: [
                { x: new Date(2018, 00, 01), y: 0.4731 },
                { x: new Date(2018, 01, 01), y: 0.4743 },
                { x: new Date(2018, 02, 01), y: 0.4760 },
                { x: new Date(2018, 03, 01), y: 0.4751 },
                { x: new Date(2018, 04, 01), y: 0.4757 },
                { x: new Date(2018, 05, 01), y: 0.4761 },
                { x: new Date(2018, 06, 01), y: 0.4768 },
                { x: new Date(2018, 07, 01), y: 0.4771 },
                { x: new Date(2018, 08, 01), y: 0.4773 },
                { x: new Date(2018, 09, 01), y: 0.4764 },
                { x: new Date(2018, 10, 01), y: 0.4757 },
                { x: new Date(2018, 11, 01), y: 0.4751 }
            ]
        }]
    }

    var growthStage = {
        animationEnabled: true,
        theme: "light2",
        title: {
            //text: "Growth Stage",
            fontSize: 18,
            verticalAlign: "bottom"
        },
        //axisX: axisX,
        axisY: {
            minimum: (new Date(date_data[0])).getTime(),
            maximum: (new Date(date_data[date_data.length - 1])).getTime()
        },
        legend: {
            itemWidth: 150,
            horizontalAlign: "right",
            verticalAlign: "center",
            cursor: "pointer",
            itemmouseover: function (e) {
                e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness * 2;
                e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize + 2;
                e.chart.render();
            },
            itemmouseout: function (e) {
                e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness / 2;
                e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize - 2;
                e.chart.render();
            },
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
        },
        data: [{
            type: "rangeBar", //change type to bar, line, area, pie, etc
            name: "Initial Stage",
            showInLegend: "true",
            yValueFormatString: "#0.## DAP",
            markerSize: 0,
            //dataPoints: init_stage_points
            dataPoints: [{
                x: 1,
                //label: "Initial Stage",
                y: [(new Date(date_data[0])).getTime(), (new Date(date_data[valDAP_init.length - 1])).getTime()]
            },
            {
                x: 1,
                //label: "Developmental Stage",
                y: [(new Date(date_data[valDAP_init.length + 1])).getTime(), (new Date(date_data[valDAP_dev.length - 1])).getTime()]
            },
            {
                x: 1,
                //label: "Mid-Season",
                y: [(new Date(date_data[valDAP_dev.length + 1])).getTime(), (new Date(date_data[valDAP_mid.length - 1])).getTime()]
            },
            {
                x: 1,
                //label: "Late Season",
                y: [(new Date(date_data[valDAP_mid.length + 1])).getTime(), (new Date(date_data[valDAP_late.length - 1])).getTime()]
            },
            ]
        }/*,
        {
            type: "stackedBar", //change type to bar, line, area, pie, etc
            name: "Developmental Stage",
            showInLegend: "true",
            yValueFormatString: "#0.## DAP",
            markerSize: 0,
            //dataPoints: dev_stage_points
            dataPoints : [{
                x: 1,
                y: (new Date(date_data[valDAP_dev.length-1]))
            }]
        },
        {
            type: "stackedBar", //change type to bar, line, area, pie, etc
            name: "Mid-Season",
            showInLegend: "true",
            yValueFormatString: "#0.## DAP",
            markerSize: 0,
            //dataPoints: mid_stage_points
            dataPoints : [{
                x: 1,
                y: (new Date(date_data[valDAP_mid.length-1]))
            }]
        },
        {
            type: "stackedBar", //change type to bar, line, area, pie, etc
            name: "Late Season",
            showInLegend: "true",
            yValueFormatString: "#0.## DAP",
            markerSize: 0,
            //dataPoints: late_stage_points
            dataPoints: [{
                x: 1,
                y: (new Date(date_data[valDAP_late.length-1]))
            }]
        }*/]
    }

    var soilCondition = {
        animationEnabled: true,
        //theme: "light2",
        title: {
            text: "",
            //text: "Soil Condition",
            fontSize: 18,
            verticalAlign: "bottom"
        },
        axisX: axisY,
        axisY: {
            minimum: Math.min.apply(Math, valPWP),
            labelFormatter: addSymbols,
            title: "Soil Water (mm)",
            //includeZero: true
        },
        axisY2: {
            minimum: Math.min.apply(Math, valPWP),
            lineThickness: 0,
            tickLength: 0,
            labelFormatter: function (e) {
                return "";
            }
        },
        legend: {
            itemWidth: 150,
            horizontalAlign: "right",
            verticalAlign: "center",
            cursor: "pointer",
            itemmouseover: function (e) {
                e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness * 2;
                e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize + 2;
                e.chart.render();
            },
            itemmouseout: function (e) {
                e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness / 2;
                e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize - 2;
                e.chart.render();
            },
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
        },
        data: [//to preserve same intervals in charts, separate charts for two stacked areas
            {
                type: "rangeArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Sufficient Water Range",
                showInLegend: true,
                yValueFormatString: "#0.## mm - Sufficient Water Range",
                dataPoints: fc_range_points,
                color: "#33cc33",
                fillOpacity: 0.3
            },
            {
                type: "stackedArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Field Capacity",
                showInLegend: true,
                yValueFormatString: "#0.## mm - Field Capacity",
                dataPoints: fc_base_points,
                color: "#00cc00",
                fillOpacity: 0,
            },
            {
                type: "stackedArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Root Zone Deficit",
                showInLegend: true,
                //yValueFormatString: "#0.## mm - Root Zone Deficit",
                dataPoints: rzwd_points,
                color: "#999966",
                fillOpacity: 0.3
            },
            {
                type: "rangeArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Wilting Range",
                showInLegend: true,
                yValueFormatString: "#0.## mm - Wilting Range",
                dataPoints: mad_range_points,
                color: "#666633",
                fillOpacity: 0.5
            },
            {
                type: "line", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Management Allowable Depletion",
                showInLegend: true,
                yValueFormatString: "#0.## mm - Management Allowable Depletion",
                dataPoints: mad_base_points,
                color: "#ff6600"
            },
            {
                type: "splineArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Permanent Wilting Point",
                showInLegend: true,
                yValueFormatString: "#0.## mm - Permanent Wilting Point",
                dataPoints: pwp_points,
                color: "#cc0000"
            },
            {
                type: "rangeArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Sufficient Water Range",
                axisYType: "secondary",
                //showInLegend: true,
                //yValueFormatString: "#0.## mm - Sufficient Water Range",
                dataPoints: fc_range_points,
                color: "#33cc33",
                fillOpacity: 0
            },
            {
                type: "stackedArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Management Allowable Depletion Base Area",
                axisYType: "secondary",
                //showInLegend: true,
                //yValueFormatString: "#0.## mm",
                dataPoints: mad_base_points,
                color: "#ff9900",
                fillOpacity: 0
            },
            {
                type: "stackedArea", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Actual Readily Available Water",
                axisYType: "secondary",
                showInLegend: true,
                yValueFormatString: "#0.## mm - Actual Readily Available Water",
                dataPoints: actualRAW_points,
                color: "#00cc66",
                fillOpacity: 0.7
            },
            {
                type: "spline", //change type to bar, line, area, pie, etc
                markerSize: 0,
                name: "Current Soil Water Line",
                showInLegend: true,
                yValueFormatString: "#0.## mm - Current Soil Water",
                dataPoints: actualRAW_base_points,
                color: "#006699",
                fillOpacity: 1
            },
        ]
    }

    var appliedWater = {
        animationEnabled: true,
        //theme: "light2", // "light1", "light2", "dark1", "dark2"
        title: {
            text: " "
            //text: "Profile of Farm Status"
        },
        axisY: {
            labelFormatter: addSymbols,
            title: "Applied Water (mm)",
            includeZero: true
        },
        legend: {
            itemWidth: 150,
            horizontalAlign: "right",
            verticalAlign: "center",
            cursor: "pointer",
            itemmouseover: function (e) {
                e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness * 2;
                e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize + 2;
                e.chart.render();
            },
            itemmouseout: function (e) {
                e.dataSeries.lineThickness = e.chart.data[e.dataSeriesIndex].lineThickness / 2;
                e.dataSeries.markerSize = e.chart.data[e.dataSeriesIndex].markerSize - 2;
                e.chart.render();
            },
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
        },
        data: [{
            type: "column", //change type to bar, line, area, pie, etc
            name: "Rainfall",
            showInLegend: true,
            yValueFormatString: "#0.## mm - Rainfall",
            dataPoints: rain_points
        },
        {
            type: "column", //change type to bar, line, area, pie, etc
            name: "Irrigation",
            showInLegend: true,
            yValueFormatString: "#0.## mm - Irrigation",
            dataPoints: irrig_points
        }]
    };


    charts.push(new CanvasJS.Chart("appliedWaterChart", appliedWater));
    charts.push(new CanvasJS.Chart("soilConditionChart", soilCondition));
    charts.push(new CanvasJS.Chart("growthStageChart", growthStage));
    syncTooltip(charts);

    for (var i = 0; i < charts.length; i++) {
        charts[i].render();
    }

    function syncTooltip(charts) {

        if (!this.onToolTipUpdated) {
            this.onToolTipUpdated = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].toolTip.showAtX(e.entries[0].xValue);
                }
            }
        }

        if (!this.onToolTipHidden) {
            this.onToolTipHidden = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].toolTip.hide();
                }
            }
        }

        for (var i = 0; i < charts.length; i++) {
            if (!charts[i].options.toolTip)
                charts[i].options.toolTip = {};

            charts[i].options.toolTip.updated = this.onToolTipUpdated;
            charts[i].options.toolTip.hidden = this.onToolTipHidden;
        }
    }

    function addSymbols(e) {
        var suffixes = ["", "K", "M", "B"];

        var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
        if (order > suffixes.length - 1)
            order = suffixes.length - 1;

        var suffix = suffixes[order];
        return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
    }


    function parseDataPoints(point_handler, x_array, y_array) {
        var index = 0;
        for (var i = index; i < x_array.length; i++) {
            point_handler.push({
                x: new Date(x_array[i]),
                y: y_array[i]
            });
        }
    }

    function parseDataPoints2(point_handler, x_array, y_array, y_array_1) {
        var index = 0;
        for (var i = index; i < x_array.length; i++) {
            point_handler.push({
                x: new Date(x_array[i]),
                y: [y_array[i], y_array_1[i]]
            });
        }
    }

    function parseDataPoints3(point_handler, x_array_val, y_array) {
        for (var i = 0; i < y_array.length; i++) {
            point_handler.push({
                x: x_array_val,
                y: y_array[i]
            });
        }
    }

    function addDataPoints() {
        parseDataPoints3(init_stage_points, 1, valDAP_init);
        parseDataPoints3(dev_stage_points, 1, valDAP_dev);
        parseDataPoints3(mid_stage_points, 1, valDAP_mid);
        parseDataPoints3(late_stage_points, 1, valDAP_late);
        //parseDataPoints3(date_data, init_stage_points, 10, date_data);
        parseDataPoints(rain_points, date_data, rain_data);
        parseDataPoints(irrig_points, date_data, irrig_data);
        parseDataPoints(rzwd_points, date_data, valnegRZWD);
        parseDataPoints(fc_base_points, date_data, valFC);
        parseDataPoints2(fc_range_points, date_data, valFC, valdMAD);
        parseDataPoints(actualRAW_points, date_data, valActualRAW);
        parseDataPoints(actualRAW_base_points, date_data, valdActualRAW);
        parseDataPoints(mad_base_points, date_data, valdMAD);
        parseDataPoints2(mad_range_points, date_data, valdMAD, valPWP);
        parseDataPoints(pwp_points, date_data, valPWP);
    }

}

function renderChart3() {
    var weatherForecast = Highcharts.chart({
        chart: {
            renderTo: 'weatherForecastChart',
            height: (1 / 20 * 100) + '%' // 40:9 ratio
        },
        title: {
            text: null
        },
        xAxis: {
            categories: date_data,
            crosshair: true,
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            visible: false
        },
        yAxis: [{
            title: {
                text: 'Weather Forecast'
            },
            tickInterval: 10,
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            minorGridLineWidth: 0,
        }],
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            spline: {
                stacking: 'normal',
            },
            areaspline: {
                stacking: 'normal',
            },
            series: {

            }
        },
        series: [{
            type: 'scatter',
            name: 'Weather Forecast',
            data: [{
                y: 0,
                marker: {
                    symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom'
                }
            },
            {
                y: 0,
                marker: {
                    symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom',
                }
            },
            {
                y: 0,
                marker: {
                    symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom'
                }
            },
            {
                y: 0,
                marker: {
                    symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom',
                }
            },
            {
                y: 0,
                marker: {
                    symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom',
                }
            },
            {
                y: 0,
                marker: {
                    symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom',
                }
            },
            {
                y: 0,
                marker: {
                    symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom',
                }
            }]
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1126
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    }
                }
            }]
        },
        credits: {
            enabled: false
        }
    });
    var plantGrowth = Highcharts.chart({
        chart: {
            renderTo: 'plantGrowthChart',
            height: (1 / 15 * 100) + '%' // 40:9 ratio
        },
        title: {
            text: null
        },
        xAxis: {
            categories: date_data,
            crosshair: true,
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            visible: false
        },
        yAxis: [{
            title: {
                text: 'Plant Growth'
            },
            tickInterval: 10,
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            minorGridLineWidth: 0
        }],
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            spline: {
                stacking: 'normal',
            },
            areaspline: {
                stacking: 'normal',
            },
            series: {

            }
        },
        series: [{
            type: 'scatter',
            name: 'Plant Growth',
            data: [{
                y: 1,
                marker: {
                    symbol: 'url(https://www.clipartmax.com/png/middle/182-1824876_soil-clipart-flower-growth-seedling-clipart.png)',
                    height: 50,
                    width: 50,
                    align: 'bottom'
                }
            },
            {
                y: 1.2,
                marker: {
                    symbol: 'url(https://www.clipartmax.com/png/middle/182-1824876_soil-clipart-flower-growth-seedling-clipart.png)',
                    height: 60,
                    width: 60,
                    align: 'bottom',
                }
            },
            {
                y: 1.4,
                marker: {
                    symbol: 'url(https://www.clipartmax.com/png/middle/182-1824876_soil-clipart-flower-growth-seedling-clipart.png)',
                    height: 70,
                    width: 70,
                    align: 'bottom'
                }
            },
            {
                y: 1.4,
                marker: {
                    symbol: 'url(https://www.clipartmax.com/png/middle/182-1824876_soil-clipart-flower-growth-seedling-clipart.png)',
                    height: 70,
                    width: 70,
                    align: 'bottom'
                }
            },
            {
                y: 1.4,
                marker: {
                    symbol: 'url(https://www.clipartmax.com/png/middle/182-1824876_soil-clipart-flower-growth-seedling-clipart.png)',
                    height: 70,
                    width: 70,
                    align: 'bottom'
                }
            },
            {
                y: 1.4,
                marker: {
                    symbol: 'url(https://www.clipartmax.com/png/middle/182-1824876_soil-clipart-flower-growth-seedling-clipart.png)',
                    height: 70,
                    width: 70,
                    align: 'bottom'
                }
            },
            {
                y: 1.4,
                marker: {
                    symbol: 'url(https://www.clipartmax.com/png/middle/182-1824876_soil-clipart-flower-growth-seedling-clipart.png)',
                    height: 70,
                    width: 70,
                    align: 'bottom'
                }
            }]
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1126
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    }
                }
            }]
        },
        credits: {
            enabled: false
        }
    });
    var growthStage = Highcharts.chart({
        chart: {
            renderTo: 'growthStageChart',
            height: (1 / 15 * 100) + '%' // 40:9 ratio
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'datetime',
            visible: false
        },
        yAxis: {
            title: {
                text: 'Growth Stage'
            },
            tickInterval: 10,
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            categories: ['Growth']
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        plotOptions: {
            xrange: {
                dataLabels: {
                    enabled: true,
                    inside: true,
                    style: {
                        color: '#FFFFFF',
                        textOutline: 'none'
                    }
                }
            },
            scatter: {
                dataLabels: {
                    shape: 'callout',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    style: {
                        color: '#FFFFFF',
                        textOutline: 'none'
                    },
                    format: 'Harvest Day',
                }
            }
        },
        series: [{
            name: 'Initial Stage',
            type: 'xrange',
            pointWidth: 50,
            data: [{
                x: new Date(date_data_init[0]).getTime(),
                x2: new Date(date_data_init[date_data_init.length - 1]).getTime(),
                y: 0
            }],
            dataLabels: {
                formatter: function () {
                    return 'Initial Stage'
                },
            }
        },
        {
            name: 'Developmental Stage',
            type: 'xrange',
            pointWidth: 50,
            data: [{
                x: new Date(date_data_dev[0]).getTime(),
                x2: new Date(date_data_dev[date_data_dev.length - 1]).getTime(),
                y: 0
            }],
            dataLabels: {
                formatter: function () {
                    return 'Developmental'
                },
            }
        },
        {
            name: 'Mid-Season Stage',
            type: 'xrange',
            pointWidth: 50,
            data: [{
                x: new Date(date_data_mid[0]).getTime(),
                x2: new Date(date_data_mid[date_data_mid.length - 1]).getTime(),
                y: 0
            }],
            dataLabels: {
                formatter: function () {
                    return 'Mid-Season'
                },
            }
        },
        {
            name: 'Late Season Stage',
            type: 'xrange',
            pointWidth: 50,
            data: [{
                x: new Date(date_data_late[0]).getTime(),
                x2: new Date(date_data_late[date_data_late.length - 1]).getTime(),
                y: 0
            }],
            dataLabels: {
                formatter: function () {
                    return 'Late Season'
                },
            }
        },
        ],
        credits: {
            enabled: false
        },
    });
    /*var soilCondition = Highcharts.chart({
        chart: {
            renderTo: 'soilConditionChart',
            height: (1 / 5 * 100) + '%', // 40:9 ratio
            events: {
                load: function () {
                    this.series[0].update({
                        //visible: false
                    });
                }
            }
        },
        title: {
            text: null
        },
        xAxis: {
            categories: date_data,
            crosshair: true,
            visible: false
        },
        yAxis: [{
            title: {
                text: 'Soil Water Condition (mm)'
            },
            tickInterval: 10,
            min: Math.min.apply(Math, valPWP),
            startOnTick: false,
        }],
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            spline: {
                stacking: 'normal',
            },
            areaspline: {
                stacking: 'normal',
                marker: {
                    enabled: false
                }
            },
        },
        series: [{
            type: 'areaspline',
            name: 'Root Zone Deficit',
            data: valnegRZWD,
            stack: 1,
            color: 'rgb(218, 142, 150)',
        },
        {
            type: 'areaspline',
            name: 'Field Capacity',
            data: valFC,
            stack: 1,
            opacity: 0.7,
            color: '#00cc00',
        },
        {
            type: 'areaspline',
            name: 'Actual Readily Available Water',
            data: valActualRAW,
            stack: 2,
            color: '#36adb9'
        },
        {
            type: 'areaspline',
            name: 'Management Allowable Depletion',
            data: valdMAD,
            stack: 2,
            color: '#ffad47'
        },
        {
            type: 'spline',
            name: 'Permanent Wilting Point',
            data: valPWP,
            stack: 2,
            color: '#cc0000'
        },
        {
            type: 'spline',
            name: 'Current Soil Water Depth',
            data: valdActualRAW,
            color: 'hsl(0, 0%, 37%)'
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1126
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    }
                }
            }]
        },
        credits: {
            enabled: false
        },
    });*/
    
    function addPlotBand(){
        var array =[];
        array = valFC;
        var startPoints = [], endPoints = [], plotBands = [], i=0;
        for (i=0; i<array.length; i++){
            if (i!=array.length-1){
                startPoints.push(array[i]);
            }
            if (i!=0){
                endPoints.push(array[i]);
            }
        }
        while (i < array.length){
            plotBands.push({
                from: startPoints[i],
                to: endPoints[i],
            });
            i++;
        }
        alert(plotBands);
    }
    var soilCondition2 = Highcharts.chart({
        chart: {
            renderTo: 'soilConditionChart',
            height: (1 / 5 * 100) + '%', // 40:9 ratio
            events: {
                load: function () {
                    this.series[0].update({
                        //visible: false
                    });
                }
            }
        },
        title: {
            text: null
        },
        xAxis: {
            categories: date_data,
            crosshair: true,
            visible: false
        },
        yAxis: [{
            title: {
                text: 'Soil Water Condition (mm)'
            },
            tickInterval: 10,
            min: Math.min.apply(Math, valPWP),
            startOnTick: false,
            plotBands: addPlotBand
        }],
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            spline: {
                stacking: 'normal',
            },
            areaspline: {
                stacking: 'normal',
                marker: {
                    enabled: false
                }
            },
        },
        series: [{
            type: 'areaspline',
            name: 'Root Zone Deficit',
            data: valnegRZWD,
            stack: 1,
            color: 'rgb(218, 142, 150)',
        },
        {
            type: 'areaspline',
            name: 'Field Capacity',
            data: valFC,
            stack: 1,
            opacity: 0.7,
            color: '#00cc00',
        },
        {
            type: 'areaspline',
            name: 'Actual Readily Available Water',
            data: valActualRAW,
            stack: 2,
            color: '#36adb9'
        },
        {
            type: 'areaspline',
            name: 'Management Allowable Depletion',
            data: valdMAD,
            stack: 2,
            color: '#ffad47'
        },
        {
            type: 'spline',
            name: 'Permanent Wilting Point',
            data: valPWP,
            stack: 2,
            color: '#cc0000'
        },
        {
            type: 'spline',
            name: 'Current Soil Water Depth',
            data: valdActualRAW,
            color: 'hsl(0, 0%, 37%)'
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1126
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    }
                }
            }]
        },
        credits: {
            enabled: false
        },
    });
    var appliedWater = Highcharts.chart({
        chart: {
            renderTo: 'appliedWaterChart',
            type: 'column',
            height: (1 / 7 * 100) + '%' // 40:9 ratio
        },
        title: {
            text: null
        },
        xAxis: {
            categories: date_data,
            crosshair: true
        },
        yAxis: [{
            title: {
                text: 'Applied Water (mm)'
            },
            tickInterval: 10
        }],
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            spline: {
                stacking: 'normal',
            },
            areaspline: {
                stacking: 'normal',
            },
        },
        series: [{
            type: 'column',
            name: 'Rainfall',
            data: rain_data
        },
        {
            type: 'column',
            name: 'Irrigation',
            data: irrig_data
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 1126
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    }
                }
            }]
        },
        credits: {
            enabled: false
        },
    });
}

window.onload = function () {
    resetArrayHolder();
    dataHandler();
    calcData();
    iterateData();
    displayResults();
    //renderChart();
    //renderChart2();
    //renderChart3();
}
