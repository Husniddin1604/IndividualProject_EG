from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.middleware.csrf import get_token
from core.models import Venue, Category, Organizer, Event, Ticket, Purchase, User
from core.serializers import (
    VenueSerializer, CategorySerializer, OrganizerSerializer,
    EventSerializer, TicketSerializer, PurchaseSerializer, UserSerializer
)
from rest_framework.pagination import PageNumberPagination

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_csrf_token(request):
    return Response({'csrfToken': get_token(request)})

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [AllowAny]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [AllowAny]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Event.objects.all()
        category = self.request.query_params.get('category')
        city = self.request.query_params.get('venue__city')
        date = self.request.query_params.get('date')
        status = self.request.query_params.get('status')
        if category:
            queryset = queryset.filter(categories__id=category)
        if city:
            queryset = queryset.filter(venue__city__icontains=city)
        if date:
            queryset = queryset.filter(date__date=date)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.filter(is_sold=False)
    serializer_class = TicketSerializer
    permission_classes = [AllowAny]

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

def home(request):
    events = Event.objects.filter(status='active').order_by('date')
    return render(request, 'core/home.html', {'events': events})