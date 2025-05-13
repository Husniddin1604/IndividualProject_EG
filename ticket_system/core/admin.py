from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Event, Ticket, Purchase

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'preferred_language', 'is_staff')
    list_filter = ('preferred_language', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('preferred_language',)}),
    )

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location', 'created_at')
    list_filter = ('date',)
    search_fields = ('title', 'location')

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('event', 'price', 'seat_number', 'is_sold', 'created_at')
    list_filter = ('is_sold', 'event')
    search_fields = ('seat_number',)

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'ticket', 'purchase_date', 'payment_status', 'payment_method')
    list_filter = ('payment_status', 'payment_method')
    search_fields = ('user__username',)