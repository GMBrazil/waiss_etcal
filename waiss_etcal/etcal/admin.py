from django.contrib import admin
from .models import Crop, Soil, Farm, Station, Data

# Register your models here.

class DataInline(admin.TabularInline):
    model = Data
    extra = 0
    fields = ['timestamp', 'eto', 'rainfall', 'irrigation']


class FarmAdmin(admin.ModelAdmin):
    list_display = ('farm_name', 'manager', 'date_planted', 'crop', 'soil')
    ordering = ["farm_name"]
    inlines = [DataInline,]

admin.site.register(Crop)
admin.site.register(Soil)
admin.site.register(Farm, FarmAdmin)
admin.site.register(Station)
admin.site.register(Data)