from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('verify-session/', views.verify_session, name='verify-session'),
    path('profile/', views.get_user_profile, name='get_user_profile'),
]