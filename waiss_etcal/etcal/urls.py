from django.contrib import admin
from django.urls import path, include
from . import views


app_name = 'etcal'

urlpatterns = [
    path('', views.index, name='index'),
    path('etcal/signup/', views.sign_up, name='sign_up'),
    path('database/', views.database, name='database'),
    path('calculator/', views.calculator, name='calculator'),
    path('getstarted/', views.get_started, name='get_started'),
    path('contribute/', views.contribute, name='contribute'),
    path('load/crop/', views.load_crop, name='load_crop'),
    path('load/soil/', views.load_soil, name='load_soil'),
    path('load/station/', views.load_station, name='load_station'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('load/dash/', views.load_dash, name='load_dash'),
    path('load/file/', views.load_file, name='load_file'),
    path('getstarted/upload/file', views.get_started_upload_file, name='get_started_upload_file'),
    path('add/data/', views.add_data, name='add_data'),
    path('add/farm/', views.add_farm, name='add_farm'),
    path('add/station/', views.add_station, name='add_station'),
    path('add/crop/', views.add_crop, name='add_crop'),
    path('add/soil/', views.add_soil, name='add_soil'),
]