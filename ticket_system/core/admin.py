from django.contrib import admin
from core.models import User, Venue, Category, Organizer, Event, Ticket, Purchase


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'phone_number', 'preferred_language', 'is_organizer']
    list_filter = ['preferred_language', 'is_organizer']
    search_fields = ['username', 'email']


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'country', 'capacity']
    search_fields = ['name', 'city']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Organizer)
class OrganizerAdmin(admin.ModelAdmin):
    list_display = ['name', 'user']
    search_fields = ['name']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'venue', 'status', 'get_categories']
    list_filter = ['status', 'venue', 'categories']
    search_fields = ['title', 'description']

    def get_categories(self, obj):
        return ", ".join(category.name for category in obj.categories.all())

    get_categories.short_description = 'Categories'


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['event', 'ticket_type', 'price', 'sector', 'row', 'seat_number', 'is_sold']
    list_filter = ['ticket_type', 'is_sold']
    search_fields = ['event__title', 'seat_number']


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_tickets', 'total_amount', 'purchase_date', 'payment_status']
    list_filter = ['payment_status', 'payment_method', 'delivery_method']
    search_fields = ['user__username']

    def get_tickets(self, obj):
        return ", ".join(f"{ticket.event.title} ({ticket.seat_number})" for ticket in obj.tickets.all())

    get_tickets.short_description = 'Tickets'