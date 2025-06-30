from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from core.models import User, Venue, Category, Organizer, Event, Ticket, Purchase

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 
                 'phone_number', 'address', 'preferred_language', 'is_organizer']
        read_only_fields = ['id', 'is_organizer']

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        if 'password' in data and 'confirm_password' in data:
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError({
                    'confirm_password': 'Passwords do not match'
                })
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            preferred_language=validated_data.get('preferred_language', 'ru'),
            is_organizer=validated_data.get('is_organizer', False)
        )
        return user

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'name', 'address', 'city', 'country', 'capacity']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizer
        fields = ['id', 'name', 'user']

class TicketSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='ticket_type')  # Маппинг ticket_type → name
    event_title = serializers.CharField(source='event.title', read_only=True)  # Для ProfilePage

    class Meta:
        model = Ticket
        fields = ['id', 'name', 'event_title', 'price', 'sector', 'row', 'seat_number', 'is_sold', 'qr_code', 'created_at']

class EventSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    organizer = OrganizerSerializer(read_only=True)
    tickets = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'venue', 'categories', 'organizer', 'image', 'status', 'created_at', 'tickets']

    def get_tickets(self, obj):
        tickets = obj.tickets.filter(is_sold=False)  # Только непроданные билеты
        return TicketSerializer(tickets, many=True).data

class PurchaseSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'user', 'tickets', 'total_amount', 'purchase_date', 'payment_status', 'payment_method', 'delivery_method']