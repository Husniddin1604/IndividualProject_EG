from rest_framework import serializers
from .models import Event, Ticket, Purchase

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'event', 'price', 'seat_number', 'is_sold', 'created_at']

class PurchaseSerializer(serializers.ModelSerializer):
    ticket = TicketSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'user', 'ticket', 'purchase_date', 'payment_status', 'payment_method']
        read_only_fields = ['user', 'purchase_date']