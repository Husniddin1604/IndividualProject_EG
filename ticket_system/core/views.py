from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event, Ticket, Purchase
from .serializers import EventSerializer, TicketSerializer, PurchaseSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]  # Все могут видеть события

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.filter(is_sold=False)
    serializer_class = TicketSerializer
    permission_classes = [AllowAny]  # Все могут видеть доступные билеты

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def home(request):
    return render(request, 'core/home.html')