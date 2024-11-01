from django.urls import path
from . import views

urlpatterns = [
    # URL для API будет использоваться как ранее
    path('api/songs/', views.SongListAPIView.as_view(), name='song-list'),
    path('api/songs/<int:pk>/', views.SongDetailAPIView.as_view(), name='song-detail'),
    
    # Новый URL для HTML-страницы плеера
    
    path('', views.index, name='index'),
    path('add_song/', views.add_song, name='add_song'),
    
]
