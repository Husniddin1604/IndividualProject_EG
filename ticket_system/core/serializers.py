from rest_framework import serializers
from core.models import User, Venue, Category, Organizer, Event, Ticket, Purchase

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone_number', 'address', 'preferred_language', 'is_organizer']
        read_only_fields = ['id', 'is_organizer']

    def create(self, validated_data):
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

class EventSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    organizer = OrganizerSerializer(read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'venue', 'categories', 'organizer', 'image', 'status', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'event', 'ticket_type', 'price', 'sector', 'row', 'seat_number', 'is_sold', 'qr_code', 'created_at']

class PurchaseSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'user', 'tickets', 'total_amount', 'purchase_date', 'payment_status', 'payment_method', 'delivery_method']