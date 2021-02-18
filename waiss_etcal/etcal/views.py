from django.shortcuts import render, reverse, redirect
from django.http import HttpResponseRedirect, JsonResponse
from .models import Crop, Soil, Farm, Station, Data
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required
def index(request):
    return render(request, 'etcal/index.html')


def sign_up(request):
    user_form = UserCreationForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            user = user_form.save()
            login(request, user)
            return render(request, 'etcal/index.html')
    context = {
        "user_form" : user_form
    }
    return render(request, 'etcal/sign_up.html', context)


def database(request):
    return render(request, 'etcal/database.html')


def calculator(request):
    return render(request, 'etcal/calculator.html')


def get_started(request):
    crop_info = Crop.objects.all()
    soil_info = Soil.objects.all()
    station_info = Station.objects.all()

    if request.method == 'POST':
        #-----Farm Form-----#
        farm_name = request.POST["farm-name"]
        farm_prov = request.POST["farm-prov"]
        farm_muni = request.POST["farm-muni"]
        farm_brgy = request.POST["farm-brgy"]
        farm_lat = request.POST["farm-lat"]
        farm_long = request.POST["farm-long"]
        #-----Crop Form-----#
        crop_def = request.POST["crops"]
        crop_other = request.POST["crop-other"]
        crop_drz = request.POST["crop-drz"]
        crop_dtm = request.POST["crop-dtm"]
        stage_init = request.POST["stage-init"]
        stage_dev = request.POST["stage-dev"]
        stage_mid = request.POST["stage-mid"]
        stage_late = request.POST["stage-late"]
        kc_init = request.POST["kc-init"]
        kc_mid = request.POST["kc-mid"]
        kc_late = request.POST["kc-late"]
        #------Soil Form----#
        soil_def = request.POST["soils"]
        soil_other = request.POST["soil-other"]
        soil_fc = request.POST["soil-fc"]
        soil_pwp = request.POST["soil-pwp"]
        percolation = request.POST["soil-perc"]
        init_depl = request.POST["init-depl"]
        mad = request.POST["mad"]
        #------Station Form----#
        station_def = request.POST["stations"]
        station_other = request.POST["sta-name"]
        station_type = request.POST["sta-type"]
        station_elev = request.POST["sta-elev"]
        station_lat = request.POST["sta-lat"]
        station_long = request.POST["sta-long"]
        station_prov = request.POST["sta-prov"]
        station_muni = request.POST["sta-muni"]
        station_brgy = request.POST["sta-brgy"]
        #------Baseline Data----#
        dap = request.POST["dap"]
        corr_factor = request.POST["corr-factor"]
        date_measured = request.POST.getlist('date_measured[]')
        eto_data = request.POST.getlist('eto_data[]')
        rain_data = request.POST.getlist('rain_data[]')
        irrig_data = request.POST.getlist('irrig_data[]')

        # check if there are new inputs in crops, soils, stations
        if (crop_def == "") or (crop_def != "Other"):
            crop_type = crop_def
        elif (crop_other != "") and (crop_def == "Other"):
            crop_type = crop_other

        if (soil_def == "") or (soil_def != "Other"):
            soil_type = soil_def
        elif (soil_other != "") and (soil_def == "Other"):
            soil_type = soil_other

        if (station_def == "") or (station_def != "Other"):
            station_name = station_def
        elif (station_other != "") and (station_def == "Other"):
            station_name = station_other

        if (station_lat == "") or (station_long == ""):
            station_lat = None
            station_long = None

        if (farm_lat == "") or (farm_long == ""):
            farm_lat = None
            farm_long = None
        
        if (dap == "") or (corr_factor == ""):
            dap = None
            corr_factor = None

        # save to databases
        crop_data, created = Crop.objects.get_or_create(crop_type=crop_type, crop_drz=crop_drz, crop_dtm=crop_dtm, stage_init=stage_init,
                                                         stage_dev=stage_dev, stage_mid=stage_mid, stage_late=stage_late, kc_init=kc_init, kc_mid=kc_mid, kc_late=kc_late)
        crop_data.save()
        crop = Crop.objects.get(id=crop_data.id)

        soil_data, created = Soil.objects.get_or_create(
            soil_type=soil_type, soil_fc=soil_fc, soil_pwp=soil_pwp, percolation=percolation, init_depl=init_depl, mad=mad)
        soil_data.save()
        soil = Soil.objects.get(id=soil_data.id)

        station_data, created = Station.objects.get_or_create(station_name=station_name, station_type=station_type, station_elev=station_elev,
                                                              station_lat=station_lat, station_long=station_long, station_prov=station_prov, station_muni=station_muni, station_brgy=station_brgy)
        station_data.save()
        station = Station.objects.get(id=station_data.id)

        farm_data, created = Farm.objects.get_or_create(farm_name=farm_name, farm_prov=farm_prov, farm_muni=farm_muni, farm_brgy=farm_brgy,
                                                        farm_lat=farm_lat, farm_long=farm_long, date_planted=dap, crop=crop, soil=soil, corr_factor=corr_factor)
        farm_data.save()
        farm = Farm.objects.get(id=farm_data.id)

        if (date_measured != "") or (eto_data != "") or (rain_data != "") or (irrig_data != ""):
            for date, eto, rainfall, irrigation in zip(date_measured, eto_data, rain_data, irrig_data):
                if (date != "") and (eto != "") and ((rainfall == "") or (irrigation == "")):
                    rainfall = 0
                    irrigation = 0
                    data, created = Data.objects.get_or_create(
                        farm=farm, station=station, timestamp=date, eto=eto, rainfall=rainfall, irrigation=irrigation)
                    data.save()
            return HttpResponseRedirect(reverse('etcal:dashboard'))
        else:            
            return HttpResponseRedirect(reverse('etcal:dashboard'))

    context = {
        "crop_info": crop_info,
        "soil_info": soil_info,
        "station_info": station_info
    }
    return render(request, 'etcal/get-started.html', context)


def dashboard(request):
    return render(request, 'etcal/dashboard.html')


def contribute(request):
    return render(request, 'etcal/contribute.html')


def load_crop(request):
    crop_id = request.GET.get('crop')
    crops = Crop.objects.filter(crop_type=crop_id)

    context = {
        "crops": crops,
    }
    return render(request, 'etcal/load-crop.html', context)


def load_soil(request):
    soil_id = request.GET.get('soil')
    soils = Soil.objects.filter(soil_type=soil_id)

    context = {
        "soils": soils,
    }
    return render(request, 'etcal/load-soil.html', context)


def load_station(request):
    station_id = request.GET.get('station')
    stations = Station.objects.filter(station_name=station_id)

    context = {
        "stations": stations,
    }
    return render(request, 'etcal/load-station.html', context)
