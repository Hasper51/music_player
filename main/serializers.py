from rest_framework import serializers
from .models import Song


class SongSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'audio_file', 'image', 'lyrics']
