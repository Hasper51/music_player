from rest_framework import generics
from .models import Song
from .serializers import SongSerializer
from django.shortcuts import render, redirect
from .lyrics import get_lyrics

class SongListAPIView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class SongDetailAPIView(generics.RetrieveAPIView):
    queryset = Song.objects.all()
    
    serializer_class = SongSerializer


def index(request):
    return render(request, 'index.html')

def add_song(request):
    if request.method == 'POST':
        title = request.POST['title']
        artist = request.POST['artist']
        image = request.FILES['image']
        audio_file = request.FILES['audio_file']
        lyrics = get_lyrics(title, artist)
        song = Song(title=title, artist=artist, image=image, audio_file=audio_file, lyrics=lyrics)
        song.save()
        return redirect('index')
    return render(request, 'add_song.html')