from django.contrib import admin
from main.models import Song
# Register your models here.

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist')

