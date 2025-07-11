"""
URL configuration for ticket_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from core import views
from core.views import home
from django.views.i18n import set_language
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Ticket System API",
        default_version='v1',
        description="API for Ticket System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@ticketsystem.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register(r'venues', views.VenueViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'organizers', views.OrganizerViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'tickets', views.TicketViewSet)
router.register(r'purchases', views.PurchaseViewSet)

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/core/', include('core.urls')),  # Подключаем core/urls.py
    path('api/register/', views.register, name='register'),
    path('api/get-csrf/', views.get_csrf_token, name='get_csrf_token'),
    path('i18n/setlang/', set_language, name='set_language'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)