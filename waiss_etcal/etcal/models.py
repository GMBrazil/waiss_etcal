from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Crop(models.Model):
    crop_type = models.CharField(max_length=20, verbose_name="Crop", default=None)
    crop_drz = models.PositiveIntegerField(verbose_name="Depth of Root Zone (mm)", null=True)
    crop_dtm = models.PositiveIntegerField(verbose_name="Days to Maturity", null=True)
    stage_init = models.PositiveIntegerField(verbose_name="Stage init (days)", null=True)
    stage_dev = models.PositiveIntegerField(verbose_name="Stage dev (days)", null=True)
    stage_mid = models.PositiveIntegerField(verbose_name="Stage mid (days)", null=True)
    stage_late = models.PositiveIntegerField(verbose_name="Stage late (days)", null=True)
    kc_init = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Kc init", null=True)
    kc_mid = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Kc mid", null=True)
    kc_late = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Kc late", null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, default=None, null=True, blank=True)
    personal = models.BooleanField(default=True)
    reference = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.crop_type


class Soil(models.Model):
    soil_type = models.CharField(max_length=20, verbose_name="Soil", default=None)
    soil_fc = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Field Capacity (mm H2O/mm soil)", null=True)
    soil_pwp = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Permanent Wilting Point (mm H2O/mm soil)", null=True)
    percolation = models.DecimalField(max_digits=4, decimal_places=2, verbose_name="Percolation (mm)", null=True)
    init_depl = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Initial Depletion (mm)", null=True)
    mad = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Management Allowable Depletion (mm H2O/mm soil)", null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, default=None, null=True, blank=True)
    personal = models.BooleanField(default=True)
    reference = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.soil_type


class Farm(models.Model):
    manager = models.ForeignKey(User, on_delete=models.CASCADE, default=None, null=True, blank=True)
    farm_name = models.CharField(max_length=50, verbose_name="Farm Name", null=True)
    farm_prov = models.CharField(max_length=30, default=None, verbose_name="Province")
    farm_muni = models.CharField(max_length=30, default=None, verbose_name="Municipality")
    farm_brgy = models.CharField(max_length=30, default=None, verbose_name="Barangay")
    farm_lat = models.DecimalField(max_digits=10, decimal_places=7, verbose_name="Latitude (°)", null=True, blank=True)
    farm_long = models.DecimalField(max_digits=10, decimal_places=7, verbose_name="Longitude (°)", null=True, blank=True)
    date_planted = models.DateField(verbose_name='Planting Date', default=None, null=True)
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, default=None, null=True)
    soil = models.ForeignKey(Soil, on_delete=models.CASCADE, default=None, null=True)    
    corr_factor = models.DecimalField(max_digits=6, decimal_places=4, verbose_name="Correction Factor", null=True)

    def __str__(self):
        return self.farm_name


class Station(models.Model):
    station_type = models.CharField(max_length=20, null=True, verbose_name="Station Type")
    station_name = models.CharField(max_length=50, verbose_name="Station Name", null=True)
    station_elev = models.DecimalField(max_digits=4, decimal_places=2, verbose_name="Station Elevation (m)", null=True, blank=True)
    station_lat = models.DecimalField(max_digits=10, decimal_places=7, verbose_name="Latitude (°)", null=True)
    station_long = models.DecimalField(max_digits=10, decimal_places=7, verbose_name="Longitude (°)", null=True)
    station_prov = models.CharField(max_length=30, default=None, verbose_name="Province", null=True, blank=True)
    station_muni = models.CharField(max_length=30, default=None, verbose_name="Municipality", null=True, blank=True)
    station_brgy = models.CharField(max_length=30, default=None, verbose_name="Barangay", null=True, blank=True)

    def __str__(self):
        return self.station_name
    

class Data(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, default=None, null=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, default=None, null=True)
    timestamp = models.DateField(verbose_name='Date Measured', null=True)
    eto = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Reference Evapotranspiration (mm)", null=True)
    rainfall = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Rainfall (mm)", null=True)
    irrigation = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Irrigation (mm)", null=True)

    class Meta:
        get_latest_by = "timestamp"