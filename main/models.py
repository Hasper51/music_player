from django.db import models

# Create your models here.
class Song(models.Model):
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    image = models.ImageField()
    audio_file = models.FileField()
    lyrics = models.TextField(null=True, blank=True)
    # duration = models.CharField(max_length=20)

    def __str__(self):
        return f'{self.title} | {self.artist}'

